require('./config/database');

type WebSocketData = {
    createdAt: number;
    socketId: string;
    token: string;
};

Bun.serve({
    port: 3000,
    fetch() {
        const htmlFile = Bun.file("frontend/public/index.html");
        const root = Bun.file("frontend/public/root.tsx");
        console.log(root, "Root")
        console.log('3000 Server being Served')
        return new Response(htmlFile);
    },
});
// const server = 
Bun.serve<WebSocketData>({
    port: 3001,
    fetch(req, server): Response | undefined {
        const socketId = Math.random().toString(36).substring(7);
        const url = new URL(req.url);
        const success = server.upgrade(req, { data: {
            createdAt: Date.now(), 
            socketId,
            token: url.searchParams.get('token') || '',
        } });

        console.log(success, "Success")
        console.log('Websocket Server being Served')
        return success
            ? undefined
            : new Response('Upgrade Failed', { status: 500 });   
    },
    websocket: {
        perMessageDeflate: true,
        open(ws) {
            const msg = `${ws.data.socketId} has joined the chat.`;
            ws.subscribe('chat');
            ws.send(msg, true);
        },
        message(ws, msg) {
            console.log(`Received ${msg} from ${ws.data.socketId}, unsure how`)
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

// console.log(`Listening on ${server.hostname}:${server.port}: Welcom to Bun, sir!`);

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