/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { render } from 'solid-js/web';
import App from './App';

render(() => <App />, document.getElementById('root') as HTMLElement);