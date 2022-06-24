import { google } from 'googleapis'
import { JWT } from 'google-auth-library'
import credentials from '../credentials.json'


export default class GCalendar {

    private calendar
    private syncToken: string | undefined
    private calendarId
    private client

    constructor(calendarId: string) {
        this.calendarId = calendarId

        this.client = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: [ // set the right scope
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/calendar.events',
            ],
        });

        this.calendar = google.calendar({ version: 'v3' });
    }

    async generateSyncToken() {
        let syncToken = null
        let nextPageToken = null

        type CalendarEventsResponse = {
            data: {
                nextPageToken?: string | null,
                nextSyncToken?: string | null
            }
        }

        while (!syncToken) {
            const res: CalendarEventsResponse = await this.calendar.events.list({
                calendarId: this.calendarId,
                auth: this.client,
                pageToken: nextPageToken ? nextPageToken : undefined,
                timeMin: (new Date()).toISOString(),
                syncToken: syncToken ? syncToken : undefined
            })
            syncToken = res.data.nextSyncToken
            nextPageToken = res.data.nextPageToken
        }
        
        return syncToken
    }

    setSyncToken(token: string) {
        this.syncToken = token
    }

    getSyncToken() {
        return this.syncToken
    }

    async getNewEvents() {
        const items = []
        let nextPageToken = null

        while (true) {
            const client = this.client
            const params: {
                calendarId: string,
                auth: typeof client,
                pageToken: string | undefined,
                syncToken?: string | undefined
            } = {
                calendarId: this.calendarId,
                auth: client,
                pageToken: nextPageToken ? nextPageToken : undefined,
            }
            if (typeof this.syncToken !== "undefined") {
                params.syncToken = this.syncToken
            }
            const res = await this.calendar.events.list(params)

            nextPageToken = res.data?.nextPageToken
            if (res.data) {
                const calendarEvents = res.data.items
                if (typeof calendarEvents !== "undefined") {
                    items.push(...calendarEvents)
                }

                if (res.data.nextSyncToken) {
                    this.syncToken = res.data.nextSyncToken
                    console.log("Changed next sync token => ", this.syncToken)
                    return { ...res.data, items }
                }
            }
        }
    }

    getCalendarId() {
        return this.calendarId
    }


}