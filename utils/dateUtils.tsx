import { Timestamp } from 'firebase/firestore';
import _ from 'lodash';

export const formatData = (obj: { [key: string]: any }) => {
  for (const key in obj) {
    if (obj[key] instanceof Timestamp)
      obj[key] = obj[key].toDate();
    if (obj[key] instanceof Date)
      obj[key] = obj[key].toJSON();
  }
};