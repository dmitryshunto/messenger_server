"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUserAvatar = exports.getFileFromDataUrl = void 0;
const commonFunctions_1 = require("./commonFunctions");
const fs_1 = __importDefault(require("fs"));
const getFileFromDataUrl = (dataUrl) => __awaiter(void 0, void 0, void 0, function* () {
    let blob = yield fetch(dataUrl).then(r => r.blob());
    return new File([blob], 'new.png', { type: 'image/png' });
});
exports.getFileFromDataUrl = getFileFromDataUrl;
const saveUserAvatar = (userLogin, dataUrl) => {
    const userFolderPath = (0, commonFunctions_1.getPathToUserFolder)(userLogin);
    if (!fs_1.default.existsSync(userFolderPath)) {
        fs_1.default.mkdirSync(userFolderPath);
    }
    const data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    const buf = Buffer.from(data, 'base64');
    fs_1.default.writeFileSync(`${userFolderPath}/avatar.png`, buf);
};
exports.saveUserAvatar = saveUserAvatar;
//# sourceMappingURL=fileSystem.js.map