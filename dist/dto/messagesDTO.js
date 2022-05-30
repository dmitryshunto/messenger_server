"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIMessagesDTO = void 0;
class UIMessagesDTO {
    constructor(messages) {
        this.messages = messages.map(mes => {
            return Object.assign(Object.assign({}, mes), { isSending: false, sendingSuccess: null });
        });
    }
}
exports.UIMessagesDTO = UIMessagesDTO;
//# sourceMappingURL=messagesDTO.js.map