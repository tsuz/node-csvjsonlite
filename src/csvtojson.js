/**
 * CSV to JSON Converter
 */

"use strict";

var Promise     = require('bluebird');
var fs          = require('fs');
var CSVtoJSON   = {};

/////////////////////////
/////////////////////////
/////////////////////////


/**
 * Public Headers, Variables, and Functions
 */

    module.exports = CSVtoJSON;

    /** Convert from CSV to JSON */
    CSVtoJSON.convert = _convert;



/////////////////////////
/////////////////////////
/////////////////////////

/**
 * Implementation, Private Functions
 */


    /**
     * Convert
     * @param csvFileName
     * @returns {bluebird}
     * @private
     */
    function _convert(csvFileName){
        //csvFileName = './src/valid-data.csv';
        return new Promise(function(resolve, reject){
            /** HTTP(S) or local data */
                if(_isHTTPFile(csvFileName)) {
                    /** HTTP or HTTPS */
                    var http    = /http:\/\//.test(csvFileName) ? require('http') : require('https');
                    csvFileName = csvFileName.replace(/^https?:\/\//,'');
                    var query   = csvFileName.split('/');
                    var host    = query.shift();
                    var path    = query.join('/');

                    http.get({
                            host: host,
                            path: '/' + path
                        }, function (res) {
                            var chunk = '';

                            res.on('data', function (_chunk) { chunk += _chunk });
                            res.on('end',  function () {
                                _readFileData(resolve,reject)(null, chunk);
                            });
                        })
                        .on('error', function(err){
                            reject(err);
                        })
                }
                else {
                    fs.exists(csvFileName, function (exists) {
                        if(!exists){
                            reject('File does not exist');
                        } else{
                            fs.readFile(csvFileName, _readFileData(resolve, reject));
                        }
                    });
                }
        });
    }

    /**
     * Is HTTP file or local file
     * @param filename
     * @returns {boolean}
     */
    function _isHTTPFile(filename){
        return /^https?:\/\//i.test(filename);
    }


    /**
     * Read Data from file
     */
    function _readFileData(resolve, reject) {
        return function(err, data) {
            var output = [];
            var _data = data.toString();
            var firstRowIndent = _data.indexOf('\n');
            var firstRow = _data.substring(0, firstRowIndent).split(',');
            if(_readFileData__arrayIsEmpty(firstRow)){
                return resolve(output);
            }
            var otherRows = _data.substring(firstRowIndent + 1, _data.length).split('\n');
            if(_readFileData__arrayIsEmpty(otherRows)){
                return resolve(output);
            }
            for(var key in otherRows){
                if(!otherRows[key]) continue;
                var _obj = {};
                var _element = _readFileData__convertToArray(otherRows[key]);
                /** Handle any kind of comma within double quotes */
                for (var key in firstRow) {
                    _obj[firstRow[key]] = _element[key];
                }
                output.push(_obj)
            }
            resolve(output);
        }
    }

    /**
      * Read file data - empty array check
      */
    function _readFileData__arrayIsEmpty(arr){
        if(arr.length < 1){
            return true;
        }
        for(var key in arr){
            if(arr[key]){
                return false;
            }
        }
        return true;
    }

    /**
     *  Read file data -
     */
    function _readFileData__convertToArray(str){
        var commaRegExp     = new RegExp('([^,]+)','g');
        /** Start with single double quotes only */
        var startWithQuotes = new RegExp('^(\"[^\"]|\s+\"[^\"])');
        /** Ends with single double quotes only */
        var endWithQuotes   = new RegExp('([^\"](\"|\"\s+))$');
        var _keepstr    = '';
        var _output     = [];
        str.replace(commaRegExp, function(match){
            if(startWithQuotes.test(match)){
                if(endWithQuotes.test(match)){
                    /** Starts with double quotes and ends with double quotes **/
                    _output.push(match);
                } else{
                    /** Add to cache so it can be concatenated **/
                    _keepstr = match + ',';
                }
            } else if(endWithQuotes.test(match)){
                /** Does not end with single double quotes so keep it for now **/
                _keepstr += match;
                _output.push(_keepstr);
                _keepstr = '';
            } else if(_keepstr.length > 0){
                /** Add to _keepstr and move on */
                _keepstr += match + ',';
            } else{
                /** _keepstr is length 0 so just a normal string. add to stack */
                _output.push(match + ',');
            }
        })
        return _output;
    }
