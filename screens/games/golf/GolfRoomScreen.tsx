import _ from 'lodash';
import React, { useState, useEffect, useMemo } from 'react';
import { Text, Button, Center, Box, HStack, ScrollView, VStack, useToast, Spinner, FlatList } from "native-base";
import { TouchableOpacity } from 'react-native';
import { Entypo, Fontisto, Ionicons } from '@expo/vector-icons';
import { getFirestore, doc, updateDoc, arrayRemove, onSnapshot, deleteField, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { GolfCourse, GolfGame, HomeStackParamList } from '../../../types';
import GolfPrepScreen from './GolfPrepScreen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButton, GolfArray, RoomDetails, UsersBar, UserAvatar, Header, LoadingView, UsersRow, UserScores, Defer } from '../../../components';
import { tryAsync, formatData, getBetScores, getColor, getColorType, getUserHoleNumber, padArr } from '../../../utils';
import { useGolfCourse, useUser } from '../../../hooks/useFireGet';
import { useIsMounted, usePrevious } from '../../../hooks/common';

interface BetRowProps {
  userId: string,
  oppUid: string,
  course: GolfCourse;
  room: GolfGame;
};

const BetRow = React.memo(({ userId, oppUid, course, room }: BetRowProps) => {
  // const [showDetail, setShowDetail] = useState(false);
  const [user, userIsLoading] = useUser(userId);
  const [oppUser, oppUserIsLoading] = useUser(oppUid);
  const { finalScore, finalScores } = getBetScores({ userId, oppUid, course, room });

  return (
    <VStack width='100%' borderWidth={2} borderColor={'gray.100'} rounded={20} padding={3} marginTop={3}>
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
      <GolfArray course={course} showCourseInfo={false}>
        <UserScores userScores={finalScores} oppUid={oppUid} len={course.parArr.length} />
      </GolfArray>
    </VStack>
  );
});

interface TransitionScoreboardProps {
  userId: string;
  room: GolfGame;
  roomName: string;
  setShowTransitionScoreboard: (bool: boolean) => void;
  golfCourse: GolfCourse;
  isMounted: React.MutableRefObject<boolean>;
  holeNumber: number;
};

const TransitionScoreboard = React.memo(({ userId, room, roomName, setShowTransitionScoreboard, golfCourse, isMounted, holeNumber }: TransitionScoreboardProps) => {
  const db = getFirestore();
  const roomRef = doc(db, 'rooms', roomName);

  const handleBack = () => {
    if (room.gameEnded) return;
    let strokes = room.usersStrokes[userId].slice();
    // because index starts with 0
    strokes[holeNumber - 1] = null;
    updateDoc(roomRef, {
      [`usersStrokes.${userId}`]: strokes
    })
      .then(res => {
        if (!isMounted.current) return;
        setShowTransitionScoreboard(false);
      })
      .catch(err => {
        console.error(err);
      });
  };

  const handleForward = () => setShowTransitionScoreboard(false);

  const sortedUserIds = useMemo(() => Object.keys(room.usersStrokes).filter((val) => val != userId).sort(), [room.usersStrokes]);
  const roomHoleLimit = golfCourse.parArr.length;

  return (
    <Box paddingX={5}>
      <HStack alignItems='center'>
        {!room.gameEnded
          ? <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={30} />
          </TouchableOpacity>
          : null}

        <Center flex={1}>
          <Text fontSize={18} fontWeight={'semibold'}>Betting Scores</Text>
        </Center>

        {!room.gameEnded
          ? 1 <= holeNumber && holeNumber <= roomHoleLimit
            ? <TouchableOpacity onPress={handleForward}>
              <Ionicons name="arrow-forward" size={30} />
            </TouchableOpacity>
            : <Box width={30} />
          : null}
      </HStack>
      {sortedUserIds.map((uid) =>
        <BetRow
          key={uid}
          userId={userId}
          oppUid={uid}
          course={golfCourse}
          room={room}
        />
      )}
    </Box>
  );
});

interface InputBoxProps {
  room: GolfGame;
  roomName: string;
  golfCourse: GolfCourse;
  userId: string;
  holeNumber: number;
  setShowTransitionScoreboard: (bool: boolean) => void;
  isMounted: React.MutableRefObject<boolean>;
};

const InputBox = ({ room, roomName, golfCourse, userId, holeNumber, setShowTransitionScoreboard, isMounted }: InputBoxProps) => {
  const [inputVal, setInputVal] = useState(golfCourse?.parArr[holeNumber - 1]);
  const [inputLoading, setInputLoading] = useState(false);
  
  useEffect(() => {
    setInputVal(golfCourse.parArr[holeNumber - 1]);
  }, [holeNumber]);

  const roomRef = doc(getFirestore(), 'rooms', roomName);

  const updateUserStrokes = () => {
    // there is an error here. what happens if another user updates before this updates, how to fix? 
    // this wouldnt occur since golf is played consecutively + each user only edits their own strokes, but watch out for future games

    const strokes = padArr(room.usersStrokes[userId], golfCourse.parArr.length); // ensure strokes is padded

    // because index starts with 0
    strokes[holeNumber - 1] = inputVal;

    // console.log('edited', strokes);
    setInputLoading(true);

    updateDoc(roomRef, {
      [`usersStrokes.${userId}`]: strokes
    })
      .then(res => {
        if (!isMounted.current) return;
        setShowTransitionScoreboard(true);
      })
      .catch(err => {
        console.error(err);
      });
  };

  const increment = () => inputVal >= 50 ? null : setInputVal(inputVal + 1);
  const decrement = () => inputVal <= 1 ? null : setInputVal(inputVal - 1);

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


const HoleSelector = ({ len, holeNumber, setHoleNumber }: { len: number, holeNumber: number, setHoleNumber: (num: number) => void }) => {
  const holes = Array.from({ length: len }, (_, i) => i + 1);

  const renderItem = ({ item: num }: { item: number }) => (
    <TouchableOpacity onPress={() => setHoleNumber(num)}>
      <Center
        style={{ width: 40, height: 40 }}
        backgroundColor={holeNumber === num ? 'gray.200' : 'gray.50'}
        marginX={0.5}
        rounded={5}
        // border looks ugly
      >
        <Text fontSize={18}>{num}</Text>
      </Center>
    </TouchableOpacity>
  );

  return (
    <Box marginX={3} marginBottom={3} shadow={1}>
      <FlatList
        data={holes}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      />
    </Box>
  );
};

interface GolfRoomScreenProps {
  roomName: string;
  navigation: NativeStackNavigationProp<HomeStackParamList, "Game">;
  isSavedView?: boolean;
};

// may change usersStrokes to be a collection with multiple listeners to each player for scalability.
// for now its just a more quick to implement solution
const GolfRoomScreen = ({ roomName, navigation, isSavedView }: GolfRoomScreenProps) => {
  const db = getFirestore();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const roomRef = doc(db, 'rooms', roomName);

  const [room, setRoom] = useState<GolfGame>();
  const [showTransitionScoreboard, setShowTransitionScoreboard] = useState(false);
  // need to handle connectivity issue, what happens if data received is nothing?
  const [golfCourse, courseIsLoading] = useGolfCourse(room?.golfCourseId);
  const toast = useToast();
  const isMounted = useIsMounted();
  const [showHandicap, setShowHandicap] = useState(false);
  const [holeNumber, setHoleNumber] = useState(1);

  const numberOfCompletedStrokes = room && userId && room.usersStrokes[userId] ? room.usersStrokes[userId].filter(e => !!e).length : 0;
  useEffect(() => {
    if (!room || !userId) return;
    setHoleNumber(getUserHoleNumber(room.usersStrokes[userId]));
  }, [numberOfCompletedStrokes]); // if user has updated stroke

  // to get room
  useEffect(() => {
    const unsubscribe = onSnapshot(roomRef, res => {
      const data = {
        id: res.id,
        ...res.data()
      } as GolfGame;

      formatData(data);
      if (isMounted.current) {
        console.log('room screen', data);
        setRoom(data);
        // handle game end
        if (data.gameEnded) setShowTransitionScoreboard(true);
        if (data.gameEnded && !isSavedView) save();
      }
    });
    return () => unsubscribe();
  }, []);


  // to handle game end
  useEffect(() => {
    if (!room || room.gameEnded || !golfCourse || !isMounted.current) return; // to only end game once
    const usersStrokesArr = Object.values(room.usersStrokes);
    if (!usersStrokesArr) return;
    // handle all ended
    const userHoleNumbers = usersStrokesArr.map(arr => getUserHoleNumber(arr));
    const lowestHoleNumber = Math.min(...userHoleNumbers);
    console.log("lowestholenumber", lowestHoleNumber);
    if (lowestHoleNumber === golfCourse.parArr.length + 1) {
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

  const handleLeave = async () => {
    if (!userId || !isMounted.current) return;
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

  const changeHandicap = () => isMounted.current ? setShowHandicap(!showHandicap) : null;
  const goBack = () => isMounted.current ? navigation.navigate("Games") : null;

  const roomHeader = useMemo(() => {
    if (!room) return null;
    if (isSavedView) {
      return (
        <HStack alignItems="center" justifyContent="space-between" shadow={1} marginX={3} marginY={2} space={2}>
          <UsersBar userIds={room.userIds} />
          <TouchableOpacity onPress={changeHandicap}>
            <Fontisto name='spinner-rotate-forward' size={25}/>
          </TouchableOpacity>
        </HStack>
      );
    }
    return (
      <Header>
        <HStack alignItems="center" justifyContent="space-between">
          <BackButton onPress={goBack} />
          <UsersBar userIds={room.userIds} />
          <RoomDetails roomName={roomName} room={room} handleLeave={handleLeave} />
        </HStack>
      </Header>
    );
  }, [room?.userIds, isSavedView, handleLeave]);

  const handleSaveError = () => {
    if (!isMounted.current) return;
    toast.show({
      title: 'Room failed to save',
      status: 'error',
    });
  };

  const save = () => {
    if (!userId) return handleSaveError();
    // may change to room.gameId
    const docRef = doc(db, 'users', userId, 'golfHistory', roomName);
    // if fail to save, room name will still be there, so user when entering golf game will trigger the save function
    setDoc(docRef, {
      dateSaved: new Date().toJSON()
    })
      .then(res => {
        console.log("Room id saved");
        if (!isMounted.current) return;
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

  if (!userId || !room) {
    return (
      <Center flex={1}>
        <Spinner size="lg" />
      </Center>
    );
  };

  const childProps = { room, roomName, golfCourse: golfCourse as GolfCourse, userId, holeNumber, setShowTransitionScoreboard, isMounted };

  return (
    <>
      {roomHeader}
      <Box flex={1} width="100%" paddingX={15}>
        {/* check that room has a golf course and that all handicap between pairs has been chosen */}
        {room.golfCourseId && room.prepDone && !showHandicap
          ?
          <ScrollView flex={1} keyboardShouldPersistTaps={'always'}>
            <Box bg={'white'} marginY={5} rounded={20} paddingY={3}>
              <LoadingView isLoading={courseIsLoading}>
                {golfCourse &&
                  (showTransitionScoreboard // golfcourse alr exists here
                    ? <TransitionScoreboard {...childProps} />
                    : <>
                      <HoleSelector len={golfCourse.parArr.length} holeNumber={holeNumber} setHoleNumber={setHoleNumber} />
                      <InputBox {...childProps} />
                    </>)}
              </LoadingView>
            </Box>
            <Center padding={5} rounded={20} bg={'white'} marginBottom={5}>
              <Text fontSize={18} fontWeight={'semibold'} marginBottom={3}>All Strokes</Text>
              <LoadingView isLoading={courseIsLoading}>
                <GolfArray course={golfCourse}>
                  <UsersRow usersStrokes={room?.usersStrokes ? room.usersStrokes : {}} course={golfCourse} />
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
export default GolfRoomScreen;