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
exports.AuthService = void 0;
const config_1 = require("../config");
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_validator_1 = require("express-validator");
const uuid_1 = require("uuid");
const MailService_1 = require("./MailService");
const TokenService_1 = require("./TokenService");
const userDto_1 = require("../dto/userDto");
const BaseService_1 = require("./BaseService");
class AuthService extends BaseService_1.BaseService {
    constructor() {
        super();
        this.mailService = new MailService_1.MailService();
        this.tokenService = new TokenService_1.TokenService();
    }
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield this._createConnection();
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ message: 'Registration error', errors: errors.array({ onlyFirstError: true }) });
                }
                const { login, password, firstName, lastName, email } = req.body;
                const logins = yield this.findItems(config_1.table_names['user'], 'login', login);
                if (logins.length)
                    return res.status(400).json({ message: "The user with the same login already exists!" });
                const emails = yield this.findItems(config_1.table_names['user'], 'email', email);
                if (emails.length)
                    return res.status(400).json({ message: "The user with the same email already exists!" });
                const hash = yield bcrypt_1.default.hash(password, 5);
                const activationLink = (0, uuid_1.v4)();
                const userRegistartionData = {
                    login, firstName, lastName, email, activationLink,
                    password: hash
                };
                yield connection.query(`INSERT INTO ${config_1.table_names['user']} SET ?`, userRegistartionData);
                let [user] = yield this.findItems(config_1.table_names['user'], 'login', login);
                yield this.mailService.sendActiovationMessage(email, `${config_1.SERVER_URL}users/activate/${activationLink}`);
                const tokens = this.tokenService.generateTokens({ login, email });
                yield this.tokenService.saveToken(user.id, tokens.refreshToken);
                res.cookie(config_1.refreshTokenCookieName, tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
                return res.json({ message: 'You have been registered!', data: new userDto_1.UserDTO(user, tokens) });
            }
            catch (e) {
                console.log(e);
                return res.status(400).json({ message: 'Registration error!' });
            }
        });
    }
    authorizeUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ message: 'Authorization error', data: errors });
                }
                const connection = yield this._createConnection();
                const { login, password } = req.body;
                const users = yield this.findItems(config_1.table_names['user'], 'login', login);
                yield connection.end();
                if (!users.length)
                    return res.status(400).json({ message: "Wrong password or username!" });
                let user = users[0];
                const validPassword = yield bcrypt_1.default.compare(password, user.password);
                if (!validPassword)
                    return res.status(400).json({ message: "Wrong password or username!" });
                const tokens = this.tokenService.generateTokens({ login, email: user.email });
                yield this.tokenService.saveToken(user.id, tokens.refreshToken);
                res.cookie(config_1.refreshTokenCookieName, tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
                return res.json({ message: 'You have been logged!', data: new userDto_1.UserDTO(user, tokens) });
            }
            catch (e) {
                console.log(e);
                return res.status(400).json({ message: 'Authorization error!' });
            }
        });
    }
    activateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield this._createConnection();
                const activationLink = req.params.link;
                let users = yield this.findItems(config_1.table_names['user'], 'activationLink', activationLink);
                if (!users.length)
                    return res.status(400).json({ message: 'Wrong activation link!' });
                let userId = users[users.length - 1].id;
                yield connection.query(`UPDATE ${config_1.table_names['user']} SET isActivated = ? WHERE id = ?`, [true, userId]);
                yield connection.end();
                return res.redirect(config_1.CLIENT_URL);
            }
            catch (e) {
                console.log(e);
                return res.status(400).json({ message: 'Activation error!' });
            }
        });
    }
    logoutUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.cookies;
                yield this.tokenService.removeToken(refreshToken);
                res.clearCookie(config_1.refreshTokenCookieName);
                return res.status(200).json({ message: 'Ok' });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error!' });
            }
        });
    }
    refresh(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield this._createConnection();
                const { refreshToken } = req.cookies;
                if (!refreshToken)
                    return res.status(400).json({ message: 'Authorization error!' });
                let userData = this.tokenService.validateToken(refreshToken, 'refresh');
                let tokenFromDb = yield this.tokenService.findItems(config_1.table_names['token'], 'refreshToken', refreshToken);
                if (!userData || !tokenFromDb.length)
                    return res.status(400).json({ message: 'Authorization error!' });
                let users = yield this.findItems(config_1.table_names['user'], 'login', userData.login);
                yield connection.end();
                let user = users[0];
                const tokens = this.tokenService.generateTokens({ login: user.login, email: user.email });
                yield this.tokenService.saveToken(user.id, tokens.refreshToken);
                res.cookie(config_1.refreshTokenCookieName, tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
                return res.json({ message: 'Ok!', data: new userDto_1.UserDTO(user, tokens) });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error!' });
            }
        });
    }
    selectUsersWithLoginContainingString(str, portionSize) {
        return __awaiter(this, void 0, void 0, function* () {
            let queryForUsersWithLoginStartingFromString = `SELECT * FROM ${config_1.table_names['user']} WHERE login LIKE ?`;
            let paramsForUsersWithLoginStartingFromString = [`${str}%`];
            let queryForUsersWithLoginContainingFromString = `SELECT * FROM ${config_1.table_names['user']} WHERE login NOT LIKE ? AND login LIKE ?`;
            let paramsForUsersWithLoginContainingFromString = [`${str}%`, `%${str}%`];
            if (portionSize) {
                queryForUsersWithLoginStartingFromString += ` LIMIT ?`;
                paramsForUsersWithLoginStartingFromString = [...paramsForUsersWithLoginStartingFromString, `${portionSize}`];
                queryForUsersWithLoginContainingFromString += ` LIMIT ?`;
                paramsForUsersWithLoginContainingFromString = [...paramsForUsersWithLoginContainingFromString, `${portionSize}`];
            }
            const connection = yield this._createConnection();
            let [usersStartingWithLogin] = yield connection.execute(queryForUsersWithLoginStartingFromString, paramsForUsersWithLoginStartingFromString);
            let [usersWithLogin] = yield connection.execute(queryForUsersWithLoginContainingFromString, paramsForUsersWithLoginContainingFromString);
            yield connection.end();
            return [...usersStartingWithLogin, ...usersWithLogin];
        });
    }
    getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { login, portionSize } = req.query;
                let users;
                if (login)
                    users = yield this.selectUsersWithLoginContainingString(login, portionSize);
                else
                    users = yield this.findItems(config_1.table_names['user']);
                let data = [];
                for (let user of users) {
                    data.push(new userDto_1.UIUserData(user).user);
                }
                res.json({ message: 'Ok!', data });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error!' });
            }
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthorizationHandlers.js.map