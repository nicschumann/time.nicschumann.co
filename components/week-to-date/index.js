'use strict';

const path = require('path');

const Component = require('../component.js');

const retrieve = require( './retrieve.js' );

const render = path.join(__dirname, 'render.js' );


module.exports = new Component( retrieve, render );
