import SendBird from 'sendbird';
import Config from 'react-native-config';
import messaging from '@react-native-firebase/messaging';

import {store} from '../redux/store';
import {inboxType, isIos} from '../constants';
import {getMentionedUsers, getParentObj} from './chat';

const APP_ID = Config.SENDBIRD_APP_ID;

export const sbRegisterUser = (
  userId: string,
  nickname: string,
  userImage?: string,
) => {
  return new Promise((resolve, reject) => {
    if (!userId) {
      reject('user ID is required');
      return;
    }
    if (!nickname) {
      reject('nickname is required');
      return;
    }
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.connect(userId, (user, error) => {
      if (error) {
        reject('sendbird user registration failed');
      } else {
        if (nickname !== user.nickname || userImage !== user.profileUrl) {
          resolve(sbUpdateProfile(nickname, userImage));
        } else {
          resolve(user);
        }
      }
    });
  });
};

export const sbConnect = (userId: string) => {
  return new Promise((resolve, reject) => {
    if (!userId) {
      reject('user ID is required');
      return;
    }
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.connect(userId, (user, error) => {
      if (error) {
        resolve('sendbird connection failed');
      } else {
        sbRegisterPushToken();
        resolve(user);
      }
    });
  });
};

export const sbRegisterPushToken = () => {
  return new Promise(async resolve => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    if (isIos) {
      const apnsToken = await messaging().getAPNSToken();
      try {
        if (apnsToken) {
          await sb.registerAPNSPushTokenForCurrentUser(apnsToken);
        }
        resolve({});
      } catch (error) {
        resolve(error);
      }
    } else {
      const token = await messaging().getToken();
      try {
        await sb.registerGCMPushTokenForCurrentUser(token);
        resolve({});
      } catch (error) {
        resolve(error);
      }
    }
  });
};

export const sbUnregisterPushToken = () => {
  return new Promise(async (resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    if (isIos) {
      const apnsToken = await messaging().getAPNSToken();
      try {
        if (apnsToken) {
          await sb.unregisterAPNSPushTokenForCurrentUser(apnsToken);
        }
        resolve({});
      } catch (error) {
        reject(error);
      }
    } else {
      const token = await messaging().getToken();
      try {
        await sb.unregisterGCMPushTokenForCurrentUser(token);
        resolve({});
      } catch (error) {
        reject(error);
      }
    }
  });
};

export const sbUpdateProfile = (nickname: string, userImage?: string) => {
  return new Promise((resolve, reject) => {
    if (!nickname) {
      reject('nickname is required');
      return;
    }
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.updateCurrentUserInfo(nickname, userImage, (user, error) => {
      if (error) {
        reject('update profile failed');
      } else {
        resolve(user);
      }
    });
  });
};

export const sbDisconnect = () => {
  return new Promise(async resolve => {
    const sb = SendBird.getInstance();
    if (sb) {
      await sbUnregisterPushToken();
      sb.disconnect(() => {
        resolve(null);
      });
    } else {
      resolve(null);
    }
  });
};

export const sbGetCurrentInfo = () => {
  const sb = SendBird.getInstance();
  if (sb.currentUser) {
    return {
      profileUrl: sb.currentUser.profileUrl,
      nickname: sb.currentUser.nickname,
    };
  }
  return {};
};

export const sbCreateGroupChannelListQuery = () => {
  const sb = SendBird.getInstance();
  let listQuery = sb.GroupChannel.createMyGroupChannelListQuery();
  listQuery.limit = 20;
  listQuery.includeEmpty = true;
  listQuery.customTypesFilter = [''];
  listQuery.memberStateFilter = 'joined_only';
  listQuery.order = 'latest_last_message';
  return listQuery;
};

export const sbCreatePersonalChatChannelListQuery = () => {
  const sb = SendBird.getInstance();
  const userId = store.getState()?.auth?.userId;
  let listQuery = sb.GroupChannel.createMyGroupChannelListQuery();
  listQuery.limit = 20;
  listQuery.includeEmpty = true;
  listQuery.customTypesFilter = ['personal_chat'];
  listQuery.memberStateFilter = 'joined_only';
  listQuery.order = 'latest_last_message';
  listQuery.metadataKey = userId || '';
  listQuery.metadataValues = [inboxType.MAIN];
  return listQuery;
};

export const sbGetRequestInboxChannels = () => {
  return new Promise(async (resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    const userId = store.getState()?.auth?.userId;
    let listQuery = sb.GroupChannel.createMyGroupChannelListQuery();
    listQuery.limit = 20;
    listQuery.includeEmpty = false;
    listQuery.customTypesFilter = ['personal_chat'];
    listQuery.memberStateFilter = 'joined_only';
    listQuery.order = 'latest_last_message';
    listQuery.metadataKey = userId || '';
    listQuery.metadataValues = [inboxType.REQUESTS];
    try {
      const channels = [];
      await getChannelsRecursively(listQuery, channels);
      resolve(channels);
    } catch (error) {
      reject(error);
    }
  });
};

