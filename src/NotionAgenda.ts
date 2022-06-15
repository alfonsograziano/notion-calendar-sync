import { Client } from "@notionhq/client"
import { AgendaPage } from "./types/notion"

type AgendaItemProperties = {
    calendarId: string,
    title: string,
    startDate: string,
    endDate: string,
    description: string | null
}


class NotionAgenda {

    private notion
    private databaseId: string

    constructor(authToken: string, databaseId: string) {
        console.log(authToken, databaseId)
        this.databaseId = databaseId
        this.notion = new Client({ auth: authToken })
    }

    public async getDataFromDB() {
        return this.notion.databases.query({ database_id: this.databaseId })
    }

    private generateItem({ calendarId, title, startDate, endDate, description }: AgendaItemProperties): AgendaPage {
        const prop: AgendaPage = {
            Name: {
                title: [{ text: { content: title } }],
            },
            calendarId: {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {
                            "content": calendarId
                        }
                    },
                ]

            },
            Date: {
                date: {
                    start: startDate,
                    end: endDate,
                }
            }
        }

        if (description) {
            prop.Description = {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {
                            "content": description
                        }
                    },
                ]
            }
        }
        return prop
    }

    public async createNewItem(properties: AgendaItemProperties) {
        const newPage: AgendaPage = this.generateItem(properties)
        //@ts-ignore
        return await this.notion.pages.create({ parent: { database_id: this.databaseId }, properties: newPage })
    }

    public async deleteItem(blockId: string) {
        return this.notion.blocks.delete({ block_id: blockId });
    }

}

export default NotionAgenda
