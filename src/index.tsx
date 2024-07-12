/* @refresh reload */
import { lazy, Suspense } from 'solid-js';
import { render } from 'solid-js/web';
import { Puff } from 'solid-spinner';
const App = lazy(async() => await import('./App'));
const root = document.getElementById('root');
render(() => <Suspense fallback={<Puff color="gold"/>}><App /></Suspense>, root!);