"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authMiddleware = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        next();
    }
    try {
        if (!req.headers.authorization)
            return res.status(401).json({ message: 'The user isnt authorized' });
        const token = req.headers.authorization.split(' ')[1];
        if (!token)
            return res.status(401).json({ message: 'The user isnt authorized' });
        const decodedData = jsonwebtoken_1.default.verify(token, config_1.JWT_ACCESS_SECRET);
        if (req.data) {
            req.data = Object.assign(Object.assign({}, req.data), decodedData);
        }
        else {
            req.data = decodedData;
        }
        next();
    }
    catch (e) {
        return res.status(401).json({ message: 'The user isnt authorized' });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map