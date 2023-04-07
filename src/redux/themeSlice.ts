import {createSlice} from '@reduxjs/toolkit';

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
      //save in localstorage what is the state of theme user has selected here
    },
  },
});

export const {setTheme} = themeSlice.actions;
export default themeSlice.reducer;
