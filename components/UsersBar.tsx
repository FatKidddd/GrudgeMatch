import React from 'react';
import { ScrollView, HStack, Box, Text, Avatar } from 'native-base';
import { userSelector, getInitials } from '../utils/userUtils';

const UsersBar = ({ userIds }: { userIds: Array<string> }) => {
  if (userIds.length === 0) return null;
  return (
    <ScrollView horizontal marginRight="5">
      <Avatar.Group size="md" marginRight={1}>
        {userIds.map(userId => {
          const user = userSelector(userId);
          const avatarProps = { key: userId } as any;
          if (!!user.imageUrl) {
            avatarProps.source = {
              uri: user.imageUrl
            };
          }
          return (
            <Avatar {...avatarProps}>
              {getInitials(user.name)}
            </Avatar>
          );
        })}
      </Avatar.Group>
    </ScrollView>
  );
};

export default UsersBar;