import { Router, Response, Request } from "express"
import { ActivateUserRequest, CreateUserRequest } from "../types/requests"
import authService from '../services/AuthorizationService'
import { body, ValidationError } from "express-validator"
import { UserAuthorizationData, UserRegistrationData } from "../types/users"
import { BaseResponse } from "../types/common"
import { UserDtoType } from "../dto/userDto"

const userHandler = (router: typeof Router) => {
    const routes = router()
    routes.post<string, {}, any, UserRegistrationData>('/create',
        [
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