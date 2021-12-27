import React, { useState, useRef } from 'react';
import { GolfGame } from '../types';
import { Box, Popover, AlertDialog, Button } from 'native-base';

interface RoomDetailsProps {
  roomName: string;
  room: GolfGame;
  handleLeave: () => void;
};

const RoomDetails = ({ roomName, room, handleLeave }: RoomDetailsProps) => {
  const [leaveRoomIsOpen, setLeaveRoomIsOpen] = useState(false);
  const onClose = () => setLeaveRoomIsOpen(false);
  const cancelRef = useRef(null);
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
      </Box>
      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={leaveRoomIsOpen}
        onClose={onClose}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Leave room permanently?</AlertDialog.Header>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={() => {
                  handleLeave();
                  onClose();
                }}
                ref={cancelRef}
              >
                Leave room
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </>
  );
};

export default RoomDetails;
