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

    self.logger.log('info', 'server', `requested entries matching selection criteria:` );






};


module.exports = route;
