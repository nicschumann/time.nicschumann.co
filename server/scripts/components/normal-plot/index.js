'use strict';

var uuid = require('uuid');
var d3 = Object.assign( require('d3'), require('d3-fetch') );
var linear = require('../utilities/index.js').linear_map;
var colors = require('../utilities/color.js');


function NormalPlot( element ) {
    if ( !(this instanceof NormalPlot)) { return new NormalPlot( element ); }
    var self = this;

    self.element = element;
    self.prefix = 'id-' + uuid.v4();

    self.viewBox = {
        x: 0,
        y: 0,
        width: 1000,
        height: 1000,
        horizontal_margin: 50,
        vertical_margin: 75,
        inner_margin: 10,
        text_margin: 25
    };

    self.maps = {};
    self.static = {};
    self.dynamic = {};

    self.keys = ['satisfaction','productivity','enjoyment'];

}


NormalPlot.prototype.init = function() {

    var self = this;

    self.container =
        d3  .select( this.element )
            .append('div')
            .attr('id', self.prefix + '-normal-plot' )
            .classed('normal-plot-loading', true)
            .classed('normal-plot-container', true);

    self.diagram =
        self.container
            .append('svg')
            .classed('normal-plot', true)
            .attr( 'width', '100%' )
            .attr( 'height', '100%' )
            .attr('viewBox', [ self.viewBox.x, self.viewBox.y, self.viewBox.width, self.viewBox.height].join(' ') )
                .append('g')
                .attr('id', 'diagram-root')
                .attr( 'width', self.viewBox.width )
                .attr( 'height', self.viewBox.width );

    return this;

};



/**
 * Draw a simple marker across the horizontal extent
 * of the normal plot, indicating the y-axis height of a
 * certain score.
 */
NormalPlot.prototype.drawPlotTickLine = function( plot, labels, where ) {

    var self = this;

    plot
        .append('line')
        .classed('plot-axis-line', true)
        .attr('x1', self.viewBox.horizontal_margin )
        .attr('x2', self.viewBox.width - self.viewBox.text_margin )
        .attr('y1', self.maps.y( where ) )
        .attr('y2', self.maps.y( where ) );

    plot
        .append('text')
        .classed('plot-axis-label', true)
        .attr('x', self.viewBox.horizontal_margin )
        .attr('y', self.maps.y( where ) - self.viewBox.text_margin )
        .text( where );

    return self;

};


NormalPlot.prototype.drawPlotLabels = function( plot, labels, w ) {

    var self = this;

    self.keys.forEach( function( key, i ) {

        labels
            .append('span')
            .classed('text-label', true)
            .classed('plot-axis-label', true)
            .style('left', (self.maps.x( i, 0 ) / 10) + '%' )
            .style('top', ((self.maps.y( 10 ) - self.viewBox.text_margin) / 10 ) + '%')
            .style('width', ((w - 2 * self.viewBox.inner_margin) / 10) + '%')
            .text( key );

    });

    labels
        .append('span')
        .classed('text-label', true)
        .classed('plot-axis-label', true)
        .classed('plot-title', true)
        .style('left', '0%' )
        .style('top', ((self.maps.y( 0 ) + 4 * self.viewBox.text_margin) / 10 ) + '%')
        .style('width', '100%')
        .text( 'Chart Title' );

    return self;

};


