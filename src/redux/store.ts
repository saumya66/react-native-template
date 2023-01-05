import {combineReducers, configureStore} from '@reduxjs/toolkit';

import {baseApi} from './baseAPI';

import themeReducer from './themeSlice';
// import authReducer from '../screens/auth/authSlice';


const combinedReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  // auth: authReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'auth/removeCredentials') {
    state = undefined;
  }
  return combinedReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({serializableCheck: false}).concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
