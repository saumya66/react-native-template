import {Platform, Dimensions} from 'react-native';

export const isIos = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

