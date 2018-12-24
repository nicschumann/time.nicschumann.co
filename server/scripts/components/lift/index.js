'use strict';

import { TransformComponent } from '../transform.js';


class Lift extends TransformComponent {

    constructor( f ) {
        super();
        this.f = f;
    }

    /**
     * This dead-simple component just logs the data
     * passing through it to the console.
     */
    transform( data ) { return data.map( this.f ); }

}

export { Lift };
