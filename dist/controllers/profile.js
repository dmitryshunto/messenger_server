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
const ProfileService_1 = __importDefault(require("../services/ProfileService"));
const activationMiddleware_1 = require("../middlewares/activationMiddleware");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const profileHandler = (router) => {
    const routes = router();
    routes.get('/myProfile', [authMiddleware_1.authMiddleware], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield ProfileService_1.default.getMyProfile(req, res);
    }));
    routes.get('/getProfile/:id', [authMiddleware_1.authMiddleware], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield ProfileService_1.default.getProfile(req, res);
    }));
    routes.get('/getUsers', [authMiddleware_1.authMiddleware, activationMiddleware_1.activationMiddleware], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield ProfileService_1.default.getUsers(req, res);
    }));
    return routes;
};
module.exports = profileHandler;
//# sourceMappingURL=profile.js.map