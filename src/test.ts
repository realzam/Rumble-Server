interface Player {
  nick: string;
  online: boolean;
}

function nextLetterPlayer(p: Player[], turn: number) {
  const players = p.slice(0);
  let i = turn;
  do {
    const player = players[i];
    if (player.online) {
      const turnf = (i + 1) % players.length;
      console.log(turnf, player.nick);
      return true;
    }
    i += 1;
    if (i >= players.length) {
      i = 0;
    }
  } while (i !== turn);
  console.log('stoped');
  return false;
}

const playersCheck: Player[] = [
  { nick: 'A', online: false },
  { nick: 'B', online: false },
  { nick: 'C', online: false },
  { nick: 'D', online: false },
  { nick: 'E', online: false },
  { nick: 'F', online: false },
  { nick: 'G', online: false },
  { nick: 'H', online: false },
];

nextLetterPlayer(playersCheck, 1);
