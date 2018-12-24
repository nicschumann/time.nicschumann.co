'use strict';

import { TransformComponent } from '../transform.js';

class SummaryComponent extends TransformComponent {

    constructor() {
        super();
        this.keys = ['satisfaction', 'productivity', 'enjoyment'];
    }

    /**
     *
     *
     */
    initial() {
        return {
            satisfaction: { avg: 0, min: Infinity, max: -Infinity, stdev: 0 },
            productivity: { avg: 0, min: Infinity, max: -Infinity, stdev: 0 },
            enjoyment: { avg: 0, min: Infinity, max: -Infinity, stdev: 0 }
        };
    }

    transform( data ) {

        var self = this;

        const total_duration = data.reduce( function( total, datapoint ) { return total + datapoint.duration; }, 0 );

        /**
         * Step 1. Calculate the basic summarys statistics for the set of entries we're given.
         */
        var averages = data.reduce( function( running_summary, datapoint ) {

            const wᵢ = datapoint.duration / total_duration;

            self.keys.forEach( function( key ) {

                running_summary[ key ].avg += wᵢ * datapoint.description[ key ];
                running_summary[ key ].min = Math.min( running_summary[ key ].min, datapoint.description[ key ] );
                running_summary[ key ].max = Math.max( running_summary[ key ].max, datapoint.description[ key ] );

            });

            return running_summary;

        }, self.initial() );

        /**
         * Step 2. Calculate the deviations from the calculated mean.
         */
        var finished = data.reduce( function( running_summary, datapoint ) {

            const wᵢ = Math.pow( datapoint.duration / total_duration, 2 );

            self.keys.forEach( function( key ) {
                /**
                 * Note that this changes the way the statistical properties of the
                 * weighted mean is constructed. In particular, since the w_i sum to 1,
                 * the weighted average no longer needs to be divided by any particular quantity.
                 *
                 * The standard deviation of the weighted mean, which is the square root of
                 * the product of the squares of the variance terms and cooresponding weights,
                 * should properly be called the standard error of the weighted mean.
                 *
                 * Letting σᵢ = (xᵢ - x̄), the weighted variance is ∑ᵢ wᵢ²σᵢ². the root of this is the standard error.
                 */

                running_summary[ key ].stdev += wᵢ * Math.pow( datapoint.description[ key ] - running_summary[ key ].avg, 2);

            });

            return running_summary;

        }, averages);

        return [ finished ];

    }

}

export { SummaryComponent };
