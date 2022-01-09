import _ from 'lodash';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Text, Popover, Button, Center, Box, AlertDialog, HStack, Input, ScrollView, VStack, Pressable, PresenceTransition, FlatList, useToast } from "native-base";
import { TouchableOpacity } from 'react-native';
import { Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getFirestore, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, collection, deleteField, getDoc, addDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useAppSelector } from '../../../hooks/selectorAndDispatch';
import { GolfCourse, GolfGame, GolfStrokes, HomeStackParamList, Stroke } from '../../../types';
import GolfPrepScreen from './GolfPrepScreen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButton, GolfArray, RoomDetails, UsersBar, UserAvatar, UserScores, UsersStrokes, getColor, getColorType } from '../../../components';
import { useUser } from '../../../utils/userUtils';

// leave room function

const getUserHoleNumber = (arr: GolfStrokes) => {
  let i = 0;
  for (; i < arr.length; i++) {
    if (arr[i] == null) break;
  }
  return i + 1;
};

interface TransitionScoreboardProps {
  userId: string | undefined;
  room: GolfGame;
  roomName: string;
  setShowTransitionScoreboard: (bool: boolean) => void;
  course: GolfCourse;
};

const TransitionScoreboard = ({ userId, room, roomName, setShowTransitionScoreboard, course }: TransitionScoreboardProps) => {
  if (!userId) return null;

  const db = getFirestore();
  const roomRef = doc(db, 'rooms', roomName);
  const holeNumber = getUserHoleNumber(room.usersStrokes[userId]);

  const handleBack = () => {
    if (holeNumber - 2 < 0) return;
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

  interface BetRowProps {
    uid: string,
    oppScores: GolfStrokes;
    userScores: GolfStrokes;
  };

  const BetRow = ({ uid, oppScores, userScores }: BetRowProps) => {
    const ids = [uid, userId].sort();
    const handicapInfo = room.pointsArr[ids[0] + '+' + ids[1]];
    const handicapIndexArr = course.handicapIndexArr;

    const trueGive = Number(ids[0] === uid) ^ Number(handicapInfo.give); // userId gives or takes, give == 1, take == 0

    const frontHoles = handicapIndexArr.slice(0, handicapIndexArr.length / 2);
    const backHoles = handicapIndexArr.slice(handicapIndexArr.length / 2);

    const compareFn = (a: number, b: number) => a > b ? -1 : a < b ? 1 : 0;
    const neededFrontHoles = frontHoles.sort(compareFn).slice(handicapInfo.frontCount);
    const neededBackHoles = backHoles.sort(compareFn).slice(handicapInfo.backCount);
    
    const set = new Set();
    for (const val of neededFrontHoles) set.add(val);
    for (const val of neededBackHoles) set.add(val);

    const pairScores = [userScores.slice(), oppScores.slice()];
    for (let i = 0; i < pairScores[trueGive].length; i++) {
      const val = pairScores[trueGive][i];
      if (val != null && set.has(handicapIndexArr[i]))
        pairScores[trueGive][i] = val - 1;
    }

    const finalScores = _.zip(...pairScores).map(pair => {
      if (pair[0] == undefined || pair[1] == undefined) return null;
      return pair[0] < pair[1] ? 1 : pair[0] > pair[1] ? -1 : 0
    });

    const sum = (arr: number[] | Stroke[]) => arr.map(e => Number(e)).reduce((prevVal, curVal) => prevVal + curVal);
    const finalScore = sum(finalScores);

    const [showDetail, setShowDetail] = useState(false);

    const golfArray = useMemo(() =>
      <GolfArray course={course}>
        <UserScores userScores={finalScores} uid={userId} oppUid={uid} />
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
              <Text numberOfLines={1} marginBottom={3}>{useUser(uid).name}</Text>
              <UserAvatar userId={uid} />
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

  const sortedUserIds = Object.keys(room.usersStrokes).filter((val, idx) => val != userId).sort();
  const scores = sortedUserIds.map(uid => room.usersStrokes[uid]);

  const renderItem = useCallback((uid, i) =>
    <BetRow
      key={uid}
      uid={uid}
      oppScores={scores[i]}
      userScores={room.usersStrokes[userId]}
    />
  , []);

  return (
    <VStack rounded={20} bg='white' padding={15} marginBottom={5}>
      <HStack alignItems='center'>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={30}/>
        </TouchableOpacity>
        <Center flex={1}>
          <Text fontSize={18} fontWeight={'semibold'}>Betting Scores</Text>
        </Center>
        {(1 <= holeNumber && holeNumber < 18)
          ? <TouchableOpacity onPress={() => setShowTransitionScoreboard(false)}>
            <Ionicons name="arrow-forward" size={30} />
          </TouchableOpacity>
          : <Box width={30}></Box>}
      </HStack>
      {sortedUserIds.map(renderItem)} 
      {/* (uid, i) =>
        <BetRow
          key={uid}
          uid={uid}
          oppScores={scores[i]}
          userScores={room.usersStrokes[userId]}
        />
      )} */}
      {/* <FlatList
        scrollEnabled={false}
        data={sortedUserIds}
        keyExtractor={(item) => item}
        renderItem={renderItem}
      /> */}
    </VStack>
  );
};

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
  const [hasSaved, setHasSaved] = useState(false);

  const [golfCourse, setGolfCourse] = useState({} as GolfCourse);

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
      roomName: ""
    });
  };


  const handleSaveFailed = () => {
    // to do
    // i think don't need for now because if fail to save, room name will still be there, so user when joining golf room will trigger the save function
  };

  const toast = useToast();

  const save = () => {
    if (!userId) return;
    // may change to room.gameId
    setDoc(doc(db, 'users', userId, 'golfHistory', roomName), {
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
        toast.show({
          title: 'Room failed to save',
          status: 'error',
        });
        // handleSaveFailed();
      });
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(roomRef, res => {
      const data = res.data() as GolfGame;
      console.log(data);
      setRoom(data);

      // handle game end
      if (data.gameEnded && !hasSaved) save();

      // get golf course
      if (data.golfCourseId && _.isEmpty(golfCourse)) {
        getDoc(doc(db, 'golfCourses', data.golfCourseId))
          .then(res => {
            const _golfCourse = res.data() as GolfCourse;
            console.log(_golfCourse);
            setGolfCourse(_golfCourse);
          })
          .catch(err => console.error(err));
      }
    });

    return function cleanup() {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const usersStrokesArr = Object.values(room.usersStrokes);
    if (usersStrokesArr.length === 0) return;
    // handle all ended
    const userHoleNumbers = usersStrokesArr.map(arr => getUserHoleNumber(arr));
    const lowestHoleNumber = Math.min(...userHoleNumbers);
    console.log("lowestholenumber", lowestHoleNumber)
    if (lowestHoleNumber === 18) {
      updateDoc(roomRef, {
        gameEnded: true,
        password: deleteField()
      })
        .then(res => {
        })
        .catch(err => console.error(err));
    }
  }, [room.usersStrokes]);

  const header = useMemo(() => {
    return (
      <HStack mb={2} alignItems="center" justifyContent="space-between" marginTop={3} height={50}>
        <BackButton onPress={() => navigation.navigate("Games")} />
        <UsersBar userIds={room.userIds} />
        <RoomDetails roomName={roomName} room={room} handleLeave={room.gameEnded ? undefined : handleLeave}/>
      </HStack>
    );
  }, [room.userIds, room.gameEnded]);


  if (!userId) return null;
  const holeNumber = getUserHoleNumber(room.usersStrokes[userId]);

  if (!(1 <= holeNumber && holeNumber <= 18) && !showTransitionScoreboard)
    setShowTransitionScoreboard(true);

  const InputBox = () => {
    const [inputVal, setInputVal] = useState(1);

    const updateUserStrokes = () => {
      // there is an error here. what happens if another user updates before this updates, how to fix? 
      // this wouldnt occur since golf is played consecutively + each user only edits their own strokes, but watch out for future games
      let strokes = room.usersStrokes[userId].slice();
      // because index starts with 0
      strokes[holeNumber - 1] = inputVal;
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


    return useMemo(() => {
      if (!userId) return null;
      const par = golfCourse.parArr && holeNumber && holeNumber > 0 ? golfCourse.parArr[holeNumber - 1] : null;
      let strokeDescription = null;
      if (par) {
        const diff = par - inputVal;
        switch (diff) {
          case 4:
            strokeDescription = 'Condor';
            break;
          case 3:
            strokeDescription = 'Albatross';
            break;
          case 2:
            strokeDescription = 'Eagle';
            break;
          case 1:
            strokeDescription = 'Birdie';
            break;
          case 0:
            strokeDescription = 'Par';
            break;
          // case -1:
          //   strokeDescription = 'Bogey';
          //   break;
          // case -2:
          //   strokeDescription = 'Double Bogey';
          //   break;
          default:
            break;
        }
        if (inputVal === 1) strokeDescription = 'Hole in One';
      }

      let bg = 'gray.100';
      if (par) {
        if (inputVal === par) bg = 'green.100';
        else if (inputVal < par) bg = 'red.100';
      }

      return (
        <Center bg={'white'} marginBottom={5} paddingTop={5} rounded={20}>
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
          <HStack marginBottom={5}>
            {/* bg='yellow.100'  */}
            <Center flex={1}>
              <Text fontSize={18}>{strokeDescription}</Text>
            </Center>
            <Button marginRight={5} onPress={updateUserStrokes}>Done</Button>
          </HStack>
        </Center>
      );
    }, [inputVal, golfCourse]);
  };

  return (
    <Box bg="red.100" flex={1} width="100%" padding="15">
      {header}
      {/* check that room has a golf course and that all handicap between pairs has been chosen */}
      {room.golfCourseId && room.prepDone
        ?
        <ScrollView >
          {showTransitionScoreboard
            ? <TransitionScoreboard
              userId={userId}
              room={room}
              roomName={roomName}
              setShowTransitionScoreboard={setShowTransitionScoreboard}
              course={golfCourse}
            />
            : <InputBox />
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
    </Box>
  );
};

export default GolfRoomScreen;