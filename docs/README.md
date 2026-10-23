# MiMusic

[![GitHub license](https://img.shields.io/github/license/clcmo/Mi_Music?style=for-the-badge)](https://github.com/clcmo/Mi_Music/blob/main/LICENCE)
[![GitHub stars](https://img.shields.io/github/stars/clcmo/Mi_Music?style=for-the-badge)](https://github.com/clcmo/Mi_Music/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/clcmo/Mi_Music?style=for-the-badge)](https://github.com/clcmo/Mi_Music/issues)

Music streaming bot for Discord. Landing page: [`docs/index.html`](index.html) (served by GitHub Pages).

## Run

```bash
cp .env.example .env     # set DISCORD_TOKEN
npm ci && npm start      # Node 18+
# or
docker compose up -d --build
```

Built on `discord.js` 14 and `discord-player` 7. v7 ships no audio sources by default, so `PlayerRepository.init()` loads the default extractors (SoundCloud, Spotify, Apple Music, Vimeo, attachments...) and registers `discord-player-youtubei` for YouTube. Non-Docker setups also need FFmpeg (`ffmpeg-static` is included).

Invite the bot with the `bot` and `applications.commands` scopes, then send `!deploy` once (bot owner only) to register the slash commands.

## Architecture (MVVM)

```
index.js                      entry point
src/app.js                    composition root: wires Model → ViewModel → View
src/models/                   discord-player and Discord API access, returns plain data
  PlayerRepository.js         extractors, search, open queue, player events
  QueueSession.js             domain wrapper around a queue (play, skip, move, swap...)
  ModerationRepository.js     ban, purge
src/viewmodels/               rules and state, no Discord objects
  PlaybackViewModel.js        play, playtop, pause, resume, skip, stop, volume, repeat
  QueueViewModel.js           queue, playing, shuffle, move, swap, remove
  ModerationViewModel.js      ban, purge, getuser
  HelpViewModel.js
  guards.js                   voice-channel and "something is playing" checks, written once
src/views/                    everything the user sees
  commands/definitions.js     slash-command metadata
  commands/handlers.js        command → ViewModel call
  presenters.js               ViewModel result → message / embed
  InteractionRouter.js, playerEvents.js, deployCommand.js
tests/                        ViewModels tested with fakes, no Discord connection needed
```

A ViewModel method resolves to `{ ok: true, type, data }` or `{ ok: false, error }`; the View decides how to render it.
To add a command: describe it in `definitions.js`, add the rule to a ViewModel, add one line in `handlers.js` and one entry in `presenters.js`.

## Tests

```bash
npm test
```

Licence: [MIT](../LICENCE)
