import _ from 'lodash';
import React, { useEffect, useRef, useState } from "react"
import { getAuth } from 'firebase/auth';
import { getFirestore, getDoc, collection, query, orderBy, limit, startAfter, onSnapshot, doc, getDocs, setDoc, updateDoc, arrayUnion, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import GolfRoomScreen from './GolfRoomScreen';
import { Modal, Button, Input, VStack, Text, FormControl, Box, Center, NativeBaseProvider, Tooltip, AlertDialog, HStack, Link, FlatList, Spinner } from "native-base"
import { GolfCourse, GolfGame, HomeStackParamList, HomeStackScreenProps } from "../../../types";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import gamesData from "../../../gamesData";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppDispatch, useAppSelector } from "../../../hooks/selectorAndDispatch";
import { BackButton, UsersBar } from "../../../components";
import { SavedGolfGame } from "../../../redux/reducers/gamesHistory";
import { useRoom } from "../../../utils/roomUtils";
import { getBetScores } from "../../../utils";

const RoomModalButtons = () => {
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
          dateEnded: null,
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
            [`roomNames.${'golf'}`]: roomName
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

const RoomView = ({ roomName }: { roomName: string }) => {
  const room: GolfGame = useRoom(roomName);
  const [course, setCourse] = useState<GolfCourse>();

  useEffect(() => {
    if (!room.golfCourseId || !course) return;
    getDoc(doc(getFirestore(), 'golfCourses', room.golfCourseId))
      .then(res => {
        setCourse(res.data() as GolfCourse);
      })
      .catch(err => console.error(err));
    
  }, []);

  if (!room?.userIds || !course) return null;

  for (let i = 0; i < room.userIds.length; i++) {
    for (let j = 0; j < room.userIds.length; j++) {
      if (i === j) continue;
      const uid = room.userIds[i];
      const oppUid = room.userIds[j];
      const { finalScore, finalScores } = getBetScores({ userId: uid, oppUid, course, room });
    }
  }
  return (
    <Box width={'100%'}>
      <HStack justifyContent={'space-between'}>
        <Text fontWeight={'semibold'} width={70} numberOfLines={1}>{roomName}</Text>
        <UsersBar userIds={room.userIds}/>
        <Text>{room.dateCreated.toLocaleDateString()}</Text>
      </HStack>

    </Box>
  );
};

interface GolfHistoryScreenProps {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Game'>;
  userId: string;
};

const GolfHistoryScreen = ({ navigation, userId }: GolfHistoryScreenProps) => {
  //const golfSavedRooms = useAppSelector(state => state.gamesHistoryReducer['golf']);
  //const dispatch = useAppDispatch();
  const [savedRooms, setSavedRooms] = useState([] as SavedGolfGame[]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData>>();
  const [loading, setLoading] = useState(false);
  const [noMoreRooms, setNoMoreRooms] = useState(false);
  
  const getSavedRooms = async () => {
    if (loading) return;
    setLoading(true);
    const golfHistoryRef = collection(getFirestore(), 'users', userId, 'golfHistory');
    const q = lastVisible == undefined
      ? query(golfHistoryRef, orderBy("dateSaved"), limit(1))
      : query(golfHistoryRef, orderBy("dateSaved"), startAfter(lastVisible), limit(1));

    try {
      const documentSnapshots = await getDocs(q);
      console.log("Got saved rooms");
      const newSavedRooms: SavedGolfGame[] = [];
      documentSnapshots.docs.forEach(doc => newSavedRooms.push({
        id: doc.id,
        ...doc.data()
      } as SavedGolfGame));
      // dispatch(addRooms('golf', savedGolfGames, documentSnapshots.docs[documentSnapshots.docs.length - 1]));
      setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
      setSavedRooms([...savedRooms, ...newSavedRooms]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // console.log(!!lastVisible)
    setLoading(false);
  }, [lastVisible]);

  useEffect(() => {
    getSavedRooms();
  }, []);

  const renderFooter = () => {
    if (!loading) return null;
    return <Spinner size="sm" />;
  };

  return (
    <Box flex={1} bg='blue.100' width={'100%'} padding={15}>
      <HStack alignItems={'center'} justifyContent={'space-between'} height={50} mb={2} marginTop={3}>
        <BackButton onPress={() => navigation.navigate("Games")} />
        <RoomModalButtons />
      </HStack>
      <FlatList
        data={savedRooms}
        renderItem={({ item }) => <RoomView roomName={item.id} />}
        keyExtractor={(item, i) => item.id + i}
        // onEndReached={getSavedRooms}
        // onEndReachedThreshold={0.5}
        // initialNumToRender={5}
        ListFooterComponent={renderFooter}
      />
    </Box>
  );
};

interface GolfGameScreenProps {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Game'>;
};

// contains all golf stuff --> shows history of games, join room buttons, room
const GolfGameScreen = ({ navigation }: GolfGameScreenProps) => {
  const [roomName, setRoomName] = useState("");

  const auth = getAuth();
  if (!auth.currentUser) return null;
  const user = auth.currentUser;
  const db = getFirestore();
  const userRef = doc(db, 'users', user.uid);

  useEffect(() => {
    const unsubscribe = onSnapshot(userRef, async (res) => {
      const data = res.data();
      setRoomName(data?.roomNames && data.roomNames['golf'] ? data.roomNames['golf'] : "");
    }, (err) => console.error(err));

    return function cleanup() {
      unsubscribe();
    }
  }, []);

  const props = {
    navigation,
    roomName,
    userId: user.uid
  };

  return (
    <Center flex={1}>
      {roomName.length > 0
        ? <GolfRoomScreen {...props}/>
        : <GolfHistoryScreen {...props}/>}
    </Center>
  );
};

export default GolfGameScreen;