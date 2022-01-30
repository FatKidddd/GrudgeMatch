import _ from 'lodash';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Text, Popover, Button, Center, Box, HStack, ScrollView, VStack, PresenceTransition, useToast, Spinner, StatusBar, IconButton, Icon } from "native-base";
import { TouchableOpacity } from 'react-native';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getFirestore, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, collection, deleteField, getDoc, addDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { GolfCourse, GolfGame, HomeStackParamList } from '../../../types';
import GolfPrepScreen from './GolfPrepScreen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButton, GolfArray, RoomDetails, UsersBar, UserAvatar, UserScores, UsersStrokes, Header, LoadingView } from '../../../components';
import { getBetScores, getColor, getColorType, getUserHoleNumber } from '../../../utils/golfUtils';
import { tryAsync } from '../../../utils/asyncUtils';
import { useGolfCourse, useUser } from '../../../hooks/useFireGet';
import { formatData } from '../../../utils/dateUtils';
import { useIsMounted } from '../../../hooks/common';

interface BetRowProps {
  userId: string,
  oppUid: string,
  course: GolfCourse;
  room: GolfGame;
};

const BetRow = ({ userId, oppUid, course, room }: BetRowProps) => {
  const [showDetail, setShowDetail] = useState(false);
  const [user, userIsLoading] = useUser(userId);
  const [oppUser, oppUserIsLoading] = useUser(oppUid);

  const { finalScore, finalScores } = getBetScores({ userId, oppUid, course, room });

  return (
    <VStack width='100%' borderWidth={2} borderColor={'gray.100'} rounded={20} padding={3} marginTop={3}>
      {/* <Center width='100%' alignItems='flex-end'>
        <TouchableOpacity onPress={() => setShowDetail(!showDetail)}>
          <MaterialIcons name={`expand-${!showDetail ? 'more' : 'less'}`} size={30} />
        </TouchableOpacity>
      </Center> */}
      <HStack marginBottom={5} justifyContent={'space-evenly'}>
        <HStack alignItems={'center'}>
          <Center width={70}>
            <Text numberOfLines={1} marginBottom={3}>{user?.name}</Text>
            <UserAvatar userId={userId} />
          </Center>
          <Text marginTop={8}>vs</Text>
          <Center width={70}>
            <Text numberOfLines={1} marginBottom={3}>{oppUser?.name}</Text>
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
      {/* <PresenceTransition
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
      > */}
      <GolfArray course={course}>
        <UserScores userScores={finalScores} uid={userId} oppUid={oppUid} />
      </GolfArray>
      {/* </PresenceTransition> */}
    </VStack>
  );
};

interface TransitionScoreboardProps {
  userId: string | undefined;
  room: GolfGame;
  roomName: string;
  setShowTransitionScoreboard: (bool: boolean) => void;
  golfCourse: GolfCourse | undefined;
};

const TransitionScoreboard = React.memo(({ userId, room, roomName, setShowTransitionScoreboard, golfCourse }: TransitionScoreboardProps) => {
  if (!userId || !golfCourse) return null;

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
  const roomHoleLimit = golfCourse.parArr.length;

  return (
    <Box paddingX={5}>
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
          ? (1 <= holeNumber && holeNumber <= roomHoleLimit)
            ? <TouchableOpacity onPress={() => setShowTransitionScoreboard(false)}>
              <Ionicons name="arrow-forward" size={30} />
            </TouchableOpacity>
            : <Box width={30}></Box>
          : null}
      </HStack>
      {sortedUserIds.map((uid) =>
        <BetRow
          key={uid}
          userId={userId}
          oppUid={uid}
          course={golfCourse}
          room={room}
        />)}
    </Box>
  );
});

interface GolfRoomScreenProps {
  roomName: string;
  navigation: NativeStackNavigationProp<HomeStackParamList, "Game">;
  isSavedView?: boolean;
};

