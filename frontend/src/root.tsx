/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { render } from 'solid-js/web';
import { Suspense } from "solid-js";
import App from './App';

console.log('Is this seen?')
const root = document.getElementById('root');
console.log('root.tsx: root =', root);

if (!(root instanceof HTMLElement)) {
    throw new Error('root.tsx: root is not an HTMLElement.');
};

render(() => 
    // <Suspense>
        <App />
    // </Suspense>
, root);