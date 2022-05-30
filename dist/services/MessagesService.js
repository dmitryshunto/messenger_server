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
const config_1 = require("../config");
const BaseService_1 = require("./BaseService");
class MessageSevice extends BaseService_1.BaseService {
    insertMessageToDB(msgData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield this._createConnection();
                let response = yield connection.query(`INSERT INTO ${config_1.tableNames['message']} SET ?`, msgData);
                yield connection.end();
                const responseHeaders = response[0];
                return responseHeaders.insertId;
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    readMessage(memberId, chatId, lastReadMessageId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield this._createConnection();
                yield connection.query(`UPDATE ${config_1.tableNames['chatMembers']} SET ? WHERE memberId = ? AND chatId = ?`, [{ lastReadMessageId }, memberId, chatId]);
                yield connection.end();
            }
            catch (e) {
                console.log(e);
            }
        });
    }
}
exports.default = new MessageSevice();
//# sourceMappingURL=MessagesService.js.map