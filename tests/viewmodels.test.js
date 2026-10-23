const test = require('node:test');
const assert = require('node:assert/strict');
const { ctx, fakeSession, fakeRepo } = require('./helpers');
const { PlaybackViewModel } = require('../src/viewmodels/PlaybackViewModel');
const { QueueViewModel } = require('../src/viewmodels/QueueViewModel');
const { ModerationViewModel } = require('../src/viewmodels/ModerationViewModel');

test('voice guard: user outside any voice channel', async () => {
  const vm = new PlaybackViewModel(fakeRepo(fakeSession()));
  assert.deepEqual(await vm.pause(ctx({ voiceChannelId: null })), { ok: false, error: 'NOT_IN_VOICE' });
});

test('voice guard: user in a different channel than the bot', async () => {
  const vm = new PlaybackViewModel(fakeRepo(fakeSession()));
  const result = await vm.skip(ctx({ botVoiceChannelId: 'other' }));
  assert.equal(result.error, 'NOT_IN_BOT_VOICE');
});

test('nothing playing', async () => {
  const vm = new PlaybackViewModel(fakeRepo(fakeSession({ isPlaying: false })));
  assert.equal((await vm.pause(ctx())).error, 'NOT_PLAYING');
});

test('skip reports the skipped track', async () => {
  const vm = new PlaybackViewModel(fakeRepo(fakeSession()));
  const result = await vm.skip(ctx());
  assert.equal(result.type, 'skipped');
  assert.equal(result.data.track.title, 'Song A');
});

test('volume is clamped to 0-200', async () => {
  const session = fakeSession();
  const vm = new PlaybackViewModel(fakeRepo(session));
  assert.equal((await vm.setVolume(ctx(), 999)).data.volume, 200);
  assert.equal((await vm.setVolume(ctx(), -5)).data.volume, 0);
});

test('play: no results', async () => {
  const vm = new PlaybackViewModel(fakeRepo(fakeSession(), { search: async () => null }));
  assert.equal((await vm.play(ctx(), 'zzz')).error, 'NO_RESULTS');
});

test('play: cannot join the voice channel', async () => {
  const vm = new PlaybackViewModel(
    fakeRepo(fakeSession(), {
      openSession: async () => {
        throw new Error('nope');
      },
    }),
  );
  assert.equal((await vm.play(ctx(), 'x')).error, 'CANNOT_JOIN');
});

test('playtop adds on top and fires hooks in order', async () => {
  const session = fakeSession();
  const events = [];
  const vm = new PlaybackViewModel(fakeRepo(session));
  const result = await vm.play(ctx(), 'x', {
    top: true,
    onSearching: () => events.push('searching'),
    onLoading: () => events.push('loading'),
  });
  assert.equal(result.type, 'started');
  assert.deepEqual(events, ['searching', 'loading']);
  assert.deepEqual(session.calls, [['add', { top: true }], ['play']]);
});

test('queue: positions are validated (1-based input)', async () => {
  const vm = new QueueViewModel(fakeRepo(fakeSession()));
  assert.equal((await vm.remove(ctx(), 0)).error, 'INVALID_POSITION');
  assert.equal((await vm.remove(ctx(), 4)).error, 'INVALID_POSITION');
  assert.equal((await vm.remove(ctx(), 3)).type, 'removed');
  assert.equal((await vm.move(ctx(), 1, 9)).error, 'INVALID_POSITION');
  assert.equal((await vm.swap(ctx(), 2, 2)).error, 'INVALID_POSITION');
  assert.equal((await vm.swap(ctx(), 1, 2)).type, 'swapped');
});

test('moderation: permissions and purge range', async () => {
  const repo = { ban: async () => {}, purge: async () => {} };
  const vm = new ModerationViewModel(repo);
  const nobody = ctx({ permissions: { canBan: false, canManageMessages: false } });
  assert.equal((await vm.ban(nobody, { username: 'x' })).error, 'NO_PERMISSION');
  assert.equal((await vm.purge(nobody, 10)).error, 'NO_PERMISSION');
  assert.equal((await vm.purge(ctx(), 1)).error, 'INVALID_COUNT');
  assert.equal((await vm.purge(ctx(), 101)).error, 'INVALID_COUNT');
  assert.equal((await vm.purge(ctx(), 50)).type, 'purged');
  assert.equal((await vm.ban(ctx(), { username: 'x' })).type, 'banned');
});
