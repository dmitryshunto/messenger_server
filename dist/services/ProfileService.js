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
const userDto_1 = require("../dto/userDto");
const BaseService_1 = require("./BaseService");
const config_1 = require("../config");
const ChatService_1 = __importDefault(require("./ChatService"));
class ProfileService extends BaseService_1.BaseService {
    getMyProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tokenPayload = req.data;
                let [user] = yield this.findItems(config_1.tableNames['user'], 'login', tokenPayload.login);
                return res.status(200).json({ message: 'Ok', data: (new userDto_1.UIUserDataDTO(user)).user });
            }
            catch (e) {
                return res.status(400).json({ message: 'Cannot find the user!' });
            }
        });
    }
    selectUsersWithLoginContainingString(login, str, portionSize) {
        return __awaiter(this, void 0, void 0, function* () {
            let queryForUsersWithLoginStartingFromString = `SELECT * FROM ${config_1.tableNames['user']} WHERE login LIKE ? AND login NOT LIKE ?`;
            let paramsForUsersWithLoginStartingFromString = [`${str}%`, login];
            let queryForUsersWithLoginContainingFromString = `SELECT * FROM ${config_1.tableNames['user']} WHERE login NOT LIKE ? AND login LIKE ? AND login NOT LIKE ?`;
            let paramsForUsersWithLoginContainingFromString = [`${str}%`, `%${str}%`, login];
            if (portionSize) {
                queryForUsersWithLoginStartingFromString += ` LIMIT ?`;
                paramsForUsersWithLoginStartingFromString = [...paramsForUsersWithLoginStartingFromString, `${portionSize}`];
                queryForUsersWithLoginContainingFromString += ` LIMIT ?`;
                paramsForUsersWithLoginContainingFromString = [...paramsForUsersWithLoginContainingFromString, `${portionSize}`];
            }
            const connection = yield this._createConnection();
            let [usersStartingWithLogin] = yield connection.execute(queryForUsersWithLoginStartingFromString, paramsForUsersWithLoginStartingFromString);
            let [usersWithLogin] = yield connection.execute(queryForUsersWithLoginContainingFromString, paramsForUsersWithLoginContainingFromString);
            yield connection.end();
            return [...usersStartingWithLogin, ...usersWithLogin];
        });
    }
    getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { str, portionSize } = req.query;
                const tokenPayload = req.data;
                let users;
                if (str)
                    users = yield this.selectUsersWithLoginContainingString(tokenPayload.login, str, portionSize);
                else
                    users = yield this.findItems(config_1.tableNames['user']);
                let data = [];
                for (let user of users) {
                    data.push(new userDto_1.UIUserDataDTO(user).user);
                }
                res.json({ message: 'Ok!', data });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error!' });
            }
        });
    }
    getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const tokenPayload = req.data;
                const users = yield this.findItems(config_1.tableNames['user'], 'id', id);
                if (!users.length)
                    return res.status(400).json({ message: 'No users found!' });
                const privateChatId = yield ChatService_1.default.getPrivateChatId(tokenPayload.userId, id);
                return res.json({ message: 'Ok!', data: new userDto_1.UIUserDataDTO(users[0], privateChatId).user });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error!' });
            }
        });
    }
}
exports.default = new ProfileService();
//# sourceMappingURL=ProfileService.js.map