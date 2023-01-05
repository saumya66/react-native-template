import Clipboard from '@react-native-clipboard/clipboard';
import {ROUTES} from '../navigation/routeNames';
import {getMentionedUsers} from './chat';
import {navigationRef} from './navigation';
import {showToast} from './toast';

export const pluralize = (val = 0, word = '', plural = `${word}s`) => {
  const _pluralize = (num, word, plural = `${word}s`) =>
    [1, -1].includes(Number(num)) ? word : plural;
  if (typeof val === 'object')
    return (num, word) => _pluralize(num, word, val[word]);
  return _pluralize(val, word, plural);
};

export const extractUrlFromText = (text = '') => {
  const urlRegex =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
  const url = text.match(urlRegex);
  return url ? url[0] : null;
};

export const copyText = (text = '') => {
  Clipboard.setString(text);
  showToast({
    type: 'success',
    title: 'success',
    subTitle: 'copied to clipboard',
  });
};

export const isJsonString = (str = '') => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export const onPhonePress = (phone = '') => {
  if (phone) {
    copyText(phone);
  }
};

export const onEmailPress = (email = '') => {
  if (email) {
    copyText(email);
  }
};

export const onMentionPress = mention => {
  const mentionedUserIds = getMentionedUsers(mention);
  if (mentionedUserIds.length > 0) {
    const mentionedUserId = mentionedUserIds[0];
    if (mentionedUserId === 'all') {
      return;
    }
    navigationRef.navigate(ROUTES.PROFILE_SCREEN, {
      userId: mentionedUserId,
    });
  }
};

export const getFileNameFromPath = (path = '') => {
  const fileName = path?.split('/')?.pop();
  return fileName ? fileName : `${Date.now()}.jpg`;
};
