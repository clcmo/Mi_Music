const test = require('node:test');
const assert = require('node:assert/strict');
const { QueueSession } = require('../src/models/QueueSession');

const t = title => ({ title, url: `u/${title}`, duration: '1:00', requestedBy: { username: 'milla' } });

function fakeQueue({ idle = false, current = t('A'), tracks = [t('B'), t('C'), t('D')] } = {}) {
  const calls = [];
  return {
    calls,
    currentTrack: current,
    tracks: { size: tracks.length, at: i => tracks[i], toArray: () => tracks, shuffle: () => calls.push(['shuffle']) },
    node: { isIdle: () => idle, play: async () => calls.push(['play']), pause: () => true, getTimestamp: () => ({ progress: 42 }), createProgressBar: () => '▬▬🔘▬' },
    addTrack: x => calls.push(['addTrack', x]),
    insertTrack: (x, i) => calls.push(['insertTrack', x.title, i]),
    removeTrack: i => tracks[i],
    moveTrack: (a, b) => calls.push(['move', a, b]),
    swapTracks: (a, b) => calls.push(['swap', a, b]),
    setRepeatMode: m => calls.push(['repeat', m]),
    delete: () => calls.push(['delete']),
  };
}

test('isPlaying: paused counts as active, idle or empty does not', () => {
  assert.equal(new QueueSession(fakeQueue()).isPlaying, true);
  assert.equal(new QueueSession(fakeQueue({ idle: true })).isPlaying, false);
  assert.equal(new QueueSession(fakeQueue({ current: null })).isPlaying, false);
});

test('add on top keeps playlist order', () => {
  const q = fakeQueue();
  new QueueSession(q).add({ isPlaylist: true, tracks: [t('X'), t('Y')] }, { top: true });
  assert.deepEqual(q.calls, [['insertTrack', 'X', 0], ['insertTrack', 'Y', 1]]);
});

test('add at the end sends a single track or the whole playlist', () => {
  const q = fakeQueue();
  const s = new QueueSession(q);
  s.add({ isPlaylist: false, tracks: [t('X'), t('Y')] });
  s.add({ isPlaylist: true, tracks: [t('P1'), t('P2')] });
  assert.equal(q.calls[0][1].title, 'X');
  assert.equal(q.calls[1][1].length, 2);
});

test('playIfIdle only starts an idle queue', async () => {
  const busy = fakeQueue();
  await new QueueSession(busy).playIfIdle();
  assert.deepEqual(busy.calls, []);
  const idle = fakeQueue({ idle: true });
  await new QueueSession(idle).playIfIdle();
  assert.deepEqual(idle.calls, [['play']]);
});

test('move, swap, snapshot and progress return plain data', () => {
  const q = fakeQueue();
  const s = new QueueSession(q);
  assert.equal(s.move(0, 2).title, 'B');
  assert.deepEqual(s.swap(0, 1).map(x => x.title), ['B', 'C']);
  assert.deepEqual(s.snapshot().upcoming.map(x => x.title), ['B', 'C', 'D']);
  assert.deepEqual([s.progress().percent, s.progress().bar], [42, '▬▬🔘▬']);
  assert.deepEqual(q.calls, [['move', 0, 2], ['swap', 0, 1]]);
});
