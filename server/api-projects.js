'use strict';


const moment = require('moment');

/**
 * @route /api/v1/projects
 *
 * Get all the projects that the authenticating user has access to.
 *
 * ROUTE CONTRACT
 * ==============
 *
 * 1. :start must be a date in the format MM-DD-YYYY
 * 2. :start must be a date before or equal to :end
 *
 */
var route = function( req, res ) {

    var self = this;

    const individual = self.individual;

    self.logger.log('info', 'server', `requested list of projects from paymo.` );

    self.paymo.projects( individual, [ individual ], function( err, data ) {

        if ( err ) {
            // the paymo request process returned an error.

            res.json({
                success: false,
                message: "/projects paymo request returned an error",
                blame: err,
                data: []
            });

        } else {

            res.json({
                success: true,
                message: "",
                data: data
            });

        }

    });




};


module.exports = route;
