import NotionCalendar from "./src/NotionCalendar"
import GCalendar from "./src/MyCalendar"
import CalendarSync from "./src/CalendarSync"
import 'dotenv/config';

const notionToken = process.env.NOTION_TOKEN
const databaseId = process.env.DATABASE_ID
const calendarId = process.env.CALENDAR_ID

console.log("Token => ", notionToken)
console.log("DB_ID => ", databaseId)
console.log("Calendar_ID => ", calendarId)

const agenda = new NotionCalendar(notionToken, databaseId)
const gCalendar = new GCalendar(calendarId)
const sync = new CalendarSync(gCalendar, agenda)


const syncNow = async () => {
    if (await sync.isFirstSync()) {
        console.log("This is your first sync, I'll create a test event for you :) ")
        await sync.createTestingItem()
    }
    await sync.sync()
}


exports.handler =  async function(event: any, context: any) {
    await syncNow()
    return "Ok!"
  }