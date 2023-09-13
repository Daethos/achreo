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
        const success = server.upgrade(req, { 
            data: {
                createdAt: Date.now(),
                socketId: socketId,
            },
        });
        if (success) return undefined;

        return new Response(
            // `Hello, world! ${socketId}, you are at ${req.url}`
            
        );
    },
    websocket: {
        perMessageDeflate: true,
        open(ws) {
            // console.log('WebSocket opened');
            const msg = `Someone has joined the chat.`;
            ws.subscribe('chat');
            ws.send(msg, true);
        },
        message(ws, msg) {
            // ws.send(msg, true);
            console.log(`Received ${msg} from ${ws.data.socketId}`)
            ws.publish('chat', msg, true);
        },
        close(ws, code, reason) {
            const msg = `Someone has left the chat.`;
            ws.publish('chat', msg, true);
            ws.unsubscribe('chat');
            // console.log(`WebSocket closed: ${code} ${reason}`);
        },
        drain(ws) {

        },
    },
});

console.log(`Listening on ${server.hostname}:${server.port}: Welcom to Bun, sir!`);

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