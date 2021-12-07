import React, { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Text, Popover, Button, Center, Box, AlertDialog, HStack, Input, ScrollView } from "native-base";
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, doc, updateDoc, arrayRemove, onSnapshot, collection, deleteField, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useAppSelector } from '../../hooks/selectorAndDispatch';
import { GolfGame, GolfStrokes } from '../../types';

// leave room function

interface GolfRoomScreenProps {
  roomName: string;
};

const TransitionScoreBoard = () => {
  
};

// may change usersStrokes to be a collection with multiple listeners to each player for scalability.
// for now its just a more quick to implement solution
const GolfRoomScreen = ({ roomName }: GolfRoomScreenProps) => {
  const db = getFirestore();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const roomRef = doc(db, 'rooms', roomName);

  const handleLeave = async () => {
    if (!userId) return null;
    const userRef = doc(db, 'users', userId);
    await updateDoc(roomRef, {
      userIds: arrayRemove(userId),
      [`usersStrokes.${userId}`]: deleteField()
    });
    await updateDoc(userRef, {
      roomName: ""
    });
  };

  const LeaveButton = () => {
    return (
      <TouchableOpacity onPress={handleLeave}>
        <Ionicons name="arrow-back" size={30} />
      </TouchableOpacity>
    );
  };

  const [room, setRoom] = useState({
    userIds: [],
    dateCreated: new Date(),
    gameId: "",
    gameOwnerUserId: "",
    bannedUserIds: [],
    password: "",

    usersStrokes: {}, // 18 holes, the render will be diff;
    usersStrokesParBirdieCount: {},
    pointsArr: {},
  } as GolfGame);

  useEffect(() => {
    const unsubscribe = onSnapshot(roomRef, res => {
      const data = res.data();
      if (!data) handleDataError();
      else {
        console.log(data);
        setRoom(data as GolfGame);
      }
    });

    return function cleanup() {
      unsubscribe();
    };
  }, []);

  const handleDataError = () => setErrorIsOpen(true);


  const RoomDetails = () => {
    return (
      <Box h="60%" w="100%" alignItems="center">
        <Popover
          trigger={(triggerProps) => {
            return (
              <Button {...triggerProps}>
                Room info
              </Button>
            )
          }}
        >
          <Popover.Content accessibilityLabel="Room Info" w="56">
            <Popover.Arrow />
            <Popover.CloseButton />
            <Popover.Body>Room Name: {roomName}</Popover.Body>
            <Popover.Body>Password: {room.password}</Popover.Body>
          </Popover.Content>
        </Popover>
      </Box>
    );
  };

  const UsersBar = () => {
    return (
      <>
        {room.userIds.forEach(userId => {
          return (
            <Box>
              <Text>userId</Text>
            </Box>
          )
        })}
      </>
    );
  };


  const [errorIsOpen, setErrorIsOpen] = useState(false);
  const onClose = () => setErrorIsOpen(false);
  const cancelRef = useRef(null);

  return (
    <ScrollView>
      <Text>{roomName}</Text>
      <LeaveButton />
      <RoomDetails />
      <UsersBar />
      
      {Object.entries(room.usersStrokes).map(([uid, userStrokes], i) =>
        <UserStrokes userId={uid} roomName={roomName} userStrokes={userStrokes} key={uid} />
      )}
      {/* <Picker
        selectedValue={selectedLanguage}
        onValueChange={(itemValue, itemIndex) =>
          setSelectedLanguage(itemValue)
        }>
        <Picker.Item label="Java" value="java" />
        <Picker.Item label="JavaScript" value="js" />
      </Picker> */}
      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={errorIsOpen}
        onClose={onClose}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Failed to join room</AlertDialog.Header>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={onClose}
                ref={cancelRef}
              >
                Cancel
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </ScrollView>
  );
};

interface UserStrokesProps {
  userId: string;
  userStrokes: GolfStrokes;
  roomName: string;
};

const UserStrokes = ({ userId, userStrokes, roomName }: UserStrokesProps) => {
  const db = getFirestore();
  const roomRef = doc(db, 'rooms', roomName);

  const updateUserStrokes = async ({ id, strokes }: { id: string, strokes: GolfStrokes }) => {
    await updateDoc(roomRef, {
      [`usersStrokes.${id}`]: strokes
    });
  };

  const [name, setName] = useState(userId);

  useEffect(() => {
    getDoc(doc(db, 'users', userId))
      .then(res => {
        const data = res.data();
        setName(data?.name ? data?.name : userId);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  const [strokes, setStrokes] = useState(userStrokes);

  useEffect(() => {
    setStrokes(userStrokes);
  }, [userStrokes]);


  const handleChangeNumber = (text: string, idx: number) => {
    const num = Number(text); // wow Number("") == 0
    setStrokes(strokes.map((v, i) => i == idx ? num : v) as GolfStrokes);
  };

  return (
    <HStack>
      <Box width={30} overflow="hidden">
        <Text>{name}</Text>
      </Box>
      <HStack>
        {strokes.map((v, i) => {
          return (
            <Box>
              <Input 
                keyboardType="numeric"
                value={v ? v.toString() : undefined}
                onEndEditing={() => updateUserStrokes({ id: userId, strokes })}
                onChangeText={text => handleChangeNumber(text, i)} key={i}
              />
            </Box>
          );
        })}
      </HStack>
    </HStack>
  );
};

export default GolfRoomScreen;