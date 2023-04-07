import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {baseApi} from './baseAPI';

import themeReducer from './themeSlice'

const combinedReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  theme: themeReducer
});

export const store = configureStore({
  reducer: combinedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({serializableCheck: false}).concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
