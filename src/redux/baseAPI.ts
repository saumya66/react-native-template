import {createApi} from '@reduxjs/toolkit/query/react';
import {axiosBaseQuery} from '../api';

export const baseApi = createApi({
  baseQuery: axiosBaseQuery(),
  endpoints: () => ({}),  //the endpoints will be injected in various apis split in different features.
});
