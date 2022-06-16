import { MESSAGE_PORION_SIZE, serverError, tableNames } from "../config";
import { BaseResponse } from "../types/common";
import { CreateChatRequest, CreatePrivateChatPageRequest, EmptyRequest, GetMessagesRequest } from "../types/requests";
import { BaseService } from "./BaseService";
import { Response } from 'express'
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { UserData } from "../types/users";
import { getArrayUniqueElements, getChatNameFromUserLogins } from '../functions/commonFunctions';
import { BaseMessageData, ChatData, ChatMember, ChatType, GetMessagesResponse, MembersData, MessageType, StartingPrivateChatInfo } from "../types/chats";
import { TokenPayload } from "../types/tokens";
import messageSevice from "./MessagesService";
import webSocketService from '../index'

class ChatSevice extends BaseService {

    async createChat(req: CreateChatRequest, res: Response<BaseResponse<ChatType>>) {
        try {
            const { membersIds, chatName, body, userId } = req.body
            const connection = await this._createConnection()
            let query = `INSERT INTO ${tableNames['chat']} (name) values (?)`
            let params = [null]
            if (chatName) {
                params = [chatName]
            }

            const response = await connection.execute(query, params)
            const responseHeaders = response[0] as ResultSetHeader
            const chatId = responseHeaders.insertId

            let uniqueMemberIdies = getArrayUniqueElements(membersIds)
            if (uniqueMemberIdies.length < 2) {
                return res.status(400).json({ message: 'Bad request!' })
            }

            let isAllUserExists = true

            for (let memberId of uniqueMemberIdies) {
                let user = await this.findItems<UserData>(tableNames['user'], 'id', memberId)
                if (!user.length) {
                    isAllUserExists = false
                }
            }

            if (!isAllUserExists) {
                await connection.query(`DELETE FROM ${tableNames['chat']} WHERE id = ?`, [chatId])
                return res.status(400).json({ message: 'User doesnt exist!' })
            }

            for (let memberId of uniqueMemberIdies) {
                await connection.query(`INSERT INTO ${tableNames['chatMembers']} SET ?`, { chatId, memberId })
            }

            await connection.end()

            let baseMessageData = { body, chatId, userId } as BaseMessageData

            const messageId = await messageSevice.insertMessageToDB(baseMessageData)
            await messageSevice.readMessage(userId, chatId, messageId)
            const [msgData] = await this.findItems<MessageType>(tableNames['message'], 'id', messageId)
                        
            const [user] = await this.findItems<UserData>(tableNames['user'], 'id', userId)
            
            let data = { id: chatId, name: user.login, newMessages: null } as ChatData

            for (let memberId of uniqueMemberIdies) {
                if(memberId !== userId) {
                    webSocketService.sendMessage(memberId, data, 'chatCreated')
                    webSocketService.sendMessage(memberId, msgData, 'message')
                } 
            }
            return res.status(200).json({ message: 'Ok!', data })
        } catch (e) {
            console.log(e)
            return res.status(500).json({ message: serverError })
        }
    }

