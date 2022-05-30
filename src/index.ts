import express from 'express'
import inject from 'require-all'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { CLIENT_URL, HOST_PORT } from './config'
import http from 'http'
import { WebSocketService } from './webSocketServer/webSocket'
import { Server } from 'socket.io'

const router = express.Router
const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: [CLIENT_URL]
    }
})

export default new WebSocketService(io)

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: CLIENT_URL
}))

app.use(bodyParser.urlencoded({
    extended: true
}))

const controllers = inject(__dirname + '/controllers')

for (let name in controllers) {
    app.use(`/${name}`, controllers[name](router))
}

const start = () => {
    try {

        server.listen(HOST_PORT, () => {
            console.log(`App is listening on port ${HOST_PORT}`)
        })
    } catch(e) {
        console.log(e)
        
    }
}

start()