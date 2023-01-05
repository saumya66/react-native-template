import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { replaceMentionValues } from 'react-native-controlled-mentions';

import { navigate, openUrlWithPrefix } from './navigation';
import { ROUTES } from '../navigation/routeNames';

export const navigateToRoute = (route = '', params = {}) => {
  if (route) {
    if (route === ROUTES.EXTERNAL_URL) {
      openUrlWithPrefix(params?.url);
    } else {
      navigate(route, params);
    }
  }
};

export const requestUserPermission = async () => {
  await messaging().requestPermission();
};

export const displayLocalPushNotification = ({
  title = '',
  body = '',
  data = {},
}) => {
  PushNotification.localNotification({
    title: title || 'leap.club',
    message: body || '',
    smallIcon: 'ic_notification',
    data: data,
    group: 'group',
    groupSummary: true,
    id: '999',
    playSound: true,
    channelId: 'leapclub',
  });
};

export const displayLocalAppNotification = async remoteMessage => {
  let title = '';
  let body = '';
  let data = {};

  if (remoteMessage) {
    title = remoteMessage?.notification?.title;
    body = remoteMessage?.notification?.body || '';
    data = {
      route: remoteMessage?.data?.route || '',
      params: remoteMessage?.data?.params || {},
    };
    displayLocalPushNotification({ title, body, data });
  }
};

export const displayForegroundNotification = remoteMessage => {
  if (remoteMessage?.data?.sendbird) {
    displayLocalSendbirdNotification(remoteMessage);
  }
};

export const onRemoteMessage = async remoteMessage => {
  await displayLocalSendbirdNotification(remoteMessage);
};

export const navigateFromPushNotificationIos = remoteMessage => {
  const isClicked = remoteMessage?.getData()?.userInteraction === 1;
  const remoteMessageData = remoteMessage?.getData();

  if (remoteMessageData && isClicked) {
    let route = '';
    let params = {};

    if (remoteMessageData?.sendbird) {
      const custom_type =
        remoteMessageData?.sendbird?.channel?.custom_type || '';
      const url = remoteMessageData?.sendbird?.channel?.channel_url || '';

      route =
        custom_type === 'personal_chat'
          ? 'personalChatScreen'
          : 'clubhouseChatScreen';

      params = { url };
    } else {
      route = remoteMessageData?.route || '';
      params = remoteMessageData?.params
        ? JSON.parse(remoteMessageData?.params)
        : {};
    }
    navigateToRoute(route, params);
  }
};

export const navigateFromPushNotification = remoteMessage => {
  if (remoteMessage && remoteMessage.data) {
    let route = '';
    let params = {};

    if (remoteMessage?.data?.sendbird) {
      const custom_type =
        remoteMessage?.data?.sendbird?.channel?.custom_type || '';
      const url = remoteMessage?.data?.sendbird?.channel?.channel_url || '';

      route =
        custom_type === 'personal_chat'
          ? 'personalChatScreen'
          : 'clubhouseChatScreen';

      params = { url };
    } else {
      route = remoteMessage.data?.route || '';
      params = remoteMessage.data?.params
        ? JSON.parse(remoteMessage.data?.params)
        : {};
    }
    navigateToRoute(route, params);
  }
};
