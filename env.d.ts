
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_API_BASE_URL?: string
    readonly NEXT_PUBLIC_FRONTEND_KEY?: string
    readonly NODE_ENV: 'development' | 'production' | 'test'
  }
}

declare module '*.svg' {
  const content: string
  export default content
}
