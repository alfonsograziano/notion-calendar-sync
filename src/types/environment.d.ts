export { };

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NOTION_TOKEN: string,
      DATABASE_ID: string,
      CALENDAR_ID: string
    }
  }
}