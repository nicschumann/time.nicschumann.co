'use strict';

import { TransformComponent } from '../transform.js';


class LogComponent extends TransformComponent {

    constructor() { super(); }

    /**
     * This dead-simple component just logs the data
     * passing through it to the console.
     */
    transform( data ) {

        console.log( data );

        return data;

    }

}

export { LogComponent };
