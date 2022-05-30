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
exports.ProfileHandler = void 0;
const userDto_1 = require("../dto/userDto");
const BaseService_1 = require("./BaseService");
const config_1 = require("../config");
class ProfileHandler extends BaseService_1.BaseService {
    getMyProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tokenPayload = req.data;
                let [user] = yield this.findItems(config_1.table_names['user'], 'login', tokenPayload.login);
                return res.status(200).json({ message: 'Ok', data: new userDto_1.UIUserData(user) });
            }
            catch (e) {
                return res.status(400).json({ message: 'Cannot find the user!' });
            }
        });
    }
}
exports.ProfileHandler = ProfileHandler;
//# sourceMappingURL=ProfilesService.js.map