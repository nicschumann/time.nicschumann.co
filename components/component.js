'use strict';

function Component( retrieve = function() {}, render = 'render' ) {
    if ( !(this instanceof Component) ) { return new Component( retrieve, render ); }
    var self = this;


    /**
     * The retrieve routine is the user-defined function passed to get data from paymo, or wherever else, really.
     * This routine is called with any parameters passed to the URL as parameters to the function itself.
     * The return object of this request sequence is passed on to render function.
     */
    self.retrieve = retrieve;

    /**
     * The render object is called to render data retreived from the API.
     */
    self.render = render;

}

module.exports = Component;
