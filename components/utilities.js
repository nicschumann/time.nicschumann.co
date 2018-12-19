'use strict';


module.exports = {
    /**
     * Given a simple map π that projects objects of a certain type onto their
     * equivalence class, construct the equivalence set modulo π, with each
     * member labelled by its equivalence class.
     */
    partition_by: function( projection, entries ) {
        var days = entries.reduce( function( partition, object ) {

            var equivalence_class = projection( object );

            if ( typeof partition[ equivalence_class ] !== 'object' || typeof partition[ equivalence_class ].length !== 'number' ) {

                partition[ equivalence_class ] = [ object ];

            } else {

                partition[ equivalence_class ].push( object );

            }

            return partition;

        }, {});

        return Object.keys( days ).map( function( day ) { return { day: day, entries: days[day] }; });

    },

    /**
     *
     *
     */
    linear_map: function linear_map( a,b ) {
        return function( c,d ) {
            return function (t) {
                return ((d - c) / (b - a)) * (t - a) + c;
            };
        };
    }
    
};
