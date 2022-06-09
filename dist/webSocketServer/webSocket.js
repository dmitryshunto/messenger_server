"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const config_1 = require("../config");
const checkUserId_1 = __importDefault(require("../middlewares/checkUserId"));
const ChatService_1 = __importDefault(require("../services/ChatService"));
const MessagesService_1 = __importDefault(require("../services/MessagesService"));
class WebSocketService {
    constructor(io) {
        this.io = io;
        this.io.use(checkUserId_1.default);
        this.io.on('connection', (socket) => {
            const connectedUsers = this.connectedUsers;
            socket.emit('onlineUsers', connectedUsers);
            socket.broadcast.emit("userConnected", {
                socketId: socket.id,
                userId: socket.data.userId,
            });
            socket.on('disconnect', () => {
                io.emit('userDisconnected', socket.data.userId);
            });
            socket.on('message', (baseMessageData) => __awaiter(this, void 0, void 0, function* () {
                const messageId = yield MessagesService_1.default.insertMessageToDB(baseMessageData);
                const [msgData] = yield MessagesService_1.default.findItems(config_1.tableNames['message'], 'id', messageId);
                const chatMembersIds = yield ChatService_1.default.getChatMembers(msgData.chatId);
                for (const memberId of chatMembersIds) {
                    const userSocketId = this.getUserSocketId(memberId);
                    if (userSocketId)
                        io.to(userSocketId).emit('message', msgData);
                }
            }));
            socket.on('messageRead', (messageId, chatId) => __awaiter(this, void 0, void 0, function* () {
                const userId = socket.data.userId;
                if (userId) {
                    yield MessagesService_1.default.readMessage(userId, chatId, messageId);
                    const chatMembersIds = yield ChatService_1.default.getChatMembers(chatId);
                    for (const memberId of chatMembersIds) {
                        if (memberId !== userId) {
                            const userSocketId = this.getUserSocketId(memberId);
                            const readMesageData = { chatId, messageId, userId };
                            if (userSocketId)
                                io.to(userSocketId).emit('messageRead', readMesageData);
                        }
                    }
                }
            }));
        });
    }
    get connectedUsers() {
        const users = [];
        for (let [id, socket] of this.io.of("/").sockets) {
            users.push({
                socketId: id,
                userId: socket.data.userId,
            });
        }
        return users;
    }
    getUserSocketId(userId) {
        const userSocketsData = this.connectedUsers.find(user => user.userId === userId);
        return userSocketsData ? userSocketsData.socketId : null;
    }
    sendMessage(toUserId, msgData, event) {
        const userSocketId = this.getUserSocketId(toUserId);
        if (userSocketId) {
            this.io.to(userSocketId).emit(event, msgData);
        }
    }
}
exports.WebSocketService = WebSocketService;
//# sourceMappingURL=webSocket.js.map