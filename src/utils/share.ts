import {Share} from 'react-native';
import {PROFILE_URL_PREFIX} from '../constants';

export const getProfileLink = (userId, name) => {
  return `${PROFILE_URL_PREFIX}${userId}`;
};

export const shareProfile = (profileId, profileName) => {
  if (profileId && profileName) {
    const profileLink = getProfileLink(profileId, profileName);
    Share.share({
      message: `${profileLink}`,
    });
  }
};
