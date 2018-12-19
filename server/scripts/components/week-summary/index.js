'use strict';

var moment = require('moment');
var d3 = Object.assign( require('d3'), require('d3-fetch') );
var partition_by = require('../utilities/index.js').partition_by;


const weeks_displayed = 8;


var types = ['satisfaction', 'productivity', 'enjoyment'];


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

/**
 * Given a dataset of timesheet entries from the API and a function that aggregates a set of entries,
 * Add an agregate to each key to each equialence class determined by the aggregator.
 */
function construct_aggregate( aggregator, data ) {

    return data.map( function( equivalence_class ) {

        equivalence_class.aggregate = aggregator( equivalence_class.entries, equivalence_class.aggregate );

        return equivalence_class;

    });
}


function build_aggregated_quantities_for( types, aggregate, entry, total_duration ) {

    const weight = ( entry.duration / total_duration );

    types.forEach( function( type ) {

        aggregate[ type ].avg +=  weight * entry.description[ type ];
        aggregate[ type ].min = Math.min( aggregate[ type ].min, entry.description[ type ] );
        aggregate[ type ].max = Math.max( aggregate[ type ].max, entry.description[ type ] );

    });

    return aggregate;

}


function reduce_aggregated_quantities_for( types, aggregate, entry, total_duration ) {

    const weight_squared = Math.pow( entry.duration / total_duration, 2);

    types.forEach( function( type ) {
        /**
         * Note that this changes the way the statistical properties of the
         * weighted mean is constructed. In particular, since the w_i sum to 1,
         * the weighted average no longer needs to be divided by any particular quantity.
         *
         * The standard deviation of the weighted mean, which is the square root of
         * the product of the squares of the variance terms and cooresponding weights,
         * should properly be called the standard error of the weighted mean.
         *
         * Letting σᵢ = (xᵢ - x̄), the weighted variance is ∑ᵢ wᵢ²σᵢ². the root of this is the standard error.
         */

        aggregate[ type ].stdev +=  weight_squared * Math.pow( entry.description[ type ] - aggregate[ type ].avg, 2 );

    });

    return aggregate;

}

/**
 * Given a set of time entries representing a day, construct the
 * total duration invested in the day.
 */
function build_total_duration( class_entries ) {
    return class_entries.reduce( function( a,b ) { return a + b.duration; }, 0 );
}

/**
 *
 */
function build_aggregate_quantities( data ) {

    return construct_aggregate( function( class_entries ) {

        const total_duration = build_total_duration( class_entries );

        return class_entries.reduce( function( aggregate, entry ) {

            return build_aggregated_quantities_for( types, aggregate, entry, total_duration );

        }, {
            satisfaction: { avg: 0, min: Infinity, max: -Infinity, stdev: 0 },
            productivity: { avg: 0, min: Infinity, max: -Infinity, stdev: 0 },
            enjoyment: { avg: 0, min: Infinity, max: -Infinity, stdev: 0 }
        });


    }, data);

}


function reduce_aggregated_quantities( data ) {

    return construct_aggregate( function( class_entries, aggregate ) {

        const total_duration = build_total_duration( class_entries );

        var finished = class_entries.reduce( function( aggregate, entry ) {

            return reduce_aggregated_quantities_for( types, aggregate, entry, total_duration );

        }, aggregate );

        return finished;

    }, data );

}


function insert_dummy_days( data ) {

    if ( data.length <= 1 ) { return data; }

    var final_sequence = [];

    for ( var y = 0, t = 1; t < data.length; y += 1, t += 1 ) {

        var last = data[ y ], current = data[ t ];

        final_sequence.push( last );

        var last_date = moment( last.day.split(' - ')[1], 'MM/DD/YYYY' ).add( 1, 'days' );
        var current_date = moment( current.day.split(' - ')[1], 'MM/DD/YYYY' );

        while ( !last_date.isSame( current_date ) ) {

            final_sequence.push( { day: last_date.format('dddd - MM/DD/YYYY'), dummy: true } );
            last_date = last_date.add( 1, 'days' );

        }

    }

    return final_sequence;

}


function linear_map( a,b ) {
    return function( c,d ) {
        return function (t) {
            return ((d - c) / (b - a)) * (t - a) + c;
        };
    };
}


