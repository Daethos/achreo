require('./config/database');
import { Elysia, t } from 'elysia';
import { html } from '@elysiajs/html';
import * as elements from "typed-html";

type WebSocketData = {
    createdAt: number;
    socketId: string;
    token: string;
};

const app = new Elysia()
    .use(html())
    .get('/', ({ html }) => html(
        <BaseHtml>
            <body
                class="flex w-full h-screen justify-center items-center"
                hx-get="/auth"
                hx-swap="innerHTML"
                hx-trigger="load"
            />Can I find anything?
        </BaseHtml>
        )
    )
    .get('/auth', () => Authorization())
    .post("/clicked", () => "Clicked")
	.listen(4000, (server) => {
		console.log(`Live and listening on http://${server.hostname}:${server.port}`)
	})


const BaseHtml = ({ children }: elements.Children) => `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Ascean</title>
    <script src="https://unpkg.com/htmx.org@1.9.3"></script>
    <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
    <link href="./styles.css" rel="stylesheet">
</head>

${children}
`;

function Authorization() {
    return (
    <div>
        <div class="flex flex-row space-x-3">
            <Login />
        </div>
        <div class="flex w-full items-center">
            <Signup />
        </div>
    </div>
    );
};

function Login() {
    return (
        <form
            class="flex flex-row space-x-3"
            hx-post="/login"
            hx-swap="beforebegin"
            // _="on submit target.reset()"
        >
            <input type="text" name="content" class="border border-black p-4" />
            <button type="submit">Login</button>
        </form>
    );
};

function Signup() {
    return (
    <form
        class="flex flex-row space-x-3"
        hx-post="/signup"
        hx-swap="beforebegin"
        // _="on submit target.reset()"
    >
        <input type="text" name="content" value="Name" class="border border-black p-4" />
        <input type="text" name="content" value="Password" class="border border-black p-4" />
        <input type="text" name="content" value="Confirm Password" class="border border-black p-4" />
        <button type="submit">Signup</button>
    </form>
    );
}

// const build = await Bun.build({
//     entrypoints: ['frontend/src/root.tsx'],
//     outdir: 'frontend/public',
//     external: ['solid-js', 'solid-js/web', 'solid-js/store'],
//     naming: '[name].[ext]',
// });
// console.log(build, "Build")
// for (const output of build.outputs) {
//     console.log(await output.arrayBuffer());
//     console.log(await output.text());
// };

// Bun.serve({
//     port: 3000,
//     async fetch(req) {
//         const htmlFile = Bun.file("frontend/public/index.html");
//         const root = Bun.file("frontend/src/root.tsx");
//         console.log(await root.text(), "Root")
//         console.log(req, "Req")
//         const url = new URL(req.url);
//         console.log(url, '3000 Server being Served')
//         return new Response(htmlFile, {
//             headers: { 'Content-Type': 'text/html' },
//         });
//     },
// });

// // const server = 
// Bun.serve<WebSocketData>({
//     port: 4000,
//     fetch(req, server): Response | undefined {
//         const socketId = Math.random().toString(36).substring(7);
//         const url = new URL(req.url);
//         const success = server.upgrade(req, { data: {
//             createdAt: Date.now(), 
//             socketId,
//             token: url.searchParams.get('token') || '',
//         } });

//         console.log(success, "Success")
//         console.log('Websocket Server being Served')
//         return success
//             ? undefined
//             : new Response('Upgrade Failed', { status: 500 });   
//     },
//     websocket: {
//         perMessageDeflate: true,
//         open(ws) {
//             const msg = `${ws.data.socketId} has joined the chat.`;
//             ws.subscribe('chat');
//             ws.send(msg, true);
//         },
//         message(ws, msg) {
//             console.log(`Received ${msg} from ${ws.data.socketId}, unsure how`)
//             ws.publish('chat', msg, true);
//         },
//         close(ws, code, reason) {
//             console.log(code, reason, "Code and Reason, what are you?")
//             const msg = `${ws.data.socketId} has left the chat.`;
//             ws.publish('chat', msg, true);
//             ws.unsubscribe('chat');
//         },
//         drain(ws) {

//         },
//     },
// });


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