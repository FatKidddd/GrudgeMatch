import _ from 'lodash';
import React from 'react';
import { ScrollView, HStack, Avatar, Spinner } from 'native-base';
import UserAvatar from './UserAvatar';

interface UsersBarProps {
  userIds: Array<string>;
  size?: "sm" | "md" | "lg";
  limit?: number;
};

const UsersBar = React.memo(({ userIds, size, limit }: UsersBarProps) => {
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
          : <Spinner size="sm" />
        }
        {limit && userIds.length && userIds.length - limit > 0
          ? <Avatar size={size ? size : "md"} zIndex={-99}>{`+${userIds.length - limit}`}</Avatar>
          : null}
      {/* </Avatar.Group> */}
    </ScrollView>
  );
}, (prevProps, nextProps) => {
  return _.isEqual(prevProps.userIds, nextProps.userIds);
});

export default UsersBar;