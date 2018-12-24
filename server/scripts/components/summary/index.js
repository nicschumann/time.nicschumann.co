'use strict';



/**
 * This summary class implements a procedure for rolling up a set of
 * time entries into summary statistics: min, max, mean, and standard deviation.
 *
 */
function Summary( ) {
    if ( !(this instanceof Summary) ) { return new Summary( ); }
    var self = this;

    self.transformed = [];
    self.next = function() {};

    self.keys = ['satisfaction', 'productivity', 'enjoyment'];

}


/**
 * This function specifies an initial condition for
 * the summary. This is used at the beginning of the
 * aggregation process.
 */
Summary.prototype.initial = function() {
    return {
        satisfaction: { avg: 0, min: Infinity, max: -Infinity, stdev: 0 },
        productivity: { avg: 0, min: Infinity, max: -Infinity, stdev: 0 },
        enjoyment: { avg: 0, min: Infinity, max: -Infinity, stdev: 0 }
    };
};


/**
 * This function summarizes the the input data by computing the
 * mean, min, max, and standard deviation from the mean.
 */
Summary.prototype.summarize = function( data ) {

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

    return finished;

};

/**
 * given some data to reduce to a summary statistic,
 * summarize the data, and pass it to the next element
 * in the pipeline.
 */
Summary.prototype.source = function( data ) {

    console.log( data );

    this.transformed = [ this.summarize( data ) ];

    this.next( this.transformed );

    return this;

};


/**
 * Set the next function in this chain.
 */
Summary.prototype.sink = function( next ) {

    this.next = next;

    this.next( this.transformed );

    return this;

};

export { Summary };
