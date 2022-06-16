import { google } from 'googleapis'
import { JWT } from 'google-auth-library'
import credentials from '../credentials.json'


export default class GCalendar {

    private calendar
    // private syncToken
    private calendarId
    private dbHelper
    private client

    constructor(calendarId: string, dbHelper: any) {
        this.calendarId = calendarId
        this.dbHelper = dbHelper

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
}