import React from 'react';
import { HStack, Center, Text, Box, ScrollView, VStack } from 'native-base';
import { GolfCourse, GolfStrokes } from '../types';
import userSelector from '../utils/userUtils';

interface GolfArrayProps {
  course: GolfCourse;
  usersStrokes?: {
    [userId: string]: GolfStrokes;
  };
};

const GolfArray = ({ course, usersStrokes }: GolfArrayProps) => {
  const renderArr = (text: string, arr: Array<number> | GolfStrokes, parArr: Array<number> | undefined = undefined) => {
    if (!arr || arr.length != 18) return null;
    //console.log(text, arr)
    return (
      <HStack>
        <Center width={90} alignItems={"flex-end"} paddingRight={2}>
          <Text numberOfLines={1}>{text}</Text>
        </Center>
        {arr.map((num, i) => {
          let bg = 'blue.100';
          if (parArr&&num) {
            if (num < parArr[i]) bg = 'green.100';
            else if (num === parArr[i]) bg = 'red.100';
          }
          return (
            <Center key={i} width="30" height="30" bg={bg}>
              <Text>{num}</Text>
            </Center>
          );
        })}
      </HStack>
    );
  };

  const UsersStrokes = () => {
    if (!usersStrokes) return null;
    const sortedStrokes = Object.entries(usersStrokes).sort();
    return (
      <VStack marginTop={5}>
        {sortedStrokes.map(([uid, strokes], i) => {
          return (
            <Box key={uid}>{renderArr(userSelector(uid).name, strokes, course.parArr)}</Box>
          );
        })}
      </VStack>
    );
  };

  return (
    <Box padding={5} rounded={20} bg={'white'}>
      <ScrollView horizontal>
        <VStack>
          <Box marginBottom={"5"}>{renderArr("Holes", Array.from({ length: 18 }, (_, i) => i + 1))}</Box>
          <Box>{renderArr("Par", course.parArr)}</Box>
          <Box>{renderArr("Handicap", course.handicapIndexArr)}</Box>
          <UsersStrokes />
        </VStack>
      </ScrollView>
    </Box>
  );
};

export default GolfArray;