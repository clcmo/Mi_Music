const { ok, fail } = require('./result');
const { voiceGuard, withPlayingSession } = require('./guards');

// Users count tracks from 1; the queue is 0-based.
const toIndex = number => number - 1;

class QueueViewModel {
  constructor(playerRepository) {
    this.repository = playerRepository;
  }

  async list(ctx) {
    const denied = voiceGuard(ctx);
    if (denied) return denied;
    const session = this.repository.getSession(ctx.guildId);
    if (!session || !session.current) return fail('EMPTY_QUEUE');
    return ok('queue', session.snapshot());
  }

  nowPlaying(ctx) {
    return withPlayingSession(this.repository, ctx, s => ok('nowPlaying', s.progress()));
  }

  shuffle(ctx) {
    return withPlayingSession(this.repository, ctx, s => {
      s.shuffle();
      return ok('queue', s.snapshot());
    });
  }

  remove(ctx, number) {
    return withPlayingSession(this.repository, ctx, s => {
      const index = toIndex(number);
      if (!s.hasIndex(index)) return fail('INVALID_POSITION');
      const track = s.remove(index);
      return track ? ok('removed', { track }) : fail('UNKNOWN');
    });
  }

  move(ctx, track, position) {
    return withPlayingSession(this.repository, ctx, s => {
      const [from, to] = [toIndex(track), toIndex(position)];
      if (!s.hasIndex(from) || !s.hasIndex(to)) return fail('INVALID_POSITION');
      return ok('moved', { track: s.move(from, to) });
    });
  }

  swap(ctx, first, second) {
    return withPlayingSession(this.repository, ctx, s => {
      const [a, b] = [toIndex(first), toIndex(second)];
      if (a === b || !s.hasIndex(a) || !s.hasIndex(b)) return fail('INVALID_POSITION');
      const [t1, t2] = s.swap(a, b);
      return ok('swapped', { first: t1, second: t2 });
    });
  }
}

module.exports = { QueueViewModel };
