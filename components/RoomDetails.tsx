import React, { useState, useRef } from 'react';
import { GolfGame } from '../types';
import { Box, Popover, AlertDialog, Button, Text } from 'native-base';
import ConfirmModal from './ConfirmModal';

interface RoomDetailsProps {
  roomName: string;
  room: GolfGame;
  handleLeave: () => void;
};

const RoomDetails = ({ roomName, room, handleLeave }: RoomDetailsProps) => {
  const [leaveRoomIsOpen, setLeaveRoomIsOpen] = useState(false);

  const handleOnPress = () => setLeaveRoomIsOpen(true);

  return (
    <>
      <Box alignItems="center" marginLeft={5}>
        <Popover
          trigger={(triggerProps) => {
            return (
              <Button {...triggerProps}>Room info</Button>
            )
          }}
        >
          <Popover.Content accessibilityLabel="Room Info" w="56">
            <Popover.Arrow />
            <Popover.CloseButton />
            <Popover.Body>
              <Box marginBottom={3}>
                <Text>Room Name:</Text>
                <Text>{roomName}</Text>
              </Box>
              {room.password
                ? <Box>
                  <Text>Password:</Text>
                  <Text>{room.password}</Text>
                </Box>
                : null}
            </Popover.Body>
            <Popover.Footer>
              <Button colorScheme={room.password ? "danger" : 'success' } onPress={handleOnPress}>Leave room</Button>
            </Popover.Footer>
          </Popover.Content>
        </Popover>
        
        <ConfirmModal
          isOpen={leaveRoomIsOpen}
          onClose={() => setLeaveRoomIsOpen(false)}
          callback={handleLeave}
          headerDesc='Leave room permanently?'
          buttonDesc='Leave'
        />
      </Box>
    </>
  );
};

export default RoomDetails;
