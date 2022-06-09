import { RowDataPacket } from "mysql2"

export interface BaseMessageData  extends RowDataPacket {
    body: string
    userId: number
    chatId: number
}

export interface MessageType extends BaseMessageData {
    id: number
    createdAT: string
}

export interface UIMessageData extends MessageType {
    isSending: boolean
    sendingSuccess: null | boolean
}
 
export interface ChatType extends RowDataPacket {
    id: number
    name: string | null
}

export interface ChatData extends ChatType {
    newMessages: number | null
    chatPhotoUrl: string | null
} 

export interface ChatMember extends RowDataPacket {
    id: number
    chatId: number
    memberId: number
    lastReadMessageId: number
}

export interface StartingPrivateChatInfo {
    companionLogin: string
    chatId: number | null
}

export interface MembersData extends RowDataPacket {
    id: number
    login: string
    photoUrl: string | null
}

export type GetMessagesResponse = {
    messages: MessageType[]
    membersData: MembersData[]
}

export type ChatNewMessageInfo = {
    chatId: number
    newMessages: number
}