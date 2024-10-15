import axios, { AxiosRequestConfig } from 'axios';
import { API_URL } from './config';

const deleteWithBody = async <R = unknown, D = unknown>(
  url?: string, 
  data?: D, 
  config?: AxiosRequestConfig
): Promise<R> => {
  url = API_URL + url;

  return axios.request<R, R>({
    ...config,
    method: 'DELETE',
    url,
    data,
    withCredentials: true,
  });
};

export default deleteWithBody;
