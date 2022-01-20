import _ from 'lodash'
import { GolfCourse, GolfGame, GolfStrokes, Stroke } from "../types";

interface GetBetScores {
  userId: string,
  oppUid: string,
  course: GolfCourse;
  room: GolfGame;
};

export const getBetScores = ({ userId, oppUid, course, room }: GetBetScores) => {
  const userScores = room.usersStrokes[userId];
  const oppScores = room.usersStrokes[oppUid];
  const ids = [oppUid, userId].sort();
  const handicapInfo = room.pointsArr[ids[0] + '+' + ids[1]];
  const handicapIndexArr = course.handicapIndexArr;

  const trueGive = Number(ids[0] === oppUid) ^ Number(handicapInfo.give); // userId gives or takes, give == 1, take == 0

  const frontHoles = handicapIndexArr.slice(0, handicapIndexArr.length / 2);
  const backHoles = handicapIndexArr.slice(handicapIndexArr.length / 2);

  const compareFn = (a: number, b: number) => a > b ? -1 : a < b ? 1 : 0;
  const neededFrontHoles = frontHoles.sort(compareFn).slice(handicapInfo.frontCount);
  const neededBackHoles = backHoles.sort(compareFn).slice(handicapInfo.backCount);
  
  const set = new Set();
  for (const val of neededFrontHoles) set.add(val);
  for (const val of neededBackHoles) set.add(val);

  const pairScores = [userScores.slice(), oppScores.slice()];
  for (let i = 0; i < pairScores[trueGive].length; i++) {
    const val = pairScores[trueGive][i];
    if (val != null && set.has(handicapIndexArr[i]))
      pairScores[trueGive][i] = val - 1;
  }

  const finalScores = _.zip(...pairScores).map(pair => {
    if (pair[0] == undefined || pair[1] == undefined) return null;
    return pair[0] < pair[1] ? 1 : pair[0] > pair[1] ? -1 : 0
  });

  const sum = (arr: number[] | Stroke[]) => arr.map(e => Number(e)).reduce((prevVal, curVal) => prevVal + curVal);
  const finalScore = sum(finalScores);
  return { finalScore, finalScores };
};


interface GetColorTypeProps {
  num: Stroke;
  arrType?: 'Stroke' | 'Bet' | 'Par' | 'Hole' | 'Handicap';
  compareNumber?: number;
};

export const getColorType = ({ num, arrType, compareNumber }: GetColorTypeProps) => {
  if (num == null || num == undefined) return 0;
  switch (arrType) {
    case 'Stroke':
      // comparisonArr is par arr
      if (compareNumber == null || compareNumber == undefined) return 0;
      if (num < compareNumber) return 2;
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
      return 'green.100';
    case 2:
      return 'red.100';
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