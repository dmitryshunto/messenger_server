import { ResultSetHeader } from "mysql2"
import { tableNames } from "../config"
import { BaseMessageData } from "../types/chats"
import { BaseService } from "./BaseService"

class MessageSevice extends BaseService {
    async insertMessageToDB(msgData: BaseMessageData) {
        try {
            const connection = await this._createConnection()
            let response = await connection.query(`INSERT INTO ${tableNames['message']} SET ?`, msgData)
            await connection.end()
            const responseHeaders = response[0] as ResultSetHeader
            return responseHeaders.insertId
        } catch(e) {
            console.log(e)
        } 
        
    }
    async readMessage(memberId: number, chatId: number, lastReadMessageId: number) {
        try {
            const connection = await this._createConnection()
            await connection.query(`UPDATE ${tableNames['chatMembers']} SET ? WHERE memberId = ? AND chatId = ?`, [{ lastReadMessageId }, memberId, chatId])
            await connection.end()
        } catch (e) {
            console.log(e)
        }

    }
}

export default new MessageSevice()