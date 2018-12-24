'use strict';

var d3 = Object.assign( require('d3'), require('d3-fetch') );

import { livereload } from './livereload-client.js';
import { OptionsPane } from './components/options-pane/index.js';
import { GroupDays } from './components/group-days/index.js';
import { LogComponent } from './components/log/index.js';
import { SummaryComponent } from './components/summary/index.js';
import { NormalPlot } from './components/normal-plot/index.js';
import { Lift } from './components/lift/index.js';
// import { WeekSummaries } from './components/week-summary/index.js';
// import { HourSummaries } from './components/hours-summary/index.js';

livereload();

console.log('main.js loaded, from gulp!');

var days = new GroupDays();
var summarize = new SummaryComponent();
// var normalplotA = new NormalPlot( document.querySelector('#left-selector') );
//
// var summarizeB = new Summary();
var normalplotA = new NormalPlot( document.querySelector('#right-selector') );
var log = new LogComponent()

// var sizing = new Sizing();
//
// var optionsA = OptionsPane( document.querySelector('#left-selector') );
// var optionsB = OptionsPane( document.querySelector('#right-selector') );
//
// // var weeks = WeekSummaries( document.querySelector('#main') );
// //
// // var hours = HourSummaries( document.querySelector('#main') );
//
// optionsA.init( sizing );
// optionsB.init( sizing );
//
// d3  .json( '/api/v1/projects' )
//     .then( function( res ) {
//
//         optionsA.source( res.data.projects );
//
//     });
//
// optionsA.sink( function( data ) {
//     optionsB.source( data );
// });

//hours.init();

days.init();
log.init();

normalplotA.init();
// normalplotB.init();

d3.json('/api/v1/entries/by-date/12-01-2018/12-11-2018')
  .then( function( res ) {

      if ( res.success ) {

          //console.log( res.data );

          days  .trigger( res.data.entries )
                .through( new Lift( function( d ) { return d.entries; }) )
                .through( new Lift( summarize.transform.bind( summarize ) ) )
                .through( new Lift( function( d ) { return d[0]; } ) )
                .through( normalplotA );
                //.through( log );


          // var source = days.source( res.data.entries );
          //
          //
          // days.source( res.data.entries ).sink( function( data ) {
          //
          //     var d_prime = data.map( function( d ) {
          //         return summarizeA.summarize( d.entries );
          //     });
          //
          //     normalplotA.source( d_prime.slice( 1,4 ) );
          //     normalplotB.source( d_prime.slice( 4,7 ) );
          //
          //     // summarizeA.source( data[3].entries ).sink( function( d ) {
          //     //
          //     //     normalplotA.source( d );
          //     //
          //     // });
          //     //
          //     // summarizeB.source( data[2].entries ).sink( function( d ) {
          //     //
          //     //     normalplotB.source( d );
          //     //
          //     // });
          //
          //
          // });

      } else {

          console.error( res );
      }

  })
  .catch( function( error ) { console.error( error ); } );
