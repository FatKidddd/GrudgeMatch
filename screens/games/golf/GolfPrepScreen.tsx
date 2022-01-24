import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getDoc, updateDoc, getDocs, getFirestore, collection, doc, addDoc, DocumentSnapshot, DocumentData, query, limit, startAfter, orderBy } from 'firebase/firestore';
import { User, GolfCourse, GolfGame, HandicapInfo } from '../../../types';
import { Box, FlatList, Heading, Avatar, HStack, VStack, Text, Spacer, Center, Button, Input, Pressable, ScrollView, Spinner } from "native-base";
import { TouchableOpacity } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GolfArray, LoadingView } from '../../../components';
import { useGolfCourse, useUser } from '../../../hooks/useFireGet';
import { useAppDispatch, useAppSelector } from '../../../hooks/selectorAndDispatch';
import { tryAsync } from '../../../utils/asyncUtils';
import { setGolfCourse } from '../../../redux/features/golfCourses';
    let json = require('./data.json');

interface CourseViewProps {
  golfCourseId: string;
  setSelectedCourseId: (id: string) => void;
  selectedCourseId: string;
}

const CourseView = ({ golfCourseId, setSelectedCourseId, selectedCourseId }: CourseViewProps) => {
  const [golfCourse, golfCourseIsLoading] = useGolfCourse(golfCourseId);
  if (!golfCourse) return null;
  const canSelect = golfCourse.parArr.length === 18;
  const isSelected = selectedCourseId === golfCourseId;
  const handleOnPress = () => setSelectedCourseId(isSelected ? '' : golfCourse.id);
  return (
    <Box padding={15} bgColor={'white'} shadow={3} rounded={20} marginBottom={3}>
      <LoadingView isLoading={golfCourseIsLoading}>
        <HStack justifyContent={'space-between'} alignItems={'center'} marginBottom={1}>
          <Box flex={1}>
            <Text fontSize={18} fontWeight={'semibold'}>{golfCourse.name}</Text>
          </Box>
          {canSelect
            ? <TouchableOpacity onPress={handleOnPress}>
              <AntDesign name={isSelected ? 'checkcircle' : 'checkcircleo'} size={30} color={isSelected ? 'green' : 'gray'} />
            </TouchableOpacity>
            : null}
        </HStack>
        <Box width={'100%'} alignItems={'flex-start'} marginBottom={3}>
          <Text>{golfCourse.location}</Text>
        </Box>
        {canSelect
          ? <GolfArray course={golfCourse} />
          : null}
      </LoadingView>
    </Box>
  );
};

