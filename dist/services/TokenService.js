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
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const BaseService_1 = require("./BaseService");
class TokenService extends BaseService_1.BaseService {
    generateTokens(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, config_1.JWT_ACCESS_SECRET, {
            expiresIn: "30m"
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, config_1.JWT_REFRESH_SECRET, {
            expiresIn: "30d"
        });
        return { accessToken, refreshToken };
    }
    validateToken(token, tokenType) {
        try {
            let SECRET_KEY = tokenType === 'access' ? config_1.JWT_ACCESS_SECRET : config_1.JWT_REFRESH_SECRET;
            const userData = jsonwebtoken_1.default.verify(token, SECRET_KEY);
            return userData;
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }
    saveToken(userId, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield this._createConnection();
                const tokens = yield this.findItems(config_1.tableNames['token'], 'userId', userId);
                if (tokens.length) {
                    yield connection.query(`UPDATE ${config_1.tableNames['token']} SET refreshToken = ? WHERE userId = ?`, [refreshToken, userId]);
                }
                else
                    yield connection.query(`INSERT INTO ${config_1.tableNames['token']} SET ?`, { userId, refreshToken });
                yield connection.end();
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    removeToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this._createConnection();
            yield connection.query(`DELETE FROM ${config_1.tableNames['token']} WHERE refreshToken = ?`, [refreshToken]);
            yield connection.end();
        });
    }
}
exports.TokenService = TokenService;
//# sourceMappingURL=TokenService.js.map