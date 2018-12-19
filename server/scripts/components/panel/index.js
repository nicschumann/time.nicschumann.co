'use strict';

var moment = require('moment');
var d3 = Object.assign( require('d3'), require('d3-fetch') );

function compute_panel_sizing( element, base_sizing ) {
    return base_sizing;
}

function get_sizing( element ) {

    var sizing = { margins: { l: 25, r: 25, t: 50, b: 50 } };

    sizing.width = element.clientWidth - sizing.margins.l - sizing.margins.r;
    sizing.height = 50;

    return sizing;

}

function Panel( element ) {
    if ( !(this instanceof Panel) ) { return new Panel( element ); }
    var self = this;

    self.element = element;
    self.root = null;

}

Panel.prototype.render = function() {

    var self = this;
    var size = get_sizing( self.element );

    self.root = d3.select( self.element )
        .append('div')
        .classed('panel-root', true)
        .style( 'width', size.width )
        .style( 'height', size.height )


    self.root
        .append( 'button' )
        .classed( 'panel-toggle', true );



    self.root
        .append( 'button' )
        .classed( 'panel-toggle', true );

};


export { Panel };
