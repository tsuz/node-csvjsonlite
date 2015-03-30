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

    module.exports          = CSVtoJSON;

    /** Automatically detects file, string, or URL and converts to JSON format */
    CSVtoJSON.convert       = _convert;

    /** Convert file from CSV to JSON */
    CSVtoJSON.convertFile   = _convertFile;

    /** Convert file from CSV to JSON */
    CSVtoJSON.convertString = _convertString;

    /** Convert file from CSV to JSON */
    CSVtoJSON.convertURL    = _convertURL;



/////////////////////////
/////////////////////////
/////////////////////////

/**
 * Implementation, Private Functions
 */

    /**
     * Convert String
     */
    function _convertString(stringData){
        return new Promise(function(resolve, reject){
            _readFileData(resolve, reject)(null, stringData);
        });
    }

    /**
     * Convert URL
     * @private
     */

    function _convertURL(csvFileName){
        return new Promise(function(resolve, reject){
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
        });
    }

    /**
     * Convert File
     * @private
     */
    function _convertFile(csvFileName){
        return new Promise(function(resolve, reject){
            fs.exists(csvFileName, function (exists) {
                if(!exists){
                    reject('File does not exist');
                } else{
                    fs.readFile(csvFileName, _readFileData(resolve, reject));
                }
            });
        })
    }

    /**
     * Convert
     * @param csvFileName
     * @returns {bluebird}
     * @private
     */
    function _convert(csvFileName){
        return new Promise(function(resolve, reject){
            /** HTTP(S) or local data */
            var fn;
                if(_isHTTPFile(csvFileName)) {
                    /** HTTP/HTTPS URL */
                    fn = 'convertURL';
                } else if(/,/.test(csvFileName)){
                    /** String **/
                    fn = 'convertString';
                } else if(/.csv\s*$/.test(csvFileName)){
                    /** File Dir **/
                    fn = 'convertFile';
                } else{
                    reject('Invalid Conversion Type');
                }

                CSVtoJSON[fn](csvFileName)
                    .then(function(success){
                        resolve(success);
                    }, function(err){
                        reject(err);
                    });
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
                    _keepstr = match.substring(1,match.length) + ',';
                }
            } else if(endWithQuotes.test(match)){
                /** Does not end with single double quotes so keep it for now **/
                _keepstr += match.substring(0,match.length-1);
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
