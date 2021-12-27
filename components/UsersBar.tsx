import React from 'react';
import { ScrollView, HStack, Box, Text } from 'native-base';

const UsersBar = ({ userIds }: { userIds: Array<string> }) => {
  return (
    <ScrollView horizontal marginRight="5">
      <HStack bg="blue.100">
        {userIds.map((userId, i) => {
          return (
            <Box key={userId} marginRight="5">
              <Text>{userId}</Text>
            </Box>
          );
        })}
      </HStack>
    </ScrollView>
  );
};

export default UsersBar;