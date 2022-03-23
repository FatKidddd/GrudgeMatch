import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { getAuth } from 'firebase/auth';
import { getFirestore, getDoc, collection, query, orderBy, limit, startAfter, onSnapshot, doc, getDocs, setDoc, updateDoc, arrayUnion, DocumentData, DocumentSnapshot, increment } from 'firebase/firestore';
import GolfRoomScreen from './GolfRoomScreen';
import { Modal, Button, Input, VStack, Text, FormControl, Box, Center, AlertDialog, HStack, Link, FlatList, Spinner } from "native-base"
import { GolfGame, HomeStackParamList, SavedRoom, User } from "../../../types";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import gamesData from "../../../gamesData";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppDispatch, useAppSelector } from "../../../hooks/selectorAndDispatch";
import { BackButton, Header, LoadingView, UsersBar } from "../../../components";
import { useRoom, useUser, useGolfCourse, useSnapshotUser } from '../../../hooks/useFireGet';
import { tryAsync, formatData, getBetScores, getColor, getColorType } from '../../../utils';
import { addSavedRooms } from '../../../redux/features/gamesHistory';
import { useIsMounted } from '../../../hooks/common';

const RoomModalButtons = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [show, setShow] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [errorIsOpen, setErrorIsOpen] = useState(false);
  const [createOrJoin, setCreateOrJoin] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitIsLoading, setSubmitIsLoading] = useState(false);
  const cancelRef = useRef(null);

  const userId = getAuth().currentUser?.uid;
  const user = useSnapshotUser(userId);

  const db = getFirestore();

  const onClose = () => setErrorIsOpen(false);

  
  const handleRoomError = (message: string = 'Failed to create / join room') => {
    setErrorMessage(message);
    setErrorIsOpen(true);
    setSubmitIsLoading(false);
  };

  const createRoomChecks = () => {
    if (!(roomName.length > 0 && roomName.length < 50)) return false;
    if (password.length === 0) return false;
    return true;
  };

  const handleCreateRoom = () => {
    if (submitIsLoading) return;
    setSubmitIsLoading(true);

    if (!user || !userId || !roomName || !createRoomChecks()) return handleRoomError();

    if (!(user.roomsLimit - (user.roomsUsed ? user.roomsUsed : 0) > 0)) return handleRoomError('You have no more rooms left! Go to the shop tab to buy more.');

    const roomRef = doc(db, 'rooms', roomName);
    // check for existing roomName
    getDoc(roomRef)
      .then(res => {
        if (res.exists()) return handleRoomError('Room already exists\nChoose another room name');

        // create room
        const golfGame: GolfGame = {
          id: roomName,
          userIds: [],
          dateCreated: new Date().toJSON(),
          dateEnded: null,
          gameId: gamesData.golf.id,
          gameOwnerUserId: userId,
          bannedUserIds: [],
          password,
          usersStrokes: {},
          pointsArr: {},
          prepDone: false,
          gameEnded: false
        };

        setDoc(roomRef, golfGame)
          .then(res => {
            // maybe there memory leak here? lazy to fix now
            console.log("New room created");
            handleJoinRoom();
          })
          .catch(err => {
            console.error(err);
            handleRoomError();
          });
      })
      .catch(err => {
        console.error(err);
        handleRoomError();
      });
  };

  const handleJoinRoom = () => {
    if (submitIsLoading) return;
    setSubmitIsLoading(true);

    if (!user || !userId || !roomName) return handleRoomError();

    const userRef = doc(db, 'users', userId);
    const roomRef = doc(db, 'rooms', roomName);

    getDoc(roomRef)
      .then(async res => {
        const data = res.data();
        if ((data?.userIds && data?.userIds.length < 8) && (data?.password && data?.password === password) && !data.prepDone) {
          // update room
          await updateDoc(roomRef, {
            userIds: arrayUnion(userId),
            [`usersStrokes.${userId}`]: [] // new Array(18).fill(null) // send help
          });

          // update user
          await updateDoc(userRef, {
            [`roomNames.${'golf'}`]: roomName,
            roomsUsed: increment(1)
          });
        } else {
          handleRoomError();
        }
      })
      .catch(err => {
        console.error(err);
        handleRoomError();
      });
  };

  if (!user) return null;
  // add text limit
  return (
    <>
      <Modal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        size="lg"
      >
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>{createOrJoin ? 'Create room' : 'Join room'}</Modal.Header>
          <Modal.Body>
            <Text fontWeight={'bold'}>Rooms Left: {user?.roomsLimit - (user?.roomsUsed ? user.roomsUsed : 0)}</Text>
            <Text></Text>
            {createOrJoin ? 'As the room creator, you decide which golf course to play.' : null}
            <FormControl mt="3">
              <FormControl.Label>Room Name</FormControl.Label>
              <Input value={roomName} onChangeText={val => setRoomName(val)} />
            </FormControl>
            <FormControl mt="3">
              <FormControl.Label>Password</FormControl.Label>
              <Box>
                <Input
                  value={password}
                  onChangeText={val => setPassword(val)}
                  type={show ? "text" : "password"}
                  InputRightElement={
                    <Button onPress={() => setShow(!show)} height='100%'>
                      <Ionicons size={20} name={!show ? "eye-outline" : "eye-off-outline"} color='#eeeeee'/>
                    </Button>}
                />
              </Box>
            </FormControl>
          </Modal.Body>
          <Link onPress={() => setCreateOrJoin(!createOrJoin)} marginY="2" alignSelf="center" _text={{ color: "blue.400" }}>
            {createOrJoin ? "Join an existing room instead" : "Create a new room"}
          </Link>
          <Modal.Footer>
            <LoadingView isLoading={submitIsLoading}>
              <Button onPress={createOrJoin ? handleCreateRoom : handleJoinRoom}>
                {createOrJoin ? 'Create' : 'Join'}
              </Button>
            </LoadingView>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={errorIsOpen}
        onClose={onClose}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Error</AlertDialog.Header>
          <AlertDialog.Body>{errorMessage}</AlertDialog.Body>
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
        <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
          <Ionicons name="add" size={30} />
        </TouchableOpacity>
      </HStack>
    </>
  );
};

