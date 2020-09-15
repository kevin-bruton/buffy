import socketIo from 'socket.io'

export const connections = {}

export function socketServer(http) {
  const server = socketIo(http)

  server.on('connection', function (socket) {
    let profileId
    console.log('SOCKET.IO: a user connected with socket id:', socket.id)

    socket.on('PROFILE_ID', recievedProfileId => {
      profileId = recievedProfileId
      console.log('SOCKET.IO: Setting profile id to', profileId)
      if (!connections[profileId]) {
        connections[profileId] = {[socket.id]: socket}
      } else {
        connections[profileId][socket.id] = socket
      }
      console.log('SOCKET.IO: Users connected:', Object.keys(connections))
    })

    socket.on('disconnect', () => {
      console.log(`Client with id '${socket.id}' and profileId '${profileId}' has disconnected`)
      connections[profileId] && connections[profileId][socket.id] && (delete connections[profileId][socket.id])
    })
  })
}

export function socketSend(eventName, message) {
  if (connections.SOCKET_CLIENT) {
    const firstConnectionForProfile = Object.keys(connections.SOCKET_CLIENT)[0]
    return sendMessage(connections.SOCKET_CLIENT[firstConnectionForProfile], eventName, message)
  }
  console.log('SOCKET_CLIENT not connected not sending messages')
  return Promise.resolve()
}

function sendMessage (socket, eventName, message) {
  return new Promise(resolve => {
    if (socket) {
      socket.emit(eventName, JSON.stringify(message), clientResponse => resolve(clientResponse))
    } else {
      console.error('SOCKET: No client connect to send message to')
    }
  }
  )
}
