import _, { uniqueId } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { HStack, Center, Text, Box, ScrollView, VStack, Spinner, FlatList } from 'native-base';
import { GolfCourse, GolfStrokes, Stroke } from '../types';
import { sum, getColor, getColorType } from '../utils/golfUtils';
import { useUser } from '../hooks/useFireGet';

interface TileProps {
  num: Stroke | string;
  color: string;
  [key: string]: any;
};

const Tile = React.memo(({ num, color, ...props }: TileProps) => {
  return <Box width="30" height="30" bg={color} justifyContent='center' alignItems={'center'} {...props}>{num}</Box>;
});

type ArrType = 'Stroke' | 'Bet' | 'Par' | 'Hole' | 'Handicap';

// interface HalfProps {
//   half: number[] | Stroke[];
//   compareHalf?: number[];
//   arrType?: ArrType;
// };

// const Half = React.memo(({ half, compareHalf, arrType }: HalfProps) => {
//   console.log('rendered half');
//   return (
//     <>
//       {half.map((num, i) => {
//         const compareNumber = compareHalf ? compareHalf[i] : undefined;
//         const colorType = getColorType({ num, arrType, compareNumber });
//         return <Tile key={i} num={num} color={getColor(colorType)} />;
//       })}
//     </>
//   );
// });

// interface SumTileProps {
//   shouldSum: boolean;
//   givenArr: number[] | Stroke[];
//   givenCompareArr?: number[] | Stroke[];
//   arrType?: ArrType;
//   [key: string]: any;
// };

// const SumTile = React.memo(({ shouldSum, givenArr, givenCompareArr, arrType, ...props }: SumTileProps) => {
//   const summation = shouldSum ? sum(givenArr) : null;
//   const colorType = getColorType({
//     num: summation,
//     arrType,
//     compareNumber: givenCompareArr ? sum(givenCompareArr) : undefined
//   });
//   return <Tile num={summation} color={getColor(colorType)} {...props} />;
// });

interface RowProps {
  text: string | undefined;
  arr: Array<number | null> | GolfStrokes;
  arrType?: ArrType;
  comparisonArr?: Array<number | null>;
  [key: string]: any;
};

const sumIfInList = ['Stroke', 'Bet', 'Par'];

const sumFrom = (arr: (number | null | undefined)[] | undefined, idx1: number, idx2: number) => {
  let res = 0;
  if (!arr) return res;
  for (let i = idx1; i < Math.min(arr.length, idx2); i++)
    if (typeof arr[i] === 'number')
      res += arr[i] as number;
  return res;
};

const Row = React.memo(({ text, arr, arrType, comparisonArr, ...props }: RowProps) => {
  const shouldSum = !!sumIfInList.find(e => e === arrType);
  const sumArr = [sumFrom(arr, 0, 9), sumFrom(arr, 9, 18)];
  const sumArrTotal = sumArr[0] + sumArr[1];
  const sumComparisonArr = [sumFrom(comparisonArr, 0, 9), sumFrom(comparisonArr, 9, 18)];
  const sumComparisonArrTotal = sumComparisonArr[0] + sumComparisonArr[1];

  const body = useMemo(() => {
    // console.log('rendered body');
    const res: JSX.Element[] = [];
    arr.forEach((num, i) => {
      const compareNumber = comparisonArr ? comparisonArr[i] : undefined;
      const colorType = getColorType({ num, arrType, compareNumber });
      res.push(<Tile key={i} num={num} color={getColor(colorType)} />);
      if ((i + 1) % 9 === 0) {
        res.push(
          <Tile
            key={'sum' + i}
            num={shouldSum ? sumArr[(i + 1) / 9 - 1] : null}
            color={getColor(getColorType({
              num: shouldSum ? sumArr[(i + 1) / 9 - 1] : null,
              arrType,
              compareNumber: shouldSum ? sumComparisonArr[(i + 1) / 9 - 1] : undefined
            }))}
            marginX={3}
          />
        )
      }
    });
    return res;
  }, [arr, comparisonArr]);

  return (
    <HStack {...props}>
      <Text numberOfLines={1} width={110} textAlign='right' paddingRight={2}>{text}</Text>
      {body}
      <Tile
        num={shouldSum ? sumArrTotal : null}
        color={getColor(getColorType({
          num: shouldSum ? sumArrTotal : null,
          arrType,
          compareNumber: shouldSum ? sumComparisonArrTotal : undefined
        }))}
      />
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
  const renderItem = useCallback(([uid, strokes], i) =>
    <UserRow key={uid} uid={uid} strokes={strokes} parArr={course.parArr} />
  , []);
  return <>{sortedStrokes.map(renderItem)}</>;
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
  const holes = Array.from({ length: numOfHoles }, (_, i) => i + 1);
  return (
    <ScrollView horizontal>
      {/* <FlatList
        data={Array.from({ length: 200 }, (_, i) => i + 1)}
        renderItem={({ item }) => <Text>{item}</Text>}
        keyExtractor={(item) => item}
        horizontal={true}
        scrollEnabled={false}
      /> */}
      <VStack>
        <Row text="Hole" arr={holes} arrType='Hole' marginBottom={3}/>
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