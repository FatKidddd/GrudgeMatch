import React from 'react';
import { Avatar } from 'native-base';
import { getInitials } from '../utils/userUtils';
import { useUser } from '../hooks/useFireGet';
import _ from 'lodash';

interface UserAvatarProps {
  userId: string;
  marginRight?: number;
  zIndex?: number;
  size?: "sm" | "md" | "lg";
};

const UserAvatar = ({ userId, marginRight, zIndex, size }: UserAvatarProps) => {
  // needs to be in a separate component like this because it uses a hook
  const [user, userIsLoading] = useUser(userId);
  if (!user) return null;
  const avatarProps = { key: user.id } as any;
  if (!!user.imageUrl) avatarProps.source = { uri: user.imageUrl };
  return (
    <Avatar {...avatarProps} marginRight={marginRight} zIndex={zIndex} size={size ? size : "md"}>
      {getInitials(user.name)}
    </Avatar>
  );
};

export default UserAvatar;