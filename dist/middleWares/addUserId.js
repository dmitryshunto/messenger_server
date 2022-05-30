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
exports.addUserId = void 0;
const config_1 = require("../config");
const AuthorizationService_1 = require("../services/AuthorizationService");
const addUserId = (socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authService = new AuthorizationService_1.AuthService();
    const userId = socket.handshake.auth.userId;
    if (!userId) {
        const err = new Error(config_1.notAuthMsg);
        next(err);
    }
    let user = yield authService.findItems(config_1.table_names['user'], 'id', userId);
    if (!user.length) {
        const err = new Error(config_1.notAuthMsg);
        next(err);
    }
    next();
});
exports.addUserId = addUserId;
//# sourceMappingURL=addUserId.js.map