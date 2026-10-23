const { Player, QueryType } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const { YoutubeExtractor } = require('discord-player-youtubei');
const { QueueSession, toTrackInfo } = require('./QueueSession');

class PlayerRepository {
  constructor(client) {
    this.player = new Player(client);
  }

  /** discord-player v7 ships no sources by default: load them before the bot logs in. */
  async init() {
    await this.player.extractors.loadMulti(DefaultExtractors);
    await this.player.extractors.register(YoutubeExtractor, {});
  }

  /** @returns {{isPlaylist: boolean, tracks: object[]} | null} */
  async search(query, requestedBy) {
    const result = await this.player
      .search(query, { requestedBy, searchEngine: QueryType.AUTO })
      .catch(() => null);
    if (!result || !result.tracks.length) return null;
    return { isPlaylist: Boolean(result.playlist), tracks: result.tracks };
  }

  getSession(guildId) {
    const queue = this.player.nodes.get(guildId);
    return queue ? new QueueSession(queue) : null;
  }

  /** Creates (or reuses) the guild queue and joins the voice channel. Throws if it can't connect. */
  async openSession({ guild, voiceChannel, textChannel }) {
    const queue = this.player.nodes.create(guild, { metadata: textChannel });
    try {
      if (!queue.connection) await queue.connect(voiceChannel);
    } catch (error) {
      queue.delete();
      throw error;
    }
    return new QueueSession(queue);
  }

  /** Translates raw player events into plain DTOs for the view layer. */
  subscribe(handlers) {
    const describe = queue => ({
      guildName: queue.guild.name,
      textChannel: queue.metadata,
      voiceChannelName: queue.channel?.name,
    });
    const bind = (event, handler, extra = () => ({})) =>
      this.player.events.on(event, (queue, ...args) => handlers[handler]?.({ ...describe(queue), ...extra(...args) }));

    bind('error', 'error', error => ({ message: error.message }));
    bind('playerError', 'connectionError', error => ({ message: error.message }));
    bind('playerStart', 'trackStart', track => ({ track: toTrackInfo(track) }));
    bind('audioTrackAdd', 'trackAdd', track => ({ track: toTrackInfo(track) }));
    bind('audioTracksAdd', 'tracksAdd', tracks => ({ count: tracks.length }));
    bind('disconnect', 'botDisconnect');
    bind('emptyChannel', 'channelEmpty');
    bind('emptyQueue', 'queueEnd');
  }
}

module.exports = { PlayerRepository };
