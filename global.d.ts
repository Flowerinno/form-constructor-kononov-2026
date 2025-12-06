namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    PORT: string
    POSTGRES_USER: string
    POSTGRES_PASSWORD: string
    POSTGRES_DBNAME: string
    DATABASE_URL: string
    RESEND_API_KEY: string
    RESEND_FROM_EMAIL: string
    MINIO_ROOT_USER: string
    MINIO_ROOT_PASSWORD: string
    S3_ENDPOINT: string
    APP_URL: string
    SESSION_SECRET: string
  }
}
