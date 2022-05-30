import { MessageType, UIMessageData } from "../types/chats"

export class UIMessagesDTO {
    messages: UIMessageData[]
    constructor(messages: MessageType[]) {
        this.messages = messages.map(mes => {
            return { 
                ...mes,
                isSending: false,
                sendingSuccess: null
            }
        })
    }
}