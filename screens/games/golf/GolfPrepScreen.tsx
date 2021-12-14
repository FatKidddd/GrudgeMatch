import React, { useCallback, useEffect, useState } from 'react';
import { getDoc, updateDoc, getDocs, getFirestore, collection, doc, addDoc } from 'firebase/firestore';
import { User, GolfCourse, GolfGame, HandicapInfo } from '../../../types';
import { Box, FlatList, Heading, Avatar, HStack, VStack, Text, Spacer, Center, Button, Input, Pressable } from "native-base";
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../hooks/selectorAndDispatch';
import { setUser } from '../../../redux/actions';

interface GolfPrepScreenProps {
  userId: string | undefined;
  roomName: string;
  room: GolfGame;
};

const GolfCourseScreen = ({ userId, roomName, room }: GolfPrepScreenProps)  => {
  const db = getFirestore();

  const [courses, setCourses] = useState([] as Array<GolfCourse>);

  // const addCourse = () => {
  //   const colRef = collection(db, 'golfCourses');
  //   addDoc(colRef, {
  //     name: "ass",
  //     location: "penis",
  //     parArr: [4, 4, 5, 3, 4, 4, 3, 4, 5, 4, 3, 4, 5, 5, 4, 4, 3, 4],
  //     handicapIndexArr: [12, 4, 2, 16, 8, 10, 18, 14, 6, 5, 15, 1, 11, 7, 17, 9, 13, 3],
  //   });
  // };

  // useEffect(() => {
  //   addCourse();
  // }, []);

  useEffect(() => {
    if (userId != room.gameOwnerUserId) return;
    const coursesRef = collection(db, 'golfCourses'); // may need to fix in the future when i properly organise this
    getDocs(coursesRef)
      .then(docs => {
        docs.forEach(doc => {
          const data = {
            ...doc.data(),
            id: doc.id,
          };
          setCourses([...courses, data] as Array<GolfCourse>);
        });
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  const handleSubmit = () => {
    if (selectedCourseId.length === 0) return;
    updateDoc(doc(db, 'rooms', roomName), {
      golfCourseId: selectedCourseId
    })
      .then(res => {
        console.log("Course selected");
      })
      .catch(err => {
        console.error(err);
      });
  };

  const [selectedCourseId, setSelectedCourseId] = useState("");
  
  const renderItem = useCallback(({ item }: { item: GolfCourse }) => (
    <TouchableOpacity onPress={() => setSelectedCourseId(item.id)}>
      <Box padding={30} bgColor={selectedCourseId === item.id ? "amber.100" : "white"}>
        <Text>{item.name}</Text>
      </Box>
    </TouchableOpacity>
  ), []);

  return (
    <>
      {userId === room.gameOwnerUserId
        ? <SafeAreaView>
          <Text>Select course</Text>
          <FlatList
            data={courses}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
          <Box>
            <Button onPress={handleSubmit}>Submit</Button>
          </Box>
        </SafeAreaView>
        : <Box>
          <Text>Wait for room owner to select course</Text>
        </Box>
      }
    </>
  );
};

interface HandicapRowProps {
  user: User;
  otherUser: User;
  flipped: boolean;
  pairId: string;
  handicapInfo: HandicapInfo;
  roomName: string;
};

const HandicapRow = React.memo(({ user, otherUser, flipped, pairId, handicapInfo, roomName }: HandicapRowProps) => {
  const giveOrTake = (Number(handicapInfo.give) ^ Number(flipped)) ? 'Give' : 'Take';

  const [frontVal, setFrontVal] = useState(handicapInfo.frontCount);
  const [backVal, setBackVal] = useState(handicapInfo.backCount);

  const db = getFirestore();
  const roomRef = doc(db, 'rooms', roomName);

  const handleInputChange = (frontOrBackCount: "frontCount" | "backCount", val: string) => {
    const num = Number(val);
    if (isNaN(num)) return;
    if (frontOrBackCount === "frontCount") setFrontVal(num);
    else setBackVal(num);
  };

  const handleInputSubmit = async (frontOrBackCount: "frontCount" | "backCount") => {
    await updateDoc(roomRef, {
      [`pointsArr.${pairId}.${frontOrBackCount}`]: frontVal
    });
  };

  const handleGiveOrTake = async () => {
    await updateDoc(roomRef, {
      [`pointsArr.${pairId}.give`]: handicapInfo.give ? false : true
    });
  };

  const handleLock = async () => {
    await updateDoc(roomRef, {
      [`pointsArr.${pairId}.locked`]: !handicapInfo.locked
    });
  };

  return (
    <VStack>
      <HStack>
        <Box>
          <Text>{flipped ? otherUser.name : user.name}</Text>
          {/* add image */}
        </Box>
        <Text marginX={4}>vs</Text>
        <Box>
          <Text>{!flipped ? otherUser.name : user.name}</Text>
        </Box>
      </HStack>
      <HStack>
        <TouchableOpacity onPress={handleGiveOrTake} disabled={handicapInfo.locked}>
          <Box>
            <Text>{giveOrTake}</Text>
          </Box>
        </TouchableOpacity>
        <Box>
          <Input
            value={frontVal ? frontVal.toString() : undefined}
            onChangeText={text => handleInputChange("frontCount", text)}
            onEndEditing={() => handleInputSubmit("frontCount")}
            editable={!handicapInfo.locked}
          />
        </Box>
        <Box>
          <Input
            value={backVal ? backVal.toString() : undefined}
            onChangeText={text => handleInputChange("backCount", text)}
            onEndEditing={() => handleInputSubmit("backCount")}
            editable={!handicapInfo.locked}
          />
        </Box>
        <TouchableOpacity onPress={handleLock}>
          <Ionicons name={handicapInfo.locked ? "md-lock-closed-outline" : "md-lock-open-outline"} size={30} />
        </TouchableOpacity>
      </HStack>
    </VStack>
  );
});

const GolfHandicapScreen = ({ userId, roomName, room }: GolfPrepScreenProps) => {
  const db = getFirestore();
  const roomRef = doc(db, 'rooms', roomName);

  const [course, setCourse] = useState({} as GolfCourse);

  useEffect(() => {
    if (!room.golfCourseId) return;
    getDoc(doc(db, 'golfCourses', room.golfCourseId))
      .then(res => {
        // set golf course
        const data = {
          ...res.data(),
          id: room.golfCourseId
        } as GolfCourse;
        setCourse(data);
      })
      .catch(err => {
        console.error(err);
      });
  }, [room.golfCourseId]);

  const users = useAppSelector(state => state.usersReducer);
  const dispatch = useAppDispatch();

  const getUser = async (uid: string) => {
    // memoization
    const userRef = doc(db, 'users', uid);
    getDoc(userRef)
      .then(res => {
        const data = {
          id: uid,
          ...res.data()
        } as User;
        dispatch(setUser(data));
      })
      .catch(err => {
        console.log("Failed to get user profile with id ", uid);
        console.error(err);
      });
  };

  const handleStart = () => {
    const req = room.userIds.length * (room.userIds.length - 1) / 2;
    let count = 0;
    for (const key in room.pointsArr)
      if (room.pointsArr[key].locked)
        count++;
    if (Object.keys(room.pointsArr).length != req || count != req) {
      console.log("Prep not done, cannot start");
      return;
    }

    updateDoc(roomRef, {
      prepDone: true
    })
      .then(res => {
        console.log("Prep done");
      })
      .catch(err => {
        console.error(err);
      });
  }

  const userSelector = (uid: string) => {
    if (users[uid]) return users[uid];
    getUser(uid);
    return { id: "", name: "Unknown", roomName: "" };
  };

  const renderItem = ({ item }: { item: string }) => {
    if (!userId) return null;
    const id = item;
    const flipped = userId > id;
    const pairId = flipped ? id + '+' + userId : userId + '+' + id;
    const handicapInfo = room.pointsArr[pairId]
      ? room.pointsArr[pairId]
      : {
        give: !flipped,
        frontCount: 0,
        backCount: 0,
        locked: false
      };
    const user = userSelector(userId);
    const otherUser = userSelector(id);
    const handicapRowProps: HandicapRowProps = { user, otherUser, roomName, handicapInfo, flipped, pairId };
    return <HandicapRow {...handicapRowProps} />;
  };

  const renderArr = (arr: Array<number>) => {
    if (!arr || arr.length != 18) return null;
    return (
      <HStack>
        {arr.map((num, i) => (
          <Box key={i}>
            <Text>{num}</Text>
          </Box>
        ))}
      </HStack>
    );
  };

  return (
    <SafeAreaView>
      <Box>{renderArr(course.parArr)}</Box>
      <Box>{renderArr(course.handicapIndexArr)}</Box>
      <FlatList
        data={room.userIds.filter(uid => uid != userId)}
        renderItem={renderItem}
        keyExtractor={(item) => item} // since the item is the user id itself
      />
      {userId === room.gameOwnerUserId
        ? <Button onPress={handleStart}>Start game</Button>
          : <Text>Wait for room owner to start game</Text>
      }
    </SafeAreaView>
  );
};

const GolfPrepScreen = (props: GolfPrepScreenProps) => {
  return (
    <Center>
      <Box width={"100%"}>
        {props.room.golfCourseId
          ? <GolfHandicapScreen {...props} /> 
          : <GolfCourseScreen {...props} />
        }
      </Box>
    </Center>
  );
};

export default GolfPrepScreen;
