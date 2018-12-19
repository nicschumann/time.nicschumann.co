"use strict";

var async = require('async');
var scheduler = require('node-schedule');
var Paymo = require('./paymo.js');

/**
 * cronRule determines a typical cron string from the human-legible schedule object field
 * provided with each task.
 *
 * @param rule a potentially undefined cron rule to define a canonical string for.
 */
function cronRule( rule ) { return ( typeof rule === "undefined" ) ? "*" : rule; }

/**
 * cronRuleFromSchedule builds a cron string for the set of available cron schedule items.
 *
 * @param schedule object, an object
 */
function cronRuleFromSchedule( schedule ) {
    return [ schedule.second, schedule.minute, schedule.hour, schedule.dayOfMonth, schedule.month, schedule.dayOfWeek ].map( cronRule ).join(' ');
}

/**
 * It's possible to pass a function as the value of the name or description field. In this case,
 * This function will be called with the resolved information from the Paymo API, and should return a
 * string containing the name or description, respectively.
 */
function buildParametricTaskValues( taskfield, project, tasklist, users ) {
    return ( typeof taskfield === "function" ) ? taskfield : function() { return taskfield; };
}




function Scheduler( keys, config ) {
    if ( !(this instanceof Scheduler)) { return new Scheduler( keys, config ); }
    var self = this;

    self.paymo = new Paymo( keys, config );

}

/**
 * This routine takes a specific task object with sane project, tasklist, and user names,
 * retrieves the required ID information from the Paymo API, and posts the new task, with
 * the specified data to the API.
 *
 * @param task a task object as specified in the tasks.js list
 * @param callback a function consuming (err, result) containing the next step of computation.
 *
 */
Scheduler.prototype.postTask = function( task, callback ) {

    var paymo = this.paymo;

    async.parallel({
            users: function( done ) {
                paymo   .get( task.assigner, "users" )
                        .then( function( d ) { done( null, d.users.filter( function( user ) { return task.users.indexOf( user.name ) !== -1 || task.users.indexOf( user.email ) !== -1; } ) ); } )
                        .catch( done );
            },
            data: function( done ) {
                paymo   .get( task.assigner, "projects" )
                        .then( function( d ) {

                            var project = d.projects.filter( function ( project ) { return project.name.toLowerCase() === task.project.toLowerCase() || project.code === task.project_name; } );
                            if ( project.length > 1 ) { done( new Error("Error: Project Name \"" + task.project + "\" did not select a unique project." ) ); }
                            if ( project.length < 1 ) { done( new Error("Error: Project \"" + task.project + "\" doesn't exist." ) ); }


                            paymo   .get(task.assigner, "tasklists", "where=project_id=" + project[0].id )
                                    .then( function( d ) {

                                        var tasklist = d.tasklists.filter( function( tasklist ) { return tasklist.name.toLowerCase() === task.tasklist.toLowerCase(); });
                                        if ( tasklist.length > 1 ) { done( new Error("Error: Tasklist Name \"" + task.tasklist + "\" did not select a unique tasklist." ) ); }
                                        if ( tasklist.length < 1 ) { done( new Error("Error: Tasklist \"" + task.tasklist + "\" doesn't exist." ) ); }

                                        done( null, {project: project[0], tasklist: tasklist[0] });

                                    })
                                    .catch( done );

                        })
                        .catch( done );

            }
        },
        function( e, results ) {

            if ( e ) { callback( e ); }

            var name = buildParametricTaskValues( task.name )( results.data.project, results.data.tasklist, results.data.users );
            var description = buildParametricTaskValues( task.description )( results.data.project, results.data.tasklist, results.data.users );

            paymo.post( task.assigner, 'tasks', {
                "name": name,
                "description": description,
                "tasklist_id": results.data.tasklist.id,
                "users": results.users.map( function( user ) { return user.id; }),
                "notify_emails": true
            })
            .then( function( d ) {
                callback( null, d );
            })
            .catch( function( e ) {
                callback( e );
            });

        }
    );

};

/**
 * This routine schedules a specific task update job based on the schedule associated with each task.
 *
 * @param task a task object as specified in the tasks.js list
 * @param callback a function consuming (err, result) containing the next step of computation.
 *
 */
Scheduler.prototype.scheduleTask = function( task, callback ) {

    if ( typeof callback !== "function" ) { callback = function( e ) { if (e) { console.error(e); } }; }

    var self = this;
    var cronRule = cronRuleFromSchedule( task.schedule );

    console.log( "Scheduler: scheduling \"" + task.name + "\" with rule: \"" + cronRule + "\"" );

    scheduler.scheduleJob( cronRule, function() {
        self.postTask( task, callback );
    });
};



module.exports = Scheduler;
