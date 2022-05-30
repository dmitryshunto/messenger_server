import { ExtendedError } from "socket.io/dist/namespace";
import { JWT_ACCESS_SECRET, notAuthMsg, tableNames } from "../config";
import authService from "../services/AuthorizationService";
import { UserData } from "../types/users";
import jwt from 'jsonwebtoken'
import { TokenPayload } from "../types/tokens";
import { BaseSocket, SocketAuthData } from "../types/webSockets";

const checkUserId = async (socket: BaseSocket<SocketAuthData>, next: (err?: ExtendedError) => void) => {
    try {
        const accessToken = socket.handshake.auth.token
        if (!accessToken) {
            const err = new Error(notAuthMsg)
            next(err)
        }
        const decodedData = jwt.verify(accessToken, JWT_ACCESS_SECRET) as TokenPayload
        let user = await authService.findItems<UserData>(tableNames['user'], 'id', decodedData.userId)
        if (!user.length) {
            const err = new Error(notAuthMsg)
            next(err)
        }
        socket.data = {
            userId: decodedData.userId
        }
        next()
    } catch(e) {
        next(new Error(e.message))
    }
}

export default checkUserId