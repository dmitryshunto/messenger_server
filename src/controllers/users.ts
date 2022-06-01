import { Router, Response, Request } from "express"
import { ActivateUserRequest, CreateUserRequest } from "../types/requests"
import authService from '../services/AuthorizationService'
import { body, ValidationError } from "express-validator"
import { UserAuthorizationData, UserRegistrationData } from "../types/users"
import { BaseResponse } from "../types/common"
import { UserDtoType } from "../dto/userDto"
import multer from 'multer'
import fs from 'fs'
import { getPathToUserFolder, getUserAvatarUrl } from "../functions/commonFunctions"
import path from 'path'

const storage = multer.diskStorage({
    destination: (req: CreateUserRequest, file, next) => {
        const login = req.body.login
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
    filename: (req: CreateUserRequest, file, next) => {
        const login = req.body.login
        const fileName = Date.now() + path.extname(file.originalname)
        req.data = {
            photoUrl: getUserAvatarUrl(login, fileName)
        }
        next(null, fileName)
    }
})

const upload = multer({ 
    storage, 
    limits: {
        fileSize: 1 * 1024 * 1024
    }
})

const userHandler = (router: typeof Router) => {
    const routes = router()
    routes.post<string, {}, any, UserRegistrationData>('/create',
        [
            upload.single('avatar'),
            body(['login', 'firstName', 'lastName', 'email'], 'Field cannot be empty').notEmpty(),
            body('email', 'Incorrect email').isEmail(),
            body('password', 'The password must contain at least one number character, one lowercase letter, one uppercase letter, and must be more than 8 characters')
                .isString()
                .isLength({ min: 8 })
                .not()
                .isLowercase()
                .not()
                .isUppercase()
                .not()
                .isNumeric()
                .not()
                .isAlpha(),
            body('confirmPassword').custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Password confirmation field does not match the password');
                }
                return true;
            }),
            body(['login', 'firstName', 'lastName'], 'Too short value').isLength({ min: 2 }),
        ],
        async (req: CreateUserRequest, res: Response<BaseResponse<UserDtoType | ValidationError[]>>) => {
            await authService.createUser(req, res)
        })

    routes.get<string, {}, any, any>('/activate/:link',
        async (req: ActivateUserRequest, res: Response<BaseResponse<any>>) => {
            await authService.activateUser(req, res)
        })

    routes.post<string, {}, any, UserAuthorizationData>('/authorize',
        [
            body(['login', 'password'], 'Field cannot be empty').notEmpty(),
        ],
        async (req: CreateUserRequest, res: Response) => {
            await authService.authorizeUser(req, res)
        })
    routes.get('/logout',
        async (req: Request, res: Response) => {
            await authService.logoutUser(req, res)
        })
    routes.get('/refresh',
        async (req: Request, res: Response) => {
            await authService.refresh(req, res)
        })
    return routes
}

module.exports = userHandler