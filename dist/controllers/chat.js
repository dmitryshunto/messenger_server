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
Object.defineProperty(exports, "__esModule", { value: true });
const activationMiddleware_1 = require("../middlewares/activationMiddleware");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const chatService = require("../services/ChatService");
const chatHandler = (router) => {
    const routes = router();
    routes.post('/create', [authMiddleware_1.authMiddleware, activationMiddleware_1.activationMiddleware], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield chatService.createChat(req, res);
    }));
    routes.get('/getChats', [authMiddleware_1.authMiddleware, activationMiddleware_1.activationMiddleware], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield chatService.getChats(req, res);
    }));
    routes.get('/getMessages/:chatId', [authMiddleware_1.authMiddleware, activationMiddleware_1.activationMiddleware], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield chatService.getMesages(req, res);
    }));
    return routes;
};
module.exports = chatHandler;
//# sourceMappingURL=chat.js.map