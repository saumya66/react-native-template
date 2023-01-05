import {Linking} from 'react-native';
import {
  CommonActions,
  createNavigationContainerRef,
  StackActions,
} from '@react-navigation/native';
import {storageKeys} from '../constants';
import {loadString} from './storage';
import {ROUTES} from '../navigation/routeNames';
import {trackEvent} from './MoE';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  }
}

export async function goBack() {
  if (navigationRef?.isReady() && navigationRef?.canGoBack()) {
    navigationRef.goBack();
  } else {
    const userId = await loadString(storageKeys.USER_ID);
    if (userId) {
      navigationRef.navigate(ROUTES.APP_HOME);
    } else {
      navigationRef.navigate(ROUTES.LOGIN_SCREEN);
    }
  }
}

export function replaceNavigate(name: string, params?: any) {
  navigationRef?.current?.dispatch(StackActions.replace(name, params));
}

export function resetAndNavigate(name: string, params?: any) {
  navigationRef?.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{name, params}],
    }),
  );
}

export async function openUrl(url: string) {
  if (url) {
    try {
      const isUrlSupported = await Linking.canOpenURL(url);
      if (isUrlSupported) {
        Linking.openURL(url);
      }
    } catch (e) {
      // TODO: log this on sentry
      console.log(e);
    }
  }
}

export async function openUrlWithPrefix(url: string) {
  if (url) {
    try {
      let updatedUrl;
      const urlHttpsPattern = /^https:\/\//i;
      const urlHttpPattern = /^http:\/\//i;
      if (urlHttpsPattern.test(url) || urlHttpPattern.test(url)) {
        updatedUrl = url;
      } else {
        updatedUrl = 'https://' + url;
      }
      trackEvent('post_extlink');
      await openUrl(updatedUrl);
    } catch (e) {
      // TODO: log this on sentry
      console.log(e);
    }
  }
}
