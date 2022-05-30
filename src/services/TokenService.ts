import jwt from 'jsonwebtoken'
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, tableNames } from '../config'
import { TokenPayload, TokensType, ValedationTokenType } from '../types/tokens'
import { BaseService } from './BaseService'

export class TokenService extends BaseService {
    generateTokens(payload: TokenPayload): TokensType {
        const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
            expiresIn: "30m"
        })
        const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
            expiresIn: "30d"
        })
        return { accessToken, refreshToken }
    }

    validateToken(token: string, tokenType: ValedationTokenType): TokenPayload | null {
        try {
            let SECRET_KEY = tokenType === 'access' ? JWT_ACCESS_SECRET : JWT_REFRESH_SECRET
            const userData = jwt.verify(token, SECRET_KEY) as TokenPayload
            return userData
        } catch (e) {
            console.log(e)
            return null
        }
    }
    async saveToken(userId: number, refreshToken: string) {
        try {
            const connection = await this._createConnection()
            const tokens = await this.findItems(tableNames['token'],'userId', userId)
            if (tokens.length) {
                await connection.query(`UPDATE ${tableNames['token']} SET refreshToken = ? WHERE userId = ?`, [refreshToken, userId])
                
            } else await connection.query(`INSERT INTO ${tableNames['token']} SET ?`, { userId, refreshToken })
            await connection.end()
        } catch (e) {
            console.log(e)
        }
    }
    async removeToken(refreshToken: string) {
        const connection = await this._createConnection()
        await connection.query(`DELETE FROM ${tableNames['token']} WHERE refreshToken = ?`, [refreshToken])
        await connection.end()
    }

}