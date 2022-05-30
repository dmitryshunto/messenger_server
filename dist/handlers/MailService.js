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
exports.MailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
class MailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: config_1.SMTP_HOST,
            port: config_1.SMTP_PORT,
            secure: false,
            auth: {
                user: config_1.SMTP_USER,
                pass: config_1.APP_PASSWORD
            }
        });
    }
    sendActiovationMessage(to, link) {
        return __awaiter(this, void 0, void 0, function* () {
            this.transporter.sendMail({
                from: config_1.SMTP_USER,
                to,
                subject: "Messager Account Activation",
                html: `
                    <div>
                        <p>For activation your account follow the link:</p>
                        <a href="${link}">Activate</a>
                    </div>
                `
            });
        });
    }
}
exports.MailService = MailService;
//# sourceMappingURL=MailService.js.map