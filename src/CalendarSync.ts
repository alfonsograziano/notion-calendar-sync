import NotionCalendar from "./NotionCalendar"
import GCalendar from "./MyCalendar"


export default class CalendarSync {

    constructor(
        private gCalendar: GCalendar,
        private notionCalendar: NotionCalendar
    ) { }

    async findSyncToken() {
        let result: string | undefined
        result = await this.notionCalendar.findLastSyncToken()
        if (typeof result === "undefined") {
            console.warn("Cannot find sync token on Notion, searching on GCalendar")
            result = await this.gCalendar.generateSyncToken()
        }
        return result
    }

}