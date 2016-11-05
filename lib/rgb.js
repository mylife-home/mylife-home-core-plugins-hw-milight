'use strict';

const log4js     = require('log4js');
const logger     = log4js.getLogger('core-plugins-hw-milight.Rgb');
const controller = require('./controller');

module.exports = class Rgb {
  constructor(config) {

    this._host = config.host;
    this._zone = config.zone;

    this.active = 'off';
    this.red    = 0;
    this.green  = 0;
    this.blue   = 0;

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

    const red   = percentTo255(this.red);
    const green = percentTo255(this.green);
    const blue  = percentTo255(this.blue);
    this._controller.send(controller.commands.rgbw.on(this._zone));
    if(red === green && green === blue) {
      logger.info('milight: R=%s, G=%s, B=%s (host=%s, zone=%s, using white mode)',
        red, green, blue, this._host, this._zone);
      this._controller.send(controller.commands.rgbw.whiteMode(this._zone));
      this._controller.send(controller.commands.rgbw.brightness(this.red));
    } else {
      const [h, s, v] = controller.commands.rgbw.rgbToHsv(red, green, blue);
      logger.info('milight: R=%s, G=%s, B=%s (host=%s, zone=%s, h=%s, s=%s, v=%s)',
        red, green, blue, this._host, this._zone, );
      this._controller.send(controller.commands.rgbw.rgb255(red, green, blue));
    }
  }

  setActive(arg) {
    this.active = arg;
    this._refresh();
  }

  setRed(arg) {
    this.red = arg;
    this._refresh();
  }

  setGreen(arg) {
    this.green = arg;
    this._refresh();
  }

  setBlue(arg) {
    this.blue = arg;
    this._refresh();
  }

  close(done) {
    logger.info('Closing milight controller (host=%s, zone=%s)', this._host, this._zone);
    controller.close(this._controller, done);
  }

  static metadata(builder) {
    const binary  = builder.enum('off', 'on');
    const percent = builder.range(0, 100);

    builder.usage.driver();

    builder.attribute('active', binary);
    builder.attribute('red', percent);
    builder.attribute('green', percent);
    builder.attribute('blue', percent);

    builder.action('setActive', binary);
    builder.action('setRed', percent);
    builder.action('setGreen', percent);
    builder.action('setBlue', percent);

    builder.config('host', 'string');
    builder.config('zone', 'integer');
  }
};

function percentTo255(x) {
  return Math.round(x * 255 / 100);
}