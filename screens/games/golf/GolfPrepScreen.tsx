import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getDoc, updateDoc, getDocs, getFirestore, collection, doc, addDoc, DocumentSnapshot, DocumentData, query, limit, startAfter, orderBy } from 'firebase/firestore';
import { User, GolfCourse, GolfGame, HandicapInfo } from '../../../types';
import { Box, FlatList, Heading, Avatar, HStack, VStack, Text, Spacer, Center, Button, Input, Pressable, ScrollView, Spinner } from "native-base";
import { TouchableOpacity } from 'react-native';
import { AntDesign, Fontisto, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GolfArray, LoadingView, UserAvatar } from '../../../components';
import { useGolfCourse, useUser } from '../../../hooks/useFireGet';
import { useAppDispatch, useAppSelector } from '../../../hooks/selectorAndDispatch';
import { tryAsync } from '../../../utils/asyncUtils';
import { addGolfCourses, setGolfCourse } from '../../../redux/features/golfCourses';
import { useIsMounted } from '../../../hooks/common';
    let json = require('./data.json');

interface CourseViewProps {
  golfCourseId: string;
  setSelectedCourseId: (id: string) => void;
  isSelected: boolean;
}

const CourseView = React.memo(({ golfCourseId, setSelectedCourseId, isSelected }: CourseViewProps) => {
  const [golfCourse, golfCourseIsLoading] = useGolfCourse(golfCourseId);
  if (!golfCourse) return null;
  const handleOnPress = () => setSelectedCourseId(isSelected ? '' : golfCourse.id);
  return (
    <Box padding={15} bgColor={'white'} shadow={3} rounded={20} marginBottom={3}>
      <LoadingView isLoading={golfCourseIsLoading}>
        <HStack justifyContent={'space-between'} alignItems={'center'} marginBottom={1}>
          <Box flex={1}>
            <Text fontSize={18} fontWeight={'semibold'}>{golfCourse.name}</Text>
          </Box>
          <TouchableOpacity onPress={handleOnPress}>
            <AntDesign name={isSelected ? 'checkcircle' : 'checkcircleo'} size={30} color={isSelected ? 'green' : 'gray'} />
          </TouchableOpacity>
        </HStack>
        <Box width={'100%'} alignItems={'flex-start'} marginBottom={3}>
          <Text>{golfCourse.location}</Text>
        </Box>
        <GolfArray course={golfCourse} />
      </LoadingView>
    </Box>
  );
});

