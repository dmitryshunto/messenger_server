import { MyProfileData, UIUserData as UIUserDataType, UserData } from '../types/users'
import { TokensType } from '../types/tokens'

export type UserDtoType = {
    user: MyProfileData
    tokens: TokensType
}

export class UserDTO implements UserDtoType {
    user: MyProfileData
    tokens: TokensType
    constructor(user: UserData, tokens: TokensType, newMessages: number[]) {
        this.tokens = tokens
        this.user = new MyProfileDTO(user, newMessages).user
    }
}

export class UIUserDataDTO {
    user: UIUserDataType
    constructor(user: UserData, privateChatId?: number | null) {
        let {password, activationLink, ...uiUserData} = user
        if(!privateChatId) privateChatId = null
        this.user = {...uiUserData, privateChatId}
    }
}

export class MyProfileDTO {
    user: MyProfileData
    constructor(user: UserData, newMessages: number[]) {
        const uiUserData = new UIUserDataDTO(user).user
        this.user = {
            ...uiUserData,
            newMessages
        }  
    }
}
