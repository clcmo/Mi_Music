/**
 * Domain wrapper around a discord-player v7 GuildQueue.
 * Everything the ViewModels know about playback goes through this class
 * and returns plain data (TrackInfo), never library objects.
 */
const toTrackInfo = track => ({
  title: track.title,
  url: track.url,
  duration: track.duration,
  requestedBy: track.requestedBy?.username ?? null,
});

class QueueSession {
  constructor(queue) {
    this.queue = queue;
  }

  /** True while a track is playing, paused or buffering (v7's isPlaying() is false when paused). */
  get isPlaying() {
    return Boolean(this.queue.currentTrack) && !this.queue.node.isIdle();
  }
  get current() {
    return this.queue.currentTrack ? toTrackInfo(this.queue.currentTrack) : null;
  }
  get size() {
    return this.queue.tracks.size;
  }
  hasIndex(index) {
    return Number.isInteger(index) && index >= 0 && index < this.size;
  }

  add(found, { top = false } = {}) {
    if (!top) return void this.queue.addTrack(found.isPlaylist ? found.tracks : found.tracks[0]);
    const tracks = found.isPlaylist ? found.tracks : [found.tracks[0]];
    tracks.forEach((track, i) => this.queue.insertTrack(track, i)); // keeps playlist order at the top
  }
  async playIfIdle() {
    if (this.queue.node.isIdle()) await this.queue.node.play();
  }

  pause() {
    return this.queue.node.pause();
  }
  resume() {
    return this.queue.node.resume();
  }
  skip() {
    return this.queue.node.skip();
  }
  setVolume(volume) {
    return this.queue.node.setVolume(volume);
  }
  setRepeatMode(mode) {
    this.queue.setRepeatMode(mode);
    return true;
  }
  shuffle() {
    this.queue.tracks.shuffle();
  }
  destroy() {
    this.queue.delete();
  }

  remove(index) {
    const track = this.queue.removeTrack(index);
    return track ? toTrackInfo(track) : null;
  }
  move(from, to) {
    const track = this.queue.tracks.at(from);
    this.queue.moveTrack(from, to);
    return toTrackInfo(track);
  }
  swap(a, b) {
    const [first, second] = [this.queue.tracks.at(a), this.queue.tracks.at(b)];
    this.queue.swapTracks(a, b);
    return [toTrackInfo(first), toTrackInfo(second)];
  }

  snapshot() {
    return { current: this.current, upcoming: this.queue.tracks.toArray().map(toTrackInfo) };
  }
  progress() {
    return {
      current: this.current,
      percent: this.queue.node.getTimestamp()?.progress ?? 0,
      bar: this.queue.node.createProgressBar() ?? '',
    };
  }
}

module.exports = { QueueSession, toTrackInfo };
