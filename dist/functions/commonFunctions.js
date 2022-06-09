"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAvatarUrl = exports.getPathToUserFolder = exports.getChatNameFromUserLogins = exports.getArrayUniqueElements = void 0;
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
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
    return `${config_1.SERVER_URL}${config_1.uploadsFolder}/${login}/${fileName}`;
};
exports.getUserAvatarUrl = getUserAvatarUrl;
//# sourceMappingURL=commonFunctions.js.map