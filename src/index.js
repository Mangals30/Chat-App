const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const path = require('path')
const Filter = require('bad-words')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000
const {generateMessage,generateLocationMessage} = require('./utils/messages.js')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')
const publicDir = path.join(__dirname,'../public')
app.use(express.static(publicDir))
//server emit client receive ==> set count or update count
//client emit server receive ==> count increament

io.on('connection', (socket) => {
  console.log('New connection added')
    
  socket.on('join',(options,callback) => {
    const {error,user} = addUser({id : socket.id,...options})
    if(error) {
      return callback(error)
    }
    socket.join(user.room)
    socket.emit('message', generateMessage('Admin','Welcome'))
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`))
    io.to(user.room).emit('roomData', {
      room : user.room,
      users : getUsersInRoom(user.room)
    })
    callback()  
  })
  socket.on('sendMessage',(inputMsg,callback) => {
    const filter = new Filter()
    if(filter.isProfane(inputMsg)) {
      return callback('Profanity not allowed')
    }
    const user = getUser(socket.id)
    if(user) {
      io.to(user.room).emit('message',generateMessage(user.username,inputMsg))
      callback()
    }

  })
  socket.on('disconnect',() => {
    const user = removeUser(socket.id)
    if(user) {
      io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`))
      io.to(user.room).emit('roomData', {
        room : user.room,
        users : getUsersInRoom(user.room)
      })
    } 
  })
  socket.on('sendLocation',(coords,callback) => {
    if(!coords.latitude || !coords.longitude)
    {
      return callback('Not a proper co-ordinate')
    }
    const user = getUser(socket.id)
    if(user) {
      io.to(user.room).emit('locationMessage',generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    }
    
    callback()
   
      })
})
server.listen(port,() => {
  console.log(`Server started at port ${port}`)
})