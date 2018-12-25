'use strict';

import { Component } from './abstract-component.js';


class All extends Component {

    constructor( f ) {
        super();
        this.f = f;
    }

    /**
     * This dead-simple component just logs the data
     * passing through it to the console.
     */
    transform( data ) { return this.f( data ); }

}

export { All };
