import React, { useState, useRef } from 'react';
import { GolfGame } from '../types';
import { Box, Popover, AlertDialog, Button } from 'native-base';
import ConfirmModal from './ConfirmModal';

interface RoomDetailsProps {
  roomName: string;
  room: GolfGame;
  handleLeave: () => void;
};

const RoomDetails = ({ roomName, room, handleLeave }: RoomDetailsProps) => {
  const [leaveRoomIsOpen, setLeaveRoomIsOpen] = useState(false);

  return (
    <>
      <Box alignItems="center">
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
            <Popover.Body>Room Name:</Popover.Body> 
            <Popover.Body>{roomName}</Popover.Body>
            <Popover.Body>Password:</Popover.Body>
            <Popover.Body>{room.password}</Popover.Body>
            <Popover.Footer>
              <Button colorScheme="danger" onPress={() => setLeaveRoomIsOpen(true)}>Leave room</Button>
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
