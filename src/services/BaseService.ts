import bluebird from 'bluebird'
import mysql2, { RowDataPacket } from 'mysql2/promise'
import { database, host, password, port, user } from '../config'

export class BaseService {
    async findItems<D extends RowDataPacket>(tableName: string, parameter?: string, value?: any) {
        try {
            const connection = await this._createConnection()
            let items: D[]
            if(parameter && value) [items] = await connection.execute<D[]>(`SELECT * FROM ${tableName} WHERE ${parameter} = ?`, [value])
            else [items] = await connection.execute<D[]>(`SELECT * FROM ${tableName}`)
            await connection.end()
            return items
        } catch (e) {
            console.log(e)
        }
    }
    async _createConnection() {
        return await mysql2.createConnection({
            host, port, user, password, database, Promise: bluebird
        })
    }
}