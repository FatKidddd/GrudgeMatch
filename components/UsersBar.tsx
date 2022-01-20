import React from 'react';
import { ScrollView, HStack, Avatar } from 'native-base';
import UserAvatar from './UserAvatar';

const UsersBar = ({ userIds, size, limit }: { userIds: Array<string>, size?: "sm" | "md" | "lg", limit?: number }) => {
  return (
    <ScrollView
      horizontal
      borderWidth={1}
      borderColor={'gray.200'}
      padding={size && size == "sm" ? 1 : 1}
      rounded={size == "sm" ? 20 : 30}
      bg='white'
    >
      {/* <Avatar.Group size="md"> */}
      <HStack>
        {userIds.length !== 0
          ? userIds.slice(0, limit ? limit : undefined).map((userId, i) =>
            <UserAvatar
              key={userId}
              userId={userId}
              marginRight={i == userIds.length - 1 ? 0 : (size && size == "sm") ? -2 : -3}
              zIndex={-i}
              size={size}
            />
          )
          : <Avatar></Avatar>
        }
        {limit && userIds.length && userIds.length - limit > 0
          ? <Avatar size={size ? size : "md"} zIndex={-99}>{`+${userIds.length - limit}`}</Avatar>
          : null}
      </HStack>
      {/* </Avatar.Group> */}
    </ScrollView>
  );
};

export default UsersBar;