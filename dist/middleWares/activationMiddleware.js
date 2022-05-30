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
exports.activationMiddleware = void 0;
const config_1 = require("../config");
const AuthorizationService_1 = __importDefault(require("../services/AuthorizationService"));
const activationMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.method === 'OPTIONS') {
        next();
    }
    try {
        const payloadData = req.data;
        let user = yield AuthorizationService_1.default.findItems(config_1.tableNames['user'], 'login', payloadData.login);
        if (!user.length)
            return res.status(401).json({ message: 'The user isnt authorized' });
        if (!user[0].isActivated)
            return res.status(403).json({ message: 'This service is available only for activated users!' });
        next();
    }
    catch (e) {
        return res.status(401).json({ message: 'The user isnt authorized' });
    }
});
exports.activationMiddleware = activationMiddleware;
//# sourceMappingURL=activationMiddleware.js.map