#!/usr/bin/env node

// index.js
// Ku page getter
//
// A command-line tool for retrieving all Ku pages.
//
'use strict';

var program = require('commander');
var async = require('async');
var request = require('request');
var util = require('util');
var fs = require('fs');
var path = require('path');
var StringDecoder = require('string_decoder').StringDecoder;

function _main() {

    program
        .usage('[options]')
        .option('-s, --startingNumber <number>', 'The starting index for Kus to retrieve. Default: 0')
        .option('-e, --endingNumber <number>', 'The ending index for Kus to retrieve. Default: 500000')
        .option('-c, --concurrency <number>', 'Max number of concurrent requests. Default: 10')
        .option('-u --user <username>', 'The username of the Ku user we\'re interested in. Required.')
        .option('-o --outputFolder <path>', 'The relative path to the folder in which the downloaded files should be written. Default: ./ku')
        .parse(process.argv);

    // Input validation.
    if (program.user === undefined) throw new Error('--user is required.');

    // Default values.
    if (program.startingNumber === undefined) program.startingNumber = 0;
    if (program.endingNumber === undefined) program.endingNumber = 500000;
    if (program.outputFolder === undefined) program.outputFolder = './ku';
    if (program.concurrency === undefined) program.concurrency = 10;

    // Setup.
    const pageUrl = 'http://kuapp.me/h/%s';
    const kuUrl = 'http://heyku.me/Photos//Heykus//heyku_%s.png';

    const outputFolder = path.resolve(program.outputFolder);
    const userPat = new RegExp(program.user);

    // Do the thing.
    async.waterfall([
        function (callback) {
            // Create array matching range of IDs.
            var range = [];
            for (var n = program.startingNumber; n <= program.endingNumber; ++n) {
                range.push(n);
            }

            // Create the output folder if it doesn't exist.
            if (!fs.existsSync(outputFolder)) {
                fs.mkdirSync(outputFolder);
            }

            // Get the Kus
            async.eachLimit(range, program.concurrency, function (n, cbEach) {
                async.retry({ times: 3, interval: 200 }, function(cbRetry) {
                    async.waterfall([
                        function fetchPage(callback) {
                            console.info('Fetching ku %s', n)
                            var requestUrl = util.format(pageUrl, n);
                            request(requestUrl, function (error, response, body) {
                                if (error) return callback(error);

                                if (response.statusCode === 200) {
                                    return callback(null, body, requestUrl);
                                }
                                else {
                                    var errMsg = util.format('Request %s returned status: %s', requestUrl, response.statusCode);
                                    console.warn(errMsg);
                                    return callback(new Error(errMsg));
                                }
                            });
                        },
                        function skipIfNotUser(body, requestUrl, callback) {
                            var match = body.match(userPat);
                            if (match === null) {
                                // not our user, jump out.
                                return cbEach(null);
                            }
                            else {
                                // continue
                                console.info('Found user [%s] on page %s.', program.user, requestUrl);
                                return callback(null, body);
                            }
                        },
                        function savePageFile(body, callback) {
                            var outputFile = path.join(outputFolder, util.format('ku_%s.html', n));
                            console.info('Saving ku page %s to file: %s', n, outputFile);
                            fs.open(outputFile, 'w', function (err, fd) {      // 'a' to append, 'w' to truncate
                                if (err) return callback(err);

                                var decoder = new StringDecoder('utf8');
                                var dataStr = decoder.write(body);

                                fs.writeFile(outputFile, dataStr, {}, function (err) {
                                    if (err) return callback(err);

                                    fs.close(fd, function (err) {
                                        console.info('Saved ku %s to file %s', n, outputFile);
                                        return callback(err);
                                    });
                                });
                            });
                        },
                        function fetchImage(callback) {
                            console.info('Fetching ku image for %s', n);
                            var outputFile = path.join(outputFolder, util.format('ku_%s.png', n));

                            request
                                .get(util.format(kuUrl, n))
                                .on('error', function (err) {
                                    console.warn(err);
                                })
                                .pipe(fs.createWriteStream(outputFile));

                            return callback(null);
                        },
                    ], function (err) {
                        return cbRetry(err);
                    });   // async.waterfall
                }, function () {
                    // Don't propagate errors, let each() continue.
                    return cbEach(null);
                });   // async.retry
            }, function (err) {
                console.info('done');

                return callback(err);
            });  // async.eachLimit
        },
    ], function (err) {
        var exitCode = 0;
        if (err) {
            exitCode = 1;
            console.error('%s', err);
        }

        process.exit(exitCode);
    });

}


try {
    _main();
}
catch(err) {
    console.error('%s', err);
}