// may change usersStrokes to be a collection with multiple listeners to each player for scalability.
// for now its just a more quick to implement solution
const GolfRoomScreen = ({ roomName, navigation, isSavedView }: GolfRoomScreenProps) => {
  const [showTransitionScoreboard, setShowTransitionScoreboard] = useState(false);
  const [room, setRoom] = useState<GolfGame>();
  // need to handle connectivity issue, what happens if data received is nothing?
  const [loading, setLoading] = useState(true);
  const [golfCourse, courseIsLoading] = useGolfCourse(room?.golfCourseId);
  const toast = useToast();
  const isMounted = useIsMounted();

  // to get room
  useEffect(() => {
    const unsubscribe = onSnapshot(roomRef, res => {
      const data = {
        id: res.id,
        ...res.data()
      } as GolfGame;

      if (isMounted.current) {
        formatData(data);
        console.log('room screen', data);
        setRoom(data);
        setLoading(false);
        // handle game end
        if (data.gameEnded && !isSavedView) save();
      }
    });
    return () => unsubscribe();
  }, []);

  // to handle game end
  useEffect(() => {
    if (!room || room.gameEnded) return; // to only end game once
    const usersStrokesArr = Object.values(room.usersStrokes);
    if (!usersStrokesArr) return;
    // handle all ended
    const userHoleNumbers = usersStrokesArr.map(arr => getUserHoleNumber(arr));
    const lowestHoleNumber = Math.min(...userHoleNumbers);
    console.log("lowestholenumber", lowestHoleNumber);
    if (lowestHoleNumber === usersStrokesArr[0].length + 1) {
      (async () => {
        const [res, err] = await tryAsync(updateDoc(roomRef, {
          gameEnded: true,
          dateEnded: new Date().toJSON(),
          password: deleteField()
        }));
        if (res) console.log("Game ended");
      })();
    }
  }, [room?.usersStrokes]);

  const db = getFirestore();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const roomRef = doc(db, 'rooms', roomName);

  const handleLeave = async () => {
    if (!userId) return;
    const userRef = doc(db, 'users', userId);

    // only delete user from room if game hasnt ended
    if (!room?.gameEnded) {
      await updateDoc(roomRef, {
        userIds: arrayRemove(userId),
        [`usersStrokes.${userId}`]: deleteField()
      });
    }

    await updateDoc(userRef, {
      [`roomNames.${'golf'}`]: deleteField()
    });
  };

  const roomHeader = useMemo(() => {
    if (!room) return null;
    if (isSavedView) {
      return (
        <HStack alignItems="center" justifyContent="space-between" shadow={1} marginX={3} marginY={2}>
          <UsersBar userIds={room.userIds} />
        </HStack>
      );
    }
    return (
      <Header>
        <HStack alignItems="center" justifyContent="space-between">
          <BackButton onPress={() => navigation.navigate("Games")} />
          <UsersBar userIds={room.userIds} />
          <RoomDetails roomName={roomName} room={room} handleLeave={handleLeave} />
        </HStack>
      </Header>
    );
  }, [room?.userIds, isSavedView, handleLeave]);

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
    setDoc(docRef, {
      dateSaved: new Date().toJSON()
    })
      .then(res => {
        console.log("Room id saved");
        toast.show({
          title: 'Game saved!',
          status: 'success',
          description: 'You can now leave the room'
        });
      })
      .catch(err => {
        console.error(err);
        handleSaveError();
      });
  };

  if (!userId || !room || loading) {
    return (
      <Center flex={1}>
        <Spinner size="lg" />
      </Center>
    );
  };

  const holeNumber = getUserHoleNumber(room.usersStrokes[userId]);

  const childProps = { room, roomName, golfCourse, userId, holeNumber, setShowTransitionScoreboard };

  return (
    <>
      {roomHeader}
      <Box flex={1} width="100%" paddingX={15}>
        {/* check that room has a golf course and that all handicap between pairs has been chosen */}
        {room.golfCourseId && room.prepDone
          ?
          <ScrollView flex={1}>
            <Box bg={'white'} marginY={5} rounded={20} paddingY={5}>
              <LoadingView isLoading={courseIsLoading}>
                {showTransitionScoreboard
                  ? <TransitionScoreboard {...childProps} />
                  : <InputBox {...childProps} />}
              </LoadingView>
            </Box>
            <Center padding={5} rounded={20} bg={'white'} marginBottom={5}>
              <Text fontSize={18} fontWeight={'semibold'} marginBottom={3}>All Strokes</Text>
              <LoadingView isLoading={courseIsLoading}>
                <GolfArray course={golfCourse}>
                  <UsersStrokes usersStrokes={room.usersStrokes} course={golfCourse} />
                </GolfArray>
              </LoadingView>
            </Center>
          </ScrollView>
          : <GolfPrepScreen
            userId={userId}
            roomName={roomName}
            room={room}
          />
        }
      </Box>
    </>
  );
};

interface InputBoxProps {
  room: GolfGame;
  roomName: string;
  golfCourse: GolfCourse | undefined;
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

  const increment = () => inputVal >= 50 ? null : setInputVal(inputVal + 1);
  const decrement = () => inputVal <= 1 ? null : setInputVal(inputVal - 1);

  if (!userId || !golfCourse) return null;

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
    <LoadingView isLoading={inputLoading}>
      <Center>
        <Text fontSize={40}>Hole: {holeNumber}</Text>
        <Text fontSize={20}>Par: {par}</Text>
        <Box marginY={5}>
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
          <HStack space={5}>
            <TouchableOpacity onPress={decrement}>
              <Entypo name="minus" size={50} />
            </TouchableOpacity>
            <TouchableOpacity onPress={increment}>
              <Entypo name="plus" size={50} />
            </TouchableOpacity>
          </HStack>
        </Box>
        <HStack>
          <Center flex={1}>
            <Text fontSize={18}>{strokeDescription}</Text>
          </Center>
          <Button marginRight={5} onPress={updateUserStrokes}>Done</Button>
        </HStack>
      </Center>
    </LoadingView>
  );
};

export default GolfRoomScreen;