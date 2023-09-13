/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { render } from 'solid-js/web';
import App from './App';
import { createRoot } from 'solid-js';

const root = createRoot(document.getElementById('root') as any);
render(() => <App />, root as any);