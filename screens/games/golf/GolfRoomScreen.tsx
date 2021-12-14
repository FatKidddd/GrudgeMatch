import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Text, Popover, Button, Center, Box, AlertDialog, HStack, Input, ScrollView, VStack } from "native-base";
import { TouchableOpacity } from 'react-native';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { getFirestore, doc, updateDoc, arrayRemove, onSnapshot, collection, deleteField, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useAppSelector } from '../../../hooks/selectorAndDispatch';
import { GolfGame, GolfStrokes } from '../../../types';
import GolfPrepScreen from './GolfPrepScreen';

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
          <Ionicons name="arrow-forward" size={30}/>
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
};

// may change usersStrokes to be a collection with multiple listeners to each player for scalability.
// for now its just a more quick to implement solution
const GolfRoomScreen = ({ roomName }: GolfRoomScreenProps) => {
  const db = getFirestore();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const roomRef = doc(db, 'rooms', roomName);

  const handleLeave = async () => {
    if (!userId) return null;
    const userRef = doc(db, 'users', userId);
    await updateDoc(roomRef, {
      userIds: arrayRemove(userId),
      [`usersStrokes.${userId}`]: deleteField()
    });
    await updateDoc(userRef, {
      roomName: ""
    });
  };

  const [room, setRoom] = useState({
    userIds: [],
    dateCreated: new Date(),
    gameId: "",
    gameOwnerUserId: "",
    bannedUserIds: [],
    password: "",

    usersStrokes: {}, // 18 holes, the render will be diff;
    usersStrokesParBirdieCount: {},
    pointsArr: {},
    prepDone: false,
    holeNumber: 1,
  } as GolfGame);

  const [showTransitionScoreboard, setShowTransitionScoreboard] = useState(false);

  // need to handle connectivity issue, what happens if data received is nothing?
  useEffect(() => {
    const unsubscribe = onSnapshot(roomRef, res => {
      const data = res.data();
      if (data) {
        console.log(data);
        setRoom(data as GolfGame);
      }
    });

    return function cleanup() {
      unsubscribe();
    };
  }, []);

  const [leaveRoomIsOpen, setLeaveRoomIsOpen] = useState(false);
  const onClose = () => setLeaveRoomIsOpen(false);
  const cancelRef = useRef(null);

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
        <HStack>
          <TouchableOpacity onPress={() => setLeaveRoomIsOpen(true)}>
            <Ionicons name="arrow-back" size={30} />
          </TouchableOpacity>
          <Text>{roomName}</Text>
          <RoomDetails roomName={roomName} room={room} />
          <UsersBar userIds={room.userIds} />
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
      return (
        <Center>
          <VStack>
            <Box>
              <Text>Hole: {room.holeNumber}</Text>
            </Box>
            <Box>
              <Text>{inputVal}</Text>
            </Box>
            <HStack>
              <TouchableOpacity onPress={decrement}>
                <Entypo name="minus" size={30} />
              </TouchableOpacity>
              <TouchableOpacity onPress={increment}>
                <Entypo name="plus" size={30} />
              </TouchableOpacity>
            </HStack>
            <Button onPress={updateUserStrokes}>Done</Button>
          </VStack>
        </Center>
      );
    }, [inputVal, room.holeNumber]);
  };

  return (
    <>
        <Header />
        {/* check that room has a golf course and that all handicap between pairs has been chosen */}
        {room.golfCourseId && room.prepDone
          ?
          <ScrollView>
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
            <AllStrokes roomName={roomName} usersStrokes={room.usersStrokes}/>
          </ScrollView>
          : <GolfPrepScreen
            userId={userId}
            roomName={roomName}
            room={room}
          />
        }

      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={leaveRoomIsOpen}
        onClose={onClose}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Leave room permanently?</AlertDialog.Header>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={() => {
                  handleLeave();
                  onClose();
                }}
                ref={cancelRef}
              >
                Leave room
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </>
  );
};

