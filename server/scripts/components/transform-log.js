'use strict';

import { Component } from './abstract-component.js';


class LogComponent extends Component {

    constructor( prefix = null ) {
        super();
        this.logPrefix = prefix;
    }

    /**
     * This dead-simple component just logs the data
     * passing through it to the console.
     */
    transform( data ) {

        if ( this.logPrefix !== null ) {
            console.log( `${ this.logPrefix }: `, data );
        } else {
            console.log( data );
        }

        return data;

    }

}

export { LogComponent };
