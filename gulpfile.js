'use strict';

// Gulp configuration:
var config = require('./gulp.config')();

// Imports:
var gulp = require('gulp');
var util = require('gulp-util');
var karma = require('karma').server;
var _ = require('lodash');

// Tasks:
gulp.task('tdd', tddTask);
gulp.task('karma', karmaTask);
gulp.task('coverage', coverageTask);

/**
 * Test driven development task.
 */
function coverageTask(done) {
    log('Starting a continuous "watch and test" cycle');

    startKarma('coverage', done);
}

/**
 * Test driven development task.
 */
function tddTask(done) {
    log('Starting a continuous "watch and test" cycle');

    startKarma('tdd', done);
}

/**
 * Runs karma with default configuration.
 */
function karmaTask(done) {
    startKarma('x', done);
}

/**
 * Runs karma with given configuration type
 *
 * @param {string} configType
 * @param callback
 */
function startKarma(configType, callback) {
    var options = _.merge(
        config.karma.default,
        config.karma[configType] || {}
    );

    karma.start(options, callback);
}

/**
 * Log a message or series of messages using chalk's blue color.
 * Can pass in a string, object or array.
 */
function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        util.log(util.colors.blue(msg));
    }
}
