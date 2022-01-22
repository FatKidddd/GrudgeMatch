import _ from 'lodash';
import React from 'react';
import { HStack, Center, Text, Box, ScrollView, VStack } from 'native-base';
import { GolfCourse, GolfStrokes, Stroke } from '../types';
import { getColor, getColorType } from '../utils/golfUtils';
import { useUser } from '../hooks/useFireGet';

const sum = (arr: number[] | Stroke[]) => arr.map(e => Number(e)).reduce((prevVal, curVal) => prevVal + curVal);

const Tile = ({ num, color }: { num: Stroke | string, color: string }) => {
  return (
    <Center width="30" height="30" bg={color}>
      <Text>{num}</Text>
    </Center>
  );
};

interface ArrProps {
  text: string | undefined;
  arr: Array<number | null> | GolfStrokes;
  arrType?: 'Stroke' | 'Bet' | 'Par' | 'Hole' | 'Handicap';
  comparisonArr?: Array<number>;
};

const Row = ({ text, arr, arrType, comparisonArr }: ArrProps) => {
  if (!arr || arr.length != 18) return null;
  //console.log(text, arr, arrType, comparisonArr);
  
  const renderHalf = (half: number[] | Stroke[], compareHalf?: number[]) => {
    return half.map((num, i) => {
      const compareNumber = compareHalf ? compareHalf[i] : undefined;
      const colorType = getColorType({ num, arrType, compareNumber });
      return <Tile key={i} num={num} color={getColor(colorType)} />;
    });
  };

  const renderSumTile = (shouldSum: boolean, givenArr: number[] | Stroke[], givenCompareArr?: number[] | Stroke[]) => {
    const summation = shouldSum ? sum(givenArr) : null;
    const colorType = getColorType({
      num: summation,
      arrType,
      compareNumber: givenCompareArr ? sum(givenCompareArr) : undefined
    });
    return <Tile num={summation} color={getColor(colorType)} />;
  };

  const front = arr.slice(0, arr.length / 2);
  const back = arr.slice(arr.length / 2);
  const compareFront = comparisonArr ? comparisonArr.slice(0, comparisonArr.length / 2) : undefined;
  const compareBack = comparisonArr ? comparisonArr.slice(comparisonArr.length / 2) : undefined;

  const sumIfInList = ['Stroke', 'Bet', 'Par'];
  const shouldSum = !!sumIfInList.find(e => e === arrType);

  return (
    <HStack>
      <Center width={110} alignItems={"flex-end"} paddingRight={2}>
        <Text numberOfLines={1}>{text}</Text>
      </Center>

      {renderHalf(front, compareFront)}
      <Box marginX={3}>
        {renderSumTile(shouldSum, front, compareFront)}
      </Box>
      {renderHalf(back, compareBack)}
      <Box marginX={3}>
        {renderSumTile(shouldSum, back, compareBack)}
      </Box>
      {renderSumTile(shouldSum, arr, comparisonArr)}
    </HStack>
  );
};

interface UsersStrokesProps {
  usersStrokes: {
    [userId: string]: GolfStrokes;
  };
  course: GolfCourse | undefined;
};

const UsersStrokes = React.memo(({ usersStrokes, course }: UsersStrokesProps) => {
  if (!course) return null;

  const sortedStrokes = Object.entries(usersStrokes).sort();
  return (
    <VStack marginTop={5}>
      {sortedStrokes.map(([uid, strokes], i) => {
        // console.log(uid);
        // console.log(strokes)
        // console.log(course.parArr)
        const [user, userIsLoading] = useUser(uid);
        return (
          <Box key={uid}>
            <Row
              text={user?.name}
              arr={strokes}
              arrType='Stroke'
              comparisonArr={course.parArr}
            />
          </Box>
        );
      })}
    </VStack>
  );
});

interface UserScoresProps {
  userScores: (0 | -1 | 1 | null)[];
  uid: string;
  oppUid: string;
};

const UserScores = React.memo(({ userScores, uid, oppUid }: UserScoresProps) => {
  const [oppUser, oppUserIsLoading] = useUser(oppUid);
  return (
    <VStack marginTop={5}>
      <Row
        text={'You vs ' + oppUser?.name}
        arr={userScores}
        arrType='Bet'
      />
    </VStack>
  );
});

interface GolfArrayProps {
  course: GolfCourse | undefined;
  children?: React.ReactNode;
};

const GolfArray = React.memo(({ course, children }: GolfArrayProps) => {
  if (!course) return null;
  return (
    <ScrollView horizontal>
      <VStack>
        <Box marginBottom={"5"}>
          <Row text="Hole" arr={Array.from({ length: 18 }, (_, i) => i + 1)} arrType='Hole' />
        </Box>
        <Box>
          <Row text="Par" arr={course.parArr} arrType='Par' />
        </Box>
        <Box>
          <Row text="Handicap" arr={course.handicapIndexArr} arrType='Handicap' />
        </Box>
        {children}
      </VStack>
    </ScrollView>
  );
});
//   , function areEqual(prevProps, nextProps) {
//   return prevProps.course.id === nextProps.course.id && _.isEqual(prevProps.children, nextProps.children);
// });

export { GolfArray, UsersStrokes, UserScores, getColor, getColorType };