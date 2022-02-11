import _ from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { HStack, Center, Text, Box, ScrollView, VStack, Spinner, FlatList, Input, Button } from 'native-base';
import { GolfCourse, GolfStrokes, Stroke } from '../types';
import { getColor, getColorType, padArr } from '../utils';
import { useUser } from '../hooks/useFireGet';
import { useAppDispatch, useAppSelector } from '../hooks/selectorAndDispatch';
import Defer from './Defer';
import { editCustomGolfCourseTile, setCustomGolfCourseArrLen } from '../redux/features/golfCourses';

interface TileProps {
  num: Stroke | string;
  color: string;
  style?: {
    [key: string]: any;
  };
};

const Tile = React.memo(({ num, color, style }: TileProps) => {
  return <Center width="30" height="30" bg={color} style={style}>{num}</Center>;
});

interface EditableTileProps extends TileProps {
  editableInfo: {
    arrName: 'parArr' | 'handicapIndexArr';
    idx: number;
  };
}

const EditableTile = React.memo(({ color, style, editableInfo }: EditableTileProps) => {
  const customGolfCourse = useAppSelector(state => state.golfCourses.customGolfCourse);
  const dispatch = useAppDispatch();

  const { arrName, idx } = editableInfo;
  const num = customGolfCourse[arrName][idx];

  return (
    <Center width="30" height="30" bg={color} style={style}>
      <Input
        bg='red.100'
        value={typeof num === 'number' ? num.toString() : undefined}
        onChangeText={(text) => dispatch(editCustomGolfCourseTile({ arrName, idx, val: Number(text) }))}
        keyboardType={'number-pad'}
      />
    </Center>
  );
});

export const EditableGolfArray = React.memo(() => {
  const customGolfCourse = useAppSelector(state => state.golfCourses.customGolfCourse);

  const numOfHoles = customGolfCourse.parArr.length;
  const res: FormatRowToTileDataProps[] = [
    {
      text: 'Hole',
      arr: Array.from({ length: numOfHoles }, (_, i) => i + 1),
      arrType: 'Hole',
      style: {
        marginBottom: 10
      }
    },
    {
      text: 'Par',
      arr: customGolfCourse.parArr,
      arrType: 'Par',
    },
    {
      text: 'Handicap',
      arr: customGolfCourse.handicapIndexArr,
      arrType: 'Handicap',
      style: {
        marginBottom: 10
      }
    }
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      horizontal
    >
      <VStack>
        <Row data={res[0]} />
        <Row data={res[1]} arrName='parArr' isEditable={true} />
        <Row data={res[2]} arrName='handicapIndexArr' isEditable={true} />
      </VStack>
    </ScrollView>
  );
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

interface UserRowProps {
  userName?: string;
  strokes: GolfStrokes;
  parArr: Array<number>;
}

export const UserRow = ({ userName, strokes, parArr }: UserRowProps) => {
  const paddedStrokes = padArr(strokes, parArr.length);
  const userRowData: FormatRowToTileDataProps = {
    text: userName,
    arr: paddedStrokes,
    arrType: 'Stroke',
    comparisonArr: parArr
  };
  return <Row data={userRowData} />;
};

interface UsersStrokesProps {
  usersStrokes: {
    [userId: string]: GolfStrokes;
  };
  course: GolfCourse | undefined;
};

export const UsersRow = ({ usersStrokes, course }: UsersStrokesProps) => {
  // console.log('rendered usersrowdata')
  const users = useAppSelector(state => state.users);
  const sortedStrokes = Object.entries(usersStrokes).sort();
  // const haveAllNames = sortedStrokes.every(([uid, _]) => Boolean(users[uid]))
  if (!course) return null;
  return (
    <Defer chunkSize={1}>
      {sortedStrokes.map(([uid, strokes], idx) =>
        <UserRow
          key={idx}
          userName={users[uid]?.name}
          strokes={strokes}
          parArr={course.parArr}
        />)}
    </Defer>
  );
};

interface UserScoresProps {
  userScores: (0 | -1 | 1 | null)[];
  oppUid: string;
  len: number;
};

export const UserScores = ({ userScores, oppUid, len }: UserScoresProps) => {
  // console.log('rendered userscoresdata');
  const [oppUser, oppUserIsLoading] = useUser(oppUid);
  const paddedStrokes = padArr(userScores, len);
  const userScoresData: FormatRowToTileDataProps = { 
    text: 'You vs ' + oppUser?.name,
    arr: paddedStrokes,
    arrType: 'Bet'
  };
  return <Row data={userScoresData} />;
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

interface RowProps {
  data: FormatRowToTileDataProps;
  arrName?: 'parArr' | 'handicapIndexArr';
  isEditable?: boolean;
}; 

const Row = React.memo(({ data, arrName, isEditable=false }: RowProps) => {
  const { text, style, ...withoutText } = data;
  const labelProps = { text, style };
  const rowData = formatRowToTileData({ ...withoutText, style });
  return (
    <HStack>
      <Label {...labelProps} />
      <Defer chunkSize={9}>
        {rowData.map((tileData, idx) =>
          isEditable && arrName
            ? <EditableTile
              key={idx}
              {...tileData}
              editableInfo={{ arrName, idx }}
            />
            : <Tile
              key={idx}
              {...tileData}
            />)}
      </Defer>
    </HStack>
  );
});

interface GolfArrayProps {
  course: GolfCourse | undefined;
  showCourseInfo?: boolean;
  // extraData?: FormatRowToTileDataProps[];
  children?: React.ReactNode;
  isEditable?: boolean;
};

export const GolfArray = React.memo(({ course, showCourseInfo = true, children }: GolfArrayProps) => {
  if (!course) return null;

  const res: FormatRowToTileDataProps[] = useMemo(() => {
    const numOfHoles = course.parArr.length;
    return [
      {
        text: 'Hole',
        arr: Array.from({ length: numOfHoles }, (_, i) => i + 1),
        arrType: 'Hole',
        style: {
          marginBottom: 10
        }
      },
      {
        text: 'Par',
        arr: course?.parArr,
        arrType: 'Par',
      },
      {
        text: 'Handicap',
        arr: course?.handicapIndexArr,
        arrType: 'Handicap',
        style: {
          marginBottom: 10
        }
      }
    ];
  }, [course]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      horizontal
    >
      <VStack>
        <Row data={res[0]} />
        {showCourseInfo && <Row data={res[1]} />}
        {showCourseInfo && <Row data={res[2]} />}
        {children}
      </VStack>
    </ScrollView>
  );
});

// , (prevProps, nextProps) => {
//   const { course: prevCourse, ...prevRest } = prevProps;
//   const { course: nextCourse, ...nextRest } = nextProps;
//   return prevCourse?.id === nextCourse?.id && prevRest === nextRest;
// });

  // console.log('rendered GolfArray');
  // const { parArr, handicapIndexArr, ...courseRest } = course;
  // console.log('\n')
  // console.log('new')
  // // console.log(courseRest, ...parArr, ...handicapIndexArr)
  // console.log('\n')
  // if (extraData) {
  //   extraData.forEach(e => {
  //     const { arr, comparisonArr, ...rest } = e;
  //     const b = comparisonArr ? comparisonArr : [];
  //     console.log(rest, ...arr, ...b);
  //   })
  // } else {
  //   console.log(extraData);
  // }
  // console.log('\n')