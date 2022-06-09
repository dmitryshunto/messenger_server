import { Response, NextFunction } from "express"
import jwt, {JwtPayload} from 'jsonwebtoken'
import { JWT_ACCESS_SECRET } from "../config"
import { BaseResponse, RequestType } from "../types/common"
import { TokenPayload } from "../types/tokens"

export const authMiddleware = (req: RequestType<any, any,  {}, TokenPayload>, res: Response<BaseResponse<any>>, next: NextFunction) => {
    if(req.method === 'OPTIONS') {
        next()
    }
    try {
        if(!req.headers.authorization) return res.status(401).json({message: 'The user isnt authorized'})
        const token = req.headers.authorization.split(' ')[1]
        if(!token) return res.status(401).json({message: 'The user isnt authorized'})
        const decodedData = jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload
        if(req.data) {
            req.data = {
                ...req.data,
                ...decodedData 
            }   
        } else {
            req.data = decodedData
        }
         
        next()
    } catch(e) {
        return res.status(401).json({message: 'The user isnt authorized'})
    }
}