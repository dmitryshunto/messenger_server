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
const config_1 = require("../config");
const BaseService_1 = require("./BaseService");
const commonFunctions_1 = require("../functions/commonFunctions");
const MessagesService_1 = __importDefault(require("./MessagesService"));
const index_1 = __importDefault(require("../index"));
class ChatSevice extends BaseService_1.BaseService {
    createChat(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { membersIds, chatName, body, userId } = req.body;
                const connection = yield this._createConnection();
                let query = `INSERT INTO ${config_1.tableNames['chat']} (name) values (?)`;
                let params = [null];
                if (chatName) {
                    params = [chatName];
                }
                const response = yield connection.execute(query, params);
                const responseHeaders = response[0];
                const chatId = responseHeaders.insertId;
                let uniqueMemberIdies = (0, commonFunctions_1.getArrayUniqueElements)(membersIds);
                if (uniqueMemberIdies.length < 2) {
                    return res.status(400).json({ message: 'Bad request!' });
                }
                let isAllUserExists = true;
                for (let memberId of uniqueMemberIdies) {
                    let user = yield this.findItems(config_1.tableNames['user'], 'id', memberId);
                    if (!user.length) {
                        isAllUserExists = false;
                    }
                }
                if (!isAllUserExists) {
                    yield connection.query(`DELETE FROM ${config_1.tableNames['chat']} WHERE id = ?`, [chatId]);
                    return res.status(400).json({ message: 'User doesnt exist!' });
                }
                for (let memberId of uniqueMemberIdies) {
                    yield connection.query(`INSERT INTO ${config_1.tableNames['chatMembers']} SET ?`, { chatId, memberId });
                }
                yield connection.end();
                let baseMessageData = { body, chatId, userId };
                const messageId = yield MessagesService_1.default.insertMessageToDB(baseMessageData);
                yield MessagesService_1.default.readMessage(userId, chatId, messageId);
                const [msgData] = yield this.findItems(config_1.tableNames['message'], 'id', messageId);
                const [user] = yield this.findItems(config_1.tableNames['user'], 'id', userId);
                let data = { id: chatId, name: user.login, newMessages: null };
                for (let memberId of uniqueMemberIdies) {
                    if (memberId !== userId) {
                        index_1.default.sendMessage(memberId, data, 'chatCreated');
                        index_1.default.sendMessage(memberId, msgData, 'message');
                    }
                }
                return res.status(200).json({ message: 'Ok!', data });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: config_1.serverError });
            }
        });
    }
    getChats(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tokenPayload = req.data;
                const { userId } = tokenPayload;
                const connection = yield this._createConnection();
                const [chats] = yield connection.execute(`SELECT ${config_1.tableNames['chat']}.id, name FROM ${config_1.tableNames['chatMembers']} 
                                                                  JOIN ${config_1.tableNames['chat']} ON chatId = ${config_1.tableNames['chat']}.id WHERE memberId = ?`, [userId]);
                const [user] = yield this.findItems(config_1.tableNames['user'], 'id', userId);
                let userLogin = user.login;
                const chatsInfo = [];
                for (let chat of chats) {
                    let name;
                    const [members] = yield connection.execute(`SELECT ${config_1.tableNames['user']}.login, photoUrl FROM ${config_1.tableNames['chatMembers']} JOIN ${config_1.tableNames['user']}
                                                                        ON memberId = ${config_1.tableNames['user']}.id WHERE chatId = ?`, [chat.id]);
                    let chatPhotoUrl = (_a = members.find(data => data.login !== userLogin)) === null || _a === void 0 ? void 0 : _a.photoUrl;
                    if (!chat.name) {
                        const logins = members.map(member => member.login);
                        name = (0, commonFunctions_1.getChatNameFromUserLogins)(logins, userLogin);
                    }
                    else {
                        name = chat.name;
                    }
                    const newMessages = yield this.getUserChatNewMessagesNumber(chat.id, userId);
                    chatsInfo.push({ id: chat.id, name, newMessages, chatPhotoUrl: chatPhotoUrl || null });
                }
                yield connection.end();
                return res.json({ message: 'Ok', data: chatsInfo });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: config_1.serverError });
            }
        });
    }
    getChatMembers(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            const members = yield this.findItems(config_1.tableNames['chatMembers'], 'chatId', chatId);
            return members.map(member => member.memberId);
        });
    }
    getMesages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.data;
                const chatId = req.params.chatId;
                const { oldestMessageId } = req.body;
                const chatMembers = yield this.getChatMembers(chatId);
                const isUserInChatMembers = chatMembers.find((memberId) => memberId === userId);
                if (!isUserInChatMembers)
                    return res.status(403).json({ message: 'You cannot read this chat!' });
                // const messages = await this.findItems<MessageType>(tableNames['message'], 'chatId', chatId)
                const connection = yield this._createConnection();
                let query;
                let params = [chatId];
                if (oldestMessageId) {
                    query = `SELECT * FROM (SELECT * FROM ${config_1.tableNames['message']} WHERE chatId = ? AND id < ? ORDER BY id DESC LIMIT ?) sub ORDER BY id ASC`;
                    params = [...params, oldestMessageId, config_1.MESSAGE_PORION_SIZE];
                }
                else {
                    query = `SELECT * FROM (SELECT * FROM ${config_1.tableNames['message']} WHERE chatId = ? ORDER BY id DESC LIMIT ?) sub ORDER BY id ASC`;
                    params = [...params, config_1.MESSAGE_PORION_SIZE];
                }
                const [messages] = yield connection.execute(query, params);
                const membersData = [];
                for (let memberId of chatMembers) {
                    const [memberData] = yield connection.execute(`SELECT memberId as id, lastReadMessageId, login, photoUrl FROM ${config_1.tableNames['chatMembers']}
                                                                              JOIN ${config_1.tableNames['user']} ON memberId = ${config_1.tableNames['user']}.id  
                                                                              WHERE memberId = ? AND chatId = ?`, [memberId, chatId]);
                    membersData.push(Object.assign({}, memberData[0]));
                }
                yield connection.end();
                return res.json({ message: 'Ok', data: { messages, membersData } });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: config_1.serverError });
            }
        });
    }
    getPrivateChatId(user1Id, user2Id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield this._createConnection();
                const [user1Chats] = yield connection.execute(`SELECT chatId FROM ${config_1.tableNames['chatMembers']} WHERE memberId = ?`, [user1Id]);
                const [user2Chats] = yield connection.execute(`SELECT chatId FROM ${config_1.tableNames['chatMembers']} WHERE memberId = ?`, [user2Id]);
                const commonChatsIds = [];
                // find common chats
                for (let i = 0; i < user1Chats.length; i++) {
                    for (let j = 0; j < user2Chats.length; j++) {
                        if (user2Chats[j].chatId === user1Chats[i].chatId)
                            commonChatsIds.push(user2Chats[j].chatId);
                    }
                }
                yield connection.end();
                if (!commonChatsIds.length)
                    return null;
                // find private chat in commons
                for (let commonChatId of commonChatsIds) {
                    let chatMembers = yield this.getChatMembers(commonChatId);
                    if (chatMembers.length === 2)
                        return commonChatId;
                }
                return null;
            }
            catch (e) {
                console.log(e);
                throw e;
            }
        });
    }
    createPrivateChatPage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.data;
                const { companionId } = req.body;
                const chatId = yield this.getPrivateChatId(userId, companionId);
                const [companion] = yield this.findItems(config_1.tableNames['user'], 'id', companionId);
                let message = 'Ok!';
                if (chatId)
                    message = 'You already have chat with this user!';
                return res.json({ message, data: { chatId, companionLogin: companion.login } });
            }
            catch (e) {
                res.status(500).json({ message: config_1.serverError });
            }
        });
    }
    // returns array of chatId with unread messages 
    getNewMessagesNumber(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this._createConnection();
            const [userChats] = yield connection.execute(`SELECT chatId FROM ${config_1.tableNames['chatMembers']} WHERE memberId = ?`, [userId]);
            const data = [];
            for (let userChat of userChats) {
                if (yield this.getUserChatNewMessagesNumber(userChat.chatId, userId))
                    data.push(+userChat.chatId);
            }
            yield connection.end();
            return data;
        });
    }
    getUserChatNewMessagesNumber(chatId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this._createConnection();
            const [lastReadMessageIdRes] = yield connection.execute(`SELECT lastReadMessageId FROM ${config_1.tableNames['chatMembers']} WHERE memberId = ? AND chatId = ?`, [userId, chatId]);
            const [result] = yield connection.execute(`SELECT MAX(id) as maxId FROM ${config_1.tableNames['message']} WHERE chatId = ?`, [chatId]);
            const lastChatMessageId = result[0]['maxId'];
            const lastReadMessageId = lastReadMessageIdRes[0]['lastReadMessageId'];
            if (lastChatMessageId > lastReadMessageId || lastReadMessageId === null) {
                const userLastReadMessageId = lastReadMessageId ? lastReadMessageId : 0;
                let [newMessagesNumber] = yield connection.execute(`SELECT COUNT(*) AS newMessages FROM ${config_1.tableNames['message']} WHERE chatId = ? AND id > ?`, [chatId, userLastReadMessageId]);
                return newMessagesNumber[0]['newMessages'];
            }
            else {
                return 0;
            }
        });
    }
}
exports.default = new ChatSevice();
//# sourceMappingURL=ChatService.js.map