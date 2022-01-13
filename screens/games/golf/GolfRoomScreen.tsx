import _ from 'lodash';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Text, Popover, Button, Center, Box, HStack, ScrollView, VStack, PresenceTransition, useToast, Spinner } from "native-base";
import { TouchableOpacity } from 'react-native';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getFirestore, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, collection, deleteField, getDoc, addDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { GolfCourse, GolfGame, HomeStackParamList } from '../../../types';
import GolfPrepScreen from './GolfPrepScreen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButton, GolfArray, RoomDetails, UsersBar, UserAvatar, UserScores, UsersStrokes } from '../../../components';
import { getBetScores, useUser, getColor, getColorType, getUserHoleNumber } from '../../../utils';

// leave room function

interface BetRowProps {
  userId: string,
  oppUid: string,
  course: GolfCourse;
  room: GolfGame;
};

const BetRow = ({ userId, oppUid, course, room }: BetRowProps) => {
  const [showDetail, setShowDetail] = useState(false);

  const { finalScore, finalScores } = getBetScores({ userId, oppUid, course, room });

  const golfArray = useMemo(() =>
    <GolfArray course={course}>
      <UserScores userScores={finalScores} uid={userId} oppUid={oppUid} />
    </GolfArray>
    , []);

  return (
    <VStack width='100%' borderWidth={2} borderColor={'gray.100'} rounded={20} padding={3} marginTop={2}>
      <Center width='100%' alignItems='flex-end'>
        <TouchableOpacity onPress={() => setShowDetail(!showDetail)}>
          <MaterialIcons name={`expand-${!showDetail ? 'more' : 'less'}`} size={30} />
        </TouchableOpacity>
      </Center>
      <HStack marginBottom={5} justifyContent={'space-evenly'}>
        <HStack alignItems={'center'}>
          <Center width={70}>
            <Text numberOfLines={1} marginBottom={3}>{useUser(userId).name}</Text>
            <UserAvatar userId={userId} />
          </Center>
          <Text marginTop={8}>vs</Text>
          <Center width={70}>
            <Text numberOfLines={1} marginBottom={3}>{useUser(oppUid).name}</Text>
            <UserAvatar userId={oppUid} />
          </Center>
        </HStack>
        <Center justifyContent='space-between'>
          <Text>Net score:</Text>
          <Center bg={getColor(getColorType({ num: finalScore, arrType: 'Bet' }))} width={50} height={50} marginTop={3} rounded={10}>
            <Text fontSize={18} fontWeight={'semibold'}>{finalScore > 0 ? `+${finalScore}` : finalScore}</Text>
          </Center>
        </Center>
      </HStack>
      <PresenceTransition
        visible={showDetail}
        initial={{
          opacity: 0,
          scale: 0,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: {
            duration: 250,
          },
        }}
      >
        {golfArray}
      </PresenceTransition>
    </VStack>
  );
};

interface TransitionScoreboardProps {
  userId: string | undefined;
  room: GolfGame;
  roomName: string;
  setShowTransitionScoreboard: (bool: boolean) => void;
  course: GolfCourse;
};

const TransitionScoreboard = React.memo(({ userId, room, roomName, setShowTransitionScoreboard, course }: TransitionScoreboardProps) => {
  if (!userId || !course) return null;
  const db = getFirestore();
  const roomRef = doc(db, 'rooms', roomName);
  const holeNumber = getUserHoleNumber(room.usersStrokes[userId]);

  const handleBack = () => {
    if (holeNumber - 2 < 0 || room.gameEnded) return;
    let strokes = room.usersStrokes[userId].slice();
    // because index starts with 0
    strokes[holeNumber - 2] = null;
    updateDoc(roomRef, {
      [`usersStrokes.${userId}`]: strokes
    })
      .then(res => {
        setShowTransitionScoreboard(false);
      })
      .catch(err => {
        console.error(err);
      });
  };

  const sortedUserIds = Object.keys(room.usersStrokes).filter((val) => val != userId).sort();

  const renderItem = useCallback((uid) =>
    <BetRow
      key={uid}
      userId={userId}
      oppUid={uid}
      course={course}
      room={room}
    />
  , []);

  return (
    <VStack rounded={20} bg='white' padding={15} marginBottom={5}>
      <HStack alignItems='center'>
        {!room.gameEnded
          ? <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={30}/>
          </TouchableOpacity>
          : null}
        <Center flex={1}>
          <Text fontSize={18} fontWeight={'semibold'}>Betting Scores</Text>
        </Center>
        {!room.gameEnded
          ? (1 <= holeNumber && holeNumber <= 18)
            ? <TouchableOpacity onPress={() => setShowTransitionScoreboard(false)}>
              <Ionicons name="arrow-forward" size={30} />
            </TouchableOpacity>
            : <Box width={30}></Box>
          : null}
      </HStack>
      {sortedUserIds.map(renderItem)} 
    </VStack>
  );
});

