'use strict';

import { Component } from './abstract-component.js';

var d3 = Object.assign( require('d3'), require('d3-fetch') );
var linear = require('./utilities/index.js').linear_map;
var colors = require('./utilities/color.js');



class NormalPlot extends Component {

    /**
     *
     */
    constructor( element, keys = ['satisfaction','productivity','enjoyment'] ) {
        super();

        this.element = element;

        this.viewBox = {
            x: 0,
            y: 0,
            width: 1000,
            height: 1000,
            horizontal_margin: 50,
            vertical_margin: 75,
            inner_margin: 10,
            text_margin: 25
        };

        this.maps = {};
        this.static = {};
        this.dynamic = {};

        this.keys = keys;

    }

    /**
     * The init method for NormalPlot sets up
     * the variously statically determinable DOMElement
     * that can be
     */
    init() {
        this.container =
            d3  .select( this.element )
                .append('div')
                .attr('id', this.prefix + '-normal-plot' )
                .classed('normal-plot-loading', true)
                .classed('normal-plot-container', true);

        this.diagram =
            this.container
                .append('svg')
                .classed('normal-plot', true)
                .attr( 'width', '100%' )
                .attr( 'height', '100%' )
                .attr('viewBox', [ this.viewBox.x, this.viewBox.y, this.viewBox.width, this.viewBox.height].join(' ') )
                    .append('g')
                    .attr('id', 'diagram-root')
                    .attr( 'width', this.viewBox.width )
                    .attr( 'height', this.viewBox.width );

        this.static.plot =
            this.diagram
                .append('g')
                .classed('plot-rules', true);

        this.static.labels =
            this.container
                .append('div')
                .classed('plot-rules-labels', true);

        return this;
    }

    /**
     * Draw an axis tick line given a location
     * in the y axis domain (ie, in [0,10]).
     */
    drawPlotTickLine( y_location ) {

        this.dynamic.plot
            .append('line')
            .classed('plot-axis-line', true)
            .attr('x1', this.viewBox.horizontal_margin )
            .attr('x2', this.viewBox.width - this.viewBox.text_margin )
            .attr('y1', this.maps.y( y_location ) )
            .attr('y2', this.maps.y( y_location ) );

        this.dynamic.plot
            .append('text')
            .classed('plot-axis-label', true)
            .attr('x', this.viewBox.horizontal_margin )
            .attr('y', this.maps.y( y_location ) - this.viewBox.text_margin )
            .text( y_location );

        return this;

    }

    /**
     * Draw the static labels on the plot. These are the labels
     * which do not depend on the data being rendered by this plot.
     */
    drawPlotLabels( width ) {

        var self = this;

        self.keys.forEach( function( key, i ) {

            self.static.labels
                .append('span')
                .classed('text-label', true)
                .classed('plot-axis-label', true)
                .style('left', (self.maps.x( i, 0 ) / 10) + '%' )
                .style('top', ((self.maps.y( 10 ) - self.viewBox.text_margin) / 10 ) + '%')
                .style('width', ((width - 2 * self.viewBox.inner_margin) / 10) + '%')
                .text( key );

        });

        self.static.labels
            .append('span')
            .classed('text-label', true)
            .classed('plot-axis-label', true)
            .classed('plot-title', true)
            .style('left', '0%' )
            .style('top', ((self.maps.y( 0 ) + 4 * self.viewBox.text_margin) / 10 ) + '%')
            .style('width', '100%')
            .text( 'Chart Title' );

        return self;

    }

