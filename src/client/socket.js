import socketIOClient from "socket.io-client";

const ENDPOINT = "http://localhost:4001";
let _socket = null;

export const connectSocket = () => {
    if(!_socket) {
        _socket = socketIOClient(ENDPOINT);
    } 

    return _socket;
}

export const connectedSocket = () => connectSocket();