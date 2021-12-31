import React, { useRef } from 'react';
import { AlertDialog, Button } from 'native-base';

interface ConfirmModalProps {
  onClose: () => void;
  isOpen: boolean;
  callback: () => void;
  headerDesc: string;
  buttonDesc: string;
};

const ConfirmModal = ({ isOpen, onClose, callback, headerDesc, buttonDesc }: ConfirmModalProps) => {
  const cancelRef = useRef(null);

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
            onPress={() => {
              callback();
              onClose();
            }}
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