
const socket = io();
const chatForm = document.getElementById('chat-form')
const messageInput = document.getElementById('msg')
const chatBoard = document.getElementById('chat-board')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

//Display message
outputMessage = message => {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p><p class="text">${message.text}<p/>`
    chatBoard.appendChild(div);
}

//add Roomname
outputRoomName = (room) => {
    roomName.innerText = room;
}

//add users
outputUsers = (users) => {
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`
}

// Get user and room from URL
// const { username, room } = Qs.parse(location.search, {
//     ignoreQueryPrefix: true
// })

getData = async () => {
    const Http = new XMLHttpRequest();
    const url='https://young-everglades-72756.herokuapp.com/getData';
    Http.open("GET", url);
    Http.send();
    setTimeout(()=>{
        const results = JSON.parse(Http.responseText)
        const username = results.username
        const room = results.room
        socket.emit('joinRoom', { username, room})
        console.log(results)
    }, 1000)
}

getData()

//Join Room
// socket.emit('joinRoom', { username, room})

//Get room and users
socket.on('roomUsers', ({ room, users}) => {
    outputRoomName(room)
    outputUsers(users)
})

//Message form server
socket.on('message', message => {
    outputMessage(message)
})

//Send message
chatForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    const msgg = JSON.stringify({msg: message})
    socket.emit('chatMessage', message)
    const Http = new XMLHttpRequest();
    const url='http://localhost:3000/keepData';
    Http.open("POST", url, true);
    Http.setRequestHeader('Content-type', 'application/json');
    Http.send(msgg);
    messageInput.value = ''
})