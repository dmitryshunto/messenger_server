import path from 'path'
import { pathToUploads, SERVER_URL, uploadsFolder, clientDomain } from '../config';
function onlyUnique<D>(value: D, index: number, array: D[]) {
    return array.indexOf(value) === index;
}

export function getArrayUniqueElements<D>(array: D[]) {
    return array.filter(onlyUnique)
}

export const getChatNameFromUserLogins = (logins: string[], userLogin: string) => {
    if(!logins.length) throw new Error('Empty logins array!')
    
    if(logins.length === 2) {
        return logins.find(login => login !== userLogin)
    }
    let chatName = ''

    for(let index = 0; index < 4; index++) {
        if(logins[index] === userLogin || !logins[index]) continue
        if(index !== logins.length - 1) chatName += `${logins[index]}, `
        else chatName += `${logins[index]}`
    }
    return logins.length > 4 ? `${chatName}...` : chatName
}

export const getPathToUserFolder = (login: string) => path.join(pathToUploads, login)

export const getUserAvatarUrl = (login: string, fileName: string) => {
    return `${clientDomain}${uploadsFolder}/${login}/${fileName}`
}