    async getChats(req: EmptyRequest, res: Response<BaseResponse<ChatData[]>>) {
        try {
            const tokenPayload = req.data as TokenPayload
            const { userId } = tokenPayload
            const connection = await this._createConnection()
            const [chats] = await connection.execute<ChatType[]>(`SELECT ${tableNames['chat']}.id, name FROM ${tableNames['chatMembers']} 
                                                                  JOIN ${tableNames['chat']} ON chatId = ${tableNames['chat']}.id WHERE memberId = ?`, [userId])

            const [user] = await this.findItems<UserData>(tableNames['user'], 'id', userId)
            let userLogin = user.login

            const chatsInfo: ChatData[] = []
            let companionId = null
            for (let chat of chats) {
                let name: string
                const [members] = await connection.execute<ChatMemeberData[]>(`SELECT ${tableNames['user']}.login, ${tableNames['user']}.id, photoUrl FROM ${tableNames['chatMembers']} JOIN ${tableNames['user']}
                                                                        ON memberId = ${tableNames['user']}.id WHERE chatId = ?`, [chat.id])    
                let chatPhotoUrl = members.find(data => data.login !== userLogin)?.photoUrl
                if(members.length === 2) companionId = members.find(data => data.login !== userLogin)?.id
                if (!chat.name) {
                    const logins = members.map(member => member.login)
                    name = getChatNameFromUserLogins(logins, userLogin)
                } else {
                    name = chat.name
                }
                
                const newMessages = await this.getUserChatNewMessagesNumber(chat.id, userId)
                chatsInfo.push({ id: chat.id, name, newMessages, chatPhotoUrl: chatPhotoUrl || null, companionId} as ChatData)
            }
            await connection.end()
            return res.json({ message: 'Ok', data: chatsInfo })
        } catch (e) {
            console.log(e)
            return res.status(500).json({ message: serverError })
        }
    }

    async getChatMembers(chatId: number) {
        const members = await this.findItems<ChatMember>(tableNames['chatMembers'], 'chatId', chatId)
        return members.map(member => member.memberId)
    }

    async getMesages(req: GetMessagesRequest, res: Response<BaseResponse<GetMessagesResponse>>) {
        try {
            const { userId } = req.data as TokenPayload
            const chatId = req.params.chatId
            const { oldestMessageId } = req.body
            
            const chatMembersIds = await this.getChatMembers(chatId)
            const isUserInChatMembers = chatMembersIds.some((memberId) => memberId === userId)
            if (!isUserInChatMembers) return res.status(403).json({ message: 'You cannot read this chat!' })
            
            const connection = await this._createConnection()

            const [result] = await connection.execute<LastReadMessageId[]>(`SELECT lastReadMessageId FROM ${tableNames['chatMembers']} 
                                                                                                    WHERE memberId = ? AND chatId = ?`, [userId, chatId])

            const userLastReadMessageId = result[0]?.lastReadMessageId

            let query: string
            let params = [chatId]
            if (oldestMessageId) {
                query = `SELECT * FROM (SELECT * FROM ${tableNames['message']} WHERE chatId = ? AND id < ? ORDER BY id DESC LIMIT ?) sub ORDER BY id ASC`
                params = [...params, oldestMessageId, MESSAGE_PORION_SIZE]
            } else {
                query = `SELECT * FROM (SELECT * FROM ${tableNames['message']} WHERE chatId = ? ORDER BY id DESC LIMIT ?) sub ORDER BY id ASC`
                params = [...params, MESSAGE_PORION_SIZE]
            }
            let [messages] = await connection.execute<MessageType[]>(query, params)
            if(messages[0]?.id > userLastReadMessageId) {
                const [additionalMessages] = await connection.execute<MessageType[]>(
                    `SELECT * FROM ${tableNames['message']} WHERE chatId = ? AND id > ? AND id < ?`,
                    [chatId, userLastReadMessageId, messages[0].id] 
                )
                if(additionalMessages.length) messages = [...additionalMessages, ...messages]
            }
            const membersData: MembersData[] = []
            for (let memberId of chatMembersIds) {
                const [memberData] = await connection.execute<MembersData[]>(`SELECT memberId as id, lastReadMessageId, login, photoUrl FROM ${tableNames['chatMembers']}
                                                                              JOIN ${tableNames['user']} ON memberId = ${tableNames['user']}.id  
                                                                              WHERE memberId = ? AND chatId = ?`, [memberId, chatId])
                membersData.push({ ...memberData[0] })
            }
            const [ress] = await connection.execute<FirstdMessageId[]>(`SELECT min(id) as firstMessageId FROM ${tableNames['message']}
                                                                        WHERE chatId = ?`, [chatId])
            let isAllMessages = false
            if(messages[0]?.id === ress[0].firstMessageId) isAllMessages = true
            await connection.end()
            return res.json({ message: 'Ok', data: { messages, membersData, isAllMessages } })
        } catch (e) {
            console.log(e)
            return res.status(500).json({ message: serverError })
        }
    }

