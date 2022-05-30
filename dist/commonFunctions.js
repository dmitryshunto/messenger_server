"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatNameFromUserLogins = exports.getArrayUniqueElements = void 0;
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
//# sourceMappingURL=commonFunctions.js.map