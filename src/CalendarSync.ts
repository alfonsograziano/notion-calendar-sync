import NotionCalendar from "./NotionCalendar"
import GCalendar from "./MyCalendar"
import { calendar_v3 } from 'googleapis';
import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints"
import { AgendaPage, AgendaItemProperties } from "./types/notion"

function isStrings(ids: (string | null | undefined)[]): ids is string[] {
    return typeof ids[0] === 'string'
}

export default class CalendarSync {

    constructor(
        private gCalendar: GCalendar,
        private notionCalendar: NotionCalendar
    ) { }

    async findSyncToken(): Promise<string>  {
        let result: string | undefined

        //Try locally
        result = this.gCalendar.getSyncToken()
        if (typeof result === "undefined") {

            //Try on Notion
            result = await this.notionCalendar.findLastSyncToken()

            if (typeof result === "undefined") {
                console.warn("Cannot find sync token on Notion, searching on GCalendar")
                //Try from Google Calendar
                result = await this.gCalendar.generateSyncToken()
            }
        }

        return result
    }

    async isFirstSync() {
        let result: string | undefined

        //Try locally
        result = this.gCalendar.getSyncToken()
        if (typeof result === "undefined") {

            //Try on Notion
            result = await this.notionCalendar.findLastSyncToken()

            if (typeof result === "undefined") {
                return true
            }
        }

        return false
    }

    async sync() {


        //1) Get the token and inject in the gCalendar obj
        const lastToken = await this.findSyncToken()
        this.gCalendar.setSyncToken(lastToken)

        //2) Get new events since last update
        //This will also update the syncToken inside the gCalendar obj
        console.log("Searching for new events...")
        const data = await this.gCalendar.getNewEvents()
        // console.debug(JSON.stringify(data, undefined, 4))
        if (data.items.length === 0) return console.log("Cannot find new updates :)")

        //Find items to update from Notion
        // const itemsToUpdate = await notionDb.findItemsToUpdate(data.items)
        const ids = data.items.map(item => item.id)
        if (isStrings(ids)) {
            const itemsToUpdate = await this.notionCalendar.findNotionItemsFromCalendarIds(ids)
            // //divide items between to update and to create
            const { toUpdate, toCreate, toDelete } = this.splitItems(data.items, itemsToUpdate)

            // console.log({ toUpdate, toCreate, toDelete })

            const results = await Promise.allSettled([
                this.deleteItems(toDelete),
                this.createItems(toCreate),
                this.updateItems(toUpdate)
            ])

            console.log("Update finished!")

        }

    }

    splitItems(items: calendar_v3.Schema$Event[], itemsToUpdate: QueryDatabaseResponse) {

        const results = itemsToUpdate.results
        const updates = results.map(item => {
            //@ts-ignore
            const prop: AgendaPage = item.properties
            return prop.calendarId.rich_text[0].plain_text
        })

        const toUpdate: calendar_v3.Schema$Event[] = []
        const toCreate: calendar_v3.Schema$Event[] = []
        const toDelete: calendar_v3.Schema$Event[] = []

        items.forEach(item => {
            if (typeof item.id === "string") {
                if (updates.includes(item.id) && item.status !== "cancelled") {
                    toUpdate.push(item)
                } else if (item.status === "cancelled") {
                    toDelete.push(item)
                } else {
                    toCreate.push(item)
                }
            }
        })

        return { toUpdate, toCreate, toDelete }
    }

    async deleteItems(items: calendar_v3.Schema$Event[]) {
        console.log(`Deleting ${items.length} items`)
        if (items.length === 0) return

        const ids = items.map(item => item.id)
        if (isStrings(ids)) {
            //From calendar items get notion pages
            const data = await this.notionCalendar.findNotionItemsFromCalendarIds(ids)
            const promises = []
            for (let i = 0; i < data.results.length; i++) {
                const item = data.results[i]
                promises.push(this.notionCalendar.deleteItem(item.id))
            }

            return Promise.allSettled(promises)
        }
    }

    async updateItems(items: calendar_v3.Schema$Event[]) {
        console.log(`Updating ${items.length} items`)
        if (items.length === 0) return

        const ids = items.map(item => item.id)
        if (isStrings(ids)) {
            //From calendar items get notion pages
            const { results } = await this.notionCalendar.findNotionItemsFromCalendarIds(ids)

            const promises = []
            for (let i = 0; i < items.length; i++) {
                const item = items[i]
                //@ts-ignore
                const page = results.find(result => result.properties.calendarId.rich_text[0].text.content === item.id)
                if (!page) continue
                promises.push(this.notionCalendar.updateItem(page.id, this.generateAgendaItemProperties(item)))
            }

            return Promise.allSettled(promises)
        }

    }

    createItems(items: calendar_v3.Schema$Event[]) {
        console.log(`Creating ${items.length} items`)
        if (items.length === 0) return

        const promises = []
        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const newPage = this.generateAgendaItemProperties(item)
            promises.push(this.notionCalendar.createNewItem(newPage))
        }

        return Promise.allSettled(promises)
    }

    generateAgendaItemProperties(item: calendar_v3.Schema$Event): AgendaItemProperties {
        const getStartTime = () => {
            if (item.start) {
                if (item.start.dateTime) return item.start.dateTime
                if (item.start.date) return item.start.date
            }
            return new Date().toISOString()
        }

        const getEndTime = () => {
            if (item.end) {
                if (item.end.dateTime) return item.end.dateTime
                if (item.end.date) return item.end.date
            }
            return new Date().toISOString()
        }

        return {
            calendarId: item.id || "",
            title: item.summary || "",
            startDate: getStartTime(),
            endDate: getEndTime(),
            description: item.description || "",
            syncToken: this.gCalendar.getSyncToken() || ""
        }
    }



    async createTestingItem() {
        const token = await this.findSyncToken()

        await this.notionCalendar.createNewItem({
            title: "Test event",
            description: "This is a test event to add an initial syncToken, please don't delete for now",
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            syncToken: token,
            calendarId: "TEST_ID"
        })

        console.log("Testing event created!")
    }

}