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

var normalplotS = new NormalPlot( document.querySelector('#left-selector'), ['satisfaction'] );
var normalplotP = new NormalPlot( document.querySelector('#middle-selector'), ['productivity'] );
var normalplotE = new NormalPlot( document.querySelector('#right-selector'), ['enjoyment'] );

days.init();
log.init();
summarize.init();

normalplotS.init();
normalplotP.init();
normalplotE.init();

d3  .json('/api/v1/entries/by-date/12-01-2018/12-11-2018')
    .then( function( res ) {

        if ( res.success ) {

            var pipeline = days
                    .through( new Each( function( d ) { return d.entries; }) )
                    .through( new Each( summarize.transform.bind( summarize ) ) )
                    .through( new Each( function( d ) { return d[0]; } ) )
                    .through( new LogComponent('Pipeline Root') );

            pipeline
                    .through( new LogComponent('Path A') )
                    .through( normalplotS );

            pipeline
                    .through( new LogComponent('Path B') )
                    .through( normalplotP );

            pipeline
                    .through( new LogComponent('Path B') )
                    .through( normalplotE );

            pipeline.run( res.data.entries );

        } else {
            console.error( res );
        }

    })
    .catch( function( error ) { console.error( error ); } );
