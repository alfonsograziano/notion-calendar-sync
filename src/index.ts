import NotionAgenda from "./NotionAgenda"
import { NotionClient } from "./types/notion"
import 'dotenv/config';

const notionToken = process.env.NOTION_TOKEN
const databaseId = process.env.DATABASE_ID

console.log("Token => ", notionToken)
console.log("DB_ID => ", databaseId)

if (notionToken && databaseId) {
    const agenda = new NotionAgenda(notionToken, databaseId)

    const init = async () => {
        const data = await agenda.getDataFromDB()
        
        await agenda.createNewItem({
            title:"1",
            description:"Desc1",
            calendarId:"1234",
            startDate:"2022-06-14T19:45:11.264Z",
            endDate:"2022-06-15T19:45:11.264Z"
        })
    }

    init()

} else {
    console.log("Cannot find params")
}