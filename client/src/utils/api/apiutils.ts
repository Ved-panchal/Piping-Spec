import axios from "axios";
// import config from "./config";
import { API_URL } from "./config";

const api = axios.create({
    withCredentials: true,
    baseURL: API_URL,
})

api.interceptors.response.use(
    response => response,
    error => {
      if (error.response.status === 401 && error.response.data['detail'] == "Invalid credentials") {
        localStorage.setItem('Failed', 'true')
        window.location.href = '/';
      }
    });


export default api;