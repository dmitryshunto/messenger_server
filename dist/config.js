"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.avatarFormFieldName = exports.pathToUploads = exports.uploadsFolder = exports.MESSAGE_PORION_SIZE = exports.tableNames = exports.serverError = exports.notAuthMsg = exports.refreshTokenCookieName = exports.CLIENT_URL = exports.SERVER_URL = exports.APP_PASSWORD = exports.SMTP_PASSWORD = exports.SMTP_USER = exports.SMTP_PORT = exports.SMTP_HOST = exports.JWT_REFRESH_SECRET = exports.JWT_ACCESS_SECRET = exports.port = exports.db_name = exports.database = exports.HOST_PORT = exports.host = exports.password = exports.user = void 0;
exports.user = 'dmitry';
exports.password = 'dmitry';
exports.host = 'localhost';
exports.HOST_PORT = 3002;
exports.database = 'messager';
exports.db_name = 'messager';
exports.port = 3306;
exports.JWT_ACCESS_SECRET = 'IlGdMySh4';
exports.JWT_REFRESH_SECRET = 'GhGJJ8hEx4';
exports.SMTP_HOST = 'smtp.gmail.com';
exports.SMTP_PORT = 587;
exports.SMTP_USER = 'mymessagerpost8@gmail.com';
exports.SMTP_PASSWORD = 'Vika1993)';
exports.APP_PASSWORD = 'ralvofpgwpkiixrv';
const CLIENT_HOST_PORT = 3003;
exports.SERVER_URL = `http://${exports.host}:${exports.HOST_PORT}/`;
exports.CLIENT_URL = `http://${exports.host}:${CLIENT_HOST_PORT}`;
exports.refreshTokenCookieName = 'refreshToken';
exports.notAuthMsg = 'Authorization error!';
exports.serverError = 'Server error!';
exports.tableNames = {
    user: 'user',
    message: 'message',
    chat: 'chat',
    token: 'token',
    chatMembers: 'chat_members'
};
exports.MESSAGE_PORION_SIZE = 50;
exports.uploadsFolder = 'uploads';
exports.pathToUploads = `src/${exports.uploadsFolder}`;
exports.avatarFormFieldName = 'avatar';
//# sourceMappingURL=config.js.map