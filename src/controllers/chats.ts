import { Router, Request, Response } from "express"
import { activationMiddleware } from "../middlewares/activationMiddleware"
import { authMiddleware } from "../middlewares/authMiddleware"
import chatService from "../services/ChatService"
import { CreatePrivateChatPageRequest, EmptyRequest, GetMessagesRequest } from "../types/requests"

const chatHandler = (router: typeof Router) => {
    const routes = router()
    routes.post('/create',
        [authMiddleware, activationMiddleware],
        async (req: Request, res: Response) => {
            await chatService.createChat(req, res)
        })
    routes.get('/getChats',
        [authMiddleware, activationMiddleware],
        async (req: Request, res: Response) => {
            await chatService.getChats(req, res)
        })
    routes.post('/createPrivateChatPage',
        [authMiddleware, activationMiddleware],
        async (req: CreatePrivateChatPageRequest, res: Response) => {
            await chatService.createPrivateChatPage(req, res)
        })
    routes.post('/getMessages/:chatId',
        [authMiddleware, activationMiddleware],
        async (req: GetMessagesRequest, res: Response) => {
            await chatService.getMesages(req, res)
        })


    return routes
}

module.exports = chatHandler