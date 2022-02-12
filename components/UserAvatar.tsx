import React from 'react';
import { Avatar, Box, Spinner, Text } from 'native-base';
import { getInitials } from '../utils/userUtils';
import { useUser } from '../hooks/useFireGet';
import _ from 'lodash';
import { CachedImage } from './CachedImage';

interface UserAvatarProps {
  userId: string;
  marginRight?: number;
  zIndex?: number;
  size?: "sm" | "md" | "lg";
};

const UserAvatar = React.memo(({ userId, size="sm", ...otherProps }: UserAvatarProps) => {
  // needs to be in a separate component like this because it uses a hook
  const [user, userIsLoading] = useUser(userId);
  if (!user) return <Spinner size="sm" />;
  // const avatarProps = { key: user.id } as any;
  // if (!!user.imageUrl) avatarProps.source = { uri: user.imageUrl };
  const imageSize = size === "md" ? 50 : size === "lg" ? 120 : 40;

  return (
    // <Avatar {...avatarProps} marginRight={marginRight} zIndex={zIndex} size={size ? size : "md"} borderWidth={1} borderColor={'warmGray.100'}>
    //   {getInitials(user.name)}
    // </Avatar>
    // size={size ? size : "md"} 
    <Box {...otherProps}>
      {user.imageUrl
        ? <CachedImage
          key={user.id}
          uri={user.imageUrl}
          style={{ height: imageSize, width: imageSize, resizeMode: 'contain', borderRadius: 100, borderWidth: 1, borderColor: 'white' }}
          //debug={true}
        />
        : <Box style={{ height: imageSize, width: imageSize, borderRadius: 100, borderWidth: 1, borderColor: 'white', alignItems: 'center', justifyContent: 'center', backgroundColor: '#bbbbbb' }}>
          <Text numberOfLines={1} fontSize={size} fontWeight={'semibold'} paddingX={2}>
            {getInitials(user.name)}
          </Text>
        </Box>}
    </Box>
  );
});

export default UserAvatar;