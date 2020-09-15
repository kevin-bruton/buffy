import io from 'socket.io-client'

export {
  connectSocket,
  getSocket,
  disconnectSocket,
  subscribe,
  unsubsribe
}

let socket
const backTestSubscribers = []

function connectSocket (profileId = 'SOCKET_CLIENT') {
  const backendHost = 'http://localhost:3000' // window.location.origin
  socket = io(backendHost)
  socket.on('connect', () => console.log('socketio connected', socket.id))
  socket.emit('PROFILE_ID', profileId)
  socket.on('BACKTEST_PROGRESS', (message, sendResponse) => {
    sendResponse('OK')
    backTestSubscribers.forEach(subscriber => subscriber(message))
  })
}

function getSocket () {
  return socket
}

function disconnectSocket () {
  socket && socket.emit('disconnect')
  console.log('disconnect socket')
}

function subscribe (to, cb) {
  return {
    BACKTEST_PROGRESS: backTestSubscribers.push(cb)
  }[to]
}

function unsubsribe(from, id) {
  if (from === 'BACKTEST_PROGRESS') {
    backTestSubscribers.splice(id, 1)
  }
}
