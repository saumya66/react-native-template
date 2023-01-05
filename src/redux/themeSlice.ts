import {createSlice} from '@reduxjs/toolkit';
import {storageKeys} from '../constants';
import {saveString} from '../utils/storage';

export enum ThemeEnum {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    currentTheme: ThemeEnum.LIGHT,
  },
  reducers: {
    setTheme: (state, action: {payload: ThemeEnum}) => {
      state.currentTheme = action.payload;
      saveString(storageKeys.USER_COLOR_PREF, action.payload);
    },
  },
});

export const {setTheme} = themeSlice.actions;
export default themeSlice.reducer;
