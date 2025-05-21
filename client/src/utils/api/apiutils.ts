import axios from "axios";
import { API_URL } from "./config";

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = JSON.parse(localStorage.getItem('token')!);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
api.interceptors.response.use(
    response => {
        // Handle 200 OK responses
        if (response.data.status === "401" && response.data.error === 'Token expired') {
            localStorage.clear();
            window.location.href = '/';
        }
        return response;
    },
    error => {
        // Handle 401 Unauthorized errors
        // console.log(error);
        if (error.response && error.response.status === '401') {
            // console.log(error.response)
            if (error.response.data['detail'] === "Invalid credentials") {
                localStorage.setItem('Failed', 'true');
            }
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;
