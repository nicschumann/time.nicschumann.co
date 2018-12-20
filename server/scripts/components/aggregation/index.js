'use strict';

var d3 = Object.assign( require('d3'), require('d3-fetch') );

function filter_projects( project ) { return true; }

function reduce_to_name_id_pairs( project ) { return { name: project.name, id: project.id }; }

function AggregationPane( element ) {
    if (!(this instanceof AggregationPane)) { return new AggregationPane( element ); }
    var self = this;

    self.element = element;
    self.options = [];

}


function make_select_element( element ) {
    var selectElement =
        d3.select( element )
            .append( 'div' )
            .classed( 'select-frame', true );

    selectElement
        .append('ul')
        .attr('id', 'selected-options')
        .classed('selected-options', true);

    selectElement
        .append('ul')
        .attr('id', 'select-options')
        .classed('select-options', true)
        .classed( 'select-options-loading', true );

    return selectElement;
}


AggregationPane.prototype.init = function( sizing ) {

    var self = this;

    make_select_element( self.element );

    self.selectOptions = d3.select('#select-options');

    self.activeOptions = d3.select('#selected-options');

    d3  .json( '/api/v1/projects' )
        .then( function( res ) {

            if ( res.success && typeof res.data.projects !== 'undefined' ) {

                var data = res.data.projects.filter( filter_projects ).map( reduce_to_name_id_pairs );

                var lis = self.selectOptions
                    .classed( 'select-options-loading', false )
                    .classed( 'select-options-loaded', true )
                    .selectAll( '.option' )
                        .data( data )
                        .enter()
                        .append('li')
                        .classed('option', true )
                        .classed('option-row', true)
                        .attr('id', function( d ) { return 'option-' + d.id; } )
                        .attr('data-option-id', function( d ) { return d.id; } )
                        .attr('value', function( d ) { return d.id; } )
                        .on( 'click', function( d ) {

                            d3.select( this ).classed('active', true);
                            self.options.push( d );
                            self.renderActiveOptions();

                        });

                lis
                    .append('p')
                    .text( function( d ) { return d.name; } )


            } else {

                var error_box =
                    self.selectOptions
                        .classed( 'select-options-loading', false )
                        .classed( 'select-options-errored', true );

                error_box
                    .append('h3')
                    .classed('error-intro', true)
                    .text('Whoops, we couldn\'t load any projects!');

                error_box
                    .append('p')
                    .classed('error-details', true)
                    .text( res.blame.message );

            }

        });

    return self;

};

/**
 *
 *
 *
 */
AggregationPane.prototype.renderActiveOptions = function() {
    var self = this;

    console.log( self.options );

    if ( self.options.length === 0 ) { d3.selectAll('.selected-option').remove(); return; }

    var activeOptions = self.activeOptions.selectAll('.selected-option').data( self.options, function( d ) { return d.id; } );

    var lis = activeOptions
        .enter()
        .append('li')
            .classed('selected-option', true)
            .classed('option-row', true)
            .attr('id', function( d ) { return 'active-option-' + d.id; } )
            .attr('data-option-id', function( d ) { return d.id; } )
            .attr('value', function( d ) { return d.id; } )
            .on( 'click', function(d) {

                d3.select( '#option-' + d.id ).classed('active', false);
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

    activeOptions.exit().remove();

};


export { AggregationPane };
