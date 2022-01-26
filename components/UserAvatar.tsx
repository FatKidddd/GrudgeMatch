import React from 'react';
import { Avatar, Spinner } from 'native-base';
import { getInitials } from '../utils/userUtils';
import { useUser } from '../hooks/useFireGet';
import _ from 'lodash';

interface UserAvatarProps {
  userId: string;
  marginRight?: number;
  zIndex?: number;
  size?: "sm" | "md" | "lg";
};

const UserAvatar = React.memo(({ userId, marginRight, zIndex, size }: UserAvatarProps) => {
  // needs to be in a separate component like this because it uses a hook
  const [user, userIsLoading] = useUser(userId);
  if (!user) return <Spinner size="sm" />;
  const avatarProps = { key: user.id } as any;
  if (!!user.imageUrl) avatarProps.source = { uri: user.imageUrl };
  return (
    <Avatar {...avatarProps} marginRight={marginRight} zIndex={zIndex} size={size ? size : "md"} borderWidth={1} borderColor={'warmGray.100'}>
      {getInitials(user.name)}
    </Avatar>
  );
});

export default UserAvatar;