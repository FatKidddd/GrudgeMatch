import _ from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { HStack, Center, Text, Box, ScrollView, VStack, Spinner, FlatList } from 'native-base';
import { GolfCourse, GolfStrokes, Stroke } from '../types';
import { getColor, getColorType } from '../utils/golfUtils';
import { useUser } from '../hooks/useFireGet';
import { useAppSelector } from '../hooks/selectorAndDispatch';

interface TileProps {
  num: Stroke | string;
  color: string;
  style?: {
    [key: string]: any;
  };
};

const Tile = React.memo(({ num, color, style }: TileProps) => {
  return <Box width="30" height="30" bg={color} justifyContent='center' alignItems={'center'} style={style}>{num}</Box>;
});

type ArrType = 'Stroke' | 'Bet' | 'Par' | 'Hole' | 'Handicap';

interface FormatRowToTileDataProps {
  text?: string | null;
  arr: Array<number | null> | GolfStrokes;
  arrType?: ArrType;
  comparisonArr?: Array<number | null>;
  style?: {
    [key: string]: any;
  };
};

const sumFrom = (arr: (number | null | undefined)[] | undefined, idx1: number, idx2: number) => {
  let res = 0;
  if (!arr) return res;
  for (let i = idx1; i < Math.min(arr.length, idx2); i++)
    if (typeof arr[i] === 'number')
      res += arr[i] as number;
  return res;
};

const formatRowToTileData = ({ text, arr, arrType, comparisonArr, style }: FormatRowToTileDataProps) => {
  const sumIfInList = ['Stroke', 'Bet', 'Par'];
  const shouldSum = !!sumIfInList.find(e => e === arrType);
  const sumArr = [sumFrom(arr, 0, 9), sumFrom(arr, 9, 18)];
  const sumArrTotal = sumArr[0] + sumArr[1];
  const sumComparisonArr = [sumFrom(comparisonArr, 0, 9), sumFrom(comparisonArr, 9, 18)];
  const sumComparisonArrTotal = sumComparisonArr[0] + sumComparisonArr[1];

  const res = [];
  arr.forEach((num, i) => {
    // tile data
    res.push({
      num,
      color: getColor(getColorType({
        num,
        arrType,
        compareNumber: comparisonArr ? comparisonArr[i] : undefined
      })),
      style
    });

    // subtotal sum tile
    if ((i + 1) % 9 === 0) { 
      res.push({
        num: shouldSum ? sumArr[(i + 1) / 9 - 1] : null,
        color: getColor(getColorType({
          num: shouldSum ? sumArr[(i + 1) / 9 - 1] : null,
          arrType,
          compareNumber: shouldSum ? sumComparisonArr[(i + 1) / 9 - 1] : undefined
        })),
        style: {
          ...style,
          marginHorizontal: 10
        }
      });
    }
  });

  // total sum tile
  res.push({
    num: shouldSum ? sumArrTotal : null,
    color: getColor(getColorType({
      num: shouldSum ? sumArrTotal : null,
      arrType,
      compareNumber: shouldSum ? sumComparisonArrTotal : undefined
    })),
    style: {
      ...style,
      marginHorizontal: 10
    }
  });

  return res;
};

const padArr = (arr: any[], finalLen: number) => {
  const len = arr.length;
  if (finalLen <= len) return arr;
  return [...arr.slice(), ...new Array(finalLen - len).fill(null)];
};

interface UserRowProps {
  userName?: string;
  strokes: GolfStrokes;
  parArr: Array<number>;
}

const getUserRowData = ({ userName, strokes, parArr }: UserRowProps): FormatRowToTileDataProps => {
  const paddedStrokes = padArr(strokes, parArr.length);
  return {
    text: userName,
    arr: paddedStrokes,
    arrType: 'Stroke',
    comparisonArr: parArr
  };
};

interface UsersStrokesProps {
  usersStrokes: {
    [userId: string]: GolfStrokes;
  };
  course: GolfCourse | undefined;
};