interface RoomViewProps {
  roomName: string;
  setRoomNameDetailed: (roomName: string) => void;
  userId: string;
};

// const Dummy = ({ userId }) => {
//   const [user, _] = useUser(userId);
//   return null;
// };

const RoomView = ({ roomName, setRoomNameDetailed, userId }: RoomViewProps) => {
  // console.log(index);
  const [room, roomIsLoading] = useRoom(roomName);
  const [golfCourse, golfCourseIsLoading] = useGolfCourse(room?.golfCourseId);

  if (!room || !room.userIds || !golfCourse) return null;

  const n = room.userIds.length;
  let usersFinalScores: Array<number> = new Array(n).fill(0);

  // swap user's and some random to make user's the first position (cannot mutate room so need to deepcopy below if you want)
  const userIds = room.userIds.slice();
  for (let i = 1; i < n; i++) {
    if (userIds[i] === userId) {
      userIds[i] = userIds[0];
      userIds[0] = userId;
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const uid = userIds[i];
      const oppUid = userIds[j];
      const { finalScore, finalScores } = getBetScores({
        userId: uid,
        oppUid,
        course: golfCourse,
        room
      });
      usersFinalScores[i] += finalScore;
    }
  }

  // let fakeName = `room${3 - index}`;
  // let golfName;

  // if (index === 1) {
  //   golfName = 'Sembawang Country Club Golf Course';
  //   usersFinalScores = [9, 21, -10, -20]
  // } else if (index === 0) {
  //   golfName = 'Changi Golf Club Golf Course';
  //   usersFinalScores = [-15, 13, -9, 11]
  // } else {
  //   golfName = 'The Serapong';
  // }

  const FINAL_SCORES_LIMIT = 4;

  const handleOnPress = () => setRoomNameDetailed(roomName);
  
  return (
    <TouchableOpacity onPress={handleOnPress} style={{ marginHorizontal: 10 }}>
      <VStack width={'100%'} rounded={20} bg={'white'} padding={4} marginBottom={3} space={2}>
        <HStack justifyContent={'space-between'} alignItems={'center'} space={3}>
          {/* borderBottomWidth={1} borderColor={'gray.200'}> */}
          <VStack width={100}>
            <Text fontWeight={'semibold'} numberOfLines={1}>{roomName}</Text>
            <Text fontWeight={'thin'} fontSize={12}>{new Date(room.dateCreated).toLocaleDateString()}</Text>
          </VStack>
          <UsersBar userIds={userIds} size="sm" limit={5}/>
        </HStack>
        <Text fontSize={16} fontWeight='bold' numberOfLines={1}>{golfCourse.name}</Text>
        <HStack justifyContent={'space-evenly'} alignItems={'center'}>
          {// limit to 4 long
            _.zip(userIds, usersFinalScores).slice(0, FINAL_SCORES_LIMIT).map(([uid, userFinalScore], idx) => {
              if (!uid || userFinalScore === undefined) return null;
              return <FinalScoreTile key={uid} userId={uid} userFinalScore={userFinalScore} isUser={idx === 0}/>;
            })}
        </HStack>
        <HStack justifyContent={'flex-end'} alignItems={'center'}>
          <Text>{userIds.length > FINAL_SCORES_LIMIT ? `+${userIds.length - FINAL_SCORES_LIMIT} more` : null}</Text>
        </HStack>
      </VStack>
    </TouchableOpacity>
  );
};

