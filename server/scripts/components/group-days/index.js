'use strict';

var moment = require('moment');
var partitionBy = require('../utilities/index.js').partition_by;

/**
 * A simple comparator for sorting day entries
 * by date time using string comparison.
 */
function byDatetime( a, b ) {

    const a_date = moment( a.day.split(' - ')[1], 'MM/DD/YYYY');
    const b_date = moment( b.day.split(' - ')[1], 'MM/DD/YYYY');

    if ( b_date.isAfter( a_date ) ) {
        return -1;
    } else if ( b_date.isBefore( a_date ) ) {
        return 1;
    } else {
        return 0;
    }

}


function GroupDays( ) {
    if ( !(this instanceof GroupDays) ) { return new GroupDays( ); }
    var self = this;

    self.next = function() {};
    self.transformed = [];

}

/**
 * given a set of time-entry data, group that data into
 * days.
 */
GroupDays.prototype.source = function( data ) {

    this.transformed =
        partitionBy(
            function( object ) { return moment( object.start_time ).format('dddd - MM/DD/YYYY'); },
            data
        ).map( function( day ) {

            var date = day.day.split(' - ');

            day.date = date[1];
            day.day = date[0];

            return day;

        });

    this.transformed.sort( byDatetime );

    this.next( this.transformed );

    return this;

};


/**
 * Set the next function in this chain.
 */
GroupDays.prototype.sink = function( next ) {

    this.next = next;

    this.next( this.transformed );

    return this;

};

export { GroupDays };
