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
    constructor( ) {

        this.prefix = 'id-' + uuid.v4();
        this.downstream = {};
        this.parent = null;

    }

    /**
     * The init routine handles any
     * setup that this component requires.
     */
    init() { return this; }

    /**
     * This is an unimplemented method that should be overridden
     * by subclasses. It is responsible for implementing all of
     * the functionality required by this component.
     */
    transform( data ) { return data; }

    /**
     * Run this pipeline that this component is part of
     * from the top. Calling this method on any component in
     * pipeline will pass the supplied data to the top of the
     * chain, and then begin processing from the top.
     */
    run( data ) {

        if ( this.parent !== null ) {
            this.parent.run( data );
        } else {
            this.trigger( data );
        }

        return this;

    }

    /**
     * The source routine assigns a set of
     * data to this component, and propagates
     * changed data to downstream components.
     */
    trigger( data ) {


        data = this.transform( data );

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

        if ( component.parent !== null ) { throw new Error(`ComponentError: You're piping data from "${this.constructor.name}" through "${component.constructor.name}" that already has a parent: "${component.parent.constructor.name}". Standard Data Streams must be have a tree-like structure.`);}

        component.parent = this;

        this.downstream[ component.prefix ] = component;

        return component;

    }

    /**
     * Given a downstream component to remove,
     * remove that component from the set of downstreams
     * at this component.
     */
    remove( component ) {

        if ( typeof this.downstream[ component.prefix ] !== 'undefined') {
            this.downstream[ component.prefix ].parent = null;
            delete this.downstream[ component.prefix ];
        }

        return this;

    }



}

export { Component };
