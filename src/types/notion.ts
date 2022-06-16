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

export type RichText = {
    type: "text",
    text: {
        content: string
    },
    plain_text?: string
}


export type AgendaPage = {
    Name: {
        title: [{ text: { content: string } }],
    },
    Description?: {
        rich_text: RichText[]
    },
    Date: {
        date: {
            start: string,
            end: string,
        }
    },
    syncToken?: {
        rich_text: RichText[]
    },
    calendarId: {
        rich_text: RichText[]
    },
    updatedAt?: {
        last_edited_time: string
    }
}

export type AgendaItemProperties = {
    calendarId: string,
    title: string,
    startDate: string,
    endDate: string,
    description: string | null,
    syncToken: string | null,
    updatedAt?: string
}