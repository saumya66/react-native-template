import axios, {AxiosRequestConfig, AxiosError} from 'axios';
import {BaseQueryFn} from '@reduxjs/toolkit/query';
import Config from 'react-native-config';


const {BASE_URL} = Config;

const server = axios.create({
  baseURL: BASE_URL,
});

// Add a request interceptor
server.interceptors.request.use(
  async function (config) {
    // Do something before request is sent

    //See if accesstoken in present if so attach it to each api request

    // const accessToken = load it from the store
    // if (accessToken) {
    //   config.headers.Authorization = accessToken;
    // }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

// Add a response interceptor
server.interceptors.response.use(
  function (response) {
    //Do anything here if response is successfully received
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
   function (error) {
    //Do anything here if an error is received
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    const originalConfig = error.config;
    if (error.response) {
      if (error.response?.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;
        //if error code is sent 401 from server then the acccess token
        //has expired so here below we use the refresh token to receive the 
        //access token again & save it to avoid further errors
      }

      if (error.response?.status === 403) {
        //if error response is 403 we dont even have the refresh token meaning we have to log out the user !
      }
    }
    return Promise.reject(error);
  },
);

export const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method: AxiosRequestConfig['method'];
      data?: AxiosRequestConfig['data'];
    },
    unknown,
    unknown
  > =>
  async ({url, method, data}) => {
    try {
      const result = await server({url, method, data});
      return {data: result.data};
    } catch (axiosError) {
      let err = axiosError as AxiosError;
      return {
        error: {status: err.response?.status, data: err.response?.data},
      };
    }
  };

export default server;
