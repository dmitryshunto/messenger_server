import { BaseResponse, RequestType } from "./common"
import {JwtPayload} from 'jsonwebtoken'
import { UserAuthorizationData, UserRegistrationData } from "./users"
import { Request } from "express"

export type CreateUserRequest = RequestType<any, UserRegistrationData, {}, string | JwtPayload>

export type AuthorizeUserRequest = RequestType<any, UserAuthorizationData, {}, string | JwtPayload>

export type ActivateUserQueryParams = {
    link: string
}

export type ActivateUserRequest = Request<ActivateUserQueryParams, BaseResponse<any>, {}>

export type UserSearchParams = {
    str?: string
    portionSize?: string
}

export type GetUsersRequest = RequestType<any, any, UserSearchParams, {}>

export type EmptyRequest = RequestType<any, any, {}, string | JwtPayload>

export type CreateChatParams = {
    membersIds: number[]
    userId: number // first sender userId 
    body: string // first message body
    chatName?: string
}

export type CreateChatRequest = RequestType<any, CreateChatParams, {}, string | JwtPayload>

export type GetUserChatsRequest = RequestType<any, any, {}, string | JwtPayload>

export type GetMessagesRequest = RequestType<any, {oldestMessageId?: number}, {}, string | JwtPayload, {chatId: number}>

export type GetUseProfilerRequest = RequestType<any, any, {}, string | JwtPayload, {id: number}>

export type CreatePrivateChatPage = {
    companionId: number
}

export type CreatePrivateChatPageRequest = RequestType<any, CreatePrivateChatPage, {}, string | JwtPayload>