export const sbGetChannelsByName = async (searchText = '') => {
  return new Promise(async (resolve, reject) => {
    const sb = SendBird.getInstance();
    let listQuery = sb.GroupChannel.createMyGroupChannelListQuery();
    listQuery.limit = 100;
    listQuery.includeEmpty = true;
    listQuery.customTypesFilter = [''];
    listQuery.memberStateFilter = 'joined_only';
    listQuery.order = 'latest_last_message';
    if (searchText) {
      listQuery.channelNameContainsFilter = searchText;
    }
    try {
      const channels = [];
      await getChannelsRecursively(listQuery, channels);
      resolve(channels);
    } catch (error) {
      reject(error);
    }
  });
};

export const sbCreateGroupChannel = ({
  name = '',
  isPublic = false,
  userIds = [],
  description = '',
  operatorUserIds = [],
}) => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    var params = new sb.GroupChannelParams();
    params.name = name;
    params.data = description;
    params.isPublic = isPublic;
    params.isEphemeral = false;
    params.isDistinct = false;
    params.isSuper = true;
    params.addUserIds(userIds);
    params.operatorUserIds = operatorUserIds;

    sb.GroupChannel.createChannel(params, (groupChannel, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(groupChannel);
      }
    });
  });
};

export const sbUpdateGroupChannel = ({
  channelUrl = '',
  name = '',
  isPublic = false,
  description = '',
}) => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    var params = new sb.GroupChannelParams();
    params.name = name;
    params.data = description;
    params.isPublic = isPublic;

    sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
      if (error) {
        reject(error);
      } else {
        channel.updateChannel(params, (response, updateError) => {
          if (updateError) {
            reject(updateError);
          } else {
            resolve(response);
          }
        });
      }
    });
  });
};

export const sbGetGroupChannelDetail = (channelUrl: string) => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(channel);
      }
    });
  });
};

export const sbGetPinnedGroupChannelDetail = (channelUrl: string) => {
  return new Promise(resolve => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
      if (error) {
        resolve({url: channelUrl, isError: true});
      } else {
        resolve(channel);
      }
    });
  });
};

export const sbCreateGroupChannelMembersListQuery = (
  channelUrl,
  order = 'alphabetical',
) => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
      if (error) {
        reject(error);
      } else {
        const memberListQuery = channel.createMemberListQuery();
        if (order === 'operator') {
          memberListQuery.order =
            sb.MemberListQuery.Order.OPERATOR_THEN_MEMBER_ALPHABETICAL;
        }
        memberListQuery.limit = 30;
        resolve(memberListQuery);
      }
    });
  });
};

export const sbJoinPublicGroupChannel = channelUrl => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
      if (error) {
        reject(error);
      } else {
        if (channel.isPublic) {
          channel.join((response, joinError) => {
            if (joinError) {
              reject(joinError);
            } else {
              resolve(response);
            }
          });
        }
      }
    });
  });
};

export const sbGetGroupChannelOperators = groupChannel => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    let listQuery = groupChannel.createOperatorListQuery();
    listQuery.next((operators, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(operators);
      }
    });
  });
};

export const sbRegisterGroupChannelOperator = (
  channelUrl,
  operatorUserIds = [],
) => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
      if (error) {
        reject(error);
      } else {
        channel.addOperators(operatorUserIds, (response, operatorError) => {
          if (operatorError) {
            reject(operatorError);
          } else {
            resolve(response);
          }
        });
      }
    });
  });
};

export const sbRemoveGroupChannelOperator = (
  channelUrl,
  operatorUserIds = [],
) => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
      if (error) {
        reject(error);
      } else {
        channel.removeOperators(operatorUserIds, (response, operatorError) => {
          if (operatorError) {
            reject(operatorError);
          } else {
            resolve(response);
          }
        });
      }
    });
  });
};

export const sbCreateGroupChannelBannedMembersListQuery = channelUrl => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
      if (error) {
        reject(error);
      } else {
        const bannedMembersListQuery = channel.createBannedUserListQuery();
        bannedMembersListQuery.limit = 100;
        resolve(bannedMembersListQuery);
      }
    });
  });
};

export const sbBanGroupChannelMember = (channelUrl, userId) => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
      if (error) {
        reject(error);
      } else {
        channel.banUserWithUserId(userId, 6400000, '', (response, banError) => {
          if (banError) {
            reject(banError);
          } else {
            resolve(response);
          }
        });
      }
    });
  });
};

