'use strict';

/**
 * @route /
 *
 * A request for the whole application.
 *
 * ROUTE CONTRACT
 * ==============
 *
 *
 */
var route = function( req, res ) {

    var self = this;

    self.logger.log('info', 'server', `requested home.` );

    res.render( 'index', {});

};


module.exports = route;
