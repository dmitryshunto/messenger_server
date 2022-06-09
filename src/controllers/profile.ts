import { Request, Response, Router } from "express";
import profileService from "../services/ProfileService";
import { activationMiddleware } from "../middlewares/activationMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { BaseResponse } from "../types/common";
import { GetUseProfilerRequest, GetUsersRequest, UpdatePhotoRequest } from "../types/requests";
import { UIUserData } from "../types/users";
import multer from 'multer'
import { createStorage } from "../functions/multer";
import { avatarFormFieldName } from "../config";

const storage = createStorage() 

const upload = multer({ 
    storage, 
    limits: {
        fileSize: 1 * 1024 * 1024
    }
})


const profileHandler = (router: typeof Router) => {
    const routes = router()
    routes.put('/updatePhoto', 
        [
            authMiddleware, 
            activationMiddleware,
            upload.single(avatarFormFieldName),
        ],
        async (req: UpdatePhotoRequest, res: Response) => {
            await profileService.updateProfilePhoto(req, res)
        })    
    routes.get('/myProfile',
        [authMiddleware],
        async (req: Request, res: Response) => {
            await profileService.getMyProfile(req, res)
        })

    routes.get('/getProfile/:id',
        [authMiddleware],
        async (req: GetUseProfilerRequest, res: Response) => {
            await profileService.getProfile(req, res)
        })


    routes.get('/getUsers',
        [authMiddleware, activationMiddleware],
        async (req: GetUsersRequest, res: Response<BaseResponse<UIUserData[]>>) => {
            await profileService.getUsers(req, res)
        })
    
    return routes
}

module.exports = profileHandler