interface GolfRoomScreenProps {
  roomName: string;
  navigation: NativeStackNavigationProp<HomeStackParamList, "Game">;
};

// may change usersStrokes to be a collection with multiple listeners to each player for scalability.
// for now its just a more quick to implement solution
const GolfRoomScreen = ({ roomName, navigation }: GolfRoomScreenProps) => {
  const db = getFirestore();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const roomRef = doc(db, 'rooms', roomName);
  const [showTransitionScoreboard, setShowTransitionScoreboard] = useState(false);
  const [room, setRoom] = useState({
    userIds: [],
    dateCreated: new Date(),
    dateEnded: null,
    gameId: "",
    gameOwnerUserId: "",
    bannedUserIds: [],
    password: "",
    gameEnded: false,

    usersStrokes: {}, // 18 holes, the render will be diff;
    usersStrokesParBirdieCount: {},
    pointsArr: {},
    prepDone: false,
  } as GolfGame);

  // need to handle connectivity issue, what happens if data received is nothing?

  const [golfCourse, setGolfCourse] = useState<GolfCourse>();
  const [loading, setLoading] = useState(true);

  const handleLeave = async () => {
    if (!userId) return null;
    const userRef = doc(db, 'users', userId);

    // only delete user from room if game hasnt ended
    if (!room.gameEnded) {
      await updateDoc(roomRef, {
        userIds: arrayRemove(userId),
        [`usersStrokes.${userId}`]: deleteField()
      });
    }

    await updateDoc(userRef, {
      [`roomNames.${'golf'}`]: deleteField()
    });
  };

  const toast = useToast();

  const save = () => {
    const handleSaveError = () => {
      toast.show({
        title: 'Room failed to save',
        status: 'error',
      });
    };

    if (!userId) return handleSaveError();

    // may change to room.gameId
    const docRef = doc(db, 'users', userId, 'golfHistory', roomName);

    // if fail to save, room name will still be there, so user when entering golf game will trigger the save function
    // getDoc(docRef)
    //   .then(res => {
    //     if (res.exists()) return; // this first get may not be necessary
    setDoc(docRef, {
      dateSaved: new Date()
    })
      .then(res => {
        console.log("Room id saved");
        toast.show({
          title: 'Game saved!',
          status: 'success',
        });
      })
      .catch(err => {
        console.error(err);
        handleSaveError();
      });
      // })
      // .catch(err => {
      //   console.error(err);
      //   handleSaveError();
      // });
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(roomRef, res => {
      const data = res.data() as GolfGame;
      console.log(data);
      setRoom(data);
      setLoading(false);

      // handle game end
      if (data.gameEnded) save();

      // get golf course
      if (data.golfCourseId && !golfCourse) {
        getDoc(doc(db, 'golfCourses', data.golfCourseId))
          .then(res => {
            setGolfCourse(res.data() as GolfCourse);
          })
          .catch(err => console.error(err));
      }
    });

    return function cleanup() {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (room.gameEnded) return; // to stop infinite loop
    const usersStrokesArr = Object.values(room.usersStrokes);
    if (usersStrokesArr.length === 0) return;
    // handle all ended
    const userHoleNumbers = usersStrokesArr.map(arr => getUserHoleNumber(arr));
    const lowestHoleNumber = Math.min(...userHoleNumbers);
    console.log("lowestholenumber", lowestHoleNumber)
    if (lowestHoleNumber === 19) {
      updateDoc(roomRef, {
        gameEnded: true,
        dateEnded: new Date(),
        password: deleteField()
      })
        .then(res => {
          console.log("Game ended");
        })
        .catch(err => console.error(err));
    }
  }, [room.usersStrokes]);

  const header = useMemo(() => {
    return (
      <HStack mb={2} alignItems="center" justifyContent="space-between" marginTop={3} height={50}>
        <BackButton onPress={() => navigation.navigate("Games")} />
        <UsersBar userIds={room.userIds} />
        <RoomDetails roomName={roomName} room={room} handleLeave={handleLeave}/>
      </HStack>
    );
  }, [room.userIds, room.gameEnded]);

  
  if (!userId) return null;
  const holeNumber = getUserHoleNumber(room.usersStrokes[userId]);

  if (holeNumber > 18 && !showTransitionScoreboard)
    setShowTransitionScoreboard(true);

  const inputBoxProps = { room, roomName, golfCourse, userId, holeNumber, setShowTransitionScoreboard };

  return (
    <Box bg="red.100" flex={1} width="100%" padding="15">
      {loading
        ? <Center flex={1}>
          <Spinner size="lg"/>
        </Center>
        : <>
          {header}
          {/* check that room has a golf course and that all handicap between pairs has been chosen */}
          {room.golfCourseId && room.prepDone
            ?
            <ScrollView>
              {showTransitionScoreboard
                ? <TransitionScoreboard
                  userId={userId}
                  room={room}
                  roomName={roomName}
                  setShowTransitionScoreboard={setShowTransitionScoreboard}
                  course={golfCourse}
                />
                : <InputBox {...inputBoxProps} />
              }
              <Box padding={5} rounded={20} bg={'white'}>
                <Text fontSize={18} fontWeight={'semibold'} marginBottom={3}>All Strokes</Text>
                <GolfArray course={golfCourse}>
                  <UsersStrokes usersStrokes={room.usersStrokes} course={golfCourse} />
                </GolfArray>
              </Box>
              {/* <AllStrokes roomName={roomName} usersStrokes={room.usersStrokes}/> */}
            </ScrollView>
            : <GolfPrepScreen
              userId={userId}
              roomName={roomName}
              room={room}
            />
          }
        </>}
    </Box>
  );
};

