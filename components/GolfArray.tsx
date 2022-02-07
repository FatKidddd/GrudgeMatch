import _ from 'lodash';
import React, { useMemo } from 'react';
import { HStack, Center, Text, Box, ScrollView, VStack, Spinner } from 'native-base';
import { GolfCourse, GolfStrokes, Stroke } from '../types';
import { sum, getColor, getColorType } from '../utils/golfUtils';
import { useUser } from '../hooks/useFireGet';

const Tile = ({ num, color }: { num: Stroke | string, color: string }) => {
  return <Center width="30" height="30" bg={color}>{num}</Center>;
};

interface RowProps {
  text: string | undefined;
  arr: Array<number | null> | GolfStrokes;
  arrType?: 'Stroke' | 'Bet' | 'Par' | 'Hole' | 'Handicap';
  comparisonArr?: Array<number>;
  [key: string]: any;
};

const Row = React.memo(({ text, arr, arrType, comparisonArr, ...props }: RowProps) => {
  // console.log(text, arr, arrType, comparisonArr);
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

  const front = arr.slice(0, 9);
  const back = arr.slice(9);
  const compareFront = comparisonArr ? comparisonArr.slice(0, 9) : undefined;
  const compareBack = comparisonArr ? comparisonArr.slice(9) : undefined;

  const sumIfInList = ['Stroke', 'Bet', 'Par'];
  const shouldSum = !!sumIfInList.find(e => e === arrType);

  return (
    <HStack {...props}>
      <Center width={110} alignItems={"flex-end"} paddingRight={2}>
        <Text numberOfLines={1}>{text}</Text>
      </Center>

      {renderHalf(front, compareFront)}
      <Box marginX={3}>
        {renderSumTile(shouldSum, front, compareFront)}
      </Box>
      {back.length
        ? <>
          {renderHalf(back, compareBack)}
          <Box marginX={3}>
            {renderSumTile(shouldSum, back, compareBack)}
          </Box>
        </>
        : null}
      {renderSumTile(shouldSum, arr, comparisonArr)}
    </HStack>
  );
});

interface UserRowProps {
  uid: string;
  strokes: GolfStrokes;
  parArr: Array<number>;
}

const UserRow = React.memo(({ uid, strokes, parArr }: UserRowProps) => {
  const [user, userIsLoading] = useUser(uid);
  const paddedStrokes = strokes.slice();
  if (parArr.length > strokes.length)
    paddedStrokes.push(...new Array(parArr.length - strokes.length).fill(null));
  return (
    <Row
      text={user?.name}
      arr={paddedStrokes}
      arrType='Stroke'
      comparisonArr={parArr}
    />
  );
});

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
    <>
      {sortedStrokes.map(([uid, strokes], i) => <UserRow key={uid} uid={uid} strokes={strokes} parArr={course.parArr} />)}
    </>
  );
});

interface UserScoresProps {
  userScores: (0 | -1 | 1 | null)[];
  uid: string;
  oppUid: string;
  len: number;
};

const UserScores = React.memo(({ userScores, uid, oppUid, len }: UserScoresProps) => {
  const [oppUser, oppUserIsLoading] = useUser(oppUid);
  const paddedStrokes = userScores.slice();
  if (len > userScores.length)
    paddedStrokes.push(...new Array(len - userScores.length).fill(null));
  return (
    <Row
      text={'You vs ' + oppUser?.name}
      arr={paddedStrokes}
      arrType='Bet'
    />
  );
});

interface GolfArrayProps {
  course: GolfCourse | undefined;
  children?: React.ReactNode;
  showCourseInfo?: boolean;
};

// I've tried so many ways to fix the garbage performance of this, turns out the issue is that rendering new UI will not be memoized lol so when showing and hiding it kills everything
const GolfArray = React.memo(({ course, children, showCourseInfo=true }: GolfArrayProps) => {
  if (!course) return null;
  // console.log('rendered GolfArray');
  const numOfHoles = course.parArr.length;
  return (
    <ScrollView horizontal>
      <VStack>
        <Row text="Hole" arr={Array.from({ length: numOfHoles }, (_, i) => i + 1)} arrType='Hole' marginBottom={3}/>
        {showCourseInfo
          ? <>
            <Row text="Par" arr={course.parArr} arrType='Par' />
            <Row text="Handicap" arr={course.handicapIndexArr} arrType='Handicap' marginBottom={3}/>
          </>
          : null}
        {children}
      </VStack>
    </ScrollView>
  );
});

export { GolfArray, UsersStrokes, UserScores, getColor, getColorType };