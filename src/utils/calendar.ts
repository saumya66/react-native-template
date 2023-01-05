import {addHours} from 'date-fns';
import * as AddCalendarEvent from 'react-native-add-calendar-event';
import {CalendarEvent, google} from 'calendar-link';
import {Alert, Linking} from 'react-native';
import {isIos} from '../constants';
import {showToast} from './toast';
import {openUrl} from './navigation';
import {calendarPermission} from './permissions';

export const addCalendarEvent = (experienceDetail: any) => {
  const eventDescription = `${experienceDetail?.zoomLink || ''} ${
    experienceDetail?.expectations || ''
  } ${experienceDetail?.aboutSpeaker || ''}`;
  const eventTitle = `leap.club: ${experienceDetail?.title}`;
  const registerEvent = async () => {
    const eventConfig = {
      title: eventTitle,
      startDate: experienceDetail?.startDate,
      endDate: addHours(
        new Date(experienceDetail?.startDate!),
        1,
      ).toISOString(),
      notes: eventDescription,
      location: experienceDetail?.zoomLink || 'n/a',
    };
    const isEnable = await calendarPermission();
    if (!isEnable) {
      showToast({
        type: 'error',
        title: 'error',
        subTitle: 'permission required',
      });
      return;
    }
    AddCalendarEvent.presentEventCreatingDialog(eventConfig)
      .then(eventInfo => {
        if (eventInfo.action === 'SAVED') {
          showToast({
            type: 'success',
            title: 'success',
            subTitle: 'event added successfully',
          });
        }
      })
      .catch(() => {
        Alert.alert(
          '',
          'calendar permission required. please give calendar permissions from app settings',
          [
            {
              text: 'cancel',
              style: 'cancel',
            },
            {text: 'open Settings', onPress: () => Linking.openSettings()},
          ],
        );
      });
  };

  const event: CalendarEvent = {
    title: eventTitle,
    description: eventDescription,
    start: experienceDetail.startDate,
    end: addHours(new Date(experienceDetail.startDate!), 1).toISOString(),
    duration: [1, 'hour'],
    location: experienceDetail?.zoomLink || 'n/a',
  };

  const addGoogleEvent = () => {
    openUrl(google(event));
  };

  if (isIos) {
    Alert.alert(
      'add event to calendar',
      '',
      [
        {
          text: 'add to google calendar',
          onPress: () => addGoogleEvent(),
        },
        {
          text: 'add to ical',
          onPress: () => registerEvent(),
        },
        {
          text: 'cancel',
          onPress: () => {},
        },
      ],
      {cancelable: false},
    );
  } else {
    registerEvent();
  }
};
