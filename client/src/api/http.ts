import axios from 'axios';
import {getToken} from "../utils/getToken.ts";

export const http = axios.create({
    baseURL: import.meta.env.PUBLIC_API_URL,
    headers: {
        'Content-type': 'application/json'
    }
})

http.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});