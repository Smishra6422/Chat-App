const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')


const app = express()


const server = http.createServer(app)

const io = socketio(server) // Because soketio require the server Raw Data to run 
// When we setup io to work with the server it also server up a file that a client can access //

const PORT = process.env.PORT || 3000

const pathPublicDirectory = path.join(__dirname, '../public')

app.use(express.static(pathPublicDirectory))   // express middleware function

// let count = 0



io.on('connection', (socket) => {
    console.log('New Connection');

    // socket.emit('countUpdate', (count))   // here count that we sending to client it will be 
    //                                       // first argument for the client in callback function

    // socket.on('increment', () => {
    //     count++

    //     // socket.emit('countUpdate', count)     // Socket is used to send the data a particular client at a time //

    //     io.emit('countUpdate', count)          // IO is used to send the data a all client at a same time //

    // })

    socket.on('room', ({ username, room}, callback) => {

        const { user, error } = addUser({ id: socket.id, username, room})

        if(error) {
           return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))

        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`))

        io.to(user.room).emit('roomData', { 
            room: user.room,
            users: getUsersInRoom(user.room)
            
        })

        callback()

        // to() method is used to send the messages to a particular room member
    })

    

    socket.on('messageUpdate', (msg , callback) => {
        const user = getUser(socket.id)
        
        if(user) {
            socket.emit('messageMe', generateMessage('You',msg))
            socket.broadcast.to(user.room).emit('message', generateMessage(user.username,msg))
        }
        

        callback()
    })

    socket.on('sendLocation', ( coords , callback) => {
        const user = getUser(socket.id)
        if(user) {
            socket.emit('locationMessageMe', generateLocationMessage('You',`https://www.google.com/maps?q=${ coords.latitude },${ coords.longitude }`))
            socket.broadcast.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://www.google.com/maps?q=${ coords.latitude },${ coords.longitude }`))

        }
        
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData', { 
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
    })

   
})


server.listen(PORT, () => {
    console.log('Server running at '+PORT);
    
})