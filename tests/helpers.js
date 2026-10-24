// Fakes: the whole point of MVVM here is that ViewModels run without Discord.
const ctx = (overrides = {}) => ({
  guildId: 'g1',
  user: { username: 'milla' },
  voiceChannelId: 'v1',
  botVoiceChannelId: null,
  permissions: { canBan: true, canManageMessages: true },
  ...overrides,
});

const track = title => ({ title });

function fakeSession(overrides = {}) {
  const calls = [];
  const session = {
    calls,
    isPlaying: true,
    current: track('Song A'),
    size: 3,
    hasIndex: i => Number.isInteger(i) && i >= 0 && i < 3,
    pause: () => true,
    resume: () => true,
    skip: () => true,
    setVolume: v => (calls.push(['volume', v]), true),
    setRepeatMode: () => true,
    destroy: () => calls.push(['destroy']),
    move: () => track('Moved'),
    swap: () => [track('One'), track('Two')],
    remove: () => track('Gone'),
    add: (found, opts) => calls.push(['add', opts]),
    playIfIdle: async () => calls.push(['play']),
    ...overrides,
  };
  return session;
}

const fakeRepo = (session, extra = {}) => ({
  getSession: () => session,
  search: async () => ({ isPlaylist: false, tracks: [track('x')] }),
  openSession: async () => session,
  ...extra,
});

module.exports = { ctx, track, fakeSession, fakeRepo };
