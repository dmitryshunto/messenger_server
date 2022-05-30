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
exports.BaseService = void 0;
const bluebird_1 = __importDefault(require("bluebird"));
const promise_1 = __importDefault(require("mysql2/promise"));
const config_1 = require("../config");
class BaseService {
    findItems(tableName, parameter, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield this._createConnection();
                let items;
                if (parameter && value)
                    [items] = yield connection.execute(`SELECT * FROM ${tableName} WHERE ${parameter} = ?`, [value]);
                else
                    [items] = yield connection.execute(`SELECT * FROM ${tableName}`);
                yield connection.end();
                return items;
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    _createConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield promise_1.default.createConnection({
                host: config_1.host, port: config_1.port, user: config_1.user, password: config_1.password, database: config_1.database, Promise: bluebird_1.default
            });
        });
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=BaseService.js.map