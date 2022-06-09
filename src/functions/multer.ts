import path from 'path'
import multer from 'multer'
import fs from 'fs'
import { getPathToUserFolder, getUserAvatarUrl } from "../functions/commonFunctions"
import { RequestType } from '../types/common'
import { TokenPayload } from '../types/tokens'
import { UpdatePhotoData } from '../types/requests'

export function createStorage<R extends RequestType<any, any, any, UpdatePhotoData>>() {
    const storage = multer.diskStorage({
        destination: (req: R, file, next) => {
            const login = req.body.login || req.data?.login
            if (login) {
                const userFolderPath = getPathToUserFolder(login)
                if (!fs.existsSync(userFolderPath)) {
                    fs.mkdirSync(userFolderPath);
                }
                next(null, userFolderPath)
            } else {
                next(new Error('Invalid user login!'), null)
            }
        },
        filename: (req: R, file, next) => {
            const login = req.body.login || req.data.login
            const fileName = Date.now() + path.extname(file.originalname)
            const photoUrl = getUserAvatarUrl(login, fileName)
            req.data = {
                ...req.data,
                photoUrl
            }
            next(null, fileName)
        }
    })
    return storage
}