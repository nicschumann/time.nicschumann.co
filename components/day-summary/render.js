'use strict';

var moment = require('moment');
var d3 = Object.assign( require('d3'), require('d3-fetch') );
const partition_by = require('../utilities.js').partition_by;
const linear_map = require('../utilities.js').linear_map;


const types = ['satisfaction', 'productivity', 'enjoyment'];

const day_start_time = '06:00';
const day_end_time = '11:00';
const max_gap_seconds = 60 * 90; // sixty seconds * ninety minutes.
const min_label_duration = 60 * 15; // sixty seconds * 15 minutes.

const sizing_constants = {
    weeks_per_screen: 2,
    diagram_x_margin: 100,
    diagram_y_margin: 100,
    day_r_margin: 50,
    day_b_margin: 20,
    label_font_max_size: 12
};


const compute_sizing = require('./sizing.js')( sizing_constants );

/**
 * A simple post-fix routine that puts pixel units on a numerical value.
 */
function px( num ) { return num + 'px'; }

/**
 * A simple post-fix routine that puts em units on a numerical value.
 */
function em( num ) { return num + 'em'; }

/**
 * A simple post-fix routine that puts vw units on a numerical value.
 */
function vw( num ) { return num + 'vw'; }

/**
 * A simple post-fix routine that puts vh units on a numerical value.
 */
function vh( num ) { return num + 'vh'; }

/**
 * A simple post-fix routine that puts % units on a numerical value.
 */
function per( num ) { return num + '%'; }



/**
 *
 */
function compute_offsets( data ) {

    data.forEach( function( day ) {

        day.entries = day.entries.sort( function( a,b ) { if ( moment( a.start_time ).isBefore( moment( b.start_time ) ) ) { return -1; } else { return 1; } });

        var day_start = moment( moment( day.entries[ 0 ].start_time ).format( 'YYYY-MM-DD') + ' ' + day_start_time );
        var day_end = moment( moment( day.entries[ day.entries.length - 1 ].end_time ).format( 'YYYY-MM-DD') + ' ' + day_end_time );

        day.timing = {
            start: day_start.unix(),
            end: day_end.unix()
        };

        day.entries.forEach( function( entry ) { entry.timing = day.timing; });

    });

    return data;

}


/** =====================
 * Renderable Application
 * ===================== */

function build_diagram_root( sizing ) {
    return d3.select('body')
        .append('svg')
        .attr( 'width', sizing.diagram.width )
        .attr( 'height', sizing.diagram.height )
            .append('g')
            .attr('id', 'diagram-root')
            .attr( 'width', sizing.diagram.width )
            .attr( 'height', sizing.diagram.height )
            .attr('transform', 'translate(' + [ sizing.diagram.margins.x / 2, sizing.diagram.margins.y / 2 ] + ')');
}

function build_day_groups( data, root, sizing ) {

    root.selectAll('.day').remove();

    var days = root
        .selectAll('.day')
        .data( data )
        .enter()
            .append('g')
            .classed('day', true)
            .attr('id', function( d ) { return d.day.replace(/\s/g, ''); })
            .attr('width', px( sizing.day.width ) )
            .attr('height', px( sizing.day.height ) )
            .attr('transform', function( d, i ) {

                return 'translate(' + [
                    0,
                    i * (sizing.day.height + sizing.day.margins.b)
                ] + ')';

            });

    days.merge( days );

    days
        .exit()
        .remove();

    return days;

}

function build_background( day_gs, sizing ) {

    day_gs  .append('rect')
            .classed('entry-background', true )
            .attr('width', px( sizing.day.width ) )
            .attr('height', px( sizing.day.height ) )
            .attr('x', px( 0 ) )
            .attr('y', px( 0 ) );

}

function build_entries( day_gs, time_map, sizing ) {



    var entry =
        day_gs  .selectAll('.entry')
                .data( function( d,i ) { return d.entries; } )
                .enter()
                    .append( 'g' )
                    .classed('entry', true)
                    .attr('transform', function( d,i ) {

                        return 'translate(' + [
                            time_map( moment( d.start_time ).unix() - d.timing.start ),
                            sizing.entry.margins.top
                        ] + ')';

                    })
                    .attr('width', function( d,i ) {
                        return time_map( moment( d.end_time ).unix() - moment( d.start_time ).unix() );
                    })
                    .attr('height', sizing.entry.height )

    return entry;

}

function build_entry_baselines( entries, time_map, sizing ) {
    entries     .append('line')
                .classed('entry-baseline', true )
                .attr('x1', sizing.entry.margins.left / 2 )
                .attr('x2', function( d ) { return time_map( d.duration ) - (sizing.entry.margins.left / 2); })
                .attr('y1', sizing.entry.height - sizing.entry.margins.top )
                .attr('y2', sizing.entry.height - sizing.entry.margins.top );
}

/**
 * A simple routine that checks if entries are disconnected from
 * one another. Used to determine if we're at the beginning of
 * a day's entries, or if we've encountered a gap in entries.
 */
function is_disconnected( d, j, entries, gap ) {

    return (j === 0) || ( j === entries.length ) || (moment( entries[ j ].start_time ).unix() - moment( entries[ j - 1 ].end_time ).unix() >= gap);

}

