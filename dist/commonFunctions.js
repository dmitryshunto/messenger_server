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
exports.getFileFromDataUrl = exports.getUserAvatarUrl = exports.getPathToUserFolder = exports.getChatNameFromUserLogins = exports.getArrayUniqueElements = void 0;
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}
function getArrayUniqueElements(array) {
    return array.filter(onlyUnique);
}
exports.getArrayUniqueElements = getArrayUniqueElements;
const getChatNameFromUserLogins = (logins, userLogin) => {
    if (!logins.length)
        throw new Error('Empty logins array!');
    if (logins.length === 2) {
        return logins.find(login => login !== userLogin);
    }
    let chatName = '';
    for (let index = 0; index < 4; index++) {
        if (logins[index] === userLogin || !logins[index])
            continue;
        if (index !== logins.length - 1)
            chatName += `${logins[index]}, `;
        else
            chatName += `${logins[index]}`;
    }
    return logins.length > 4 ? `${chatName}...` : chatName;
};
exports.getChatNameFromUserLogins = getChatNameFromUserLogins;
const getPathToUserFolder = (login) => path_1.default.join(config_1.pathToUploads, login);
exports.getPathToUserFolder = getPathToUserFolder;
const getUserAvatarUrl = (login, fileName) => {
    return path_1.default.join(config_1.uploadsFolder, login, fileName);
};
exports.getUserAvatarUrl = getUserAvatarUrl;
const getFileFromDataUrl = (dataUrl) => __awaiter(void 0, void 0, void 0, function* () {
    let blob = yield fetch(dataUrl).then(r => r.blob());
    return new File([blob], 'new.png', { type: 'image/png' });
});
exports.getFileFromDataUrl = getFileFromDataUrl;
//# sourceMappingURL=commonFunctions.js.map