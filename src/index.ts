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

    const init = async () => {
        const data = await agenda.getDataFromDB()
        console.log(JSON.stringify(data, undefined, 4))
        // await agenda.createNewItem({
        //     title: "1",
        //     description: "Desc1",
        //     calendarId: "1234",
        //     startDate: "2022-06-14T19:45:11.264Z",
        //     endDate: "2022-06-15T19:45:11.264Z",
        //     syncToken:"1234"
        // })
    }

    // init()

    const syncNow = async () => {
        // const token = await sync.findSyncToken()
        // console.log("Token => ", token)
        const token = "CNiKiZSDsPgCENiKiZSDsPgCGAUggpPo2AE="
        gCalendar.setSyncToken(token)

        sync.sync()
    
    }

    syncNow()

} else {
    console.log("Cannot find params")
}