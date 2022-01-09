import React, { useEffect, useRef, useState } from "react"
import { getAuth } from 'firebase/auth';
import { getFirestore, getDoc, collection, query, orderBy, limit, startAfter, onSnapshot, doc, getDocs, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import GolfRoomScreen from './GolfRoomScreen';
import { Modal, Button, Input, VStack, Text, FormControl, Box, Center, NativeBaseProvider, Tooltip, AlertDialog, HStack, Link } from "native-base"
import { GolfGame, HomeStackParamList, HomeStackScreenProps } from "../../../types";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import gamesData from "../../../gamesData";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppDispatch, useAppSelector } from "../../../hooks/selectorAndDispatch";
import { BackButton } from "../../../components";
//import { setReduxRoomName } from '../../../redux/actions';

const RoomModalButtons = () => {
  //const dispatch = useAppDispatch();
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
    if (!(roomName.length > 0 && roomName.length < 30)) return handleRoomError();

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
          pointsArr: {},
          prepDone: false,
          gameEnded: false
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

  const handleJoinRoom = () => {
    const db = getFirestore();
    const roomRef = doc(db, 'rooms', roomName);
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return handleRoomError();

    getDoc(roomRef)
      .then(async res => {
        const data = res.data();
        if (data?.password && data?.password === password) {
          // update room
          await updateDoc(roomRef, {
            userIds: arrayUnion(userId),
            [`usersStrokes.${userId}`]: new Array(18).fill(null)
          });

          // update user
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            roomName
          });
          setShow(false);
        } else {
          handleRoomError();
        }
      })
      .catch(err => {
        console.error(err);
      });
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
              You need to create a room for every golf course.
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

interface GolfGameScreenProps {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Game'>;
};

// shows history of games and join room buttons
const GolfGameScreen = ({ navigation }: GolfGameScreenProps) => {
  const auth = getAuth();
  if (!auth.currentUser) return null;
  
  const user = auth.currentUser;
  const db = getFirestore();

  const userRef = doc(db, 'users', user.uid);

  // const roomName = useAppSelector(state => state.userInfoReducer.roomName);
  // const dispatch = useAppDispatch();

  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(userRef, async (res) => {
      const data = res.data();

      setRoomName(data?.roomNames && data.roomNames['game1'] ? data.roomNames['game1'] : "");
      //dispatch(setReduxRoomName(data?.roomName ? data.roomName : ""));
    }, (err) => console.error(err));

    return function cleanup() {
      unsubscribe();
    }
  }, []);

  // useEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => roomName.length ? null : <RoomModalButtons />,
  //     headerShown: roomName.length ? false : true,
  //   });
  // }, [roomName]);

  return (
    <Center flex={1}>
      {roomName.length > 0
        ? <GolfRoomScreen roomName={roomName} navigation={navigation}/>
        : <Box flex={1} bg='blue.100' width={'100%'} padding={15}>
          <HStack alignItems={'center'} justifyContent={'space-between'} height={50} mb={2} marginTop={3}>
            <BackButton onPress={() => navigation.navigate("Games")} />
            <RoomModalButtons />
          </HStack>
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