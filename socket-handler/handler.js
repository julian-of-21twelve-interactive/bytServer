const SOCKET_LISTENER = 'byt-node-admin-socket'

const SocketDispatch = (req, { type, payload = null }) => {

    let userId = ''

    if (req.user != undefined) {
        if (req.user.id != undefined)
            userId = req.user.id
        else console.log('socket error >> user id not found')
    }
    else console.log('socket error >> user not found')

    let response = {
        origin: 'SOCKET',
        // Note: user is who, who are calling the request not who are receiving.
        // for some request you can ignore the user checking
        user: userId,
        action: type,
        data: payload
    }

    req.io.sockets.emit(SOCKET_LISTENER, response);
}

module.exports = SocketDispatch