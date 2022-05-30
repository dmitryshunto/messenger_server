import { RowDataPacket } from "mysql2"

export type TokensType = {
    accessToken: string
    refreshToken: string
}

export type ValedationTokenType = 'access' | 'refresh'

export interface TokenType extends RowDataPacket {
    id: number
    userId: number
    refreshToken: string
}

export type TokenPayload = {
    login: string
    userId: number
}