export const sbUnbanGroupChannelMember = (channelUrl, userId) => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
      if (error) {
        reject(error);
      } else {
        channel.unbanUserWithUserId(userId, (response, unbanError) => {
          if (unbanError) {
            reject(unbanError);
          } else {
            resolve(response);
          }
        });
      }
    });
  });
};

export const sbLeaveGroupChannel = channelUrl => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
      if (error) {
        reject(error);
      } else {
        channel.leave((response, leaveError) => {
          if (leaveError) {
            reject(leaveError);
          } else {
            resolve(response);
          }
        });
      }
    });
  });
};

export const sbDeleteGroupChannel = channelUrl => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
      if (error) {
        reject(error);
      } else {
        channel.delete((response, deleteError) => {
          if (deleteError) {
            reject(deleteError);
          } else {
            resolve(response);
          }
        });
      }
    });
  });
};

export const sbSetGroupChannelPushTriggerOption = (
  channelUrl,
  triggerState,
) => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
      if (error) {
        reject(error);
      } else {
        channel.setMyPushTriggerOption(
          triggerState,
          (response, triggerError) => {
            if (triggerError) {
              reject(triggerError);
            } else {
              resolve(response);
            }
          },
        );
      }
    });
  });
};

export const sbGetUserMetadata = () => {
  let sb = SendBird.getInstance();
  if (!sb) {
    sb = new SendBird({appId: APP_ID});
  }
  const user = sb.currentUser;
  return user.metaData;
};

export const sbUpdateUserMetadata = data => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    const user = sb.currentUser;
    user.updateMetaData(data, (metadata, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(metadata);
      }
    });
  });
};

export const sbDeleteUserMetadata = key => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    const user = sb.currentUser;
    const userMetadata = user?.metaData;
    if (userMetadata?.hasOwnProperty(key)) {
      user.deleteMetaData(key, (response, error) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    } else {
      resolve(null);
    }
  });
};

export const sbCreateUserMetadata = data => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    const user = sb.currentUser;
    user.createMetaData(data, (metadata, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(metadata);
      }
    });
  });
};

export const sbGetPinnedGroupChannels = () => {
  const userMetadata = sbGetUserMetadata();
  const pinnedChannels = Object.keys(userMetadata).map(async key => {
    return await sbGetPinnedGroupChannelDetail(key);
  });
  return Promise.all(pinnedChannels);
};

export const sbCreatePreviousMessageListQuery = channelUrl => {
  return new Promise((resolve, reject) => {
    sbGetGroupChannelDetail(channelUrl)
      .then(channel => {
        const query = channel.createPreviousMessageListQuery();
        query.replyType = 'all';
        query.includeThreadInfo = true;
        query.includeParentMessageInfo = true;
        resolve(query);
      })
      .catch(error => reject(error));
  });
};

export const sbGetMessageList = previousMessageListQuery => {
  const limit = 30;
  const reverse = true;
  return new Promise((resolve, reject) => {
    previousMessageListQuery.load(limit, reverse, (messages, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(messages);
      }
    });
  });
};

export const sbSendUserMessage = (
  channelUrl = '',
  message = '',
  parent = null,
) => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
      if (error) {
        reject(error);
      } else {
        const params = new sb.UserMessageParams();
        params.message = message;

        const mentionedUserIds = getMentionedUsers(message);
        const allTagIndex = mentionedUserIds.findIndex(
          mention => mention === 'all',
        );
        if (allTagIndex > -1) {
          params.mentionType = 'channel';
        } else {
          if (mentionedUserIds.length > 0) {
            params.mentionType = 'users';
            params.mentionedUserIds = mentionedUserIds;
          }
        }

        if (parent) {
          const parentObj = getParentObj(parent);
          params.data = JSON.stringify(parentObj);
        }
        channel.sendUserMessage(params, (sentMessage, sentMessageError) => {
          if (sentMessageError) {
            reject(sentMessageError);
          } else {
            resolve(sentMessage);
          }
        });
      }
    });
  });
};

export const sbSendFileMessage = (channelUrl, selectedFile, parent = null) => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
      if (error) {
        reject(error);
      } else {
        const params = new sb.FileMessageParams();
        if (isIos) {
          params.file = {
            size: selectedFile.size,
            uri: selectedFile.sourceURL,
            name: selectedFile.filename,
            type: selectedFile.mime,
          };
        } else {
          params.file = {
            size: selectedFile.size,
            uri: selectedFile.path,
            name: 'file',
            type: selectedFile.mime,
          };
        }

        if (parent) {
          const parentObj = getParentObj(parent);
          params.data = JSON.stringify(parentObj);
        }
        channel.sendFileMessage(params, (sentMessage, sentMessageError) => {
          if (sentMessageError) {
            reject(sentMessageError);
          } else {
            resolve(sentMessage);
          }
        });
      }
    });
  });
};