interface InputBoxProps {
  room: GolfGame;
  roomName: string;
  golfCourse: GolfCourse;
  userId: string;
  holeNumber: number;
  setShowTransitionScoreboard: (bool: boolean) => void;
};

const InputBox = ({ room, roomName, golfCourse, userId, holeNumber, setShowTransitionScoreboard }: InputBoxProps) => {
  const [inputVal, setInputVal] = useState(1);
  const [inputLoading, setInputLoading] = useState(false);
  const updateUserStrokes = () => {
    // there is an error here. what happens if another user updates before this updates, how to fix? 
    // this wouldnt occur since golf is played consecutively + each user only edits their own strokes, but watch out for future games
    const roomRef = doc(getFirestore(), 'rooms', roomName);
    let strokes = room.usersStrokes[userId].slice();
    // because index starts with 0
    strokes[holeNumber - 1] = inputVal;
    setInputLoading(true);
    updateDoc(roomRef, {
      [`usersStrokes.${userId}`]: strokes
    })
      .then(res => {
        setShowTransitionScoreboard(true);
      })
      .catch(err => {
        console.error(err);
      });
  };

  const increment = () => {
    if (inputVal >= 50) return;
    setInputVal(inputVal + 1);
  };

  const decrement = () => {
    if (inputVal <= 1) return;
    setInputVal(inputVal - 1);
  };

  if (!userId) return null;
  const par = golfCourse.parArr && holeNumber && holeNumber > 0 ? golfCourse.parArr[holeNumber - 1] : null;
  let strokeDescription = null;
  if (par) {
    const diff = par - inputVal;
    const diffArr = ['Par', 'Birdie', 'Eagle', 'Albatross', 'Condor'];
    strokeDescription = diffArr[diff];
    if (inputVal === 1) strokeDescription = 'Hole in One';
  }

  let bg = par ? getColor(getColorType({ num: inputVal, arrType: 'Stroke', compareNumber: par })) : 'gray.100';

  return (
    <Center bg={'white'} marginBottom={5} rounded={20} paddingY={5}>
      {inputLoading
        ? <Center marginY={5}>
          <Spinner size="lg" />
        </Center>
        : <>
          <Box>
            <Text fontSize={40}>Hole: {holeNumber}</Text>
          </Box>
          <Box>
            <Text fontSize={20}>Par: {par}</Text>
          </Box>
          <Center marginY={5}>
            <Box
              size={120}
              rounded={40}
              alignItems='center'
              justifyContent='center'
              marginBottom={5}
              borderColor={bg}
              borderWidth={5}
            >
              <Text fontSize={50}>{inputVal}</Text>
            </Box>
            <HStack space={8}>
              <TouchableOpacity onPress={decrement}>
                <Entypo name="minus" size={50} />
              </TouchableOpacity>
              <TouchableOpacity onPress={increment}>
                <Entypo name="plus" size={50} />
              </TouchableOpacity>
            </HStack>
          </Center>
          <HStack>
            {/* bg='yellow.100'  */}
            <Center flex={1}>
              <Text fontSize={18}>{strokeDescription}</Text>
            </Center>
            <Button marginRight={5} onPress={updateUserStrokes}>Done</Button>
          </HStack>
        </>}
    </Center>
  );
};

export default GolfRoomScreen;