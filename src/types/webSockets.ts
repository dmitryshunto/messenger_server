import { Socket } from "socket.io"

export type BaseSocket<D> = Socket<any, any, any, D>

export interface SocketAuthData {
    userId: number
}

export interface UserSocketsData extends SocketAuthData {
    socketId: string
}

export type MessageData = {
    fromUserLogin: string
    body: string
}

export type ReadMessageData = {
    chatId: number, 
    messageId: number,
    userId: number
}