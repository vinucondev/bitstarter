#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var util = require('util');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://stark-garden-1021.herokuapp.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioStream = function(checkURL) {
    return cheerio.load(checkURL);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
  
    $ = cheerioHtmlFile(htmlfile);

    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var buildfn = function(htmlfile, checksfile) {
    var checkURLFile = function(result, response) {
        if (result instanceof Error) {
            console.log("No URL specified")
            console.error('Error: ' + util.format(response.message));
        } else {
            $ = cheerioStream(result);
        }
        var checks = loadChecks(checksfile).sort();
        var out = {};
        for(var ii in checks) {
           var present = $(checks[ii]).length > 0;
           out[checks[ii]] = present;
        }
        console.log(JSON.stringify(out, null, 4));

    };
    return checkURLFile;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-u, --url <url_file>')
        .parse(process.argv);

    if(program.url == null){
      var checkJson = checkHtmlFile(program.file, program.checks);
      console.log(JSON.stringify(checkJson, null, 4));
    }
    else{
      var checkURLFile = buildfn(program.file, program.checks);
      rest.get(program.url).on('complete', checkURLFile);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
