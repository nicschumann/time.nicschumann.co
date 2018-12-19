'use strict';


const moment = require('moment');

/**
 * @route /api/v1/entries/:start/:end
 *
 * Given a request containing request parameters :start, and :end,
 * Get all entries between :start and :end.
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

    self.logger.log('info', 'server', `requested entries from ${ req.params.start } to ${ req.params.end }` );

    const start = moment( req.params.start, 'MM-DD-YYYY' )
    const end = moment( req.params.end, 'MM-DD-YYYY' );
    const individual = 'Nic Schumann';

    if ( !start.isValid() || !end.isValid() ) {
        // NOTE: We didn't get passed a valid date according to our contract

        res.json({
            success: false,
            message: "/entries/:start/:end requires a dates in the form MM-DD-YYYY.",
            blame: req.params
        });

    } else if ( !start.isSameOrBefore( end ) ) {
        // NOTE: the start date is strictly after end date, which is invalid according to our contract.

        res.json({
            success: false,
            message: "/entries/:start/:end requires an start date is either equal to or after the passed end date.",
            blame: req.params
        });


    } else {
        // NOTE: the date strings seem well-formed according to our checking.

        self.paymo.entrySegment( individual, [ individual ], start, end.add(1, 'days'), function( err, data ) {

            if ( err ) {

                res.json({
                    success: false,
                    message: err.message,
                    blame: err,
                    data: []
                });

            } else {

                data.entries.forEach( function( entry ) {
                    try {
                        entry.description = entry.description.replace(/\u201c/g, '"').replace(/\u201d/g, '"');
                        entry.description = JSON.parse( entry.description );
                        entry.invalidJSON = false;
                    } catch ( e ) {
                        entry.description = { description: entry.description };
                        entry.invalidJSON = true;
                        self.logger.log('warn', 'server', `time entry with id ${ entry.id } (created on ${ entry.created_time }) had an invalid description.`);
                    }
                });

                res.json({
                    success: true,
                    message: '',
                    blame: {},
                    data: data
                });

            }

        });

    }

};


module.exports = route;
