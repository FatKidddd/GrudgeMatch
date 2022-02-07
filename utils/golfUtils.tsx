import _ from 'lodash'
import { GolfCourse, GolfGame, GolfStrokes, Stroke } from "../types";

interface GetBetScores {
  userId: string,
  oppUid: string,
  course: GolfCourse;
  room: GolfGame;
};

export const sum = (arr: number[] | Stroke[]) => arr.length ? arr.map(e => Number(e)).reduce((prevVal, curVal) => prevVal + curVal) : 0;

export const getBetScores = ({ userId, oppUid, course, room }: GetBetScores) => {
  const roomHoleLimit = course.parArr.length;
  const userScores = room.usersStrokes[userId];
  const oppScores = room.usersStrokes[oppUid];
  const ids = [oppUid, userId].sort();
  const handicapInfo = room.pointsArr[ids[0] + '+' + ids[1]];
  const handicapIndexArr = course.handicapIndexArr;

  const trueGive = Number(ids[0] === oppUid) ^ Number(handicapInfo.give); // userId gives or takes, give == 1, take == 0

  const holes = Array.from({ length: roomHoleLimit }, (_, i) => i + 1);

  const frontHoles = holes.slice(0, 9);
  const backHoles = holes.slice(9);

  const compareFn = (holeA: number, holeB: number) => {
    const handicapA = handicapIndexArr[holeA - 1];
    const handicapB = handicapIndexArr[holeB - 1];
    return handicapA > handicapB ? -1 : handicapA < handicapB ? 1 : 0;
  };
  // console.log(frontHoles.sort(compareFn), backHoles.sort(compareFn));

  const sortedFrontHoles = frontHoles.sort(compareFn).slice(0, handicapInfo.frontCount);
  const sortedBackHoles = backHoles.sort(compareFn).slice(0, handicapInfo.backCount);

  // console.log(neededFrontHoles, neededBackHoles);
  
  const set = new Set();
  for (let i = 0; i < Math.min(handicapInfo.frontCount, sortedFrontHoles.length); i++) set.add(sortedFrontHoles[i]);
  for (let i = 0; i < Math.min(handicapInfo.backCount, sortedBackHoles.length); i++) set.add(sortedBackHoles[i]);
  
  const pairScores = [userScores.slice(), oppScores.slice()];
  for (let i = 0; i < pairScores[trueGive].length; i++) {
    const val = pairScores[trueGive][i];
    if (val != null && set.has(i + 1)) // if stroke has been made and the hole is handicapped
      pairScores[trueGive][i] = val - 1;
  }

  // console.log(pairScores)

  const finalScores = _.zip(...pairScores).map(pair => {
    if (pair[0] == undefined || pair[1] == undefined) return null;
    return pair[0] < pair[1] ? 1 : pair[0] > pair[1] ? -1 : 0
  });

  // console.log(finalScores);

  const finalScore = sum(finalScores);
  return { finalScore, finalScores };
};


interface GetColorTypeProps {
  num: Stroke;
  arrType?: 'Stroke' | 'Bet' | 'Par' | 'Hole' | 'Handicap';
  compareNumber?: number | null;
};

export const getColorType = ({ num, arrType, compareNumber }: GetColorTypeProps) => {
  if (typeof num !== 'number') return 0;
  switch (arrType) {
    case 'Stroke':
      // comparisonArr is par arr
      if (compareNumber == null || compareNumber == undefined) return 0;
      if (num < compareNumber) return 3;
      else if (num === compareNumber) return 1;
      return 0;
    case 'Bet':
      if (num > 0) return 1;
      else if (num < 0) return 2;
      return 0;
  };
  return 0;
};

export const getColor = (colorType: number) => {
  switch (colorType) {
    case 1:
      return 'green.200';
    case 2:
      return 'red.200';
    case 3:
      return 'green.500';
    default:
      return 'gray.100';
  }
};

export const getUserHoleNumber = (arr: GolfStrokes) => {
  if (!arr) return -1;
  let i = 0;
  for (; i < arr.length; i++) {
    if (arr[i] == null) break;
  }
  return i + 1;
};