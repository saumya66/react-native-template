import {Platform, Dimensions, PixelRatio} from 'react-native';

export const isIos = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;
export const PIXEL_RATIO = PixelRatio.getFontScale();

export const storageKeys = {
  USER_COLOR_PREF: 'userColorPref',
  USER_ACCESS_TOKEN: 'userAccessToken',
  USER_REFRESH_TOKEN: 'userRefreshToken',
  USER_ID: 'userId',
};