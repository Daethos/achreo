import { createEffect, createSignal, Show } from "solid-js";
import { getUserFromToken, logout } from "./utils/auth";
import Login from "./components/login";

type User = {
    username: string;
};

function App() {
    const [user, setUser] = createSignal<User | null>(null);

    console.log('App.tsx is seen?')

    // createEffect(() => {
    //     const user = getUserFromToken();
    //     setUser(user);
    // });

    return (
        <div>
        <h1>The Ascean</h1>
        <p>"Greetings, and welcome to the Ascea."</p>
        {/* <Show when={user()} fallback={<Login />}>
            <p>Welcome back, {user()?.username}!</p>
            <button onClick={() => logout()}>Logout</button>
        </Show> */}
        </div>
    );
};

export default App;