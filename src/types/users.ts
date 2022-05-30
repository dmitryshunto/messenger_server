import { RowDataPacket } from "mysql2/promise"

export interface UserAuthorizationData extends RowDataPacket {
    login: string
    password: string
}

interface BaseUserData extends RowDataPacket {
    login: string
    firstName: string
    lastName: string
    email: string
}

export interface UserRegistrationData extends BaseUserData {
    password: string
    confirmPassword?: string
}

export interface AdditionalUserData extends BaseUserData {
    id: number
    isActivated: boolean
    createdAt: string
    photoUrl: string | null
}

export interface UserData extends AdditionalUserData {
    password: string
    activationLink: string
}

export interface UIUserData extends AdditionalUserData {
    privateChatId: number | null
}

export interface MyProfileData extends AdditionalUserData {
    newMessages: number[]
}