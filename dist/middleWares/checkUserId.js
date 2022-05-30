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
const AuthorizationService_1 = __importDefault(require("../services/AuthorizationService"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const checkUserId = (socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = socket.handshake.auth.token;
        if (!accessToken) {
            const err = new Error(config_1.notAuthMsg);
            next(err);
        }
        const decodedData = jsonwebtoken_1.default.verify(accessToken, config_1.JWT_ACCESS_SECRET);
        let user = yield AuthorizationService_1.default.findItems(config_1.tableNames['user'], 'id', decodedData.userId);
        if (!user.length) {
            const err = new Error(config_1.notAuthMsg);
            next(err);
        }
        socket.data = {
            userId: decodedData.userId
        };
        next();
    }
    catch (e) {
        next(new Error(e.message));
    }
});
exports.default = checkUserId;
//# sourceMappingURL=checkUserId.js.map