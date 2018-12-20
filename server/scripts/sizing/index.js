'use strict';


var EventEmitter = require('events');

/**
 * The sizing module is responsible for tracking
 * changes to the document sizing, recalculating
 * size changes based on external events, and
 * propagating changes to subscribed modules.
 *
 */
function Sizing() {
    if ( !(this instanceof Sizing)) { return new Sizing(); }
    var self = this;

    self.emitter = new EventEmitter();


}

Sizing.prototype.recalculate = function() {
    var self = this;





}


export { Sizing };
