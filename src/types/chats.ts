import { RowDataPacket } from "mysql2"

export interface BaseMessageData  extends RowDataPacket {
    body: string
    userId: number
    chatId: number
}

export interface MessageType extends BaseMessageData {
    id: number
    createdAt: number
}
 
export interface ChatType extends RowDataPacket {
    id: number
    name: string | null
}

export interface ChatData extends ChatType {
    newMessages: number | null
    chatPhotoUrl: string | null
    companionId?: number
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
    isAllMessages: boolean
}

export type ChatNewMessageInfo = {
    chatId: number
    newMessages: number
}