export const getNameSpace = (id: number): null | string => {
  const games = ['Hangman'];
  return games[id];
};

export const delay = (time: number) =>
  // eslint-disable-next-line no-promise-executor-return
  new Promise((resolve) => setTimeout(resolve, time));
