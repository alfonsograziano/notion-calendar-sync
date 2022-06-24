import { Client } from "@notionhq/client"
import { AgendaPage, AgendaItemProperties } from "./types/notion"


class NotionCalendar {

    private notion
    private databaseId: string

    constructor(authToken: string, databaseId: string) {
        this.databaseId = databaseId
        this.notion = new Client({ auth: authToken })
    }

    public async getDataFromDB() {
        return this.notion.databases.query({ database_id: this.databaseId })
    }

    private generateItem({ calendarId, title, startDate, endDate, description, syncToken }: AgendaItemProperties): AgendaPage {
        const prop: AgendaPage = {
            Name: {
                title: [{ text: { content: title } }],
            },
            calendarId: {
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: calendarId
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
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: description
                        }
                    },
                ]
            }
        }

        if (syncToken) {
            prop.syncToken = {
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: syncToken
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

    public async updateItem(pageId: string, properties: AgendaItemProperties) {
        const newPage: AgendaPage = this.generateItem(properties)
        //@ts-ignore    
        return this.notion.pages.update({ page_id: pageId, properties: newPage });
    }

    public async findLastSyncToken(): Promise<string | undefined> {
        const response = await this.notion.databases.query({
            database_id: this.databaseId,
            filter: {
                property: 'calendarId',
                rich_text: {
                    is_not_empty: true
                }
            },
            sorts: [{
                property: "updatedAt",
                direction: "descending"
            }]

        })


        if (response.results.length === 0) return
        const firstResult = response.results[0]
        //@ts-ignore
        const prop: AgendaPage = firstResult.properties
        return prop.syncToken?.rich_text[0]?.plain_text
    }

    async findNotionItemsFromCalendarIds(ids: string[]) {
        const or = ids.map(id => ({
            property: "calendarId",
            rich_text: {
                equals: id
            }
        }))
        const filter = { or }

        return this.notion.databases.query({
            database_id: this.databaseId,
            filter
        });
    }


}

export default NotionCalendar