const GolfCourseScreen = ({ userId, roomName, room }: GolfPrepScreenProps)  => {
  const [golfCourseIds, setGolfCourseIds] = useState<Array<string>>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot<DocumentData> | null | undefined>();
  const [loading, setLoading] = useState(false);
  const [noMore, setNoMore] = useState(false);
  const isMounted = useIsMounted();
  const dispatch = useAppDispatch();

  useEffect(() => {
    getGolfCourses();
    // addCoursesFromJson();
  }, []);

  const db = getFirestore();

  const addCourse = () => {
    const colRef = collection(db, 'golfCourses');
    // addDoc(colRef, {
    //   name: "ass",
    //   location: "penis",
    //   parArr: [4, 4, 5, 3, 4, 4, 3, 4, 5, 4, 3, 4, 5, 5, 4, 4, 3, 4],
    //   handicapIndexArr: [12, 4, 2, 16, 8, 10, 18, 14, 6, 5, 15, 1, 11, 7, 17, 9, 13, 3],
    // });
  };

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
    if (loading || userId !== room.gameOwnerUserId || !isMounted.current) return;
    setLoading(true);

    const golfCoursesRef = collection(db, 'golfCourses');
    const q = lastVisible == undefined
      ? query(golfCoursesRef, orderBy("name"), limit(2))
      : query(golfCoursesRef, orderBy("name"), startAfter(lastVisible), limit(2));

    const [documentSnapshots, err] = await tryAsync(getDocs(q));
    if (!documentSnapshots || !isMounted.current) return;

    // if no more past games
    if (!documentSnapshots.docs.length) setNoMore(true);
    else {
      // update golfCourse cache
      console.log("Got golf courses");
      const newGolfCourses = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as GolfCourse));

      // may need to make this async?
      if (!isMounted.current) return;
      dispatch(addGolfCourses(newGolfCourses));

      // newGolfCourses.forEach(newGolfCourse => {
      //   dispatch(setGolfCourse(newGolfCourse));
      // });

      // update lastVisible
      const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(newLastVisible);

      // add golfCourseIds
      const newGolfCourseIds = newGolfCourses.map(newGolfCourse => newGolfCourse.id); 
      setGolfCourseIds([...golfCourseIds, ...newGolfCourseIds]);
    }
    if (!isMounted.current) return;
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

  const renderFooter = () => loading ? <Spinner size="lg" /> : null;

  const renderItem = ({ item: golfCourseId }: { item: string }) => (
    <CourseView
      golfCourseId={golfCourseId}
      setSelectedCourseId={setSelectedCourseId}
      isSelected={selectedCourseId === golfCourseId}
    />
  );

  return (
    <>
      {userId === room.gameOwnerUserId
        ? <Box flex={1} marginBottom={5}>
          <Center width='100%' padding={1} rounded={20} bgColor={'white'} marginY={3}>
            <Text fontSize={18} fontWeight="500">Select course</Text>
          </Center>
          <Box flex={1} marginBottom={3}>
            <FlatList
              data={golfCourseIds}
              renderItem={renderItem}
              keyExtractor={(item, i) => item + i}
              onEndReached={onEndReached}
              onEndReachedThreshold={0.7}
              initialNumToRender={3}
              ListFooterComponent={renderFooter}
              removeClippedSubviews={true}
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
  userId: string | undefined;
  oppUid: string;
  room: GolfGame;
  roomName: string;
};

const HandicapRow = ({ userId, oppUid, room, roomName }: HandicapRowProps) => {
  const [user, userIsLoading] = useUser(userId);
  const [otherUser, otherUserIsLoading] = useUser(oppUid);
  const [frontVal, setFrontVal] = useState<number>();
  const [backVal, setBackVal] = useState<number>();

  const flipped = userId ? userId > oppUid : false;
  const pairId = flipped ? oppUid + '+' + userId : userId + '+' + oppUid;
  const handicapInfo = room.pointsArr[pairId]
    ? room.pointsArr[pairId]
    : {
      give: !flipped,
      frontCount: 0,
      backCount: 0,
      locked: false
    };

  console.log(handicapInfo)

  useEffect(() => {
    setFrontVal(Number(handicapInfo.frontCount));
    setBackVal(Number(handicapInfo.backCount));
  }, [handicapInfo]);

  if (!user || !otherUser) return null;

  const giveOrTake = (Number(handicapInfo.give) ^ Number(flipped)) ? 'Give' : 'Take';

  const db = getFirestore();
  const roomRef = doc(db, 'rooms', roomName);

  const handleInputChange = (frontOrBackCount: "frontCount" | "backCount", val: string) => {
    const num = Number(val);
    if (frontOrBackCount === "frontCount") setFrontVal(num);
    else setBackVal(num);
  };

  const handleInputSubmit = async (frontOrBackCount: "frontCount" | "backCount") => {
    const checkNumberInRange = (num: number | undefined | null) => {
      if (num === undefined || num === null) return false;
      return 0 <= num && num <= 9;
    }
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

  const renderInput = (frontOrBackCount: "frontCount" | "backCount") => {
    const val = frontOrBackCount === "frontCount" ? frontVal : backVal;
    return (
      <Center>
        <Text fontWeight={'semibold'}>{frontOrBackCount === "frontCount" ? 'Front' : 'Back'}</Text>
        <Box height={50} width={50}>
        <Input
          value={val ? val.toString() : undefined}
          onChangeText={text => handleInputChange(frontOrBackCount, text)}
          onEndEditing={() => handleInputSubmit(frontOrBackCount)}
          editable={!handicapInfo.locked}
          flex={1}
          fontSize={20}
          rounded={10}
          textAlign={'center'}
        />
        </Box>
      </Center>
    );
  };

  return (
    <Center bg='white' borderWidth={1} borderColor={'gray.100'} shadow={1} padding={15} rounded="20" marginTop={3}>
      <HStack justifyContent={'space-between'} width='100%' space={5} alignItems={'center'}>
        <Button disabled={true} variant="subtle" colorScheme={giveOrTake !== 'Give' ? 'green' : 'rose'}>{giveOrTake}</Button>
        <HStack space={3} alignItems={'center'}>
          {handicapInfo.locked
            ? null
            : <TouchableOpacity onPress={handleGiveOrTake} disabled={handicapInfo.locked}>
              <Fontisto name='spinner-rotate-forward' size={25} />
            </TouchableOpacity>}
          <TouchableOpacity onPress={handleLock}>
            <Ionicons name={handicapInfo.locked ? "md-lock-closed" : "md-lock-open-outline"} size={30} />
          </TouchableOpacity>
        </HStack>
      </HStack>
      <HStack paddingY={2} alignItems={'center'}>
        <HStack>
          <Center width={60}>
            <Text numberOfLines={1}>{user.name}</Text>
            {/* add image */}
            <UserAvatar userId={user.id} />
          </Center>
          <Center marginX={2}>
            <Text>vs</Text>
          </Center>
          <Center width={60}>
            <Text numberOfLines={1}>{otherUser.name}</Text>
            <UserAvatar userId={otherUser.id} />
          </Center>
        </HStack>
        <HStack justifyContent={'space-evenly'} flex={1} marginLeft={3}>
          {renderInput("frontCount")}
          {renderInput("backCount")}
        </HStack>
      </HStack>
    </Center>
  );
};

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
    return <HandicapRow userId={userId} oppUid={item} room={room} roomName={roomName} />;
  };

  const len = room.userIds.length;
  let cnt = 0;
  for (const [key, val] of Object.entries(room.pointsArr))
    if (val.locked)
      cnt++;
  const isReady = len * (len - 1) / 2 === cnt;

  return (
    <VStack flex={1} marginY={3} >
      <Center bg="white" padding={15} rounded={20} width="100%" flex={1} maxHeight={200}>
        <Text fontSize={18} fontWeight="500" marginBottom={3}>Handicap</Text>
        <LoadingView isLoading={courseIsLoading}>
          <GolfArray course={course} />
        </LoadingView>
      </Center>
      <Box flex={1}>
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