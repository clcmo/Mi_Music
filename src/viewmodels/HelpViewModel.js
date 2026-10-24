const { ok } = require('./result');

class HelpViewModel {
  constructor(commandDefinitions) {
    this.definitions = commandDefinitions;
  }

  list() {
    return ok('help', { commands: this.definitions.map(({ name, description }) => ({ name, description })) });
  }
}

module.exports = { HelpViewModel };
