import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { updateDoc, getDocs, getFirestore, collection, doc, DocumentSnapshot, DocumentData, query, limit, startAfter, orderBy, addDoc, setDoc, CollectionReference } from 'firebase/firestore';
import { GolfCourse, GolfGame } from '../../../types';
import { Heading, FormControl, Box, FlatList, Text, Center, Button, Input, HStack, ScrollView, Spinner, KeyboardAvoidingView, VStack } from "native-base";
import { TouchableOpacity } from 'react-native';
import { AntDesign, Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BackButton, Defer, GolfArray, LoadingView, UserAvatar } from '../../../components';
import { useGolfCourse, useUser } from '../../../hooks/useFireGet';
import { useAppDispatch, useAppSelector } from '../../../hooks/selectorAndDispatch';
import { padArr, tryAsync } from '../../../utils';
import { addGolfCourses, editCustomGolfCourseField, resetCustomGolfCourse, setCustomGolfCourseArrLen } from '../../../redux/features/golfCourses';
import { useIsMounted } from '../../../hooks/common';
import uuid from 'react-native-uuid';
import { EditableGolfArray } from '../../../components/GolfArray';

interface CourseViewProps {
  golfCourseId: string;
  setSelectedCourseId: (id: string) => void;
  isSelected: boolean;
}

const CourseView = React.memo(({ golfCourseId, setSelectedCourseId, isSelected }: CourseViewProps) => {
  // console.log('render courseview')
  const [golfCourse, golfCourseIsLoading] = useGolfCourse(golfCourseId);
  if (!golfCourse) return null;
  const handleOnPress = () => setSelectedCourseId(isSelected ? '' : golfCourse.id);
  return (
    <Defer chunkSize={1}>
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
    </Defer>
  );
});

const addCoursesFromJson = () => {
  // console.log(json);
  // console.log("hi")
  // const colRef = collection(db, 'golfCourses');
  // let json = require('./data.json');
  // for (const obj of json) {
  //   // console.log(obj)
  //   addDoc(colRef, obj);
  // }
};

interface GolfCourseListProps extends GolfPrepScreenProps {
  golfCoursesRef: CollectionReference<DocumentData>;
};

const GolfCourseList = ({ userId, roomName, room, golfCoursesRef }: GolfCourseListProps)  => {
  const [golfCourseIds, setGolfCourseIds] = useState<Array<string>>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot<DocumentData> | null | undefined>();
  const [loading, setLoading] = useState(false);
  const [noMore, setNoMore] = useState(false);
  const isMounted = useIsMounted();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // if golfCoursesRef changes from default to custom or vice versa
    if (!isMounted.current) return;
    setGolfCourseIds([]);
    setSelectedCourseId('');
    setLastVisible(undefined);
    setNoMore(false);
    setLoading(false);
  }, [golfCoursesRef]);

  useEffect(() => {
    getGolfCourses();
  }, [golfCourseIds.length === 0]);

  const db = getFirestore();

  const getGolfCourses = async () => {
    if (loading || userId !== room.gameOwnerUserId || !isMounted.current) return;
    setLoading(true);

    const q = lastVisible === undefined
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

      // if (!isMounted.current) return;
      dispatch(addGolfCourses(newGolfCourses));

      // update lastVisible
      const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      // if (!isMounted.current) return;
      setLastVisible(newLastVisible);

      // add golfCourseIds
      const newGolfCourseIds = newGolfCourses.map(newGolfCourse => newGolfCourse.id); 
      // if (!isMounted.current) return;
      setGolfCourseIds([...golfCourseIds, ...newGolfCourseIds]);
    }
    setLoading(false);
  };

  const onEndReached = () => {
    if (noMore) return;
    getGolfCourses();
  };

  const handleSubmit = () => {
    if (!selectedCourseId || selectedCourseId.length === 0) return;
    updateDoc(doc(db, 'rooms', roomName), {
      golfCourseId: selectedCourseId
    })
      .then(res => console.log("Course selected"))
      .catch(err => console.error(err));
  };

  const renderFooter = () => loading ? <Spinner size="lg" /> : null;

  const renderItem = useCallback(({ item: golfCourseId }: { item: string }) => (
    <CourseView
      golfCourseId={golfCourseId}
      setSelectedCourseId={setSelectedCourseId}
      isSelected={selectedCourseId === golfCourseId}
    />
  ), [selectedCourseId]);

  return (
    <>
      {userId === room.gameOwnerUserId
        ? <Box flex={1} marginBottom={5}>
            {/* <Text fontSize={18} fontWeight="500">Select a course</Text> */}
          <Box flex={1} marginBottom={3}>
            <FlatList
              data={golfCourseIds}
              renderItem={renderItem}
              keyExtractor={(item, i) => item + i}
              onEndReached={onEndReached}
              onEndReachedThreshold={0.5}
              initialNumToRender={2}
              ListFooterComponent={renderFooter}
              // removeClippedSubviews={true}
              showsVerticalScrollIndicator={false}
            />
          </Box>
          <Box>
            <Button onPress={handleSubmit}>Submit</Button>
          </Box>
        </Box>
        : <Center flex={1}>
          <Text>Wait for room owner to select course</Text>
        </Center>}
    </>
  );
};

