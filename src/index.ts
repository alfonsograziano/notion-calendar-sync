import NotionCalendar from "./NotionCalendar"
import GCalendar from "./MyCalendar"
import CalendarSync from "./CalendarSync"
import 'dotenv/config';

const notionToken = process.env.NOTION_TOKEN
const databaseId = process.env.DATABASE_ID
const calendarId = process.env.CALENDAR_ID

console.log("Token => ", notionToken)
console.log("DB_ID => ", databaseId)
console.log("Calendar_ID => ", calendarId)

if (notionToken && databaseId && calendarId) {
    const agenda = new NotionCalendar(notionToken, databaseId)
    const gCalendar = new GCalendar(calendarId)
    const sync = new CalendarSync(gCalendar, agenda)


    const syncNow = async () => {
        if(await sync.isFirstSync()){
            console.log("This is your first sync, I'll create a test event for you :) ")
            await sync.createTestingItem()
        }
        sync.sync()
    }

    syncNow()

} else {
    console.log("Cannot find params")
}