export type NotionClient = {
    databases: {
        query: (params: {
            database_id: string,
            filter?: any
        }) => QueryResult
    },
    pages: {

    },
    blocks: {

    }
}

export type QueryResult = {
    object: string,
    results: Page[]
}

export type Page = {
    object: "page",
    id: string,
    created_time: string,
    last_edited_time: string
}

export type AgendaPage = {
    Name: {
        title: [{ text: { content: string } }],
    },
    Description?: {
        rich_text: [
            {
                type: "text",
                text: {
                    content: string
                }
            },
        ]
    },
    calendarId: {
        rich_text: [
            {
                type: "text",
                text: {
                    content: string
                }
            },
        ]

    },
    Date: {
        date: {
            start: string,
            end: string,
        }
    }
}
