"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const require_all_1 = __importDefault(require("require-all"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const http_1 = __importDefault(require("http"));
const webSocket_1 = require("./webSocketServer/webSocket");
const socket_io_1 = require("socket.io");
const router = express_1.default.Router;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: [config_1.CLIENT_URL]
    }
});
exports.default = new webSocket_1.WebSocketService(io);
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    credentials: true,
    origin: config_1.CLIENT_URL
}));
app.use(body_parser_1.default.urlencoded({
    extended: true
}));
const controllers = (0, require_all_1.default)(__dirname + '/controllers');
for (let name in controllers) {
    app.use(`/${name}`, controllers[name](router));
}
const start = () => {
    try {
        server.listen(config_1.HOST_PORT, () => {
            console.log(`App is listening on port ${config_1.HOST_PORT}`);
        });
    }
    catch (e) {
        console.log(e);
    }
};
start();
//# sourceMappingURL=index.js.map