'use strict';

var moment = require('moment');
var d3 = Object.assign( require('d3'), require('d3-fetch') );

function px( num ) { return num + 'px'; }

var diagram_x_margin = 50;
var diagram_y_margin = 50;

var diagram_width = window.innerWidth - diagram_x_margin, diagram_height = window.innerHeight - diagram_y_margin;

var root = d3.select('body')
    .append('svg')
    .attr( 'width', diagram_width )
    .attr( 'height', diagram_height )
        .append('g')
        .attr( 'width', diagram_width )
        .attr( 'height', diagram_height )
        .attr('transform', 'translate(' + [ diagram_x_margin / 2, diagram_y_margin / 2 ] + ')');






function partition_by( projection, entries ) {
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

}


function renderEntries( data ) {

    data.entries.forEach( function( entry ) { console.log( entry.description );  });

    data = partition_by( function( object ) { return moment( object.start_time ).format('dddd'); }, data.entries );

    var g_x_margin = 10;
    var g_y_margin = 35;

    var entry_r_margin = 30;
    var entry_bar_padding = 5;

    var g_width = diagram_width - g_x_margin;
    var g_height = diagram_height / Math.max( data.length, 1) - g_y_margin;
    var entry_width = (g_width / data.reduce( function( max, a ) { return Math.max( max, a.entries.length ); }, 1 )) - entry_r_margin;
    var entry_height = g_height;

    var bar_width = entry_width / 3;

    var day_gs = root
                    .selectAll('.day')
                    .data( data )
                    .enter()
                        .append('g')
                        .classed('day', true)
                        .attr('id', function( d ) { return d.day; })
                        .attr('width', px( g_width ) )
                        .attr('height', px( g_height ) )
                        .attr('transform', function( d,i ) { return 'translate(' + [g_x_margin / 2, i * (g_height + g_y_margin) ] + ')'; } );


    var entry_gs = day_gs
                    .selectAll('.entry')
                    .data( function( d ) { return d.entries; })
                    .enter()
                        .append('g')
                        .classed('entry', true)
                        .attr('width', px( entry_width ) )
                        .attr('height', px( entry_height ) )
                        .attr('transform', function( d,i ) { return 'translate(' + [i * (entry_width + entry_r_margin), 0] + ')'; } );


    entry_gs
                    .append( 'rect' )
                    .classed('satisfaction', true)
                    .attr('x', entry_bar_padding / 2 )
                    .attr('y', function( d ) { return entry_height - ((d.description.satisfaction / 10) * entry_height); } )
                    .attr('width', px( bar_width - entry_bar_padding ) )
                    .attr('height', function( d ) { return (d.description.satisfaction / 10) * entry_height; } );

    entry_gs
                    .append( 'rect' )
                    .classed('productivity', true)
                    .attr('x', bar_width + (entry_bar_padding / 2) )
                    .attr('y', function( d ) { return entry_height - ((d.description.productivity / 10) * entry_height); } )
                    .attr('width', px( bar_width - entry_bar_padding ) )
                    .attr('height', function( d ) { return (d.description.productivity / 10) * entry_height; } );

    entry_gs
                    .append( 'rect' )
                    .classed('enjoyment', true)
                    .attr('x', (2 * bar_width) + (entry_bar_padding / 2) )
                    .attr('y', function( d ) { return entry_height - ((d.description.enjoyment / 10) * entry_height); } )
                    .attr('width', px( bar_width - entry_bar_padding ) )
                    .attr('height', function( d ) { return (d.description.enjoyment / 10) * entry_height; } );


    entry_gs
                    .append( 'text' )
                    .classed('dimension-label', true)
                    .classed('satisfaction-dimension-label', true)
                    .attr('x', px( entry_width / 6 ) )
                    .attr('y', function( d ) { return entry_height - ((d.description.satisfaction / 10) * entry_height) + (bar_width / 2); } )
                    .attr('transform', 'translate('+[-(bar_width/15),0]+')')
                    .style('fill', 'white')
                    .style('font-size', bar_width / 3 )
                    .text( function(d) { return d.description.satisfaction; });

    entry_gs
                    .append( 'foreignObject' )
                    .classed('activity-label', true)
                    .attr('x', px( 0 ) )
                    .attr('y', px( entry_height + 10 ) )
                    .attr('width', entry_width )
                    .attr('height', 50 )
                    .append('p')
                        .attr('xmlns', 'http://www.w3.org/1999/xhtml')
                        .style('font-size', px( 10 ) )
                        .text( function(d) { return d.description.description; });






}


function getEntries() {
    d3.json( '/test/data' )
        .then( renderEntries )
        .catch( function( e ) { console.error( e ); });
}

getEntries();
