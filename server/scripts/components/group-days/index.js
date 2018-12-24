'use strict';

var moment = require('moment');
var partitionBy = require('../utilities/index.js').partition_by;

import { TransformComponent } from '../transform.js';

/**
 * A simple comparator for sorting day entries
 * by date time using string comparison.
 */
function byDatetime( a, b ) {

    const a_date = moment( a.day.split(' - ')[1], 'MM/DD/YYYY');
    const b_date = moment( b.day.split(' - ')[1], 'MM/DD/YYYY');

    return ( b_date.isAfter( a_date ) ) ? -1 : ((b_date.isBefore( a_date )) ? 1 : 0);

}



class GroupDays extends TransformComponent {

    /**
     * This constructor takes a single parameter, indicating
     * whether or not to sort the output by datetime.
     * defaults to sorted output. Pass false to leave unsorted.
     */
    constructor( sorted = true ) {
        super();
        this.sorted = sorted;
    }

    /**
     * This transform routine implements a simple routine
     * for grouping a set of entries by the day they occurred on.
     */
    transform( data ) {

        data = partitionBy(
            function( object ) { return moment( object.start_time ).format('dddd - MM/DD/YYYY'); },
            data
        ).map( function( day ) {

            var date = day.day.split(' - ');

            day.date = date[1];
            day.day = date[0];

            return day;

        });

        if ( this.sorted ) { data.sort( byDatetime ); }

        return data;

    }

}

export { GroupDays };
