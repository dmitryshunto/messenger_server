import { getPathToUserFolder } from "./commonFunctions";
import fs from "fs";

export const getFileFromDataUrl = async (dataUrl: string) => {
    let blob = await fetch(dataUrl).then(r => r.blob())
    return new File([blob], 'new.png', { type: 'image/png' });
}

export const saveUserAvatar = (userLogin: string, dataUrl: string) => {
    const userFolderPath = getPathToUserFolder(userLogin)
    if (!fs.existsSync(userFolderPath)) {
        fs.mkdirSync(userFolderPath);
    }
    const data = dataUrl.replace(/^data:image\/\w+;base64,/, "")
    const buf = Buffer.from(data, 'base64')
    fs.writeFileSync(`${userFolderPath}/avatar.png`, buf)
}