"use strict";

var request = require("request-promise");
var base64 = require("base-64");
var async = require('async');

var validPaymoTypes = ["bookings", "clientcontacts", "clients", "comments", "entries", "company", "discussions", "estimatetemplates", "timeentries", "users", "projects", "tasklists", "tasks"];

function Paymo( keys, config ) {
    if (!(this instanceof Paymo)) { return new Paymo( keys, config ); }
    var self = this;

    self.keys = keys;
    self.paymo_url = config.paymo_url;

}

/** Make an authenticated API get request */
Paymo.prototype.get = function( user, type, query ) {

    if ( validPaymoTypes.indexOf( type ) === -1 ) { throw new Error("Error: \"" +type+ "\" is not a valid Paymo request type."); }

    query = ( typeof query === "undefined" ) ? "" : "?" + query;

    var encodedKey = this.keys[ user ] + ":X";

    return request({
        uri: [this.paymo_url, type, query].join(''),
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": ["Basic", base64.encode( encodedKey ) ].join(" "),
        },
        json: true
    });

};

/** Make an authenticated API get request */
Paymo.prototype.post = function( user, type, data ) {

    if ( validPaymoTypes.indexOf( type ) === -1 ) { throw new Error("Error: \"" +type+ "\" is not a valid Paymo request type."); }

    var encodedKey = this.keys[ user ] + ":X";

    return request({
        uri: [this.paymo_url, type].join(''),
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Authorization": ["Basic", base64.encode( encodedKey ) ].join(" "),
        },
        body: data,
        json: true
    });

};

/**
 * This helper generates a special selector for reducing the set of entries by
 * a given set of user and task ids, which have been computed from the domain.
 * It further restricts a range to a given time slice specified in the aggregation rule.
 *
 */
function entries_selector( user_ids, from, to ) {
    var includes = "&include=project.name,project.client.name,task.name,task.tasklist.name,user.name";
    return "where=user_id in (" + user_ids.join(",") + ") and time_interval in (" + ["\""+from.format()+"\"", "\""+to.format()+"\""].join(",") + ")" + includes;
}

/**
 * Given a set of users, a start time, and an end time,
 * return a list of time entries from that time period,
 * which is given by a moment time stamp.
 */
Paymo.prototype.entrySegment = function( sponsor, users, start, end, callback ) {

    var self = this;

    self    .get( sponsor, 'users' )
            .then( function( d ) {

                users = d.users
                    .filter( function( user ) { return users.indexOf( user.name ) !== -1; })
                    .map( function( user ) { return user.id; } );

                var query = entries_selector( users, start, end );

                self    .get( sponsor, 'entries', query )
                        .then( function( d ) { callback( null, d ); })
                        .catch( callback );


            })
            .catch( callback );

};

module.exports = Paymo;
