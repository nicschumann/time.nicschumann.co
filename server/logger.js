'use strict';

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;


function Logger() {
    if ( !(this instanceof Logger)) { return new Logger(); }
    var self = this;

    const myFormat = printf(info => {
      return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
    });

    self.logger = createLogger({
        level: 'info',
        format: combine(
            timestamp(),
            myFormat
        ),
    });

    self.logger.add( new transports.Console() );

}

Logger.prototype.log = function( level, label, message ) {
    var self = this;

    self.logger.log({
        level: level,
        label: label,
        message: message
    });

    return self;

};

module.exports = Logger;
