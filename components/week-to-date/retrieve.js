"use strict";

var moment = require('moment');


function escapeJSON(json) {
  var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
  var meta = {    // table of character substitutions
              '\b': '\\b',
              '\t': '\\t',
              '\n': '',
              '\f': '\\f',
              '\r': '\\r',
              '"' : '\\"',
              '\u2018': '\\"',
              '\u2019': '\\"',
              '\u201c': '\\"',
              '\u201d': '\\"',

              '\\': '\\\\'
            };

  escapable.lastIndex = 0;
  return escapable.test(json) ? '"' + json.replace(escapable, function (a) {
      var c = meta[a];
      return (typeof c === 'string') ? c
        : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
  }) + '"' : '"' + json + '"';

}



module.exports = function retrieve( params, done ) {

    var individual = "Nic Schumann";

    this.paymo.entrySegment( individual, [ individual ], moment().subtract(7, 'd'), moment(), function( err, data ) {

        if ( err ) { done( err ); }

        data.entries.forEach( function( entry ) {
            try {
                entry.description = entry.description.replace(/\u201c/g, '"').replace(/\u201d/g, '"');
                entry.description = JSON.parse( entry.description );
            } catch ( e ) {
                entry.description = '{}';
                console.error( e );
            }
        });

        done( data );

    });

};
