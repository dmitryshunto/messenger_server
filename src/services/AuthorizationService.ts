import { apiDomain, clientDomain, CLIENT_URL, refreshTokenCookieName, serverError, SERVER_URL, tableNames } from "../config"
import { Response, Request } from "express"
import { ActivateUserRequest, AuthorizeUserRequest, CreateUserRequest } from "../types/requests"
import bcrypt from 'bcrypt'
import { Result, ValidationError, validationResult } from "express-validator"
import { v4 } from 'uuid'
import { MailService } from './MailService'
import { TokenService } from "./TokenService"
import { UserData } from "../types/users"
import { UserDTO, UserDtoType } from "../dto/userDto"
import { BaseResponse } from '../types/common';
import { BaseService } from "./BaseService"
import { TokenType } from "../types/tokens"
import chatService from './ChatService'

class AuthService extends BaseService {
    mailService: MailService
    tokenService: TokenService
    
    constructor() {
        super()
        this.mailService = new MailService()
        this.tokenService = new TokenService()
    }

    async createUser(req: CreateUserRequest, res: Response<BaseResponse<UserDtoType>>) {
        try {
            const connection = await this._createConnection()
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Registration error', errors: errors.array({ onlyFirstError: true }) })
            }
            const { login, password, firstName, lastName, email } = req.body

            const logins = await this.findItems<UserData>(tableNames['user'], 'login', login)
            if (logins.length) return res.status(400).json({ message: "The user with the same login already exists!" })
            const emails = await this.findItems<UserData>(tableNames['user'], 'email', email)
            if (emails.length) return res.status(400).json({ message: "The user with the same email already exists!" })

            const hash = await bcrypt.hash(password, 5)
            const activationLink = v4()
            let photoUrl = null
            if(req.data && req.data.photoUrl)  photoUrl = req.data.photoUrl
            const userRegistartionData = {
                login, firstName, lastName, email, activationLink,
                password: hash, photoUrl
            }
            await connection.query(`INSERT INTO ${tableNames['user']} SET ?`, userRegistartionData)

            let [user] = await this.findItems<UserData>(tableNames['user'], 'login', login)

            await this.mailService.sendActiovationMessage(email, `${apiDomain}users/activate/${activationLink}`)

            const tokens = this.tokenService.generateTokens({ login, userId: user.id })
            await this.tokenService.saveToken(user.id, tokens.refreshToken)
            res.cookie(refreshTokenCookieName, tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            const newMessages = await chatService.getNewMessagesNumber(user.id)
            return res.json({ message: 'You have been registered!', data: new UserDTO(user, tokens, newMessages) })
        } catch (e) {
            console.log(e)
            return res.status(500).json({ message: 'Registration error!' })
        }
    }

    async authorizeUser(req: AuthorizeUserRequest, res: Response<BaseResponse<Result<ValidationError> | UserDTO>>) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Authorization error', data: errors })
            }
            const connection = await this._createConnection()
            const { login, password } = req.body
            const users = await this.findItems<UserData>(tableNames['user'], 'login', login)
            await connection.end()

            if (!users.length) return res.status(400).json({ message: "Wrong password or username!" })
            let user = users[0]
            const validPassword = await bcrypt.compare(password, user.password)
            if (!validPassword) return res.status(400).json({ message: "Wrong password or username!" })

            const tokens = this.tokenService.generateTokens({ login, userId: user.id })
            await this.tokenService.saveToken(user.id, tokens.refreshToken)
            res.cookie(refreshTokenCookieName, tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            const newMessages = await chatService.getNewMessagesNumber(user.id)
            return res.json({ message: 'You have been logged!', data: new UserDTO(user, tokens, newMessages) })
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: 'Authorization error!' })
        }
    }

    async activateUser(req: ActivateUserRequest, res: Response<BaseResponse<any>>) {
        try {
            const connection = await this._createConnection()
            const activationLink = req.params.link
            let users = await this.findItems(tableNames['user'], 'activationLink', activationLink)
            if (!users.length) return res.status(400).json({ message: 'Wrong activation link!' })
            let userId = users[users.length - 1].id
            await connection.query(`UPDATE ${tableNames['user']} SET isActivated = ? WHERE id = ?`, [true, userId])
            await connection.end()
            return res.redirect(clientDomain)
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: 'Activation error!' })
        }
    }

    async logoutUser(req: Request, res: Response<BaseResponse<any>>) {
        try {
            const { refreshToken } = req.cookies
            await this.tokenService.removeToken(refreshToken)
            res.clearCookie(refreshTokenCookieName)
            return res.status(200).json({ message: 'Ok' })
        } catch (e) {
            console.log(e)
            return res.status(500).json({ message: 'Server error!' })
        }
    }

    async refresh(req: Request, res: Response<BaseResponse<UserDTO>>) {
        try {
            const connection = await this._createConnection()
            const { refreshToken } = req.cookies
            if (!refreshToken) return res.status(400).json({ message: 'Authorization error!' })
            let userData = this.tokenService.validateToken(refreshToken, 'refresh')
            let tokenFromDb = await this.tokenService.findItems<TokenType>(tableNames['token'], 'refreshToken', refreshToken)
            if (!userData || !tokenFromDb.length) return res.status(400).json({ message: 'Authorization error!' })
            let users = await this.findItems<UserData>(tableNames['user'], 'login', userData.login)
            await connection.end()
            let user = users[0]
            const tokens = this.tokenService.generateTokens({ login: user.login, userId: user.id })
            await this.tokenService.saveToken(user.id, tokens.refreshToken)
            res.cookie(refreshTokenCookieName, tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            const newMessages = await chatService.getNewMessagesNumber(user.id)
            return res.json({ message: 'Ok!', data: new UserDTO(user, tokens, newMessages) })
        } catch (e) {
            console.log(e)
            return res.status(500).json({ message: serverError })
        }
    }
}

export default new AuthService()