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
const activationMiddleware_1 = require("../middlewares/activationMiddleware");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const ChatService_1 = __importDefault(require("../services/ChatService"));
const chatHandler = (router) => {
    const routes = router();
    routes.post('/create', [authMiddleware_1.authMiddleware, activationMiddleware_1.activationMiddleware], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield ChatService_1.default.createChat(req, res);
    }));
    routes.get('/getChats', [authMiddleware_1.authMiddleware, activationMiddleware_1.activationMiddleware], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield ChatService_1.default.getChats(req, res);
    }));
    routes.post('/createPrivateChatPage', [authMiddleware_1.authMiddleware, activationMiddleware_1.activationMiddleware], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield ChatService_1.default.createPrivateChatPage(req, res);
    }));
    routes.post('/getMessages/:chatId', [authMiddleware_1.authMiddleware, activationMiddleware_1.activationMiddleware], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield ChatService_1.default.getMesages(req, res);
    }));
    return routes;
};
module.exports = chatHandler;
//# sourceMappingURL=chats.js.map