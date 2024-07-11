/* @refresh reload */
import { lazy, Suspense } from 'solid-js';
import { render } from 'solid-js/web';
const App = lazy(async() => await import('./App'));
const root = document.getElementById('root');
render(() => <Suspense fallback={<div>Loading...</div>}><App /></Suspense>, root!);