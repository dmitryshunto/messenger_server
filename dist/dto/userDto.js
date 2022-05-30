"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyProfileDTO = exports.UIUserDataDTO = exports.UserDTO = void 0;
class UserDTO {
    constructor(user, tokens, newMessages) {
        this.tokens = tokens;
        this.user = new MyProfileDTO(user, newMessages).user;
    }
}
exports.UserDTO = UserDTO;
class UIUserDataDTO {
    constructor(user, privateChatId) {
        let { password, activationLink } = user, uiUserData = __rest(user, ["password", "activationLink"]);
        if (!privateChatId)
            privateChatId = null;
        this.user = Object.assign(Object.assign({}, uiUserData), { privateChatId });
    }
}
exports.UIUserDataDTO = UIUserDataDTO;
class MyProfileDTO {
    constructor(user, newMessages) {
        const uiUserData = new UIUserDataDTO(user).user;
        this.user = Object.assign(Object.assign({}, uiUserData), { newMessages });
    }
}
exports.MyProfileDTO = MyProfileDTO;
//# sourceMappingURL=userDto.js.map