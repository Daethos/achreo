require('./config/database');
import { Elysia, t } from 'elysia';
import { html } from '@elysiajs/html';
import * as elements from "typed-html";

const tailwind = Bun.file("/dist/output.css");
console.log(tailwind, "Tailwind")

const app = new Elysia()
    .use(html())
    .get('/', ({ html }) => html(
        <BaseHtml>
            <body // font-cinzel flex w-full h-screen justify-center items-center bg-black
                class="bg-black"
                hx-get="/authorization"
                hx-swap="innerHTML"
                hx-trigger="load"
            />
        </BaseHtml>
        )
    )
    .get('/authorization', () => {
            return (
                <Authorization />
            )
        }
    )
    // .use(static('dist'))
    .get("./styles.css", () => Bun.file("/dist/output.css"))
	.listen(3000, (server) => {
		console.log(`Live and listening on ${server.hostname}:${server.port}`)
	})

// <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
{/* <script src="https://cdn.tailwindcss.com"></script> */}
// <link href='https://fonts.googleapis.com/css2?family=Cinzel&display=swap' rel='stylesheet'>

const BaseHtml = ({ children }: elements.Children) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>The Ascean</title>
        <link href="#" rel="icon">
        <link href="/dist/output.css" rel="stylesheet">
        <link href='https://fonts.googleapis.com/css2?family=Cinzel&display=swap' rel='stylesheet'>
        <script src="https://unpkg.com/htmx.org@1.9.3"></script>
        <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
    </head>
    ${children}
`;

function Authorization() {
    console.log("Authorization");
    return (
        <div>
            <div class="flex flex-row space-x-5 p-5">
                <Login />
            </div>
            <div class="flex w-full items-center p-5">
                <Signup />
            </div>
        </div>
    );
};

function Login() {
    return (
        <form
            class="flex flex-row space-x-5"
            hx-post="/login"
            hx-swap="beforebegin"
            _="on submit target.reset()"
        >
            <input type="text" name="content" value="Name" class="border border-black p-4" />
            <input type="text" name="content" value="Password" class="border border-black p-4" />
            <button type="submit">Login</button>
        </form>
    );
};

function Signup() {
    return (
    <form
        class="flex flex-row space-x-5"
        hx-post="/signup"
        hx-swap="beforebegin"
        _="on submit target.reset()"
    >
        <input type="text" name="content" value="Name" class="border border-black p-4" />
        <input type="text" name="content" value="Password" class="border border-black p-4" />
        <input type="text" name="content" value="Confirm Password" class="border border-black p-4" />
        <button type="submit">Signup</button>
    </form>
    );
};

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