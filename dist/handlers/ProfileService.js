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
exports.ProfileService = void 0;
const userDto_1 = require("../dto/userDto");
const BaseService_1 = require("./BaseService");
const config_1 = require("../config");
class ProfileService extends BaseService_1.BaseService {
    getMyProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tokenPayload = req.data;
                let [user] = yield this.findItems(config_1.table_names['user'], 'login', tokenPayload.login);
                return res.status(200).json({ message: 'Ok', data: (new userDto_1.UIUserDataDTO(user)).user });
            }
            catch (e) {
                return res.status(400).json({ message: 'Cannot find the user!' });
            }
        });
    }
    selectUsersWithLoginContainingString(login, str, portionSize) {
        return __awaiter(this, void 0, void 0, function* () {
            let queryForUsersWithLoginStartingFromString = `SELECT * FROM ${config_1.table_names['user']} WHERE login LIKE ? AND login NOT LIKE ?`;
            let paramsForUsersWithLoginStartingFromString = [`${str}%`, login];
            let queryForUsersWithLoginContainingFromString = `SELECT * FROM ${config_1.table_names['user']} WHERE login NOT LIKE ? AND login LIKE ? AND login NOT LIKE ?`;
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
                    users = yield this.findItems(config_1.table_names['user']);
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
}
exports.ProfileService = ProfileService;
//# sourceMappingURL=ProfileService.js.map