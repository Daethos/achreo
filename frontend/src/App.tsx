import { createEffect, createSignal, Show } from "solid-js";
import { getUserFromToken, login, logout, isLoggedIn } from "./utils/auth";

const App = () => {
    const [username, setUsername] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [user, setUser] = createSignal({ username: '' });
    const [error, setError] = createSignal("");
    const [loggedIn, setLoggedIn] = createSignal(isLoggedIn());
    const [showPassword, setShowPassword] = createSignal(false);

    createEffect(() => {
        const user = getUserFromToken();
        setUser(user);
    });

    return (
        <section>
            <h1>The Ascean</h1>
            <p>"Greetings, and welcome to the Ascea."</p>

            {/* { loggedIn() ? (
                <>
                    <p>Welcome back, {user().username}!</p>
                    <button onClick={() => logout()}>Logout</button>
                </>
            } : (
                <>
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" value={username()} oninput={(e) => setUsername(e.currentTarget.value)} />
                    <label for="password">Password</label>
                    <input type={showPassword() ? "text" : "password"} id="password" name="password" value={password()} oninput={(e) => setPassword(e.currentTarget.value)} />
                    <button type="button" onclick={() => setShowPassword(!showPassword())}>{showPassword() ? "Hide" : "Show"} Password</button>
                    <button onClick={() => login({ username, password })}>Login</button>
                </>
            ) } */}
        </section>
    );
};

export default App;