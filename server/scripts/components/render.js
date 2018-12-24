'use strict';

import { Component } from './component.js';


class RenderComponent extends Component {

    /**
     * RenderComponents require a DOMElement to
     * attatch their visualization or interface
     * logic to.
     */
    constructor( element ) {

        super();
        this.element = element;

    }

    /**
     * This routine implements a rendering procedure
     * for drawing the supplied data to the
     */
    render( data ) { return this; }

    /**
     * Override the default triggering behavior to
     * render the passed data, and then trigger the super
     */
    trigger( data ) {

        this.data = this.render( data );

        return super.trigger( data );

    }

}

export { RenderComponent };
