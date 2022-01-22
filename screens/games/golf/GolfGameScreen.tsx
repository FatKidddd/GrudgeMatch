import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { getAuth } from 'firebase/auth';
import { getFirestore, getDoc, collection, query, orderBy, limit, startAfter, onSnapshot, doc, getDocs, setDoc, updateDoc, arrayUnion, DocumentData, DocumentSnapshot } from 'firebase/firestore';
import GolfRoomScreen from './GolfRoomScreen';
import { Modal, Button, Input, VStack, Text, FormControl, Box, Center, NativeBaseProvider, Tooltip, AlertDialog, HStack, Link, FlatList, Spinner } from "native-base"
import { GolfCourse, GolfGame, HomeStackParamList, HomeStackScreenProps, SavedRoom } from "../../../types";
import { StatusBar, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import gamesData from "../../../gamesData";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppDispatch, useAppSelector } from "../../../hooks/selectorAndDispatch";
import { BackButton, Header, UsersBar } from "../../../components";
import { useRoom, useUser, useGolfCourse } from '../../../hooks/useFireGet';
import { getBetScores, getColor, getColorType } from "../../../utils/golfUtils";
import { tryAsync } from '../../../utils/asyncUtils';
import { addSavedRooms } from '../../../redux/features/gamesHistory';
import { formatData } from '../../../utils/dateUtils';

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

  const createRoomChecks = () => {
    if (!(roomName.length > 0 && roomName.length < 30)) return false;
    if (password.length === 0) return false;
    return true;
  }

  const handleCreateRoom = () => {
    if (!createRoomChecks) return handleRoomError();

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
          id: '',
          userIds: [],
          dateCreated: '',
          dateEnded: null,
          gameId: gamesData.golf.id,
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

interface RoomViewProps {
  roomName: string;
  setRoomNameDetailed: (roomName: string) => void;
  userId: string;
};

const RoomView = ({ roomName, setRoomNameDetailed, userId }: RoomViewProps) => {
  const [room, roomIsLoading] = useRoom(roomName);
  const [golfCourse, golfCourseIsLoading] = useGolfCourse(room?.golfCourseId);

  const renderItem = useCallback(([uid, userFinalScore]) => 
    <FinalScoreTile key={uid} userId={uid} userFinalScore={userFinalScore} />
  , []);

  if (!room || !room.userIds || !golfCourse) return null;

  const n = room.userIds.length;
  const usersFinalScores: Array<number> = new Array(n).fill(0);

  // swap user's and some random to make user's the first position
  for (let i = 1; i < n; i++) {
    if (room.userIds[i] === userId) {
      room.userIds[i] = room.userIds[0];
      room.userIds[0] = userId;
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const uid = room.userIds[i];
      const oppUid = room.userIds[j];
      const { finalScore, finalScores } = getBetScores({
        userId: uid,
        oppUid,
        course: golfCourse,
        room
      });
      usersFinalScores[i] += finalScore;
    }
  }

  const FINAL_SCORES_LIMIT = 4;

  return (
    <TouchableOpacity onPress={() => setRoomNameDetailed(roomName)} style={{ marginHorizontal: 10 }}>
      <Box width={'100%'} rounded={20} bg={'white'} padding={4} marginBottom={5}>
        <HStack justifyContent={'space-between'} alignItems={'center'} space={3} paddingBottom={2} borderBottomWidth={1} borderColor={'gray.200'}>
          <VStack width={70}>
            <Text fontWeight={'semibold'} numberOfLines={1}>{roomName}</Text>
            <Text fontWeight={'thin'} fontSize={12}>{new Date(room.dateCreated).toLocaleDateString()}</Text>
          </VStack>
          <UsersBar userIds={room.userIds} size="sm" limit={5}/>
        </HStack>
        <HStack justifyContent={'space-evenly'} alignItems={'center'}>
          {// limit to 4 long
            _.zip(room.userIds, usersFinalScores).slice(0, FINAL_SCORES_LIMIT).map(renderItem)}

          {room.userIds.length > FINAL_SCORES_LIMIT
            ? <Center>
              <Text>+{room.userIds.length - FINAL_SCORES_LIMIT} more</Text>
            </Center>
            : null}
        </HStack>
      </Box>
    </TouchableOpacity>
  );
};

const FinalScoreTile = ({ userId, userFinalScore }: { userId: string, userFinalScore: number }) => {
  const [user, userIsLoading] = useUser(userId);
  return (
    <Center width={70} margin={2}>
      <Text numberOfLines={1}>{user?.name}</Text>
      <Center bg={getColor(getColorType({ num: userFinalScore, arrType: 'Bet' }))} width={50} height={50} marginTop={3} rounded={10}>
        <Text fontSize={18} fontWeight={'semibold'}>{userFinalScore > 0 ? `+${userFinalScore}` : userFinalScore}</Text>
      </Center>
    </Center>
  );
};

interface GolfHistoryScreenProps {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Game'>;
  userId: string;
};

const GolfHistoryScreen = ({ navigation, userId }: GolfHistoryScreenProps) => {
  const { savedRooms, lastVisibleId } = useAppSelector(state => state.gamesHistory.golf);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot<DocumentData> | null | undefined>();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [noMoreRooms, setNoMoreRooms] = useState(false);
  const [roomNameDetailed, setRoomNameDetailed] = useState<string>();

  const db = getFirestore();
  const golfHistoryRef = collection(db, 'users', userId, 'golfHistory');
  
  useEffect(() => {
    getSavedRooms();
  }, []);

  const getSavedRooms = async () => {
    if (loading) return;

    setLoading(true);

    let trueLast = lastVisible;
    if (lastVisibleId && !lastVisible) {
      const [initialLastVisible, err] = await tryAsync(getDoc(doc(golfHistoryRef, lastVisibleId)));
      trueLast = initialLastVisible;
    }

    const q = trueLast == undefined
      ? query(golfHistoryRef, orderBy("dateSaved"), limit(1))
      : query(golfHistoryRef, orderBy("dateSaved"), startAfter(trueLast), limit(1));

    const [documentSnapshots, err] = await tryAsync(getDocs(q));
    if (!documentSnapshots) return;

    // if no more past games
    if (!documentSnapshots.docs.length) setNoMoreRooms(true);
    else {
      console.log("Got saved rooms");
      const newSavedRooms = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedRoom));
      newSavedRooms.forEach(savedRoom => formatData(savedRoom));

      const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      dispatch(addSavedRooms({
        gameId: 'golf',
        savedRooms: newSavedRooms,
        lastVisibleId: newLastVisible.id
      }));
      setLastVisible(newLastVisible);
    }
    setLoading(false);
  };

  const onEndReached = () => {
    if (noMoreRooms) return;
    getSavedRooms();
  };

  const handleBackButton = () => {
    if (roomNameDetailed) return setRoomNameDetailed("");
    navigation.navigate("Games");
  };

  const header = useMemo(() =>
    <Header>
      <HStack alignItems={'center'} justifyContent={'space-between'}>
        <BackButton onPress={handleBackButton} />
        <RoomModalButtons />
      </HStack>
    </Header>
    , [roomNameDetailed]);

  const renderItem = useCallback(({ item }) =>
    <RoomView roomName={item.id} setRoomNameDetailed={setRoomNameDetailed} userId={userId} />
    , []);

  return (
    <Box flex={1} width={'100%'}>
      {header}
      {roomNameDetailed
        ? <GolfRoomScreen
          roomName={roomNameDetailed}
          navigation={navigation}
          isSavedView={true}
        />
        : <FlatList
          data={savedRooms}
          renderItem={renderItem}
          keyExtractor={(item, i) => item.id + i}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          initialNumToRender={5}
          ListFooterComponent={loading ? <Spinner size="sm" /> : null}
        />}
    </Box>
  );
};

interface GolfGameScreenProps {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Game'>;
};

// contains all golf stuff --> shows history of games, join room buttons, room
const GolfGameScreen = ({ navigation }: GolfGameScreenProps) => {
  const [roomName, setRoomName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const auth = getAuth();
  if (!auth.currentUser) return null;
  const user = auth.currentUser;
  const db = getFirestore();
  const userRef = doc(db, 'users', user.uid);

  useEffect(() => {
    const unsubscribe = onSnapshot(userRef, async (res) => {
      const data = res.data();
      setRoomName(data?.roomNames && data.roomNames['golf'] ? data.roomNames['golf'] : "");
      setIsLoading(false);
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
      {isLoading 
        ? <Spinner size="lg" />
        : roomName.length > 0
          ? <GolfRoomScreen {...props}/>
          : <GolfHistoryScreen {...props}/>}
    </Center>
  );
};

export default GolfGameScreen;