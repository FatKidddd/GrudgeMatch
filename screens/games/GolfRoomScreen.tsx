import React from 'react';
import { Text, Tooltip, Button, Center } from "native-base";
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useAppSelector } from '../../hooks/selectorAndDispatch';

interface GolfRoomScreenProps {
  setInRoom: (bool: boolean) => void;
};

// leave room function

const GolfRoomScreen = ({ setInRoom }: GolfRoomScreenProps) => {
  const roomName = useAppSelector(state => state.userInfoReducer.roomName);
  const handleLeave = () => {
    const db = getFirestore();
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    console.log(roomName);

    getDoc(doc(db, 'rooms', roomName))
      .then(res => {
        const data = res.data();
        if (data?.gameOwnerUserId === userId) {

        } else {

        }
      })
      .catch(err => {
        console.error(err);
      });
  };

  const LeaveButton = () => {
    return (
      <TouchableOpacity onPress={handleLeave}>
        <Ionicons name="arrow-back" size={30} />
      </TouchableOpacity>
    );
  };

  return (
    <Text>Balls</Text>
  );
};

const RoomDetails = () => {
  return (
    <Tooltip label="Hey, I'm here!" openDelay={0}>
      <Button>More</Button>
    </Tooltip>
  );
};
export default GolfRoomScreen;