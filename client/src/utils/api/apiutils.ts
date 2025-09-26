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
        console.log("response", response);
        // Handle 200 OK responses
        if (response.data.status === "401" && response.data.error === 'Token expired') {
            localStorage.clear();
            window.location.href = '/';
        }
        // Handle session invalidation flag from backend
        if (response.data && response.data.sessionExpired === true) {
            localStorage.clear();
            window.location.href = '/';
        }
        return response;
    },
    error => {
        // Handle 401 Unauthorized errors
        // console.log(error);
        console.log("error", error);
        if (error.response && (error.response.status === 401 || error.response.status === '401')) {
            // console.log(error.response)
            if (error.response.data['detail'] === "Invalid credentials") {
                localStorage.setItem('Failed', 'true');
            }
            // If backend indicates session expired/invalid, clear and redirect
            if (error.response.data && error.response.data.sessionExpired === true) {
                localStorage.clear();
                window.location.href = '/';
                return Promise.reject(error);
            }
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;
