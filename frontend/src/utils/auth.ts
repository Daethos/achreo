import { connectSocket } from "./socket";
const BASE_URL = '/api/users/';

export  function getToken() {
    let token = localStorage.getItem('token');
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp < Date.now() / 1000) {
            localStorage.removeItem('token');
            token = null;
        };
    };
    return token;
};

export function getUserFromToken() {
    const token = getToken();
    return token ? JSON.parse(atob(token.split('.')[1])).user : null;
};

export function setToken(token: string) {
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    };
};

export function removeToken() {
    localStorage.removeItem('token');
};

export function isLoggedIn() {
    return !!getToken();
};

export async function login(creds: any) {
    return fetch(BASE_URL + 'login', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(creds)
    }).then(async res => {
        if (res.ok) return res.json();
        const response = await res.json();
        throw new Error(response.err);
    }).then(({token}) => setToken(token));
};

export function logout() {
    removeToken();
};

export async function signup(user: any) {
    return fetch(BASE_URL + 'signup', {
        method: 'POST',
        body: user
    }).then(async res => {
        if (res.ok) return res.json();
        return res.json().then(response => {
            throw new Error(response.err)
        })
    }).then(({token}) => setToken(token));
};