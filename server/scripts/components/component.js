'use strict';

var uuid = require('uuid');

/**
 * Abstract Class: Component
 * =========================
 *
 * The component class is the basis for
 * all of our interface components. Our
 * interface components come in two flavors:
 *
 * 1. TransformComponents. TransformComponents handle transforming
 *                         data in some way, and passing the results on to downstream components.
 *
 * 2. RenderComponents. RenderComponents are responsible for actually rendering data to the page.
 *
 */
class Component {

    /**
     *
     *
     *
     */
    constructor() {

        this.prefix = 'id-' + uuid.v4();
        this.data = [];
        this.downstream = {};

    }

    /**
     * The init routine handles any
     * setup that this component requires.
     */
    init() { return this; }

    /**
     * The source routine assigns a set of
     * data to this component, and propagates
     * changed data to downstream components.
     */
    trigger( data ) {

        for ( var id in this.downstream ) {
            if ( this.downstream.hasOwnProperty( id ) ) {
                this.downstream[ id ].trigger( data );
            }
        }

        return this;

    }

    /**
     * Given a downstream component to add, add the passed
     * component to the set of downstreams at this component,
     * and trigger the passed component with this components data.
     *
     */
    through( component ) {

        if ( component.prefix === this.prefix ) { throw new Error('ComponentError: tried to add a component as a downstream of itelf.'); }

        this.downstream[ component.prefix ] = component;

        component.trigger( this.data );

        return component;

    }

    /**
     * Given a downstream component to remove,
     * remove that component from the set of downstreams
     * at this component.
     */
    remove( component ) {

        if ( typeof this.downstream[ component.prefix ] !== 'undefined') {
            delete this.downstream[ component.prefix ];
        }

        return this;

    }

}

export { Component };
