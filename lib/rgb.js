'use strict';

const log4js     = require('log4js');
const logger     = log4js.getLogger('core-plugins-hw-milight.Rgb');
const controller = require('./controller');

module.exports = class Rgb {
  constructor(config) {

    this._host = config.host;
    this._zone = config.zone;

    this.active = 'off';
    this.white = 'off';
    this.hue = 0;
    this.brightness = 0;

    logger.info('Opening milight controller (host=%s, zone=%s)', this._host, this._zone);
    this._controller = controller.open(this._host);
    this._refresh();
  }

  _refresh() {
    if(this.active === 'off') {
      logger.info('milight: OFF (host=%s, zone=%s)', this._host, this._zone);
      this._controller.send(controller.commands.rgbw.off(this._zone));
      return;
    }

    this._controller.send(controller.commands.rgbw.on(this._zone));
    if(this.white === 'on') {
      logger.info('milight white=on, brightness=%s (host=%s, zone=%s)',
        this.brightness, this._host, this._zone);
      this._controller.send(controller.commands.rgbw.whiteMode(this._zone));
      this._controller.send(controller.commands.rgbw.brightness(this.brightness));
    } else {
      logger.info('milight hue=%s, brightness=%s (host=%s, zone=%s)',
        this.hue, this.brightness, this._host, this._zone);
      this._controller.send(controller.commands.rgbw.hue(this.hue));
      this._controller.send(controller.commands.rgbw.brightness(this.brightness));
    }
  }

  setActive(arg) {
    this.active = arg;
    this._refresh();
  }

  setWhite(arg) {
    this.white = arg;
    this._refresh();
  }

  setHue(arg) {
    this.hue = arg;
    this._refresh();
  }

  setBrightness(arg) {
    this.brightness = arg;
    this._refresh();
  }

  close(done) {
    logger.info('Closing milight controller (host=%s, zone=%s)', this._host, this._zone);
    this._controller.send(controller.commands.rgbw.off(this._zone));
    controller.close(this._controller, done);
  }

  static metadata(builder) {
    const binary  = builder.enum('off', 'on');
    const percent = builder.range(0, 100);
    const hue     = builder.range(0, 255);

    builder.usage.driver();

    builder.attribute('active', binary);
    builder.attribute('white', binary);
    builder.attribute('hue', hue);
    builder.attribute('brightness', percent);

    builder.action('setActive', binary);
    builder.action('setWhite', binary);
    builder.action('setHue', hue);
    builder.action('setBrightness', percent);

    builder.config('host', 'string');
    builder.config('zone', 'integer');
  }
};
