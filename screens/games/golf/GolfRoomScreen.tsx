import _ from 'lodash';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Text, Popover, Button, Center, Box, AlertDialog, HStack, Input, ScrollView, VStack } from "native-base";
import { TouchableOpacity } from 'react-native';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { getFirestore, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, collection, deleteField, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useAppSelector } from '../../../hooks/selectorAndDispatch';
import { GolfCourse, GolfGame, GolfStrokes, HomeStackParamList } from '../../../types';
import GolfPrepScreen from './GolfPrepScreen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GolfArray, RoomDetails } from '../../../components';
import UsersBar from '../../../components/UsersBar';
import userSelector from '../../../utils/userUtils';

// leave room function

interface TransitionScoreboardProps {
  userId: string | undefined;
  room: GolfGame;
  showScores: boolean;
  setShowTransitionScoreboard: (bool: boolean) => void;
  setShowScores: (bool: boolean) => void;
};

const TransitionScoreboard = ({ userId, room, showScores, setShowTransitionScoreboard, setShowScores }: TransitionScoreboardProps) => {
  if (!userId) return null;

  const [showRowsDict, setShowRowsDict] = useState({} as { [userId: string]: boolean });

  const Content = () => {
    const scores = [];
    const sortedKeys = Object.keys(room.usersStrokes).filter((val, idx) => val != userId).sort();
    return (
      <Box>
        {sortedKeys.map(uid => {
          const finalScore = 0;
          return (
            <TouchableOpacity onPress={() => setShowRowsDict({ ...showRowsDict, [uid]: !showRowsDict[uid] })}>
              <HStack>
                <HStack>
                  <Text>{userId}</Text> {/* change to avatar + name */}
                  <Text>vs</Text>
                  <Text>{uid}</Text>
                </HStack>
                <Box>
                  <Text>{finalScore}</Text>
                </Box>
              </HStack>
            </TouchableOpacity>
          );
        })}
      </Box>
    );
  };

  return (
    <VStack>
      <Box>
        <TouchableOpacity onPress={() => {
          setShowTransitionScoreboard(false);
          setShowScores(false);
        }}>
          <Ionicons name="arrow-back" size={30}/>
        </TouchableOpacity>
      </Box>

      {!showScores
        ? <Box>
          <Text>I have a small penis.</Text>
        </Box>
        : <Content />
      }
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
    holeNumber: 1,
  } as GolfGame);

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
  };

  const save = () => {
    if (!userId) return;
    const gameHistoryRef = doc(db, 'users', userId, 'gamesHistory', room.gameId);
    updateDoc(gameHistoryRef, {
      pastRooms: arrayUnion(roomName)
    })
      .then(res => {
        console.log("Room id saved");
        setHasSaved(true);
      })
      .catch(err => {
        console.error(err);
        handleSaveFailed();
      });
  };

  // need to handle connectivity issue, what happens if data received is nothing?
  const [hasSaved, setHasSaved] = useState(false);

  const [golfCourse, setGolfCourse] = useState({} as GolfCourse);
  useEffect(() => {
    const unsubscribe = onSnapshot(roomRef, res => {
      const data = res.data() as GolfGame;
      console.log(data);
      setRoom(data);
      // handle game end
      if (data.holeNumber > 18) {
        updateDoc(roomRef, {
          gameEnded: true,
          password: deleteField()
        })
          .catch(err => console.error(err));
      }
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

  const [showScores, setShowScores] = useState(false);

  useEffect(() => {
    const usersStrokesArr = Object.values(room.usersStrokes);
    if (usersStrokesArr.length === 0) return;
    let mn = 18; // round number
    for (const arr of usersStrokesArr) {
      let i = 0;
      for (; i < arr.length; i++) {
        if (arr[i] == null) break;
      }
      mn = Math.min(mn, i);
    }
    // mn will be lowest hole number completed of all users
    if (usersStrokesArr.length != 0 && mn >= room.holeNumber) {
      // there may be multiple users making the same update call but I can't think of a way to prevent this.
      // if get room data listener + setstate is faster then no update would be called.
      updateDoc(roomRef, {
        holeNumber: room.holeNumber + 1
      }).then(res => {
        console.log("Changed to round " + mn.toString());
        setShowScores(true);
      }).catch(err => {
        console.error(err);
      });
    }
  }, [room.usersStrokes]);

  const Header = () => {
    return useMemo(() => {
      return (
        <HStack mb={2} justifyContent="space-between">
          <UsersBar userIds={room.userIds} />
          <RoomDetails roomName={roomName} room={room} handleLeave={handleLeave}/>
        </HStack>
      );
    }, [room.userIds]);
  };

  const InputBox = () => {
    const [inputVal, setInputVal] = useState(1);
    const updateUserStrokes = () => {
      // there is an error here. what happens if another user updates before this updates, how to fix? 
      // this wouldnt occur since golf is played consecutively, but watch out for future games
      if (!userId) return;
      let strokes = room.usersStrokes[userId].slice();
      // because index starts with 0
      strokes[room.holeNumber - 1] = inputVal;
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
      const par = golfCourse.parArr ? golfCourse.parArr[room.holeNumber - 1] : null;
      let strokeDescription = null;
      if (par) {
        if (inputVal < par) {
          strokeDescription = 'Birdie'
        } else if (inputVal === par) {
          strokeDescription = 'Par'
        } else {
          strokeDescription = 'Anus'
        }
      }

      let bg = 'gray.100';
      if (par) {
        if (inputVal < par) bg = 'green.100';
        else if (inputVal === par) bg = 'red.100';
      }

      return (
        <Center bg={'white'} marginBottom={5} paddingTop={5} rounded={20}>
          <Box>
            <Text fontSize={40}>Hole: {room.holeNumber}</Text>
          </Box>
          <Box>
            <Text fontSize={20}>Par: {par}</Text>
          </Box>
          <Center marginY={5}>
            <Input
              value={inputVal.toString()}
              editable={false}
              boxSize={120}
              fontSize={80}
              rounded={40}
              textAlign={'center'}
              marginBottom={5}
              borderColor={bg}
              borderWidth={5}
            />
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
    }, [inputVal, room.holeNumber, golfCourse]);
  };

  return (
    <Box bg="red.100" flex={1} width="100%" padding="15">
      <Header />
      {/* check that room has a golf course and that all handicap between pairs has been chosen */}
      {room.golfCourseId && room.prepDone
        ?
        <ScrollView >
          {showTransitionScoreboard
            ? <TransitionScoreboard
              userId={userId}
              room={room}
              showScores={showScores}
              setShowTransitionScoreboard={setShowTransitionScoreboard}
              setShowScores={setShowScores}
            />
            : <InputBox />
          }
          <GolfArray course={golfCourse} usersStrokes={room.usersStrokes}/>
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