const RoomDetails = ({ roomName, room }: { roomName: string, room: GolfGame }) => {
  return (
    <Box alignItems="center">
      <Popover
        trigger={(triggerProps) => {
          return (
            <Button {...triggerProps}>Room info</Button>
          )
        }}
      >
        <Popover.Content accessibilityLabel="Room Info" w="56">
          <Popover.Arrow />
          <Popover.CloseButton />
          <Popover.Body>Room Name: {roomName}</Popover.Body>
          <Popover.Body>Password: {room.password}</Popover.Body>
        </Popover.Content>
      </Popover>
    </Box>
  );
};

const UsersBar = ({ userIds }: { userIds: Array<String> }) => {
  return (
    <>
      {userIds.forEach(userId => {
        return (
          <Box>
            <Text>{userId}</Text>
          </Box>
        )
      })}
    </>
  );
};

const AllStrokes = ({ roomName, usersStrokes }: { roomName: string, usersStrokes: { [uid: string]: GolfStrokes } }) => {
  interface UserStrokesProps {
    userId: string;
    userStrokes: GolfStrokes;
    roomName: string;
  };

  const UserStrokes = ({ userId, userStrokes, roomName }: UserStrokesProps) => {
    const db = getFirestore();

    const [name, setName] = useState(userId);

    useEffect(() => {
      getDoc(doc(db, 'users', userId))
        .then(res => {
          const data = res.data();
          setName(data?.name ? data.name : userId);
        })
        .catch(err => {
          console.error(err);
        });
    }, []);

    const [strokes, setStrokes] = useState(userStrokes);

    useEffect(() => {
      setStrokes(userStrokes);
    }, [userStrokes]);


    return (
      <HStack>
        <Box >
          <Text>{name}</Text>
        </Box>
        <HStack>
          {/* {strokes.map((v, i) => {
            return (
              <Box>
              </Box>
            );
          })} */}
        </HStack>
      </HStack>
    );
  };

  return useMemo(() => {
    const sorted = Object.entries(usersStrokes).sort();
    return (
      <Box>
        {sorted.map(([uid, userStrokes], i) => <UserStrokes userId={uid} roomName={roomName} userStrokes={userStrokes} key={uid} />)}
      </Box>
    );
  }, [usersStrokes]);
};

// const UserStrokes = ({ userId, userStrokes, roomName }: UserStrokesProps) => {
//   const db = getFirestore();
//   const roomRef = doc(db, 'rooms', roomName);

//   const updateUserStrokes = async ({ id, strokes }: { id: string, strokes: GolfStrokes }) => {
//     await updateDoc(roomRef, {
//       [`usersStrokes.${id}`]: strokes
//     });
//   };

//   const [name, setName] = useState(userId);

//   useEffect(() => {
//     getDoc(doc(db, 'users', userId))
//       .then(res => {
//         const data = res.data();
//         setName(data?.name ? data?.name : userId);
//       })
//       .catch(err => {
//         console.error(err);
//       });
//   }, []);

//   const [strokes, setStrokes] = useState(userStrokes);

//   useEffect(() => {
//     setStrokes(userStrokes);
//   }, [userStrokes]);


//   const handleChangeNumber = (text: string, idx: number) => {
//     const num = Number(text); // wow Number("") == 0
//     setStrokes(strokes.map((v, i) => i == idx ? num : v) as GolfStrokes);
//   };

//   return (
//     <HStack>
//       <Box width={30} overflow="hidden">
//         <Text>{name}</Text>
//       </Box>
//       <HStack>
//         {/* {strokes.map((v, i) => {
//           return (
//             <Box>
//               <Input 
//                 keyboardType="numeric"
//                 value={v ? v.toString() : undefined}
//                 onEndEditing={() => updateUserStrokes({ id: userId, strokes })}
//                 onChangeText={text => handleChangeNumber(text, i)} key={i}
//               />
//             </Box>
//           );
//         })} */}
//       </HStack>
//     </HStack>
//   );
// };

export default GolfRoomScreen;
/* <Picker
  selectedValue={selectedLanguage}
  onValueChange={(itemValue, itemIndex) =>
    setSelectedLanguage(itemValue)
  }>
  <Picker.Item label="Java" value="java" />
  <Picker.Item label="JavaScript" value="js" />
</Picker> */