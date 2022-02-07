import React, { useRef } from 'react';
import { AlertDialog, Button } from 'native-base';
import { useAppDispatch } from '../hooks/selectorAndDispatch';
import { deleteSavedRooms } from '../redux/features/gamesHistory';

interface ConfirmModalProps {
  onClose: () => void;
  isOpen: boolean;
  callback: () => void;
  headerDesc: string;
  buttonDesc: string;
};

const ConfirmModal = ({ isOpen, onClose, callback, headerDesc, buttonDesc }: ConfirmModalProps) => {
  const cancelRef = useRef(null);
  const dispatch = useAppDispatch();

  const onPress = () => {
    // onClose();
    dispatch(deleteSavedRooms('golf'));
    callback();
  };

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      isOpen={isOpen}
      onClose={onClose}
    >
      <AlertDialog.Content>
        <AlertDialog.CloseButton />
        <AlertDialog.Header>{headerDesc}</AlertDialog.Header>
        <AlertDialog.Footer>
          <Button
            colorScheme="danger"
            onPress={onPress}
            ref={cancelRef}
          >
            {buttonDesc}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};

export default ConfirmModal;