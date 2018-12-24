'use strict';

const path = require('path');
const express = require('express');
require('express-namespace');
require('twig');

const Logger = require('./logger.js');

const entriesAPIRoute = require('./api-entries.js');
const filterAPIRoute = require('./api-filter.js');
const projectsAPIRoute = require('./api-projects.js');

const homeUIRoute = require('./ui-home.js');

function Server( paymo, config ) {
    if ( !(this instanceof Server) ) { return new Server( paymo, config ); }
    var self = this;

    self.config     = config;
    self.paymo      = paymo;
    self.app        = express();
    self.logger     = new Logger();
    self.routes     = [];

    self.individual = 'Nic Schumann';

    self.app.set('views', path.join(__dirname, 'templates') );
    self.app.set('view engine', 'twig');
    self.app.set('twig_options', { strict_variables: false });

    self.app.use('/static', express.static( path.join(__dirname, 'static') ) );

    // NOTE: API Routes here.
    self.app.namespace('/api/v1/', function() {

        self.app.get('projects', projectsAPIRoute.bind(self) );

        self.app.get('entries/by-project/:project', filterAPIRoute.bind( self ) );

        //self.app.get('entries/by-project/:project', filterAPIRoute.bind( self ) );

        self.app.get('entries/by-date/:start/:end', entriesAPIRoute.bind( self ) );



    });

    // NOTE: UI Routes here.
    self.app.get('/', homeUIRoute.bind( self ) );


}

/**
 * Start the server!
 */
Server.prototype.start = function() {
    var self = this;

    self.app.listen( self.config.port, function() {

        self.logger.log( 'info', 'server', `started on ${ self.config.port }.` );

    });

};


module.exports = Server;
