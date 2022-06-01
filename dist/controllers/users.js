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
const AuthorizationService_1 = __importDefault(require("../services/AuthorizationService"));
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const commonFunctions_1 = require("../functions/commonFunctions");
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, next) => {
        const login = req.body.login;
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
        const login = req.body.login;
        const fileName = Date.now() + path_1.default.extname(file.originalname);
        req.data = {
            photoUrl: (0, commonFunctions_1.getUserAvatarUrl)(login, fileName)
        };
        next(null, fileName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 1 * 1024 * 1024
    }
});
const userHandler = (router) => {
    const routes = router();
    routes.post('/create', [
        upload.single('avatar'),
        (0, express_validator_1.body)(['login', 'firstName', 'lastName', 'email'], 'Field cannot be empty').notEmpty(),
        (0, express_validator_1.body)('email', 'Incorrect email').isEmail(),
        (0, express_validator_1.body)('password', 'The password must contain at least one number character, one lowercase letter, one uppercase letter, and must be more than 8 characters')
            .isString()
            .isLength({ min: 8 })
            .not()
            .isLowercase()
            .not()
            .isUppercase()
            .not()
            .isNumeric()
            .not()
            .isAlpha(),
        (0, express_validator_1.body)('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation field does not match the password');
            }
            return true;
        }),
        (0, express_validator_1.body)(['login', 'firstName', 'lastName'], 'Too short value').isLength({ min: 2 }),
    ], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield AuthorizationService_1.default.createUser(req, res);
    }));
    routes.get('/activate/:link', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield AuthorizationService_1.default.activateUser(req, res);
    }));
    routes.post('/authorize', [
        (0, express_validator_1.body)(['login', 'password'], 'Field cannot be empty').notEmpty(),
    ], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield AuthorizationService_1.default.authorizeUser(req, res);
    }));
    routes.get('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield AuthorizationService_1.default.logoutUser(req, res);
    }));
    routes.get('/refresh', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield AuthorizationService_1.default.refresh(req, res);
    }));
    return routes;
};
module.exports = userHandler;
//# sourceMappingURL=users.js.map