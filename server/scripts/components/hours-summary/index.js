'use strict';

var moment = require('moment');
var d3 = Object.assign( require('d3'), require('d3-fetch') );
var partition_by = require('../utilities/index.js').partition_by;
var linear_map = require('../utilities/index.js').linear_map;

const weeks_per_screen = 2;

const diagram_x_margin = 100;
const diagram_y_margin = 100;

const day_r_margin = 50;
const day_b_margin = 120;

const label_font_max_size = 12;

const day_start_time = '00:00';
const day_end_time = '00:00';

const hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
const workday_hours = [9,12,17];

function compute_sizing( ) {

    var sizing = {

        diagram: { margins: { x: diagram_x_margin, y: diagram_y_margin  } },

        day: { positions: {}, margins: { r: day_r_margin, b: day_b_margin } },

        labels: { },

        entry: { frame: { margins: {} }, margins: { } }
    };

    sizing.inner_radius = 50;

    sizing.radius_margin = 5;

    sizing.tick_length = 5;

    sizing.entry_width = 20;

    sizing.diagram.width = window.innerWidth - diagram_x_margin;
    sizing.diagram.height = window.innerHeight - diagram_y_margin;

    sizing.day.width = (sizing.diagram.width / 7) - sizing.day.margins.r;
    sizing.day.height = (sizing.diagram.height / weeks_per_screen) - sizing.day.margins.b;

    sizing.day.positions.x = {
        Sunday: 0,
        Monday: (sizing.day.width + sizing.day.margins.r),
        Tuesday: 2 * (sizing.day.width + sizing.day.margins.r),
        Wednesday: 3 * (sizing.day.width + sizing.day.margins.r),
        Thursday: 4 * (sizing.day.width + sizing.day.margins.r),
        Friday: 5 * (sizing.day.width + sizing.day.margins.r),
        Saturday: 6 * (sizing.day.width + sizing.day.margins.r)
    };

    sizing.labels.font_size = Math.min( sizing.day.width, label_font_max_size );
    sizing.labels.font_width = sizing.labels.font_size / 2;
    sizing.labels.padding = 3 * sizing.labels.font_size / 4;

    sizing.entry.frame.height = 50;
    sizing.entry.frame.width = 100;
    sizing.entry.frame.margins.left = (100 - sizing.entry.frame.width) / 2;
    sizing.entry.frame.margins.top = 100 - sizing.entry.frame.height;

    sizing.entry.height = 45;
    sizing.entry.margins.top = (sizing.entry.frame.height - sizing.entry.height) / 2;

    return sizing;

}


/**
 * A simple comparator for sorting day entries
 * by date time using string comparison.
 */
