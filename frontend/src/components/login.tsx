import { Component, Show, createSignal } from "solid-js"
import { login, signup } from "../utils/auth";

const Login: Component<{}> = (props) => {
    const [username, setUsername] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [showPassword, setShowPassword] = createSignal(false);
    const [showSignup, setShowSignup] = createSignal(false);
    
    return (
        <div>
        <button onClick={() => setShowSignup(!showSignup())}>{showSignup() ? "Login" : "Signup"}</button>
        <Show when={showSignup()} fallback={<>
            <label for="username">Username</label>
            <input type="text" id="username" name="username" value={username()} oninput={(e) => setUsername(e.currentTarget.value)} />
            <label for="password">Password</label>
            <input type={showPassword() ? "text" : "password"} id="password" name="password" value={password()} oninput={(e) => setPassword(e.currentTarget.value)} />
            <button type="button" onclick={() => setShowPassword(!showPassword())}>{showPassword() ? "Hide" : "Show"} Password</button>
            <button onClick={() => login({ username, password })}>Login</button>
        </>}>
            <>
            <label for="username">Username</label>
            <input type="text" id="username" name="username" value={username()} oninput={(e) => setUsername(e.currentTarget.value)} />
            <label for="password">Password</label>
            <input type={showPassword() ? "text" : "password"} id="password" name="password" value={password()} oninput={(e) => setPassword(e.currentTarget.value)} />
            <button type="button" onclick={() => setShowPassword(!showPassword())}>{showPassword() ? "Hide" : "Show"} Password</button>
            <button onClick={() => signup({ username, password })}>Signup</button>
            </>
        </Show>
        </div>
    );
};

export default Login;