function build_curve_line( type, time_map, range_map, sizing ) {

    function build_coordinate_entry( command, d ) {
        return [
            command,
            time_map( (moment( d.start_time ).unix() - d.timing.start) + (d.duration / 2) ), // absolute X coordinate,
            ',',
            range_map( d.description[ type ] ),
        ].join('');
    }

    return function( day, i, arr ) {

        var path = day.entries.reduce( function( b, d, j ) {

            if ( is_disconnected( d, j, day.entries, max_gap_seconds ) ) {

                return b.concat( build_coordinate_entry( 'M', d ) );

            } else {

                return b.concat( build_coordinate_entry( 'L', d ) );

            }

        }, []);

        return path.join(' ');

    };
}


function entry_time_label( day_gs, time_map, range_map, sizing, position = 'start' ) {

    function get_x( d ) { return time_map( (moment( d[ position + '_time' ] ).unix() - d.timing.start) ) - ( (position === 'start') ? 0 : sizing.labels.font_size ) + (sizing.labels.font_size / 3); }

    function get_y( d ) { return sizing.entry.height + (sizing.entry.margins.top / 4);  }

    var data = [];

    var labels = day_gs  .selectAll('.entry-' + position + '-time-label')
            .data( function( d ) { data = d.entries; return d.entries; } );

            labels
            .enter()
                .append('text')
                .classed('entry-' + position + '-time-label', true)
                .classed('entry-time-label', true )
                .attr('x', get_x )
                .attr('y',  get_y )
                .attr('transform', function( d ) {
                    return [ 'rotate(', '90,', get_x( d ), ',', get_y( d ), ')' ].join('');
                })
                .text( function( d, i, a ) {

                    if ( i === 0 ) {data = a.map( function( d ) { return d.__data__; });}

                    const timing = moment( d[ position + '_time' ] ).format('h:mm');

                    return ( position === 'start' || (position === 'end' && is_disconnected( d, i + 1, data, 1800 ) && d.duration > min_label_duration ) ) ? timing : '';

                })
                .style('font-size', sizing.labels.font_size );

    return labels;

}

function entry_project_type( day_gs, time_map, range_map, sizing ) {

    function get_x( d ) { return time_map( moment( d.start_time ).unix() + (d.duration / 2) - d.timing.start ); }

    function get_y( d ) { return range_map( 10.25 );  }

    day_gs  .selectAll( '.entry-type-label' )
            .data( function( d ) { return d.entries; })
            .enter()
                .append( 'text' )
                .classed( 'entry-type-label', true )
                .attr('x', get_x )
                .attr('y', get_y )
                .attr('transform', function( d ) {
                    return [ 'rotate(', '-45,', get_x( d ), ',', get_y( d ), ')' ].join('');
                })
                .text( function( d ) { return d.project.client.name; })
                .style('font-size', sizing.labels.font_size - 1 );

}


function build_day_curves( day_gs, time_map, range_map, sizing ) {

    day_gs  .selectAll('.entry-center-line')
            .data( function( d ) { return d.entries; } )
            .enter()
                .append('line')
                .classed('entry-center-line', true )
                .attr('x1', function( d ) {  return time_map( (moment( d.start_time ).unix() - d.timing.start) + (d.duration / 2) ); })
                .attr('x2', function( d ) {  return time_map( (moment( d.start_time ).unix() - d.timing.start) + (d.duration / 2) ); })
                .attr('y1', range_map( 0 ) )
                .attr('y2', range_map( 10 ) );


    entry_time_label( day_gs, time_map, range_map, sizing, 'start' );
    entry_time_label( day_gs, time_map, range_map, sizing, 'end' );
    entry_project_type( day_gs, time_map, range_map, sizing );

    types.forEach( function( type ) {

            day_gs  .append('path')
                    .classed('graph-line', true)
                    .classed( type + '-graph-line', true)
                    .classed( type, true )
                    .attr('d', build_curve_line( type, time_map, range_map, sizing ) );

            day_gs  .selectAll('.entry-' + type + 'point' )
                    .data( function( d ) { return d.entries; } )
                    .enter()
                        .append('circle')
                        .classed( 'entry-point', true )
                        .classed( 'entry-' + type + 'point', true )
                        .attr('cx', function( d ) { return time_map( (moment( d.start_time ).unix() - d.timing.start) + (d.duration / 2) ); })
                        .attr('cy', function( d ) { return range_map( d.description[ type ] ); } )
                        .attr('r', 3);


    });

}







function build_day_plots( day_gs, sizing ) {

    const time_map = linear_map( 0, 61200 )( 0, sizing.day.width - sizing.day.margins.r );

    const range_map = linear_map( 0, 10 )( sizing.entry.height, (sizing.entry.margins.top * 2));


    build_background( day_gs, sizing );

    build_day_curves( day_gs, time_map, range_map, sizing );


    var entries = build_entries( day_gs, time_map, sizing );

    build_entry_baselines( entries, time_map, sizing );

}


function render( data, root, sizing ) {

    var day_gs = build_day_groups( data, root, sizing );

    build_day_plots( day_gs, sizing );

}


function renderEntries( data ) {

    data = partition_by( function( object ) { return moment( object.start_time ).format('dddd - MM/DD'); }, data.entries );

    data = compute_offsets( data );

    console.log( data );

    var sizing = compute_sizing( data, window.innerWidth, window.innerHeight );

    var root = build_diagram_root( sizing );

    render( data, root, sizing );

    window.addEventListener( 'resize', function() { render( data, root, compute_sizing( data, window.innerWidth, window.innerHeight ) ); } );

}


function getEntries() {
    d3.json( [ window.location, '/data'].join('') )
        .then( renderEntries )
        .catch( function( e ) { console.error( e ); });


}

getEntries();