function by_datetime( a, b ) {

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


function decorate_by_day_offset_index( day, i ) {

    day.entries = day.entries.map( function( entry ) {

        entry.offset_index = i;

        return entry;

    });

    return day;

}

/**
 *
 */
function compute_offsets( data ) {

    data.forEach( function( day ) {

        day.entries = day.entries.sort( function( a,b ) { if ( moment( a.start_time ).isBefore( moment( b.start_time ) ) ) { return -1; } else { return 1; } });

        var day_start = moment( day.day.split(' - ')[1], 'MM/DD/YYYY' );
        var day_end = moment( day.day.split(' - ')[1], 'MM/DD/YYYY' ).add( 1, 'day' );

        day.timing = {
            start: day_start.unix(),
            end: day_end.unix()
        };

        day.entries.forEach( function( entry ) { entry.timing = day.timing; });

    });

    return data;

}


// RENDERABLE FUNCTIONS

var map = linear_map( 24, 0 )( Math.PI / 2 + Math.PI, (-3 * Math.PI) / 2 + Math.PI );
var map_inverse = linear_map( Math.PI / 2 + Math.PI, (-3 * Math.PI) / 2 + Math.PI )( 24, 0 );
//var map = linear_map( 24, 0 )( 0, 2 * Math.PI );

function build_diagram_root( element, sizing ) {
    return d3.select( element )
        .append('svg')
        .attr( 'width', sizing.diagram.width )
        .attr( 'id', 'hours-summary-diagram')
        .attr( 'height', sizing.diagram.height )
            .append('g')
            .attr('id', 'hours-summary-diagram-root')
            .attr( 'width', sizing.diagram.width )
            .attr( 'height', sizing.diagram.height )
            .attr('transform', 'translate(' + [ sizing.diagram.margins.x / 2, sizing.diagram.margins.y / 2 ] + ')');
}


function build_tick_marks( root, sizing ) {

    root.selectAll('.tick-mark')
        .data( hours )
        .enter()
        .append( 'line' )
            .classed('tick-mark', true)
            .attr('x1', function( d ) { return (sizing.diagram.width / 2) + (sizing.inner_radius - sizing.tick_length) * Math.cos( map( d ) ); } )
            .attr('y1', function( d ) { return (sizing.diagram.height / 2) + (sizing.inner_radius - sizing.tick_length) * Math.sin( map( d ) ); } )
            .attr('x2', function( d ) { return (sizing.diagram.width / 2) + sizing.inner_radius * Math.cos( map( d ) ); } )
            .attr('y2', function( d ) { return (sizing.diagram.height / 2) + sizing.inner_radius * Math.sin( map( d ) ); } );

}

function build_long_divisions( root, data, sizing ) {

    root.selectAll('.long-tick-mark')
        .data( workday_hours )
        .enter()
        .append( 'line' )
            .classed('long-tick-mark', true)
            .attr('x1', function( d ) { return (sizing.diagram.width / 2) + (sizing.inner_radius - sizing.tick_length) * Math.cos( map( d ) ); } )
            .attr('y1', function( d ) { return (sizing.diagram.height / 2) + (sizing.inner_radius - sizing.tick_length) * Math.sin( map( d ) ); } )
            .attr('x2', function( d ) { return (sizing.diagram.width / 2) + (sizing.inner_radius + data.length * sizing.entry_width ) * Math.cos( map( d ) ); } )
            .attr('y2', function( d ) { return (sizing.diagram.height / 2) + (sizing.inner_radius + data.length * sizing.entry_width ) * Math.sin( map( d ) ); } );

}



function create_arc_path( x, y, radius, start_angle, end_angle ) {

    var start_inner = { x: x + radius * Math.cos( end_angle ), y: y + radius * Math.sin( end_angle ) };

    var end_inner = { x: x + radius * Math.cos( start_angle ), y: y + radius * Math.sin( start_angle ) };


    //var start_outer = { x: x + (radius + sizing.entry_width) * Math.cos( start_angle ), y: y + (radius + sizing.entry_width) * Math.sin( start_angle ) };

    //var end_outer = { x: x + (radius + sizing.entry_width ) * Math.cos( end_angle ), y: y + (radius + sizing.entry_width) * Math.sin( end_angle ) };


    var large_arc_flag = end_angle - start_angle <= Math.PI ? "0" : "1";


    return [
        'M', start_inner.x, start_inner.y,
        'A', radius, radius, 0, large_arc_flag, 0, end_inner.x, end_inner.y,
        // 'L', start_outer.x, start_outer.y,
        // 'A', radius, radius, 0, large_arc_flag, 1, end_outer.x, end_outer.y,
        // 'Z'
    ].join(' ');
}


function build_arc_simple_length( sizing ) {

    function gap( index ) { return 0.01 * ( 1 / ((index + 1) / 4) ); }

    return function( d ) {

        var start_hour  = (moment( d.start_time ).unix() - d.timing.start) / 60 / 60;
        var end_hour    = (moment( d.end_time ).unix() - d.timing.start) / 60 / 60;

        var start_angle = map( start_hour );
        var end_angle = map( end_hour - gap( d.offset_index ) );

        var radius = sizing.inner_radius +
                   (sizing.tick_length * 2) +
                   ( d.offset_index * (sizing.entry_width + sizing.radius_margin ) +
                   ((sizing.entry_width - sizing.radius_margin) / 3) );

        return create_arc_path( sizing.diagram.width / 2, sizing.diagram.height / 2, radius, start_angle, end_angle, sizing );

    };

}

function build_arc_parameteric_length( sizing, type, index ) {

    function gap( index ) { return 0.01 * ( 1 / ((index + 1)) ); }

    return function( d ) {

        var start_hour  = (moment( d.start_time ).unix() - d.timing.start) / 60 / 60;
        var end_hour    = (moment( d.end_time ).unix() - d.timing.start) / 60 / 60;

        var start_angle = map( start_hour );
        var end_angle = map( end_hour - gap( d.offset_index ) );

        var map_angle = linear_map(0,10)( start_angle, end_angle );

        var s = d.description[ type ];

        var radius = sizing.inner_radius +
                   (sizing.tick_length * 2) +
                   ( d.offset_index * (sizing.entry_width + sizing.radius_margin ) +
                   (index * (sizing.entry_width - sizing.radius_margin) / 3) );

        return create_arc_path( sizing.diagram.width / 2, sizing.diagram.height / 2, radius, start_angle, map_angle( s ), sizing );

    };

}


function create_detail_chart( root, entry, sizing ) {

    const bar_height = 40;
    const bar_margin = 10;
    const diagram_min = 3 * sizing.diagram.width / 4;
    const diagram_max = sizing.diagram.width;
    const font_size = 10;

    function set_height( i ) { return (sizing.diagram.height / 2) - (3 * (bar_height + bar_margin) / 2) + (i * (bar_height + bar_margin)); }

    var bar_chart_map = linear_map( 0, 10 )( 0, diagram_max - diagram_min );

    var body = d3.select('body');

    var g = root.append('g')
        .classed('detail-chart-entry', true )
        .classed('detail-chart-' + entry.id, true )
        .attr('id', 'detail-chart-' + entry.id );

    g.append('line')
        .classed('detail-chart-anchor-line', true)
        .attr('x1', diagram_min )
        .attr('y1', 0 )
        .attr('x2', diagram_min)
        .attr('y1', sizing.diagram.height );


    var div = body.append('div')
        .classed('detail-chart-' + entry.id, true )
        .style('position', 'absolute')
        .style('top', `${50}px`)
        .style('left', `${diagram_min + (diagram_x_margin / 2) + 10 }px`)
        .style('width', `${diagram_max - diagram_min}px`);

    div.append('h5')
        .classed('project-name', true)
        .text( entry.project.name );

    div.append('p')
        .classed('task-name', true)
        .text( entry.task.name );

    div.append('p')
        .classed('description-text', true)
        .text( entry.description.description );

    // g.append('text')
    //     .attr('x', diagram_min + 10 )
    //     .attr('y', 50 )
    //     .text( entry.project.name )
    //     .style('font-size', 12);
    //
    // g.append('text')
    //     .attr('x', diagram_min + 10 )
    //     .attr('y', 62 )
    //     .text( entry.task.name )
    //     .style('font-size', 10);


    ['satisfaction', 'productivity', 'enjoyment'].forEach( function( type, i ) {

        g.append('rect')
            .classed( type + '-rect', true)
            .attr('x', diagram_min + bar_chart_map(0) )
            .attr('width', bar_chart_map( entry.description[ type ] ))
            .attr('y', set_height( i ) )
            .attr('height', bar_height );

        g.append('text')
            .classed( type + '-label', true)
            .attr('x', diagram_min - 60 )
            .attr('y', set_height( i ) + (bar_height + font_size / 2 ) / 2 )
            .text( type )
            .style('font-size', font_size );

        g.append('text')
            .classed( type + 'quantity-label', true)
            .attr('x', diagram_min + bar_chart_map( entry.description[ type ] ) + 10 )
            .attr('y', set_height( i ) + (bar_height + font_size / 2 ) / 2 )
            .text( entry.description[ type ] )
            .style('font-size', font_size );

    });

}

function remove_detail_chart( root, entry ) {
    d3.selectAll('.detail-chart-' + entry.id ).remove();
}

function build_arc( root, data, sizing ) {

    var day_base = root.selectAll('.day-arc-frame')
        .data( data )
        .enter()
        .append('g')
            .classed('day-arc-frame', true)
            .attr( 'width', sizing.diagram.width )
            .attr( 'height', sizing.diagram.height );


    var arc_base = day_base.selectAll('.arc-frame')
        .data( function( d ) { return d.entries; } )
        .enter()
            .append( 'g' )
            .classed('arc-frame', true)
            .on('mouseover' , function(d) {

                create_detail_chart( root, d, sizing );

            })
            .on('mouseout', function(d) {

                remove_detail_chart( root, d, sizing );

            });


    arc_base
        .append('path')
            .classed('entry-arc', true)
            .classed('base-arc', true)
            .attr('d', build_arc_simple_length( sizing ) )
            .style('stroke-width', sizing.entry_width - 3 );

    arc_base
        .append('path')
            .classed('entry-arc', true)
            .classed('statisfaction-arc', true)
            .attr('d', build_arc_parameteric_length( sizing, 'satisfaction', 0 ) )
            .style('stroke-width', (sizing.entry_width - 2*sizing.radius_margin) / 3 );

    arc_base
        .append('path')
            .classed('entry-arc', true)
            .classed('productivity-arc', true)
            .attr('d', build_arc_parameteric_length( sizing, 'productivity', 1 ) )
            .style('stroke-width', (sizing.entry_width - 2*sizing.radius_margin) / 3 );

    arc_base
        .append('path')
            .classed('entry-arc', true)
            .classed('enjoyment-arc', true)
            .attr('d', build_arc_parameteric_length( sizing, 'enjoyment', 2 ) )
            .style('stroke-width', (sizing.entry_width - 2*sizing.radius_margin) / 3 );

}

function build_day_labels( root, data, sizing ) {

    root.selectAll('.day-label')
        .data( data )
        .enter()
            .append('text')
            .classed('day-label', true)
            .attr( 'x', function( d ) {

                var first_entry = d.entries[0];

                var start_hour = ((moment( first_entry.start_time ).unix() - first_entry.timing.start) / 60 / 60) - 0.25;

                var radius = sizing.inner_radius +
                           (sizing.tick_length * 2) +
                           ( first_entry.offset_index * (sizing.entry_width + sizing.radius_margin ) +
                           ((sizing.entry_width - sizing.radius_margin) / 3) );

                return (sizing.diagram.width / 2) + radius * Math.cos( map( start_hour ) );

            })
            .attr( 'y', function( d ) {

                var first_entry = d.entries[0];

                var start_hour = ((moment( first_entry.start_time ).unix() - first_entry.timing.start) / 60 / 60) - 0.25;

                var radius = sizing.inner_radius +
                           (sizing.tick_length * 2) +
                           ( first_entry.offset_index * (sizing.entry_width + sizing.radius_margin ) +
                           ((sizing.entry_width - sizing.radius_margin) / 3) );

                return (sizing.diagram.height / 2) + radius * Math.sin( map( start_hour ) );

            })
            .style('font-size', 8 )
            .text( function( d ) { return d.day.split(' - ')[1].slice(0,5); });

}

function draw_cursor( root, sizing ) {

    var cx = (sizing.diagram.width) / 2, cy = (sizing.diagram.height) / 2;

    d3.select('body').on('mousemove', function( d ) {
        var x = d3.event.screenX, y = d3.event.clientY;

        console.log( d3.event );

        d3.selectAll('.cursor').remove();

        var r = Math.sqrt( Math.pow( x - cx, 2 ) + Math.pow( y - cy, 2 ) );

        var theta_upper = Math.asin( (y - cy) / r );
        var theta_lower = Math.acos( (x - cx) / r );

        console.log( theta_upper );
        console.log( theta_lower );


        root.append('line').classed('cursor', true)
            .attr('x1', cx )
            .attr('y1', cy )
            .attr('x2', cx + 50 * Math.cos( theta_lower ) )
            .attr('y2', cy + 50 * Math.sin( theta_upper ) );
            // .attr('x2', Math.acos( (x - cx) / r ) )
            // .attr('y2', Math.asin( (y - cy) / r ) );

    });
}




function render_entries( data, element ) {

    data = partition_by( function( object ) { return moment( object.start_time ).format('dddd - MM/DD/YYYY'); }, data.entries );

    data.sort( by_datetime );

    data = data.map( decorate_by_day_offset_index );

    data = compute_offsets( data );

    console.log( data );

    const sizing = compute_sizing();

    const root = build_diagram_root( element, sizing );

    //data = [ data[0], data[1], data[3], data[4] ];

    build_arc( root, data, sizing );

    build_long_divisions( root, data, sizing );

    build_tick_marks( root, sizing );

    build_day_labels( root, data, sizing );

    //draw_cursor( root, sizing );

}

function HourSummaries( element ) {
    if ( !(this instanceof HourSummaries) ) { return new HourSummaries( element ); }
    var self = this;

    self.element = element;
    self.data = [];

}

HourSummaries.prototype.init = function() {

    var self = this;

    window.addEventListener( 'resize', function() { self.render( self.data, self.element ); } );

};


HourSummaries.prototype.render = function( data ) {

    var self = this;

    self.data = data;

    render_entries( data, self.element );

};

export { HourSummaries };
