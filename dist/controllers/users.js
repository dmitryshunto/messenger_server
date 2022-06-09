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
const multer_2 = require("./../functions/multer");
const config_1 = require("../config");
const storage = (0, multer_2.createStorage)();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 1 * 1024 * 1024
    }
});
const userHandler = (router) => {
    const routes = router();
    routes.post('/create', [
        upload.single(config_1.avatarFormFieldName),
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