const useUsersRowData = ({ usersStrokes, course }: UsersStrokesProps): FormatRowToTileDataProps[] => {
  const users = useAppSelector(state => state.users);
  const sortedStrokes = Object.entries(usersStrokes).sort();
  if (!course || !sortedStrokes.every(([uid, _]) => Boolean(users[uid]))) return [];
  return sortedStrokes.map(([uid, strokes], i) => getUserRowData({
    userName: users[uid]?.name,
    strokes,
    parArr: course.parArr
  }));
};

interface UserScoresProps {
  userScores: (0 | -1 | 1 | null)[];
  oppUid: string;
  len: number;
};

const useUserScoresData = ({ userScores, oppUid, len }: UserScoresProps): FormatRowToTileDataProps[] => {
  const [oppUser, oppUserIsLoading] = useUser(oppUid);
  const paddedStrokes = padArr(userScores, len);
  return [{ 
    text: 'You vs ' + oppUser?.name,
    arr: paddedStrokes,
    arrType: 'Bet'
  }];
};

interface GolfArrayProps {
  course: GolfCourse | undefined;
  showCourseInfo?: boolean;
  extraData?: FormatRowToTileDataProps[];
};

// I've tried so many ways to fix the garbage performance of this, turns out the issue is that rendering new UI will not be memoized lol so when showing and hiding it kills everything
// rewrote the whole thing to use flatlist but still not improvement
interface Label {
  text: (string | null | undefined);
  style?: {
    [key: string]: any;
  };
};

const Label = React.memo(({ text, style }: Label) => {
  return <Text numberOfLines={1} width={110} height={30} textAlign='right' paddingRight={2} style={style}>{text}</Text>
});

const GolfArray = React.memo(({ course, showCourseInfo=true, extraData }: GolfArrayProps) => {
  if (!course) return null;
  console.log('rendered GolfArray');
  const numOfHoles = course.parArr.length;
  const holes = Array.from({ length: numOfHoles }, (_, i) => i + 1);

  const labels: Label[] = [];
  const body: TileProps[] = [];

  const allocateData = (data: FormatRowToTileDataProps) => {
    const { text, style, ...withoutText } = data;
    labels.push({ text, style });
    const rowData = formatRowToTileData({ ...withoutText, style });
    body.push(...rowData);
  };
  
  const res: FormatRowToTileDataProps[] = [
    {
      text: 'Hole',
      arr: holes,
      arrType: 'Hole',
      style: {
        marginBottom: 10
      }
    },
    {
      text: 'Par',
      arr: course.parArr,
      arrType: 'Par',
    },
    {
      text: 'Handicap',
      arr: course.handicapIndexArr,
      arrType: 'Handicap',
      style: {
        marginBottom: 10
      }
    },
  ];

  allocateData(res[0]);

  if (showCourseInfo) {
    allocateData(res[1]);
    allocateData(res[2]);
  }

  extraData?.forEach((val, idx) => {
    allocateData(val);
  });

  const renderLabel = useCallback(({ item }: { item: Label }) => <Label {...item} />, []);

  const renderBody = useCallback(({ item }: { item: TileProps }) => <Tile {...item} />, []);

  return null;
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      horizontal
      removeClippedSubviews={true}
      flex={1}
    >
      <FlatList
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={labels}
        renderItem={renderLabel}
        keyExtractor={(item, idx) => 'labels' + course.id + idx.toString()}
        scrollEnabled={false}
        listKey={'labels' + course.id}
      />
      <FlatList
        contentContainerStyle={{ alignSelf: 'flex-start' }}
        numColumns={numOfHoles + Math.floor(numOfHoles / 9) + 1} // flex-wrap
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={body}
        renderItem={renderBody}
        keyExtractor={(item, idx) => 'body' + course.id + idx.toString()}
        scrollEnabled={false}
        listKey={'body' + course.id}
      />
    </ScrollView>
  );
}, (prevProps, nextProps) => {
  return prevProps.course?.id === nextProps.course?.id && prevProps.extraData === nextProps.extraData && prevProps.showCourseInfo === nextProps.showCourseInfo;
});

export { GolfArray, getUserRowData, useUsersRowData, useUserScoresData };