export const sbDeleteMessage = (channelUrl, messageId) => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
      if (error) {
        reject(error);
      } else {
        const params = new sb.MessageRetrievalParams();
        params.messageId = parseInt(messageId, 10);
        params.channelType = 'group';
        params.channelUrl = channelUrl;
        sb.BaseMessage.getMessage(params, (message, getMessageError) => {
          if (getMessageError) {
            reject(getMessageError);
          } else {
            channel.deleteMessage(message, (response, deleteMessageError) => {
              if (deleteMessageError) {
                reject(deleteMessageError);
              } else {
                resolve(response);
              }
            });
          }
        });
      }
    });
  });
};

const getChannelsRecursively = async (listQuery, result) => {
  if (listQuery?.hasNext && !listQuery?.isLoading) {
    const channels = await listQuery?.next();
    result.push(...channels);
    getChannelsRecursively(listQuery, result);
  }
};

const getMembersRecursively = async (listQuery, result) => {
  if (listQuery?.hasNext && !listQuery?.isLoading) {
    const members = await listQuery?.next();
    const formattedMembers = members.map(member => ({
      id: member.userId,
      name: member.nickname,
      profileUrl: member.plainProfileUrl,
    }));
    result.push(...formattedMembers);
    getMembersRecursively(listQuery, result);
  }
};

// export const sbGetTotalUnreadChannelCount = () => {
//   let sb = SendBird.getInstance();
//   if (!sb) {
//     sb = new SendBird({appId: APP_ID});
//   }
//   return new Promise((resolve, reject) => {
//     const groupChannelParams =
//       new sb.GroupChannelTotalUnreadChannelCountParams();
//     groupChannelParams.channelCustomTypesFilter = ['personal_chat'];
//     sb.getTotalUnreadChannelCount(groupChannelParams, (count, error) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(count);
//       }
//     });
//   });
// };

export const sbGetTotalUnreadChannelCount = () => {
  return new Promise(async (resolve, reject) => {
    const sb = SendBird.getInstance();
    const userId = store.getState()?.auth?.userId;
    let listQuery = sb.GroupChannel.createMyGroupChannelListQuery();
    listQuery.limit = 100;
    listQuery.includeEmpty = true;
    listQuery.customTypesFilter = ['personal_chat'];
    listQuery.memberStateFilter = 'joined_only';
    listQuery.order = 'latest_last_message';
    listQuery.metadataKey = userId || '';
    listQuery.metadataValues = [inboxType.MAIN, inboxType.REQUESTS];

    try {
      const channels = [];
      await getChannelsRecursively(listQuery, channels);
      const channelsWithUnreadMessages = channels?.filter(
        item => item?.isDistinct && item?.unreadMessageCount > 0,
      );
      resolve(channelsWithUnreadMessages?.length || 0);
    } catch (error) {
      reject(error);
    }
  });
};

export const sbGetGroupChannelMembers = (channelUrl, nameFilter = '') => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.GroupChannel.getChannel(channelUrl, async (channel, error) => {
      if (error) {
        reject(error);
      } else {
        const memberListQuery = channel.createMemberListQuery();
        memberListQuery.limit = 100;
        if (nameFilter) {
          memberListQuery.nicknameStartsWithFilter = nameFilter;
        }
        try {
          const members = [];
          await getMembersRecursively(memberListQuery, members);
          resolve(members);
        } catch (e) {
          reject(e);
        }
      }
    });
  });
};

export const sbGetChannelMetadata = (channelUrl = '', keys) => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.GroupChannel.getChannel(channelUrl, async (channel, error) => {
      if (error) {
        reject(error);
      } else {
        try {
          const metadata = await channel.getMetaData(keys);
          resolve(metadata);
        } catch (e) {
          reject(e);
        }
      }
    });
  });
};

export const sbMarkAsRead = (channelUrl = '') => {
  return new Promise((resolve, reject) => {
    let sb = SendBird.getInstance();
    if (!sb) {
      sb = new SendBird({appId: APP_ID});
    }
    sb.markAsReadWithChannelUrls([channelUrl], (response, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

export const sbInviteUsersAsMembers = async (channelUrl, userIds) => {
  try {
    const channel = await sbGetGroupChannelDetail(channelUrl);
    channel?.inviteWithUserIds(userIds);
  } catch (error) {
    console.log('error', error);
  }
};
