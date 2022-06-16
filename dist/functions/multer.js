"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStorage = void 0;
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const commonFunctions_1 = require("../functions/commonFunctions");
function createStorage() {
    const storage = multer_1.default.diskStorage({
        destination: (req, file, next) => {
            var _a;
            const login = req.body.login || ((_a = req.data) === null || _a === void 0 ? void 0 : _a.login);
            if (login) {
                const userFolderPath = (0, commonFunctions_1.getPathToUserFolder)(login);
                if (!fs_1.default.existsSync(userFolderPath)) {
                    fs_1.default.mkdirSync(userFolderPath);
                }
                next(null, userFolderPath);
            }
            else {
                next(new Error('Invalid user login!'), null);
            }
        },
        filename: (req, file, next) => {
            const login = req.body.login || req.data.login;
            const fileName = Date.now() + path_1.default.extname(file.originalname);
            const photoUrl = (0, commonFunctions_1.getUserAvatarUrl)(login, fileName);
            req.data = Object.assign(Object.assign({}, req.data), { photoUrl });
            next(null, fileName);
        }
    });
    return storage;
}
exports.createStorage = createStorage;
//# sourceMappingURL=multer.js.map