NormalPlot.prototype.drawExtentsLine = function( plot, labels, key, i, iw ) {

    var self = this;

    const offset_multiplier = 1 / 3;
    const width_multiplier = 1 - offset_multiplier;

    // NOTE: Plot Elements

    plot
        .append('line')
        .classed('normal-plot-extents-line', true)
        .classed('normal-plot-'+ key +'-extents-line', true)
        .attr('x1', function( d, j ) { return self.maps.x( i, j ) + iw / 2; } )
        .attr('y1', function( d ) { return self.maps.y( d[ key ].max ); })
        .attr('x2', function( d, j ) { return self.maps.x( i, j ) + iw / 2; } )
        .attr('y2', function( d ) { return self.maps.y( d[ key ].min ); } );

    plot
        .append('line')
        .classed('normal-plot-extents-line', true)
        .classed('normal-plot-'+ key +'-extents-line', true)
        .attr('x1', function( d, j ) { return self.maps.x( i, j ) + offset_multiplier * iw; } )
        .attr('y1', function( d ) { return self.maps.y( d[ key ].max ); })
        .attr('x2', function( d, j ) { return self.maps.x( i, j ) + width_multiplier * iw; } )
        .attr('y2', function( d ) { return self.maps.y( d[ key ].max ); } );

    plot
        .append('line')
        .classed('normal-plot-extents-line', true)
        .classed('normal-plot-'+ key +'-extents-line', true)
        .attr('x1', function( d, j ) { return self.maps.x( i, j ) + offset_multiplier * iw; } )
        .attr('y1', function( d ) { return self.maps.y( d[ key ].min ); })
        .attr('x2', function( d, j ) { return self.maps.x( i, j ) + width_multiplier * iw; } )
        .attr('y2', function( d ) { return self.maps.y( d[ key ].min ); } );

    // NOTE: Label Elements

    labels
        .append('span')
        .classed('text-label', true)
        .classed('plot-data-label', true)
        .style('left', function( d, j ) { return (self.maps.x( i, j ) / 10) + '%'; })
        .style('top', function( d ) { return ((self.maps.y( d[ key ].max ) - 50) / 10) + '%'; } )
        .style('width', (iw / 10) + '%' )
        .text( function( d ) { return d[ key ].max; } );

    labels
        .append('span')
        .classed('text-label', true)
        .classed('plot-data-label', true)
        .style('left', function( d, j ) { return (self.maps.x( i, j ) / 10) + '%'; })
        .style('top', function( d ) { return ((self.maps.y( d[ key ].min )) / 10) + '%'; } )
        .style('width', (iw / 10) + '%' )
        .text( function( d ) { return d[ key ].min; } );


    return this;

};

/**
 * Given an aggregated view of some data,
 * construct a normal plot for that
 *
 *
 */
NormalPlot.prototype.source = function( data ) {

    console.log( data );

    var self = this;

    self.container.classed('normal-plot-loading', true );

    const n = data.length;
    const m = self.viewBox.horizontal_margin;
    const mₜ = m * (self.keys.length + 1);
    const wₜ = (self.viewBox.width - mₜ);
    const w = wₜ / self.keys.length;

    const im = self.viewBox.inner_margin;
    const imₜ = im * (n + 1);
    const iwₜ = w - imₜ;
    const iw = iwₜ / n;


    self.maps.x = function( i, j ) {  return m + im + (i * (w + m)) + (j * (iw + im)); };
    self.maps.x_percent = function( i, j ) { return (self.maps.x( i, j ) / 10); };

    self.maps.y = linear( 0, 10 )( self.viewBox.height - self.viewBox.vertical_margin, self.viewBox.vertical_margin );
    self.maps.y_percent = function( value ) { return (self.maps.y( value ) / 10); };

    self.static.plot =
        self.diagram
            .append('g')
            .classed('plot-rules', true);

    self.static.labels =
        self.container
            .append('div')
            .classed('plot-rules-labels', true);

    self.dynamic.plot =
        self.diagram
            .selectAll( '.plot' )
            .data( data )
            .enter()
            .append('g')
            .classed( 'plot', true );

    self.dynamic.labels =
        self.container
            .selectAll('.labels')
            .data( data )
            .enter()
            .append('div')
            .classed('labels', true );


    self.drawPlotLabels( self.static.plot, self.static.labels, w, im );
    self.drawPlotTickLine( self.static.plot, self.static.labels, 2.5 );
    self.drawPlotTickLine( self.static.plot, self.static.labels, 5 );
    self.drawPlotTickLine( self.static.plot, self.static.labels, 7.5 );

    self.keys.forEach( function( key, i ) {

        self.drawExtentsLine( self.dynamic.plot, self.dynamic.labels, key, i, iw );

        self.dynamic.plot
            .append('line')
            .classed('normal-plot-average-line', true)
            .classed('normal-plot-'+ key +'-average-line', true)
            .attr('x1', function( d, j ) { return self.maps.x( i, j ); } )
            .attr('y1', function( d ) { return self.maps.y( d[ key ].avg ); })
            .attr('x2', function( d, j ) { return self.maps.x( i, j ) + iw; } )
            .attr('y2', function( d ) { return self.maps.y( d[ key ].avg ); } );

        self.dynamic.plot
            .append('rect')
            .classed('normal-plot-stdev-box', true)
            .classed('normal-plot-'+ key +'-stdev-box', true)
            .attr('x', function( d, j ) { return self.maps.x( i, j ) + iw / 8; } )
            .attr('y', function( d ) { return self.maps.y( d[ key ].avg + d[ key ].stdev ); })
            .attr('width', function( d, j ) { return (3/4) * iw; } )
            .attr('height', function( d ) { return self.maps.y(0) - self.maps.y( d[ key ].stdev * 2 ); } )
            .attr('style', function( d ) { return 'fill:' + colors.rgb[ key ]( d ); })


    });

    self.container.classed('normal-plot-loading', false );

};


export { NormalPlot };
