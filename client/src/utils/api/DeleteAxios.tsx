import axios, { AxiosRequestConfig } from 'axios';
import { API_URL } from './config';

const deleteWithBody = async <R = unknown, D = unknown>(
  url?: string, 
  data?: D, 
  config?: AxiosRequestConfig
): Promise<R> => {
  // Concatenate the base API URL with the provided URL
  url = API_URL + url;

  // Define the default headers, including Authorization if a token is provided
  const defaultHeaders = {
    ...config?.headers, // Spread existing headers if any
    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token')!)}`, // Replace this with your actual token retrieval logic
  };

  return axios.request<R, R>({
    ...config,
    method: 'DELETE',
    url,
    data,
    headers: defaultHeaders, // Set the headers including the Authorization token
    withCredentials: true,
  });
};

export default deleteWithBody;