interface FinalScoreTileProps {
  userId: string;
  userFinalScore: number;
  isUser: boolean;
};

const FinalScoreTile = ({ userId, userFinalScore, isUser }: FinalScoreTileProps) => {
  const [user, userIsLoading] = useUser(userId);
  return (
    <Center width={70}>
      <LoadingView isLoading={userIsLoading} alignItems={'center'}>
        <Text numberOfLines={1}>{isUser ? 'You' : user?.name}</Text>
        <Center bg={getColor(getColorType({ num: userFinalScore, arrType: 'Bet' }))} width={50} height={50} marginTop={3} rounded={10}>
          <Text fontSize={18} fontWeight={'semibold'}>{userFinalScore > 0 ? `+${userFinalScore}` : userFinalScore}</Text>
        </Center>
      </LoadingView>
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

  const isMounted = useIsMounted();

  const db = getFirestore();
  const golfHistoryRef = collection(db, 'users', userId, 'golfHistory');
  
  useEffect(() => {
    getSavedRooms();
  }, []);

  const getSavedRooms = async () => {
    if (loading || !isMounted.current) return;

    setLoading(true);

    let trueLast = lastVisible;
    if (lastVisibleId && !lastVisible) {
      const [initialLastVisible, err] = await tryAsync(getDoc(doc(golfHistoryRef, lastVisibleId)));
      trueLast = initialLastVisible;
    }

    const q = trueLast == undefined
      ? query(golfHistoryRef, orderBy("dateSaved", "desc"), limit(5))
      : query(golfHistoryRef, orderBy("dateSaved", "desc"), startAfter(trueLast), limit(5));

    const [documentSnapshots, err] = await tryAsync(getDocs(q));
    if (!documentSnapshots || !isMounted.current) return;

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
    if (!isMounted.current) return;
    if (roomNameDetailed) return setRoomNameDetailed("");
    navigation.navigate("Games");
  };

  const header = useMemo(() =>
    <Header>
      <HStack alignItems={'center'} justifyContent={'space-between'}>
        <BackButton onPress={handleBackButton} />
        <Text fontWeight={'semibold'} fontSize={18}>Golf History</Text>
        <RoomModalButtons />
      </HStack>
    </Header>
    , [roomNameDetailed]);

  const renderItem = useCallback(({ item }) =>
    <RoomView roomName={item.id} setRoomNameDetailed={setRoomNameDetailed} userId={userId} />
    , [userId]);

  return (
    <Box flex={1} width={'100%'}>
      {header}
      {roomNameDetailed
        ? <GolfRoomScreen
          roomName={roomNameDetailed}
          navigation={navigation}
          isSavedView={true}
        />
        : noMoreRooms && savedRooms.length === 0
          ? <Center flex={1} alignSelf={'center'}>
            <Center width="90%" maxWidth={300} bg='white' padding={10} rounded={20}>
              <Text textAlign={'center'}>You haven't played any golf games yet, click the plus icon to get started!</Text>
            </Center>
          </Center>
          : <Box marginTop={3} flex={1}>
            <FlatList
              data={savedRooms}
              renderItem={renderItem}
              keyExtractor={(item, i) => item.id + i}
              onEndReached={onEndReached}
              onEndReachedThreshold={0.5}
              ListFooterComponent={loading ? <Spinner size="sm" /> : null}
              showsVerticalScrollIndicator={false}
            />
          </Box>}
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
  const isMounted = useIsMounted();

  const auth = getAuth();
  if (!auth.currentUser) return null;
  const user = auth.currentUser;
  const db = getFirestore();
  const userRef = doc(db, 'users', user.uid);

  useEffect(() => {
    const unsubscribe = onSnapshot(userRef, async (res) => {
      const data = res.data();
      if (isMounted.current) {
        setRoomName(data?.roomNames && data.roomNames['golf'] ? data.roomNames['golf'] : "");
        setIsLoading(false);
      }
    }, (err) => console.error(err));

    return () => unsubscribe();
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