const GolfCourseScreen = ({ userId, roomName, room }: GolfPrepScreenProps)  => {
  const [golfCourseIds, setGolfCourseIds] = useState<Array<string>>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot<DocumentData> | null | undefined>();
  const [loading, setLoading] = useState(false);
  const [noMore, setNoMore] = useState(false);

  const db = getFirestore();
  const dispatch = useAppDispatch();

  const addCourse = () => {
    const colRef = collection(db, 'golfCourses');
    // addDoc(colRef, {
    //   name: "ass",
    //   location: "penis",
    //   parArr: [4, 4, 5, 3, 4, 4, 3, 4, 5, 4, 3, 4, 5, 5, 4, 4, 3, 4],
    //   handicapIndexArr: [12, 4, 2, 16, 8, 10, 18, 14, 6, 5, 15, 1, 11, 7, 17, 9, 13, 3],
    // });
  };

  const isMounted = useRef(true);

  useEffect(() => {
    getGolfCourses();
    // addCoursesFromJson();
    () => isMounted.current = false;
  }, []);

  const addCoursesFromJson = () => {
    // console.log(json);
    // console.log("hi")
    const colRef = collection(db, 'golfCourses');
    for (const obj of json) {
      // console.log(obj)
      addDoc(colRef, obj);
    }
    // addDoc(colRef, {
    //   name: "ass",
    //   location: "penis",
    //   parArr: [4, 4, 5, 3, 4, 4, 3, 4, 5, 4, 3, 4, 5, 5, 4, 4, 3, 4],
    //   handicapIndexArr: [12, 4, 2, 16, 8, 10, 18, 14, 6, 5, 15, 1, 11, 7, 17, 9, 13, 3],
    // });
  };

  const getGolfCourses = async () => {
    if (loading || userId !== room.gameOwnerUserId) return;

    setLoading(true);

    const golfCoursesRef = collection(db, 'golfCourses');
    const q = lastVisible == undefined
      ? query(golfCoursesRef, orderBy("name"), limit(3))
      : query(golfCoursesRef, orderBy("name"), startAfter(lastVisible), limit(3));

    const [documentSnapshots, err] = await tryAsync(getDocs(q));
    if (!documentSnapshots) return;

    // if no more past games
    if (!documentSnapshots.docs.length) setNoMore(true);
    else {
      // update golfCourse cache
      if (!isMounted) return;
      console.log("Got golf courses");
      const newGolfCourses = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as GolfCourse));
      // may need to make this async?
      newGolfCourses.forEach(newGolfCourse => {
        dispatch(setGolfCourse(newGolfCourse));
      });

      // update lastVisible
      const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(newLastVisible);

      // add golfCourseIds
      const newGolfCourseIds = newGolfCourses.map(newGolfCourse => newGolfCourse.id); 
      setGolfCourseIds([...golfCourseIds, ...newGolfCourseIds]);
    }
    if (!isMounted) return;
    setLoading(false);
  };

  const onEndReached = () => {
    if (noMore) return;
    getGolfCourses();
  };

  const handleSubmit = () => {
    if (selectedCourseId.length === 0) return;
    updateDoc(doc(db, 'rooms', roomName), {
      golfCourseId: selectedCourseId
    })
      .then(res => console.log("Course selected"))
      .catch(err => console.error(err));
  };

  return (
    <>
      {userId === room.gameOwnerUserId
        ? <Box flex={1} marginBottom={5}>
          <Center width='100%' padding={1} rounded={20} bgColor={'white'} marginY={3}>
            <Text fontSize={18} fontWeight="500">Select course</Text>
          </Center>
          <Box flex={1}>
            <FlatList
              data={golfCourseIds}
              renderItem={({ item: golfCourseId }: { item: string }) => (
                <CourseView
                  golfCourseId={golfCourseId}
                  setSelectedCourseId={setSelectedCourseId}
                  selectedCourseId={selectedCourseId}
                />
              )}
              keyExtractor={(item, i) => item + i}
              onEndReached={onEndReached}
              onEndReachedThreshold={0.5}
              initialNumToRender={5}
              ListFooterComponent={loading ? <Spinner size="sm" /> : null}
            />
          </Box>
          <Box>
            <Button onPress={handleSubmit}>Submit</Button>
          </Box>
        </Box>
        : <Center flex={1}>
          <Text>Wait for room owner to select course</Text>
        </Center>
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

  const [frontVal, setFrontVal] = useState(Number(handicapInfo.frontCount));
  const [backVal, setBackVal] = useState(Number(handicapInfo.backCount));

  const db = getFirestore();
  const roomRef = doc(db, 'rooms', roomName);

  const handleInputChange = (frontOrBackCount: "frontCount" | "backCount", val: string) => {
    const num = Number(val);
    if (isNaN(num)) return;
    if (frontOrBackCount === "frontCount") setFrontVal(num);
    else setBackVal(num);
  };

  const handleInputSubmit = async (frontOrBackCount: "frontCount" | "backCount") => {
    const checkNumberInRange = (num: number) => 0 <= num && num <= 9;
    if (!checkNumberInRange(frontVal) || !checkNumberInRange(backVal)) return;
    //console.log(frontVal, backVal)
    await updateDoc(roomRef, {
      [`pointsArr.${pairId}.${frontOrBackCount}`]: frontOrBackCount === "frontCount" ? frontVal : backVal
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
    <Center bg="green.100" padding={15} rounded="20" marginTop={5}>
      <HStack flex={1} bg="white" paddingY={3}>
        <Center flex={1}>
          <Text numberOfLines={1}>{flipped ? otherUser.name : user.name}</Text>
          {/* add image */}
        </Center>
        <Box marginX={4}>
          <Text>vs</Text>
        </Box>
        <Center flex={1}>
          <Text numberOfLines={1}>{!flipped ? otherUser.name : user.name}</Text>
        </Center>
      </HStack>

      <HStack alignItems='center' flex={1}>
        <Box flex={1}>
          <Button onPress={handleGiveOrTake} disabled={handicapInfo.locked} variant="subtle">{giveOrTake}</Button>
        </Box>
        <HStack flex={2} justifyContent={'space-evenly'}>
          <Input
            value={frontVal ? frontVal.toString() : undefined}
            onChangeText={text => handleInputChange("frontCount", text)}
            onEndEditing={() => handleInputSubmit("frontCount")}
            editable={!handicapInfo.locked}
            size={16}
            fontSize={20}
            rounded={10}
            textAlign={'center'}
          />
          <Input
            value={backVal ? backVal.toString() : undefined}
            onChangeText={text => handleInputChange("backCount", text)}
            onEndEditing={() => handleInputSubmit("backCount")}
            editable={!handicapInfo.locked}
            size={16}
            fontSize={20}
            rounded={10}
            textAlign={'center'}
          />
        </HStack>
        <Box>
          <TouchableOpacity onPress={handleLock}>
            <Ionicons name={handicapInfo.locked ? "md-lock-closed" : "md-lock-open-outline"} size={30} />
          </TouchableOpacity>
        </Box>
      </HStack>
    </Center>
  );
});

const GolfHandicapScreen = ({ userId, roomName, room }: GolfPrepScreenProps) => {
  const [course, courseIsLoading] = useGolfCourse(room.golfCourseId);

  const db = getFirestore();
  const roomRef = doc(db, 'rooms', roomName);

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
    const [user, userIsLoading] = useUser(userId);
    const [otherUser, otherUserIsLoading] = useUser(id);
    if (!user || !otherUser) return null;
    const handicapRowProps: HandicapRowProps = { user, otherUser, roomName, handicapInfo, flipped, pairId };
    return <HandicapRow {...handicapRowProps} />;
  };

  const len = room.userIds.length;
  let cnt = 0;
  for (const [key, val] of Object.entries(room.pointsArr))
    if (val.locked)
      cnt++;
  const isReady = len * (len - 1) / 2 === cnt;

  return (
    <VStack bg="white" flex={1} marginY={5} padding={15} rounded={20}>
      <Center marginBottom={3}>
        <Text fontSize={18} fontWeight="500">Handicap</Text>
      </Center>
      <Box>
        <GolfArray course={course}/>
      </Box>
      <Box marginY={5} flex={1}>
        <FlatList
          data={room.userIds.filter(uid => uid != userId)}
          renderItem={renderItem}
          keyExtractor={(item) => item} // since the item is the user id itself
        />
      </Box>
      <Center>
        {userId === room.gameOwnerUserId
          ? isReady
            ? <Button onPress={handleStart}>Start game</Button>
            : <Text>Make sure all give and takes are locked</Text>
          : <Text>Wait for room owner to start game</Text>
        }
      </Center>
    </VStack>
  );
};

interface GolfPrepScreenProps {
  userId: string | undefined;
  roomName: string;
  room: GolfGame;
};

const GolfPrepScreen = (props: GolfPrepScreenProps) => {
  return (
    <Box flex={1}>
      {props.room.golfCourseId
        ? <GolfHandicapScreen {...props} /> 
        : <GolfCourseScreen {...props} />}
    </Box>
  );
};

export default GolfPrepScreen;