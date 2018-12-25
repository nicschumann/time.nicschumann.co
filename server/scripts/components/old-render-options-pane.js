'use strict';

var d3 = Object.assign( require('d3'), require('d3-fetch') );
var uuid = require('uuid');

function OptionsPane( element ) {
    if (!(this instanceof OptionsPane)) { return new OptionsPane( element ); }
    var self = this;

    self.element = element;
    self.options = [];
    self.prefix = 'id-' + uuid.v4();
    self.next = function() {};

}





OptionsPane.prototype.makeSelectElement = function( ) {
    var self = this;

    var selectElement =
        d3.select( self.element )
            .append( 'div' )
            .classed( 'select-frame', true );

    selectElement
        .append('ul')
        .attr('id', self.prefix + '-selected-options')
        .classed('selected-options', true);

    selectElement
        .append('ul')
        .attr('id', self.prefix + '-select-options')
        .classed('select-options', true)
        .classed( 'select-options-loading', true );

    return selectElement;
};

/**
 * Initialize the options pane by creating an
 * the required elements. Does not actually
 * render the supplied values,
 */
OptionsPane.prototype.init = function( ) {

    var self = this;

    self.makeSelectElement();

    self.selectOptions = d3.select('#' + self.prefix + '-select-options');

    self.activeOptions = d3.select('#' + self.prefix + '-selected-options');

    return self;

};

OptionsPane.prototype.matchActiveOptionsToData = function( data ) {

    var self = this;

    if ( self.options.length > 0 ) {

        self.options = self.options.filter( function( option ) {

            for ( var i in data ) { if (data[ i ].id === option.id) { return true; } }

            return false;

        });

    }

    console.log( self.options );

    self.renderActiveOptions();

};

/**
 * This routine sets the datasource for a given selection renderer,
 * and renders the options-list to the page. This function can be
 * called at any time to update the set of data representing the available options.
 *
 * NOTE: a singe options pane may only have a SINGLE source.
 *
 * @param array data an array containing options objects to render.
 *                   options objects must contain at least a unique id and a name.
 *
 */
OptionsPane.prototype.source = function( data ) {

    var self = this;

    self.matchActiveOptionsToData( data );

    var options =
        self.selectOptions
            .classed( 'select-options-loading', false )
            .classed( 'select-options-loaded', true )
            .selectAll( '.option' )
            .data( data, function( d ) { return d.id; } );

    var lis =
        options
            .enter()
            .append('li')
            .classed('option', true )
            .classed('option-row', true)
            .attr('id', function( d ) { return self.prefix + '-option-' + d.id; } )
            .attr('data-option-id', function( d ) { return d.id; } )
            .attr('value', function( d ) { return d.id; } )
            .on( 'click', function( d ) {

                d3.select( this ).classed('active', true);
                self.options.push( d );
                self.renderActiveOptions();

            });

        lis
            .append('p')
            .text( function( d ) { return d.name; } );

    options
        .exit()
        .remove();

    return self;

};

/**
 * Specify a function that's called whenever the set of
 * active options changes.
 *
 * NOTE: a singe options pane may only have a SINGLE sink.
 */
OptionsPane.prototype.sink = function( nextStep ) {

    var self = this;

    self.next = nextStep;

    return self;

};

/**
 * This routine updates the active options associated with
 * this select box. Active options appear at the top of
 * the select window in an active options list, and appear
 * marked with the .active class in the list of options.
 */
OptionsPane.prototype.renderActiveOptions = function() {
    var self = this;

    var activeOptions = self.activeOptions.selectAll('.selected-option').data( self.options, function( d ) { return d.id; } );

    var lis =
        activeOptions
            .enter()
            .append('li')
                .classed('selected-option', true)
                .classed('option-row', true)
                .attr('id', function( d ) { return self.prefix + 'active-option-' + d.id; } )
                .attr('data-option-id', function( d ) { return d.id; } )
                .attr('value', function( d ) { return d.id; } )
                .on( 'click', function(d) {

                    d3.select( '#' + self.prefix + '-option-' + d.id ).classed('active', false);
                    self.options = self.options.filter( function( option ) { return option.id !== d.id; } );
                    self.renderActiveOptions();

                });

            lis
                .append('p')
                .text( function( d ) { return d.name; } )
                    .append('span')
                    .classed('option-remove-button', true)
                    .classed('pictogram', true)
                    .text('X');

    activeOptions
        .exit()
        .remove();

    self.next( self.options );

};


export { OptionsPane };
