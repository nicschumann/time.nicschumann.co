'use strict';

var d3 = Object.assign( require('d3'), require('d3-fetch') );

import { livereload } from './livereload-client.js';
import { Sizing } from './sizing/index.js';
import { OptionsPane } from './components/options-pane/index.js';
// import { WeekSummaries } from './components/week-summary/index.js';
// import { HourSummaries } from './components/hours-summary/index.js';

livereload();

console.log('main.js loaded, from gulp!');

var sizing = new Sizing();

var options = OptionsPane( document.querySelector('#main') );

// var weeks = WeekSummaries( document.querySelector('#main') );
//
// var hours = HourSummaries( document.querySelector('#main') );

options.init( sizing );

options.sink( function( data ) {
    console.log( data );
});

d3  .json( '/api/v1/projects' )
    .then( function( res ) {

        options.source( res.data.projects.map( function( p ) { return { name: p.name, id: p.id }; } ) );

    });

//hours.init();

// d3.json('/api/v1/entries/12-01-2018/12-11-2018')
//   .then( function( res ) {
//       if ( res.success ) {
//
//           console.log( res );
//           weeks.render( res.data );
//
//       } else {
//
//           console.error( res );
//       }
//
//   })
//   .catch( function( error ) { console.error( error ); } );
