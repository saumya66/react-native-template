import {Platform} from 'react-native';
import {PERMISSIONS, request} from 'react-native-permissions';

export const calendarPermission = async () => {
  try {
    const response = await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.WRITE_CALENDAR,
        ios: PERMISSIONS.IOS.CALENDARS,
      }),
    )
      .then(res => {
        if (res === 'granted' || res === 'unavailable') {
          return true;
        } else {
          return false;
        }
      })
      .catch(() => {
        return false;
      });
    return response;
  } catch (e) {
    return false;
  }
};
