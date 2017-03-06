'use strict';

const milight = require('node-milight-promise');

const repository = new Map();

class Controller {

  constructor(host) {
    this.host = host;
    this.usage = 0;
    this._controller = new milight.MilightController({
      ip                   : this._host,
      delayBetweenCommands : 75,
      commandRepeat        : 5
    });
  }

  ref() {
    ++this.usage;
  }

  unref() {
    return !!(--this.usage);
  }

  send(command) {
    this._controller.sendCommands(command);
  }

  close(done) {
    this._controller.close().then(done);
  }
}

module.exports.open = (host) => {
  let controller = repository.get(host);
  if(!controller) {
    repository.set(host, (controller = new Controller(host)));
  }
  controller.ref();
  return controller;
};

module.exports.close = (controller, done) => {
  if(controller.unref()) {
    return setImmediate(done);
  }

  repository.delete(controller.host);
  return controller.close(done);
};

module.exports.commands = milight.commands2;