    /**
     * This routine draws the background line behind the box plot.
     */
    drawExtentsLine( key, i, iw ) {
        var self = this;

        const offset_multiplier = 1 / 3;
        const width_multiplier = 1 - offset_multiplier;

        // NOTE: Plot Elements

        self.dynamic.plot
            .append('line')
            .classed('normal-plot-extents-line', true)
            .classed('normal-plot-'+ key +'-extents-line', true)
            .attr('x1', function( d, j ) { return self.maps.x( i, j ) + iw / 2; } )
            .attr('y1', function( d ) { return self.maps.y( d[ key ].max ); })
            .attr('x2', function( d, j ) { return self.maps.x( i, j ) + iw / 2; } )
            .attr('y2', function( d ) { return self.maps.y( d[ key ].min ); } );

        self.dynamic.plot
            .append('line')
            .classed('normal-plot-extents-line', true)
            .classed('normal-plot-'+ key +'-extents-line', true)
            .attr('x1', function( d, j ) { return self.maps.x( i, j ) + offset_multiplier * iw; } )
            .attr('y1', function( d ) { return self.maps.y( d[ key ].max ); })
            .attr('x2', function( d, j ) { return self.maps.x( i, j ) + width_multiplier * iw; } )
            .attr('y2', function( d ) { return self.maps.y( d[ key ].max ); } );

        self.dynamic.plot
            .append('line')
            .classed('normal-plot-extents-line', true)
            .classed('normal-plot-'+ key +'-extents-line', true)
            .attr('x1', function( d, j ) { return self.maps.x( i, j ) + offset_multiplier * iw; } )
            .attr('y1', function( d ) { return self.maps.y( d[ key ].min ); })
            .attr('x2', function( d, j ) { return self.maps.x( i, j ) + width_multiplier * iw; } )
            .attr('y2', function( d ) { return self.maps.y( d[ key ].min ); } );

        // NOTE: Label Elements

        self.dynamic.labels
            .append('span')
            .classed('text-label', true)
            .classed('plot-data-label', true)
            .style('left', function( d, j ) { return (self.maps.x( i, j ) / 10) + '%'; })
            .style('top', function( d ) { return ((self.maps.y( d[ key ].max ) - 50) / 10) + '%'; } )
            .style('width', (iw / 10) + '%' )
            .text( function( d ) { return d[ key ].max; } );

        self.dynamic.labels
            .append('span')
            .classed('text-label', true)
            .classed('plot-data-label', true)
            .style('left', function( d, j ) { return (self.maps.x( i, j ) / 10) + '%'; })
            .style('top', function( d ) { return ((self.maps.y( d[ key ].min )) / 10) + '%'; } )
            .style('width', (iw / 10) + '%' )
            .text( function( d ) { return d[ key ].min; } );


        return this;
    }

    /**
     *
     *
     */
    drawAverageLine( key, i, iw ) {

        var self = this;

        self.dynamic.plot
            .append('line')
            .classed('normal-plot-average-line', true)
            .classed('normal-plot-'+ key +'-average-line', true)
            .attr('x1', function( d, j ) { return self.maps.x( i, j ); } )
            .attr('y1', function( d ) { return self.maps.y( d[ key ].avg ); })
            .attr('x2', function( d, j ) { return self.maps.x( i, j ) + iw; } )
            .attr('y2', function( d ) { return self.maps.y( d[ key ].avg ); } );

        return self;
    }

    /**
     *
     *
     */
    drawStdevBox( key, i, iw ) {

        var self = this;

        self.dynamic.plot
            .append('rect')
            .classed('normal-plot-stdev-box', true)
            .classed('normal-plot-'+ key +'-stdev-box', true)
            .attr('x', function( d, j ) { return self.maps.x( i, j ) + iw / 8; } )
            .attr('y', function( d ) { return self.maps.y( d[ key ].avg + d[ key ].stdev ); })
            .attr('width', (3/4) * iw )
            .attr('height', function( d ) { return self.maps.y(0) - self.maps.y( d[ key ].stdev * 2 ); } )
            .attr('style', function( d ) { return 'fill:' + colors.rgb[ key ]( d ); });

        return self;

    }

    /**
     * Override the parents rendering routine to
     * to implement our baseline rendering.
     */
    transform( data ) {

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


        self.drawPlotLabels( w );
        self.drawPlotTickLine( 2.5 );
        self.drawPlotTickLine( 5 );
        self.drawPlotTickLine( 7.5 );

        self.keys.forEach( function( key, i ) {

            self.drawExtentsLine( key, i, iw );
            self.drawAverageLine( key, i, iw );
            self.drawStdevBox( key, i, iw );

        });

        self.container.classed('normal-plot-loading', false );

        return data;
    }

}

export { NormalPlot };
