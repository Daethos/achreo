import * as WebSocket from 'ws';
let socket: WebSocket | null = null;

export function connectSocket(url: string): WebSocket {
    if (!socket) {
        socket = new WebSocket.WebSocket(url);
    };
    return socket;
};

export function getSocket(): WebSocket {
    if (!socket) throw new Error('Socket not connected or initialized');
    return socket;
};

export function closeSocket(): void {
    if (socket) {
        socket.close();
        socket = null;
    };
};

export function isSocketConnected(): boolean {
    return !!socket;
};