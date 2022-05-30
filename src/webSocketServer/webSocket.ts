import { Server } from 'socket.io'
import { tableNames } from '../config'
import checkUserId from '../middlewares/checkUserId'
import ChatService from '../services/ChatService'
import messageService from '../services/MessagesService'
import { BaseMessageData, MessageType } from '../types/chats'
import { EmitEventTypes } from '../types/events'
import { BaseSocket, ReadMessageData, SocketAuthData, UserSocketsData } from '../types/webSockets'

export class WebSocketService {
    io: Server<any, any, any, SocketAuthData>
    constructor(io: Server<any, any, any, SocketAuthData>) {
        this.io = io
        this.io.use(checkUserId)
        this.io.on('connection', (socket: BaseSocket<SocketAuthData>) => {
            const connectedUsers = this.connectedUsers
            socket.emit<EmitEventTypes>('onlineUsers', connectedUsers)
            socket.broadcast.emit<EmitEventTypes>("userConnected", {
                socketId: socket.id,
                userId: socket.data.userId,
            })
            socket.on('disconnect', () => {
                socket.broadcast.emit<EmitEventTypes>('userDisconnected', socket.data.userId)
            })
            socket.on<EmitEventTypes>('message', async (baseMessageData: BaseMessageData) => {
                const messageId = await messageService.insertMessageToDB(baseMessageData)
                const [msgData] = await messageService.findItems<MessageType>(tableNames['message'], 'id', messageId)
                const chatMembersIds = await ChatService.getChatMembers(msgData.chatId)
                for (const memberId of chatMembersIds) {
                    const userSocketId = this.getUserSocketId(memberId)
                    if (userSocketId) io.to(userSocketId).emit<EmitEventTypes>('message', msgData)
                }
            })
            socket.on<EmitEventTypes>('messageRead', async (messageId: number, chatId: number) => {
                const userId = socket.data.userId
                if (userId) {
                    await messageService.readMessage(userId, chatId, messageId)
                    const chatMembersIds = await ChatService.getChatMembers(chatId)
                    for (const memberId of chatMembersIds) {
                        if (memberId !== userId) {
                            const userSocketId = this.getUserSocketId(memberId)
                            const readMesageData: ReadMessageData = { chatId, messageId, userId }
                            if (userSocketId) io.to(userSocketId).emit<EmitEventTypes>('messageRead', readMesageData)
                        }
                    }
                }

            })
        })
    }

    get connectedUsers() {
        const users: UserSocketsData[] = []
        for (let [id, socket] of this.io.of("/").sockets) {
            users.push({
                socketId: id,
                userId: socket.data.userId,
            })
        }
        return users
    }

    getUserSocketId(userId: number): string | null {
        const userSocketsData = this.connectedUsers.find(user => user.userId === userId)
        return userSocketsData ? userSocketsData.socketId : null
    }

    sendMessage(toUserId: number, msgData: unknown, event: EmitEventTypes) {
        const userSocketId = this.getUserSocketId(toUserId)
        if (userSocketId) {
            this.io.to(userSocketId).emit<EmitEventTypes>(event, msgData)
        }
    }
}