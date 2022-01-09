import React from 'react';
import { Avatar } from 'native-base';
import { useUser, getInitials } from '../utils/userUtils';
import _ from 'lodash';

interface UserAvatarProps {
  userId: string;
  marginRight?: number;
  zIndex?: number;
};

const UserAvatar = React.memo(({ userId, marginRight, zIndex }: UserAvatarProps) => {
  // needs to be in a separate component like this because it uses a hook
  const user = useUser(userId);
  const avatarProps = { key: user.id } as any;
  if (!!user.imageUrl) avatarProps.source = { uri: user.imageUrl };
  return (
    <Avatar {...avatarProps} marginRight={marginRight} zIndex={zIndex}>
      {getInitials(user.name)}
    </Avatar>
  );
}, (prevProps, nextProps) => {
  return true//_.isEqual(prevProps, nextProps);
});

export default UserAvatar;