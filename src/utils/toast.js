import React from 'react';
import styled from 'styled-components/native';
import Toast, {BaseToast} from 'react-native-toast-message';
import {SCREEN_WIDTH} from '../constants';

const StyledBaseToast = styled(BaseToast).attrs(props => ({
  contentContainerStyle: {
    backgroundColor:
      props.type === 'success'
        ? props.theme.colors.success
        : props.theme.colors.error,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  text1Style: {
    color: props.theme.colors.white,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    textTransform: 'lowercase',
    fontWeight: '600',
  },
  text2Style: {
    color: props.theme.colors.white,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    textTransform: 'lowercase',
    fontWeight: '400',
  },
}))`
  background-color: ${props =>
    props.type === 'success'
      ? props.theme.colors.success
      : props.theme.colors.error};
  min-height: 60px;
  min-width: ${SCREEN_WIDTH - 40}px;
  height: 100%;
  border-left-width: 0px;
  border-radius: 8px;
`;

export const toastConfig = {
  success: props => (
    <StyledBaseToast {...props} text1NumberOfLines={2} text2NumberOfLines={5} />
  ),
  error: props => (
    <StyledBaseToast {...props} text1NumberOfLines={2} text2NumberOfLines={5} />
  ),
};

export const showToast = ({
  type = 'success',
  title = '',
  subTitle = '',
  position = 'bottom',
}) => {
  Toast.show({
    type,
    text1: title,
    text2: subTitle,
    position: position,
  });
};