const GolfCourseScreen = ({ ...props }: GolfPrepScreenProps) => {
  const [showCustomCourses, setShowCustomCourses] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);

  const golfCoursesRef = useMemo(() => {
    const db = getFirestore();
    return showCustomCourses
      ? collection(db, 'users', props.userId, 'golfCourses')
      : collection(db, 'golfCourses');
  }, [showCustomCourses]);

  const toggleShowCustomCourses = () => setShowCustomCourses(!showCustomCourses);
  const toggleShowAddCourse = () => setShowAddCourse(!showAddCourse);

  return (
    <Box flex={1}>
      {/* <VStack width='100%' padding={1} rounded={20} bgColor={'white'} marginY={3} alignItems='center' justifyContent='space-between'> */}
      <HStack width='100%' alignItems={'center'} space={2} paddingY={3}>
        {showAddCourse
          ? null
          : <Button onPress={toggleShowCustomCourses} bg='emerald.500' flex={1}>
            {showCustomCourses ? 'View default' : 'View custom'}
          </Button>}
        <Button onPress={toggleShowAddCourse} flex={1}>
          {showAddCourse ? 'View courses' : 'Add custom'}
        </Button>
      </HStack>

      {!showAddCourse
        ? <GolfCourseList
          {...props}
          golfCoursesRef={golfCoursesRef}
        />
        : <GolfCourseAdder userId={props.userId} toggleShowAddCourse={toggleShowAddCourse} />}
    </Box>
  );
};

interface GolfCourseAdderProps {
  userId: string;
  toggleShowAddCourse: () => void;
};

const GolfCourseAdder = ({ userId, toggleShowAddCourse }: GolfCourseAdderProps) => {
  const customGolfCourse = useAppSelector(state => state.golfCourses.customGolfCourse);
  const dispatch = useAppDispatch();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useIsMounted();

  const db = getFirestore();

  const checkArr = (arr: any[], checkHandicap=false): [boolean, string] => {
    if (!(arr.length > 0 && arr.length % 9 === 0)) return [false, 'Invalid length']; // should never happen
    const allPositiveIntegers = arr.every(val => typeof val === 'number' && val > 0 && Number.isSafeInteger(val));
    if (!allPositiveIntegers) return [false, `Invalid values in ${checkHandicap ? 'handicap' : 'par'} cells`];
    if (checkHandicap) {
      const boolArr = new Array(arr.length).fill(false);
      arr.forEach(num => {
        const idx = num - 1;
        if (idx >= 0 && idx < boolArr.length)
          boolArr[idx] = true;
      });
      const handicapIsIota = boolArr.every(e => e);
      return [handicapIsIota, !handicapIsIota ? 'HandicapIndex needs to contain every number from 1 to 9 or 18' : ''];
    }
    return [true, ''];
  };

  const checkString = (s: string | undefined, canBeUndefined=false): [boolean, string] => {
    if (canBeUndefined && !s) return [true, ''];
    const withinRange = s ? s.length > 0 && s.length <= 200 : false;
    return [withinRange, !withinRange ? 'Name is a required field and cannot exceed 200 characters' : ''];
  };

  const checkCustomCourse = () => {
    const { name, clubName, location, parArr, handicapIndexArr } = customGolfCourse;
    const res = [
      checkString(name),
      checkString(clubName, true),
      checkString(location, true),
      checkArr(parArr),
      checkArr(handicapIndexArr, true)
    ];
    return res.reduce(([prevCan, prevErr], [curCan, curErr]) => {
      const spacer = (prevErr && prevErr.slice(prevErr.length - 1) !== '\n' ? '\n' : '');
      return [prevCan && curCan, prevErr + spacer + curErr];
    });
  };

  const addCustomCourse = async () => {
    const [can, errMsg] = checkCustomCourse();
    if (can) {
      try {
        // post 2 of the same object to diff directories in firestore, because the one in user doc will be used for infinite scroll, the other one is general
        setIsLoading(true);
        const uniqueId = uuid.v4() as string;

        const customCourseRef = doc(db, 'customGolfCourses', uniqueId);
        await setDoc(customCourseRef, customGolfCourse);

        if (!isMounted.current) return;
        const userCustomCourseRef = doc(db, 'users', userId, 'golfCourses', uniqueId); // this will contain all custom courses of user
        await setDoc(userCustomCourseRef, customGolfCourse);
        if (!isMounted.current) return;
        setIsLoading(false);
        dispatch(resetCustomGolfCourse());
        console.log('Added custom course');
      } catch (err) {
        console.error(err);
      }
    } else {
      setErrorMessage(errMsg);
    }
  };

  const handleOnPress = () => {
    const curLen = customGolfCourse.parArr.length;
    dispatch(setCustomGolfCourseArrLen(curLen === 9 ? 18 : 9));
  };

  // console.log(customGolfCourse);

  return (
    // <KeyboardAvoidingView flex={1} behavior={'padding'}>
      <ScrollView marginBottom={3} showsVerticalScrollIndicator={false}>
        <VStack width='100%' padding={3} rounded={20} bg='white'>
          <HStack width='100%' alignItems={'center'} marginBottom={3} justifyContent='space-between'>
            <BackButton onPress={toggleShowAddCourse} />
            <Heading textAlign={'center'} fontWeight='semibold'>Course Details</Heading>
            <Box width={21} />
          </HStack>
          <FormControl>
            <VStack space={3}>
              <FormControl.Label>Name*</FormControl.Label>
              <Input
                value={customGolfCourse.name}
                onChangeText={(val) => dispatch(editCustomGolfCourseField({ fieldName: 'name', val }))}
              />
              <FormControl.Label>Club Name</FormControl.Label>
              <Input
                value={customGolfCourse.clubName}
                onChangeText={(val) => dispatch(editCustomGolfCourseField({ fieldName: 'clubName', val }))}
              />
              <FormControl.Label>Location</FormControl.Label>
              <Input
                value={customGolfCourse.location}
                onChangeText={(val) => dispatch(editCustomGolfCourseField({ fieldName: 'location', val }))}
              />
              <VStack space={3} marginTop={3}>
                <Button alignSelf='flex-end' onPress={handleOnPress}>Toggle No. of Holes</Button>
                <EditableGolfArray size={50} />
              </VStack>
              <Text color='red.500'>{errorMessage}</Text>
              {isLoading
                ? <Spinner size='lg' />
                : <Button onPress={addCustomCourse}>Submit</Button>}
            </VStack>
          </FormControl>
        </VStack>
        <Box height={400} />
      </ScrollView>
    // </KeyboardAvoidingView>
  );
};


