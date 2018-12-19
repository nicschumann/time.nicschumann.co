"use strict";

var keys = require("./.env.json");
var config = require("./package.json");

const Paymo = require('./paymo');
const Server = require('./server');

const paymo = new Paymo( keys, config );
const server = new Server( paymo, config );

server.start();
