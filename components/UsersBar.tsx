import React from 'react';
import { ScrollView, HStack, Box, Text, Avatar } from 'native-base';
import UserAvatar from './UserAvatar';

const UsersBar = ({ userIds }: { userIds: Array<string> }) => {
  return (
    <ScrollView horizontal marginRight="5">
      {/* <Avatar.Group size="md"> */}
      <HStack>
        {userIds.length !== 0
          ? userIds.map((userId, i) => 
            <UserAvatar
              key={userId}
              userId={userId}
              marginRight={i == userIds.length - 1 ? 0 : -3}
              zIndex={-i}
            />
          )
          : <Avatar></Avatar>
        }
      </HStack>
      {/* </Avatar.Group> */}
    </ScrollView>
  );
};

export default UsersBar;