interface HandicapRowProps {
  userId: string;
  oppUid: string;
  room: GolfGame;
  roomName: string;
  renderBackCount: boolean;
};

const HandicapRow = React.memo(({ userId, oppUid, room, roomName, renderBackCount }: HandicapRowProps) => {
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

  // handicapInfo.give = pairId === 'BIslUXlGdQaOWDwW9x4X2oRtxvo1+QUMvGO7beZV9NRSRejsVIe5gk9B2' ? true : false;
  // console.log(handicapInfo)
  
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

  const checkNumberInRange = (num: number | undefined | null) => {
    if (typeof num !== 'number') return false;
    return 0 <= num && num <= 9;
  };

  const handleInputSubmit = async (frontOrBackCount: "frontCount" | "backCount") => {
    const canFront = frontOrBackCount === 'frontCount' && checkNumberInRange(frontVal);
    const canBack = frontOrBackCount === 'backCount' && checkNumberInRange(backVal);
    if (!canFront && !canBack) return;
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
    if (room.gameEnded) return;
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
            autoCorrect={false}
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
          <TouchableOpacity onPress={handleLock} disabled={Boolean(room.gameEnded)}>
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
          {renderBackCount && renderInput("backCount")}
        </HStack>
      </HStack>
    </Center>
  );
});

const GolfHandicapScreen = ({ userId, roomName, room }: GolfPrepScreenProps) => {
  const [course, courseIsLoading] = useGolfCourse(room.golfCourseId);
  const renderBackCount = course ? course?.parArr.length > 9 : true;

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
    const db = getFirestore();
    const roomRef = doc(db, 'rooms', roomName);

    updateDoc(roomRef, {
      prepDone: true
    })
      .then(res => {
        console.log("Prep done");
      })
      .catch(err => {
        console.error(err);
      });
  };

  const isReady = useMemo(() => {
    const len = room.userIds.length;
    let cnt = 0;
    for (const val of Object.values(room.pointsArr))
      if (val.locked)
        cnt++;
    return len * (len - 1) / 2 === cnt;
  }, [room.userIds.length, room.pointsArr]);

  const userIds = useMemo(() => room.userIds.filter(uid => uid != userId), [room.userIds]);

  return (
    <KeyboardAvoidingView flex={1} behavior={'padding'}>
      <ScrollView marginY={3} flex={1} keyboardShouldPersistTaps={'always'} showsVerticalScrollIndicator={false}>
        <Center bg="white" padding={15} rounded={20} width="100%" flex={1}>
          <Text fontSize={18} fontWeight="500" mb="3">Handicap</Text>
          <LoadingView isLoading={courseIsLoading}>
            <GolfArray course={course} />
          </LoadingView>
        </Center>
        <Defer chunkSize={1}>
          {userIds.map((uid, idx) =>
            <HandicapRow
              key={uid + idx}
              userId={userId}
              oppUid={uid}
              room={room}
              roomName={roomName}
              renderBackCount={renderBackCount}
            />
          )}
        </Defer>
        {room.gameEnded
          ? null
          : <Center>
            <Text textAlign={'center'} marginY={3}>Make sure all players have joined the room before starting!</Text>
            {userId === room.gameOwnerUserId
              ? isReady
                ? <Button onPress={handleStart}>Start game</Button>
                : <Text>Make sure all give and takes are locked</Text>
              : <Text>Wait for room owner to start game</Text>}
          </Center>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

interface GolfPrepScreenProps {
  userId: string;
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