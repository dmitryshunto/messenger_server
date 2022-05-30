import { NextFunction, Response } from "express"
import { JwtPayload } from "jsonwebtoken"
import { tableNames } from "../config"
import authService from "../services/AuthorizationService"
import { BaseResponse, RequestType } from "../types/common"
import { UserData } from "../types/users"
import { TokenPayload } from "../types/tokens"


export const activationMiddleware = async (req: RequestType<any, any,  {}, string | JwtPayload>, res: Response<BaseResponse<any>>, next: NextFunction) => {
    if(req.method === 'OPTIONS') {
        next()
    }
    try {
        const payloadData = req.data as TokenPayload
        let user = await authService.findItems<UserData>(tableNames['user'], 'login', payloadData.login)
        if(!user.length) return res.status(401).json({message: 'The user isnt authorized'})
        if(!user[0].isActivated) return res.status(403).json({message: 'This service is available only for activated users!'})
        next()
    } catch(e) {
        return res.status(401).json({message: 'The user isnt authorized'})
    }
}