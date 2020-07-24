const path = require('path');
const http = require('http');
const formatMessage = require('./utils/msgFormat');
const { userJoin,getCurrentUser, userLeft, getRoomUser } = require('./utils/users');
const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const database = require('./Database')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const {
    SESS_NAME = 'sid',
    SESS_SECRET = 'ssh!quiet,it\'asecret!'
} = process.env

app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET
}))

const redirectLogin = (req, res, next) => {
    if(!req.session.sessId) {
        res.redirect('/')
    } else {
        next()
    }
}

app.use(express.static(path.join(__dirname,"public")));


app.get('/', (req,res) => {
    keept = {
        name: 'bat',
        room: 'js',
        msg: 'bruh'
    }
    //database.addData(keept)
    database.getData()
    res.render('index.ejs')
});

let sessId = ""
let sessRoom = ""
app.post('/chat', (req,res) => {
    console.log("post: "+req.body.username)
    req.session.sessId = req.body.username
    req.session.sessRoom = req.body.room
    sessId = req.session.sessId
    sessRoom = req.session.sessRoom
    let keepp = {
        name: sessId,
        room: sessRoom,
        msg: 'test'
    }
    res.redirect('/chat')
});

app.get('/chat', redirectLogin, (req,res) => {
    console.log("get: "+req.session.sessId)
    res.render('chat.ejs', {username: req.session.sessId, room: req.session.sessRoom})
});

// app.get('/chat1', (req,res) => {
//     res.render('chat1.ejs')
// });

app.get('/getData', redirectLogin, (req,res) => {
    res.json({ username: sessId, room: sessRoom})
});

app.get('/getData1', (req,res) => {
    res.json({ username: sessId, room: sessRoom})
});

app.post('/keepData', redirectLogin, (req,res) => {
    let keepp = {
        name: sessId,
        room: sessRoom,
        msg: req.body.msg
    }
    database.addData(keepp)
});

const botName = 'RoomBot'

//Run when CLient connected
io.on('connection', socket => {
    console.log("new client connected...")
    console.log("chat: "+sessId)
    const dataInfo = {
        'username':  sessId,
        'room': sessRoom
    }
    socket.emit('data', dataInfo)

    //Join Room
    socket.on('joinRoom', ({username, room}) => {
        console.log("join Room: "+room)
        const user = userJoin(socket.id, username, room)
        socket.join(user.room)

        database.getData(sessRoom).then(val => {
            console.log(val)
            socket.emit('message', formatMessage(botName, "Welcome to Chat Room!"))
            socket.emit('message', formatMessage(val.name, val.msg))
        })

        //Welcome message
        //socket.emit('message', formatMessage(botName, "Welcome to Chat Room!"))

        //Broadcast
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`))

        //User and room info
        io.to(user.room).emit('roomUsers', {room: user.room, users: getRoomUser(user.room)})
    })

    //Listening chat
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    //Disconnected
    socket.on('disconnect', () => {
        const user = userLeft(socket.id)
        if(user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))

            io.to(user.room).emit('roomUsers', {room: user.room, users: getRoomUser(user.room)})
        }
    })
})

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));