import { UIUserDataDTO } from "../dto/userDto";
import { BaseResponse } from "../types/common";
import { EmptyRequest, GetUseProfilerRequest, GetUsersRequest } from "../types/requests";
import { BaseService } from "./BaseService";
import { Response } from 'express'
import { tableNames } from "../config";
import { UIUserData, UserData } from "../types/users";
import { TokenPayload } from "../types/tokens";
import chatService from "./ChatService";

class ProfileService extends BaseService {
    
    async getMyProfile(req: EmptyRequest, res: Response<BaseResponse<UIUserData>>) {
        try {
            const tokenPayload = req.data as TokenPayload
            let [user] = await this.findItems<UserData>(tableNames['user'], 'login', tokenPayload.login)
            return res.status(200).json({message: 'Ok', data: (new UIUserDataDTO(user)).user})
        } catch(e) {
            return res.status(400).json({message: 'Cannot find the user!'})
        }
    }
    
    async selectUsersWithLoginContainingString(login: string, str: string, portionSize: string | undefined) {
        let queryForUsersWithLoginStartingFromString = `SELECT * FROM ${tableNames['user']} WHERE login LIKE ? AND login NOT LIKE ?`
        let paramsForUsersWithLoginStartingFromString = [`${str}%`, login]
        
        let queryForUsersWithLoginContainingFromString = `SELECT * FROM ${tableNames['user']} WHERE login NOT LIKE ? AND login LIKE ? AND login NOT LIKE ?`
        let paramsForUsersWithLoginContainingFromString = [`${str}%`, `%${str}%`, login]
        if(portionSize) {       
            queryForUsersWithLoginStartingFromString += ` LIMIT ?`
            paramsForUsersWithLoginStartingFromString = [...paramsForUsersWithLoginStartingFromString, `${portionSize}`]

            queryForUsersWithLoginContainingFromString += ` LIMIT ?`
            paramsForUsersWithLoginContainingFromString = [...paramsForUsersWithLoginContainingFromString, `${portionSize}`]
        }
        
        const connection = await this._createConnection()
        let [usersStartingWithLogin] = await connection.execute<UserData[]>(queryForUsersWithLoginStartingFromString, paramsForUsersWithLoginStartingFromString)
        let [usersWithLogin] = await connection.execute<UserData[]>(queryForUsersWithLoginContainingFromString, paramsForUsersWithLoginContainingFromString)
        await connection.end()

        return [...usersStartingWithLogin, ...usersWithLogin]            
    }

    async getUsers(req: GetUsersRequest, res: Response<BaseResponse<UIUserData[]>>) {
        try {
            const { str, portionSize } = req.query
            const tokenPayload = req.data as TokenPayload
            let users: UserData[]
            
            if(str) users = await this.selectUsersWithLoginContainingString(tokenPayload.login, str, portionSize) 
            else users = await this.findItems<UserData>(tableNames['user'])
            
            let data = []
            for (let user of users) {
                data.push(new UIUserDataDTO(user).user)
            }
            res.json({message: 'Ok!', data})
        } catch(e) {
            console.log(e)
            return res.status(500).json({ message: 'Server error!' })           
        }
    }

    async getProfile(req: GetUseProfilerRequest, res: Response<BaseResponse<UIUserData>>) {
        try {
            const {id} = req.params
            const tokenPayload = req.data as TokenPayload
            const users = await this.findItems<UserData>(tableNames['user'], 'id', id)
            if(!users.length) return res.status(400).json({message: 'No users found!'})
            const privateChatId = await chatService.getPrivateChatId(tokenPayload.userId, id)
            return res.json({message: 'Ok!', data: new UIUserDataDTO(users[0], privateChatId).user})
        } catch(e) {
            console.log(e)
            return res.status(500).json({ message: 'Server error!' })           
        }
    }
}

export default new ProfileService()