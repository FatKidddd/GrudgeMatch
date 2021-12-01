import React, { useEffect, useRef, useState } from "react"
import { getAuth } from 'firebase/auth';
import { getFirestore, getDoc, collection, query, orderBy, limit, startAfter, onSnapshot, doc, getDocs, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import GolfRoomScreen from './GolfRoomScreen';
import { Modal, Button, Input, VStack, Text, FormControl, Box, Center, NativeBaseProvider, Tooltip, AlertDialog, HStack, Link } from "native-base"
import { GolfGame, HomeStackParamList, HomeStackScreenProps } from "../../types";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import gamesData from "../../gamesData";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppDispatch } from "../../hooks/selectorAndDispatch";
import { setRoomName } from '../../redux/actions';

interface RoomModalButtonsProp {
  setInRoom: (bool: boolean) => void;
};

const RoomModalButtons = ({ setInRoom }: RoomModalButtonsProp) => {
  const dispatch = useAppDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [show, setShow] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [errorIsOpen, setErrorIsOpen] = useState(false);
  const [createOrJoin, setCreateOrJoin] = useState(true);

  const handleClick = () => setShow(!show);
  const onClose = () => setErrorIsOpen(false);
  const cancelRef = useRef(null);
  
  const handleRoomError = () => setErrorIsOpen(true);

  const handleCreateRoom = () => {
    const db = getFirestore();
    const roomRef = doc(db, 'rooms', roomName);

    // check for existing roomName
    getDoc(roomRef)
      .then(res => {
        if (res.exists()) return handleRoomError();

        // create room
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
        if (!userId) return handleRoomError();
        
        const golfGame: GolfGame = {
          userIds: [],
          dateCreated: new Date(),
          gameId: gamesData[0].id,
          gameOwnerUserId: userId,
          bannedUserIds: [],
          password,
          usersStrokes: {},
          usersStrokesParBirdieCount: {},
          pointsArr: {}
        };

        setDoc(roomRef, golfGame)
          .then(res => {
            console.log("New room created");
            handleJoinRoom();
            setShow(false);
          })
          .catch(err => {
            console.error(err);
          });
      })
      .catch(err => {
        console.error(err);
      });
  };

  const handleJoinRoom = async () => {
    const db = getFirestore();
    const roomRef = doc(db, 'rooms', roomName);
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return handleRoomError();

    await updateDoc(roomRef, {
      userIds: arrayUnion(userId)
    });

    dispatch(setRoomName(roomName));

    setInRoom(true);
  };

  // add text limit
  return (
    <>
      <Modal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        size="lg"
      >
        {createOrJoin
          ?
          <Modal.Content>
            <Modal.CloseButton />
            <Modal.Header>Create room</Modal.Header>
            <Modal.Body>
              {/* Create room for all your friends to join! */}
              <FormControl mt="3">
                <FormControl.Label>Room Name</FormControl.Label>
                <Input value={roomName} onChangeText={val => setRoomName(val)}/>
              </FormControl>
              <FormControl mt="3">
                <FormControl.Label>Password</FormControl.Label>
                <Input
                  value={password}
                  onChangeText={val => setPassword(val)}
                  type={show ? "text" : "password"}
                  InputRightElement={
                    <Button size="xs" rounded="none" onPress={handleClick}>
                      {show ? "Hide" : "Show"}
                    </Button>
                  }
                />
              </FormControl>
            </Modal.Body>
            <Link onPress={() => setCreateOrJoin(!createOrJoin)} marginY="2" alignSelf="center" _text={{ color: "blue.400" }}>
              {createOrJoin ? "Join an existing room instead" : "Create a new room"}
            </Link>
            <Modal.Footer>
              <Button flex="1" onPress={handleCreateRoom}>
                Create
              </Button>
            </Modal.Footer>
          </Modal.Content>

          : <Modal.Content>
            <Modal.CloseButton />
            <Modal.Header>Join room</Modal.Header>
            <Modal.Body>
              {/* Create room for all your friends to join! */}
              <FormControl mt="3">
                <FormControl.Label>Room Name</FormControl.Label>
                <Input value={roomName} onChangeText={val => setRoomName(val)}/>
              </FormControl>
              <FormControl mt="3">
                <FormControl.Label>Password</FormControl.Label>
                <Input
                  value={password}
                  onChangeText={val => setPassword(val)}
                  type={show ? "text" : "password"}
                  InputRightElement={
                    <Button size="xs" rounded="none" onPress={handleClick}>
                      {show ? "Hide" : "Show"}
                    </Button>
                  }
                />
              </FormControl>
            </Modal.Body>
            <Link onPress={() => setCreateOrJoin(!createOrJoin)} marginY="2" alignSelf="center" _text={{ color: "blue.400" }}>
              {createOrJoin ? "Join an existing room instead" : "Create a new room"}
            </Link>
            <Modal.Footer>
              <Button flex="1" onPress={handleJoinRoom}>
                Join
              </Button>
            </Modal.Footer>
          </Modal.Content>
        }
      </Modal>

      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={errorIsOpen}
        onClose={onClose}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Failed to create/join room</AlertDialog.Header>
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
      
      <HStack space={8} alignItems="center">
        <TouchableOpacity
          onPress={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <Ionicons name="add" size={30}/>
        </TouchableOpacity>
      </HStack>
    </>
  )
};

// shows history of games and join room buttons
const GolfGameScreen = ({ navigation }: { navigation: NativeStackNavigationProp<HomeStackParamList, 'Game'> }) => {
  const [inRoom, setInRoom] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (!auth.currentUser) return;
    
    const user = auth.currentUser;
    const db = getFirestore();

    navigation.setOptions({
      headerRight: () => <RoomModalButtons setInRoom={setInRoom} />
    });
  }, []);

  return (
    <Center flex={1}>
      {inRoom
        ? <GolfRoomScreen setInRoom={setInRoom} />
        : <Box>
          <Text>Cock</Text>
        </Box>
      }
    </Center>
  );
};

// default view is progress and history of games
// create room function
// view room details stuff toast
// button to go to room
// room with all the players

export default GolfGameScreen;