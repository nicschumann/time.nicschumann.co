'use strict';

var d3 = Object.assign( require('d3'), require('d3-fetch') );

import { livereload } from './livereload-client.js';


import { GroupDays } from './components/transform-group-days.js';
import { LogComponent } from './components/transform-log.js';
import { SummaryComponent } from './components/transform-summarize.js';
import { Each } from './components/transform-each.js';
import { All } from './components/transform-all.js';

import { NormalPlot } from './components/render-normal-plot.js';
//import { OptionsPane } from './components/render-options-pane.js';


livereload();

console.log('main.js loaded, from gulp!');

var days = new GroupDays( );
var log = new LogComponent();
var summarize = new SummaryComponent();

var normalplotS1 = new NormalPlot( document.querySelector('#left-selector'), ['satisfaction'] );
var normalplotS2 = new NormalPlot( document.querySelector('#left-selector'), ['satisfaction'] );
var normalplotP1 = new NormalPlot( document.querySelector('#middle-selector'), ['productivity'] );
var normalplotP2 = new NormalPlot( document.querySelector('#middle-selector'), ['productivity'] );
var normalplotE1 = new NormalPlot( document.querySelector('#right-selector'), ['enjoyment'] );
var normalplotE2 = new NormalPlot( document.querySelector('#right-selector'), ['enjoyment'] );

days.init();
log.init();
summarize.init();

normalplotS1.init();
normalplotS2.init();
normalplotP1.init();
normalplotP2.init();
normalplotE1.init();
normalplotE2.init();

d3  .json('/api/v1/entries/by-date/12-01-2018/12-11-2018')
    .then( function( res ) {

        if ( res.success ) {

            var pipeline = days
                    .through( new Each( function( d ) { return d.entries; }) )
                    .through( new Each( summarize.transform.bind( summarize ) ) )
                    .through( new Each( function( d ) { return d[0]; } ) )
                    .through( new LogComponent('Pipeline Root') );

            pipeline
                    .through( new All( function(d) { return d.slice( 0,4 ); }))
                    .through( new LogComponent('Path S₁') )
                    .through( normalplotS1 );

            pipeline
                    .through( new All( function(d) { return d.slice( 4,8 ); }))
                    .through( new LogComponent('Path S₂') )
                    .through( normalplotS2 );

            pipeline
                    .through( new All( function(d) { return d.slice( 0,4 ); }))
                    .through( new LogComponent('Path P') )
                    .through( normalplotP1 );
            pipeline
                    .through( new All( function(d) { return d.slice( 4,8 ); }))
                    .through( new LogComponent('Path P') )
                    .through( normalplotP2 );

            pipeline
                    .through( new All( function(d) { return d.slice( 0,4 ); }))
                    .through( new LogComponent('Path E') )
                    .through( normalplotE1 );
            pipeline
                    .through( new All( function(d) { return d.slice( 4,8 ); }))
                    .through( new LogComponent('Path E') )
                    .through( normalplotE2 );

            pipeline.run( res.data.entries );

        } else {
            console.error( res );
        }

    })
    .catch( function( error ) { console.error( error ); } );