function round_term( n, precision ) {

    n = n.toString();
    var point = n.indexOf('.')

    return n.slice(0, (point!==-1) ? point + precision + 1 : n.length );

}

function estimate_label_width( label, sizing ) {
    return label.length * sizing.labels.font_width;
}


/** =====================
 * Renderable Application
 * ===================== */

const weeks_per_screen = 2;

const diagram_x_margin = 100;
const diagram_y_margin = 100;

const day_r_margin = 50;
const day_b_margin = 120;

const label_font_max_size = 12;

function compute_sizing( ) {

    var sizing = {

        diagram: { margins: { x: diagram_x_margin, y: diagram_y_margin } },

        day: { positions: {}, margins: { r: day_r_margin, b: day_b_margin } },

        labels: { },

        entry: { frame: { margins: {} }, margins: { } }
    };

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

function build_diagram_root( element, sizing ) {
    return d3.select( element )
        .append('svg')
        .attr( 'width', sizing.diagram.width )
        .attr( 'height', Math.max( sizing.diagram.height, (sizing.day.height + sizing.day.margins.b) * weeks_displayed ) )
            .append('g')
            .attr('id', 'diagram-root')
            .attr( 'width', sizing.diagram.width )
            .attr( 'height', Math.max( sizing.diagram.height, (sizing.day.height + sizing.day.margins.b) * weeks_displayed ) )
            .attr('transform', 'translate(' + [ sizing.diagram.margins.x / 2, sizing.diagram.margins.y / 2 ] + ')');
}

function build_detail_root( root, sizing ) {
    return root.append('section')
            .classed('hidden', true )
            .attr('id', 'detail-root' )
            .style('width', vw( sizing.entry.frame.width ) )
            .style('height', vh( sizing.entry.frame.height ) )
            .style('left', vw( sizing.entry.frame.margins.left ) )
            .style('top', vh( sizing.entry.frame.margins.top ) );

}


function build_day_breakdown( data, root, sizing ) {

    root.classed( 'hidden', false );

    const total_duration = build_total_duration( data.entries );

    var running_sum = 10;

    var entries = root.selectAll('.entry').data( data.entries );

    entries
        .enter()
        .append('div')
            .classed('entry', true)
            .style('left', function( d,i ) { return per( running_sum ); })
            .style('top', per( sizing.entry.margins.top ) )
            .style('width', function( d,i ) {
                const width = 80 * d.duration / total_duration;
                running_sum += width;
                return per( width );
            })
            .style('height', function( d,i ) { return per( sizing.entry.height ); });


}

function build_day_groups( data, root, sizing ) {

    var day_count = { 'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0 };

    function increment_initial_counts( day ) {
        switch ( day ) {

            case 'Saturday':
                day_count.Friday = 1;

            case 'Friday':
                day_count.Thursday = 1;

            case 'Thursday':
                day_count.Wednesday = 1;

            case 'Wednesday':
                day_count.Tuesday = 1;

            case 'Tuesday':
                day_count.Monday = 1;

            case 'Monday':
                day_count.Sunday = 1;

            default:
                return;
        }
    }

    root.selectAll('.day').remove();

    var days = root
        .selectAll('.day')
        .data( data )
        .enter()
            .append('g')
            .classed('day', true)
            .classed( 'dummy', function( d ) { return d.dummy; })
            .attr('id', function( d ) { return d.day.replace(/\s/g, ''); })
            .attr('width', px( sizing.day.width ) )
            .attr('height', px( sizing.day.height ) )
            .attr('transform', function( d, i ) {

                var day = d.day.slice( 0, d.day.indexOf(' - '));

                if ( i === 0 ) { increment_initial_counts( day ); }

                var translate = 'translate(' + [
                    sizing.day.positions.x[ day ],
                    day_count[ day ] * ( sizing.day.height + sizing.day.margins.b )
                ] + ')';

                day_count[ day ] += 1;

                return translate;

            })
            .on( 'click', function( d, i ) {
                build_day_breakdown( d, d3.select('#detail-root'), sizing );
            });

    days.merge( days );

    days
        .exit()
        .remove();

    return days;

}


function build_range_line( days, type, type_x, type_map, sizing ) {

    days    .append( 'line' )
            .classed( 'range-line', true )
            .classed( 'dummy', function( d ) { return d.dummy; })
            .attr('x1', type_x )
            .attr('y1', function( d ) { return ( d.dummy ) ? 0 : type_map( d.aggregate[type].max ); })
            .attr('x2', type_x )
            .attr('y2', function( d ) { return ( d.dummy ) ? 0 : type_map( d.aggregate[type].min ); });


    days    .append( 'line' )
            .classed( 'range-top-tick', true )
            .classed( 'range-tick', true )
            .classed( 'dummy', function( d ) { return d.dummy; })
            .attr('x1', type_x - ( sizing.day.width / 12 ) )
            .attr('y1', function( d,i ) { return ( d.dummy ) ? 0 : type_map( d.aggregate[type].max ); })
            .attr('x2', type_x + ( sizing.day.width / 12 ) )
            .attr('y2', function( d,i ) { return ( d.dummy ) ? 0 : type_map( d.aggregate[type].max ); });


    days    .append( 'line' )
            .classed( 'range-bottom-tick', true )
            .classed( 'range-tick', true )
            .classed( 'dummy', function( d ) { return d.dummy; })
            .attr('x1', type_x - ( sizing.day.width / 12 ) )
            .attr('y1', function( d,i ) { return ( d.dummy ) ? 0 : type_map( d.aggregate[type].min ); })
            .attr('x2', type_x + ( sizing.day.width / 12 ) )
            .attr('y2', function( d,i ) { return ( d.dummy ) ? 0 : type_map( d.aggregate[type].min ); });


    days    .append( 'text' )
            .classed( 'range-line-label', true )
            .classed( 'text-label', true )
            .classed( 'dummy', function( d ) { return d.dummy; })
            .attr('x', type_x - (sizing.labels.font_width / 2) )
            .attr('y', function( d,i ) { return ( d.dummy ) ? 0 : type_map( d.aggregate[type].max ) - sizing.labels.padding; })
            .text( function( d,i ) { return ( d.dummy ) ? 0 : d.aggregate[type].max; } )
            .style('font-size', sizing.labels.font_size);

    days    .append( 'text' )
            .classed( 'range-line-label', true )
            .classed( 'text-label', true )
            .classed( 'dummy', function( d ) { return d.dummy; })
            .attr('x', type_x - (sizing.labels.font_width / 2) )
            .attr('y', function( d,i ) { return ( d.dummy ) ? 0 : type_map( d.aggregate[type].min ) + 2 * sizing.labels.padding; })
            .text( function( d,i ) { return ( d.dummy ) ? 0 : d.aggregate[type].min; } )
            .style('font-size', sizing.labels.font_size);

}

function append_day_label( days, sizing ) {

    days    .append('text')
            .classed('day-label', true)
            .classed('text-label', true)
            .classed( 'dummy-label', function( d ) { return d.dummy; })
            .attr('x', function( d ) { return (sizing.day.width / 2) - (estimate_label_width( d.day, sizing ) / 2); } )
            .attr('y', px( sizing.day.height + 2 * (sizing.labels.font_size + sizing.labels.padding ) ) )
            .text( function( d ) { return d.day; } )
            .style('font-size', sizing.labels.font_size);

}

function build_error_box( days, type, type_x, type_map, sizing ) {

    days  .append( 'rect' )
            .classed( 'standard-deviation', true )
            .classed( 'dummy', function( d ) { return d.dummy; })
            .attr('x', function(d,i) { return ( d.dummy ) ? 0 : type_x - ( sizing.day.width / 12 ); } )
            .attr('y', function(d,i) { return ( d.dummy ) ? 0 : type_map( d.aggregate[ type ].avg + (d.aggregate[ type ].stdev / 2) ); } )
            .attr('width', function(d,i) { return ( d.dummy ) ? 0 : (sizing.day.width / 6); } )
            .attr('height', function( d,i ) { return ( d.dummy ) ? 0 : Math.abs( type_map( 10 - d.aggregate[ type ].stdev ) ); } )

}


function build_reference_line( days, line_type, y_pos, sizing ) {

    days    .append( 'line' )
            .classed('reference-line', true)
            .classed('reference-' + line_type + '-line', true)
            .classed( 'dummy', function( d ) { return d.dummy; })
            .attr('x1', 0 )
            .attr('y1', y_pos  )
            .attr('x2', sizing.day.width )
            .attr('y2', y_pos );

}


function build_mean( days, type, type_x, type_map, sizing ) {

    days    .append( 'line' )
            .classed( 'mean-marker', true )
            .classed( 'dummy', function( d ) { return d.dummy; })
            .classed( 'dummy-marker', function( d ) { return d.dummy; })
            .attr('x1', function(d,i) { return ( d.dummy ) ? 0 : type_x - ( sizing.day.width / 8 ); } )
            .attr('y1', function(d,i) { return ( d.dummy ) ? 0 : type_map( d.aggregate[ type ].avg ); } )
            .attr('x2', function(d,i) { return ( d.dummy ) ? 0 : type_x + ( sizing.day.width / 8 ); } )
            .attr('y2', function(d,i) { return ( d.dummy ) ? 0 : type_map( d.aggregate[ type ].avg ); } );

    days    .append( 'text' )
            .classed( 'range-line-label', true )
            .classed( 'text-label', true )
            .classed( 'dummy', function( d ) { return d.dummy; })
            .classed( 'dummy-label', function( d ) { return d.dummy; })
            .attr('x', function(d,i) { return ( d.dummy ) ? 0 : type_x + ( sizing.labels.font_width / 2 ); } )
            .attr('y', function( d,i ) { return ( d.dummy ) ? 0 : type_map( d.aggregate[ type ].avg ) + 2 * sizing.labels.padding; })
            .text( function( d,i ) { return ( d.dummy ) ? 0 : ( d.aggregate[type].min !== d.aggregate[type].max ) ? round_term( d.aggregate[type].avg, 2 ) : ''; } )
            .style('font-size', sizing.labels.font_size);

}


function build_day_plots( data, day_gs, sizing ) {

    var xs = {
        'satisfaction': sizing.day.width / 6,
        'productivity': sizing.day.width / 2,
        'enjoyment': 5 * (sizing.day.width / 6)
    };

    var map = linear_map( 0, 10 )( sizing.day.height, 0 );

    //day_gs.data( data.filter( function( day ) { return !day.dummy; } ) );

    build_reference_line( day_gs, 'top', 0, sizing );
    build_reference_line( day_gs, 'middle', sizing.day.height / 2, sizing );
    build_reference_line( day_gs, 'bottom', sizing.day.height, sizing );

    types.forEach( function( type ) {

        append_day_label( day_gs, sizing );
        build_range_line( day_gs, type, xs[ type ], map, sizing );
        build_error_box( day_gs, type, xs[ type ], map, sizing );
        build_mean( day_gs, type, xs[ type ], map, sizing );

    });

}

function render( data, root ) {

    var sizing = compute_sizing( );

    var day_gs = build_day_groups( data, root, sizing );

    build_day_plots( data, day_gs, sizing );

}

function renderEntries( data, element ) {

    data = partition_by( function( object ) { return moment( object.start_time ).format('dddd - MM/DD/YYYY'); }, data.entries );

    data.sort( by_datetime );

    data = build_aggregate_quantities( data );

    data = reduce_aggregated_quantities( data );

    data = insert_dummy_days( data );

    console.log( data );

    var sizing = compute_sizing( );

    var root = build_diagram_root( element, sizing );

    //var detail_root = build_detail_root( element, sizing );

    render( data, root );

    window.addEventListener( 'resize', function() { render( data, root ); } );

}



function WeekSummaries( element ) {
    if ( !(this instanceof WeekSummaries) ) { return new WeekSummaries( element ); }
    var self = this;

    self.element = element;
    self.data = [];

}

WeekSummaries.prototype.init = function() {

    var self = this;

    window.addEventListener( 'resize', function() { self.render( self.data, self.element ); } );

};


WeekSummaries.prototype.render = function( data ) {

    var self = this;

    self.data = data;

    renderEntries( data, self.element );

};

export { WeekSummaries };
