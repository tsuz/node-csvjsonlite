/**
 *  CSV to JSON Test
 */

"use strict";

var expect      = require('chai').expect;
var CSVtoJSON   = require('./../src/csvtojson');

describe('CSV to JSON', function(){

    var definedKeys     = ['Date','Open','High','Low','Close','Volume','Adj Close'];
    var validDataFile   = './test/data/valid-data.csv';
    var mtplReturnsFile = './test/data/valid-data-with-returns.csv';
    var emptyDataFile   = './test/data/empty-data.csv';
    var corruptDataFile = './test/data/corrupt-data.csv'; // TODO
    var columnOnlyFile  = './test/data/column-only-data.csv';
    var validCommaFile  = './test/data/valid-data-comma.csv';

    describe('Handle CSV Data', function(){
        it('should convert into array with defined parameters',
            _handleCSVData__convertIntoArrayWithDefinedParameters(validDataFile, definedKeys));

        it('should convert into array with defined parameters with random multiple returns',
            _handleCSVData__convertIntoArrayWithMultipleReturns(mtplReturnsFile, definedKeys));

        it('should handle empty CSV files with an empty array',
            _handleCSVData__handleEmptyCSVFile(emptyDataFile));

        it('should handle CSV files with an empty data but valid columns',
            _handleCSVData__handleEmptyCSVFileWithValidColumns(columnOnlyFile));

        it('should reject a promise if the file name is not defined',
            _handleCSVData__rejectPromiseIfFileNotFound);

        it('should handle exception for commas within cell',
            _handleCSVData__handleExceptionForCommas(validCommaFile, definedKeys));
    })

    describe('HTTP CSV Data', function(){
        var validUrl    = 'http://real-chart.finance.yahoo.com/table.csv?s=AAPL&a=11&b=12&c=2014&d=02&e=29&f=2015&g=d&ignore=.csv';
        var validUrl2   = 'http://www-01.ibm.com/support/knowledgecenter/api/content/nl/en-us/SVU13_7.2.1/com.ibm.ismsaas.doc/reference/UsersImportCompleteSample.csv';
        var invalidUrl  = 'http://real-charhoo.com/table.csv?s=AAPL&a=11&b=12&c=2014&d=02&e=29&f=2015&g=d&ignore=.csv';
        var validHTTPS  = 'https://docs.shopify.com/manual/your-store/products/product_template.csv';

        it('should retrieve data from valid HTTP URL',
            _HTTP__returnValidOnlineCSVURL(validUrl));

        it('should retrieve data from another valid HTTP URL',
            _HTTP__returnValidOnlineCSVURL(validUrl2));

        it('should retrieve data from valid HTTPS URL',
            _HTTP__returnValidOnlineCSVURL(validHTTPS));

        it('should not retrieve data from invalid CSV URL',
            _HTTP__returnInvalidOnlineCSVURL(invalidUrl));
        
    })
})


/**
 * convertIntoArrayWithDefinedParameters
 * @param validDataFile
 * @param definedKeys
 * @returns {Function}
 * @private
 */
function _handleCSVData__convertIntoArrayWithDefinedParameters(validDataFile, definedKeys){
    return function(done) {
        CSVtoJSON
            .convert(validDataFile)
            .then(function (data) {
                expect(data.length).to.equal(3);
                for (var key in definedKeys) {
                    data.forEach(function (e) {
                        expect(e[definedKeys[key]]).to.be.defined;
                    })
                }
                done();
            })
    }
}


/**
 * convertIntoArrayWithMultipleReturns
 * @param done
 * @private
 */
function _handleCSVData__convertIntoArrayWithMultipleReturns(mtplReturnsFile, definedKeys) {
    return function (done) {
        CSVtoJSON
            .convert(mtplReturnsFile)
            .then(function (data) {
                expect(data.length).to.equal(3);
                for (var key in definedKeys) {
                    data.forEach(function (e) {
                        expect(e[definedKeys[key]]).to.be.defined;
                    })
                }
                done();
            })
    }
}


/**
 * handleEmptyCSVFile
 * @param emptyDataFile
 * @returns {Function}
 * @private
 */
function _handleCSVData__handleEmptyCSVFile(emptyDataFile){
    return function(done){
        CSVtoJSON
            .convert(emptyDataFile)
            .then(function(data){
                expect(data.length).to.equal(0);
                done();
            })
    }
}

/**
 * handleEmptyCSVFileWithValidColumns
 * @param columnOnlyFile
 * @returns {Function}
 * @private
 */
function _handleCSVData__handleEmptyCSVFileWithValidColumns(columnOnlyFile){
    return function(done){
        CSVtoJSON
            .convert(columnOnlyFile)
            .then(function(data){
                expect(data.length).to.equal(0);
                done();
            })
    }
}

/**
 * _handleCSVData__rejectPromiseIfFileNotFound
 * @param done
 * @private
 */
function _handleCSVData__rejectPromiseIfFileNotFound(done){
    CSVtoJSON
        .convert('./test/data/unknown-data.csv')
        .then(function(){

        }, function(reason){
            expect(reason).to.equal('File does not exist');
            done();
        })
}

/**
 * _handleCSVData__handleExceptionForCommas
 * @param validCommaFile
 * @param definedKeys
 * @returns {Function}
 * @private
 */
function _handleCSVData__handleExceptionForCommas(validCommaFile, definedKeys){
    return function(done){
        CSVtoJSON
            .convert(validCommaFile)
            .then(function(data){
                expect(data.length).to.equal(3);
                expect(data[0]['Volume']).to.equal('"1045,200"');
                expect(data[1]['Close']).to.equal('"2.59"');
                for(var key in definedKeys){
                    data.forEach(function(e){
                        expect(e[definedKeys[key]]).to.be.defined;
                    })
                }
                done();
            })
    }
}


/**
 * _HTTP__returnValidOnlineCSVURL
 * @param url
 * @returns {Function}
 * @private
 */
function _HTTP__returnValidOnlineCSVURL(url){
    return function(done){
        CSVtoJSON
            .convert(url)
            .then(function(data){
                expect(data.length).to.be.greaterThan(0);
                done();
            });
    }
}


/**
 * _HTTP__returnInvalidOnlineCSVURL
 * @param url
 * @returns {Function}
 * @private
 */
function _HTTP__returnInvalidOnlineCSVURL(url){
    return function(done){
        CSVtoJSON
            .convert(url)
            .then(function(data){

            }, function(err){
                expect(err).to.be.defined;
                done();
            });
    }
}