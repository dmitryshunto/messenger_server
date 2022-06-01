export const user = 'dmitry'
export const password = 'dmitry'
export const host = 'localhost'
export const HOST_PORT = 3002

export const database = 'messager'
export const db_name = 'messager'
export const port = 3306

export const JWT_ACCESS_SECRET = 'IlGdMySh4' 
export const JWT_REFRESH_SECRET = 'GhGJJ8hEx4'

export const SMTP_HOST = 'smtp.gmail.com'
export const SMTP_PORT = 587
export const SMTP_USER = 'mymessagerpost8@gmail.com'
export const SMTP_PASSWORD = 'Vika1993)'
export const APP_PASSWORD = 'ralvofpgwpkiixrv'

const CLIENT_HOST_PORT = 3003
export const SERVER_URL = `http://${host}:${HOST_PORT}/`
export const CLIENT_URL = `http://${host}:${CLIENT_HOST_PORT}`

export const refreshTokenCookieName = 'refreshToken'

export const notAuthMsg = 'Authorization error!'

export const serverError = 'Server error!'

export const tableNames = {
    user: 'user',
    message: 'message',
    chat: 'chat',
    token: 'token',
    chatMembers: 'chat_members'
}

export const MESSAGE_PORION_SIZE = 3

export const uploadsFolder = 'uploads'

export const pathToUploads = `src/${uploadsFolder}`