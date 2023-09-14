require('./config/database');

type WebSocketData = {
    createdAt: number;
    socketId: string;
    token: string;
};

const server = Bun.serve<WebSocketData>({
    port: 3000,
    fetch(req, server) {
        const socketId = Math.random().toString(36).substring(7);
        // const success = server.upgrade(req, { 
        //     data: {
        //         createdAt: Date.now(),
        //         socketId: socketId,
        //     },
        // });
        // if (success) return undefined;

        
        const url = new URL(req.url);
        console.log(url, 'URL?')
            const success = server.upgrade(req, { data: {
                createdAt: Date.now(), 
                socketId,
                token: url.searchParams.get('token') || '',
            } });
            console.log(success, "Success")
            if (success) return undefined;
        // : new Response("WebSocket upgrade error", { status: 400 });

        return new Response(
            // `Hello, world! ${socketId}, you are at ${req.url}`
            // Need to have the index.html file referenced here ? 
            // Or is it just a matter of having the index.html file in the same directory as the server.ts file?
        );
    },
    websocket: {
        perMessageDeflate: true,
        open(ws) {
            const msg = `${ws.data.socketId} has joined the chat.`;
            ws.subscribe('chat');
            ws.send(msg, true);
        },
        message(ws, msg) {
            console.log(`Received ${msg} from ${ws.data.socketId}`)
            ws.publish('chat', msg, true);
        },
        close(ws, code, reason) {
            const msg = `${ws.data.socketId} has left the chat.`;
            ws.publish('chat', msg, true);
            ws.unsubscribe('chat');
        },
        drain(ws) {

        },
    },
});

console.log(`Listening on ${server.hostname}:${server.port}: Welcom to Bun, sir!`);

const socket = new WebSocket('ws://localhost:3000');
// message is received
socket.addEventListener("message", event => {});

// socket opened
socket.addEventListener("open", event => {});

// socket closed
socket.addEventListener("close", event => {});

// error handler
socket.addEventListener("error", event => {});


// This demonstrates how to hash and verify passwords. no external dependencies required
// const password = 'super-secure-password';
// const hash = await Bun.password.hash(password);
// const isMatch = await Bun.password.verify(password, hash);
// console.log(`Password matches: ${isMatch}`);

// ws.send('Hello, world!');
// ws.send(response.arrayBuffer());
// ws.send(new Uint8Array([1, 2, 3]));

// Built-in Inflat/Deflate
// const buff = Buffer.from('Welcome to the Ascea, friend.'.repeat(1000));
// const compress = Bun.deflateSync(buff);
// const decompress = Bun.inflateSync(compress);
// const dec = new TextDecoder();
// console.log(dec.decode(decompress).length); // Another way to perform the concept

// console.log(`Compressed: ${compress.length} bytes`);
// console.log(`Decompressed: ${decompress.length} bytes`);