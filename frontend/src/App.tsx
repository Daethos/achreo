import { createEffect, createSignal, Show } from "solid-js";
import { getUserFromToken, logout } from "./utils/auth";
import Login from "./components/login";

type User = {
    username: string;
}

const App = () => {
    const [user, setUser] = createSignal<User | null>(null);

    createEffect(() => {
        const user = getUserFromToken();
        setUser(user);
    });

    return (
        <section>
        <h1>The Ascean</h1>
        <p>"Greetings, and welcome to the Ascea."</p>
        <Show when={user()} fallback={<Login />}>
            <p>Welcome back, {user()?.username}!</p>
            <button onClick={() => logout()}>Logout</button>
        </Show>
        {/* <Show when={loggedIn()} 
            fallback={<>
                <label for="username">Username</label>
                <input type="text" id="username" name="username" value={username()} oninput={(e) => setUsername(e.currentTarget.value)} />
                <label for="password">Password</label>
                <input type={showPassword() ? "text" : "password"} id="password" name="password" value={password()} oninput={(e) => setPassword(e.currentTarget.value)} />
                <button type="button" onclick={() => setShowPassword(!showPassword())}>{showPassword() ? "Hide" : "Show"} Password</button>
                <button onClick={() => login({ username, password })}>Login</button>
            </>}>
            <>
                <p>Welcome back, {user().username}!</p>
                <button onClick={() => logout()}>Logout</button>
            </>
        </Show> */}
        </section>
    );
};

export default App;