    async getPrivateChatId(user1Id: number, user2Id: number): Promise<number | null> {
        try {
            const connection = await this._createConnection()
            const [user1Chats] = await connection.execute<ChatId[]>(`SELECT chatId FROM ${tableNames['chatMembers']} WHERE memberId = ?`, [user1Id])
            const [user2Chats] = await connection.execute<ChatId[]>(`SELECT chatId FROM ${tableNames['chatMembers']} WHERE memberId = ?`, [user2Id])

            const commonChatsIds = []
            // find common chats
            for (let i = 0; i < user1Chats.length; i++) {
                for (let j = 0; j < user2Chats.length; j++) {
                    if (user2Chats[j].chatId === user1Chats[i].chatId) commonChatsIds.push(user2Chats[j].chatId)
                }
            }
            await connection.end()
            if (!commonChatsIds.length) return null
            // find private chat in commons
            for (let commonChatId of commonChatsIds) {
                let chatMembers = await this.getChatMembers(commonChatId)
                if (chatMembers.length === 2) return commonChatId
            }
            return null
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    async createPrivateChatPage(req: CreatePrivateChatPageRequest, res: Response<BaseResponse<StartingPrivateChatInfo>>) {
        try {
            const { userId } = req.data as TokenPayload
            const { companionId } = req.body
            const chatId = await this.getPrivateChatId(userId, companionId)
            const [companion] = await this.findItems<UserData>(tableNames['user'], 'id', companionId)
            let message = 'Ok!'
            if (chatId) message = 'You already have chat with this user!'
            return res.json({ message, data: { chatId, companionLogin: companion.login } })
        } catch (e) {
            res.status(500).json({ message: serverError })
        }
    }
    // returns array of chatId with unread messages 
    async getNewMessagesNumber(userId: number): Promise<number[]> {
            const connection = await this._createConnection()
            const [userChats] = await connection.execute<ChatMember[]>(`SELECT chatId FROM ${tableNames['chatMembers']} WHERE memberId = ?`, [userId])
            const data = []
            for (let userChat of userChats) {
                if(await this.getUserChatNewMessagesNumber(userChat.chatId, userId)) data.push(+userChat.chatId)
            }
            await connection.end()
            return data            
    }

    async getUserChatNewMessagesNumber(chatId: number, userId: number): Promise<number | null> {
        const connection = await this._createConnection()
        const [lastReadMessageIdRes] = await connection.execute<ChatMember[]>(`SELECT lastReadMessageId FROM ${tableNames['chatMembers']} WHERE memberId = ? AND chatId = ?`, [userId, chatId])
        const [result] = await connection.execute(`SELECT MAX(id) as maxId FROM ${tableNames['message']} WHERE chatId = ?`, [chatId])
        const lastChatMessageId = result[0]['maxId']
        const lastReadMessageId = lastReadMessageIdRes[0]['lastReadMessageId']
         
        if (lastChatMessageId > lastReadMessageId || lastReadMessageId === null) {
            const userLastReadMessageId = lastReadMessageId ? lastReadMessageId : 0
            let [newMessagesNumber] = await connection.execute<NewMessage[]>(`SELECT COUNT(*) AS newMessages FROM ${tableNames['message']} WHERE chatId = ? AND id > ?`, [chatId, userLastReadMessageId])
            return newMessagesNumber[0]['newMessages']
        } else {
            return 0
        }
    }
}

interface ChatMemeberData extends RowDataPacket { 
    id: number
    login: string
    photoUrl: string | null
}

interface LastReadMessageId extends RowDataPacket {
    lastReadMessageId: number | null
}

interface FirstdMessageId extends RowDataPacket {
    firstMessageId: number
}

interface ChatId extends RowDataPacket { chatId: number }
interface NewMessage extends RowDataPacket { newMessages: number }

export default new ChatSevice()
