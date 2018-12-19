"use strict";

var moment = require('moment');


module.exports = function retrieve( params, done ) {

    var individual = "Nic Schumann";

    this.paymo.entrySegment( individual, [ individual ], moment().subtract( 7, 'd'), moment(), function( err, data ) {

        if ( err ) { done( err ); }

        data.entries.forEach( function( entry ) {
            try {
                entry.description = entry.description.replace(/\u201c/g, '"').replace(/\u201d/g, '"');
                entry.description = JSON.parse( entry.description );
            } catch ( e ) {
                entry.description = { description: entry.description };
                console.error( e );
            }
        });

        done( data );

    });

};
