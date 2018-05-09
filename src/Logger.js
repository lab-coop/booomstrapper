'use strict'

import winston from 'winston'

module.exports =
  new winston.Logger({
    transports: [
      new (winston.transports.Console)({
        showLevel: false,
        colorize: 'all',
        level: process.env['DEBUG'] ? 'debug' : 'info'
      })
    ]
  })
