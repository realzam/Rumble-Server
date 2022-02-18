import { gamesTypes } from '../types/types';

const getNameSpace = (id: number): null | string => {
  return gamesTypes[id].namespace;
};

const getNameSpace2 = () => {};

export { getNameSpace, getNameSpace2 };
