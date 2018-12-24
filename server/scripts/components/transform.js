'use strict';

import { Component } from './component.js';

class TransformComponent extends Component {

    constructor() {
        super();
    }

    /**
     * This routine implements a transformation
     * on the incoming data. this transformation is
     * called whenever the component is triggered
     * with new data.
     */
    transform( data ) { return data; }

    /**
     * Override the default triggering behavior to
     * render the passed data, and then trigger the super
     */
    trigger( data ) {

        this.data = this.transform( data );

        return super.trigger( data );

    }

}

export { TransformComponent }
