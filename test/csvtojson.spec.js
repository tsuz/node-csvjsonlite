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
    var largeDataFile   = './test/data/valid-data-stock.csv';

    describe('Detect and Handle CSV Data as File', function(){
        it('should convert into array with defined parameters',
            _handleCSVAsFile__convertIntoArrayWithDefinedParameters(validDataFile, definedKeys));

        it('should convert into array with defined parameters with random multiple returns',
            _handleCSVAsFile__convertIntoArrayWithMultipleReturns(mtplReturnsFile, definedKeys));

        it('should handle empty CSV files with an empty array',
            _handleCSVAsFile__handleEmptyCSVFile(emptyDataFile));

        it('should handle CSV files with an empty data but valid columns',
            _handleCSVAsFile__handleEmptyCSVFileWithValidColumns(columnOnlyFile));

        it('should reject a promise if the file name is not defined',
            _handleCSVAsFile__rejectPromiseIfFileNotFound);

        it('should handle exception for commas within cell',
            _handleCSVAsFile__handleExceptionForCommas(validCommaFile, definedKeys));

        it('should handle custom options',
            _handleCSVAsFile__customOption_sort(validDataFile, definedKeys));


        this.timeout(4000);
        it('should handle more data',
            _handleCSVAsFile__large_data(largeDataFile));

    })

    describe('Detect and Handle HTTP CSV Data', function(){
        var validUrl    = 'http://real-chart.finance.yahoo.com/table.csv?s=AAPL&a=11&b=12&c=2014&d=02&e=29&f=2015&g=d&ignore=.csv';
        var validUrl2   = 'http://www-01.ibm.com/support/knowledgecenter/api/content/nl/en-us/SVU13_7.2.1/com.ibm.ismsaas.doc/reference/UsersImportCompleteSample.csv';
        var invalidUrl  = 'http://real-charhoo.com/table.csv?s=AAPL&a=11&b=12&c=2014&d=02&e=29&f=2015&g=d&ignore=.csv';
        var validHTTPS  = 'https://docs.shopify.com/manual/your-store/products/product_template.csv';

        it('should retrieve data from valid HTTP URL',
            _handleCSVAsURL__returnValidOnlineCSVURL(validUrl));

        it('should retrieve data from another valid HTTP URL',
            _handleCSVAsURL__returnValidOnlineCSVURL(validUrl2));


        this.timeout(4000);
        it('should retrieve data from valid HTTPS URL',
            _handleCSVAsURL__returnValidOnlineCSVURL(validHTTPS));

        it('should not retrieve data from invalid CSV URL',
            _handleCSVAsURL__returnInvalidOnlineCSVURL(invalidUrl));
    })

    describe('Detect and Handle String CSV Data ', function(){
        var handleStringCSV = 'Date,Value\n3,4\n5,6';
        it('should handle string data',
            _handleCSVAsString__returnValidStringToJSON(handleStringCSV));
    })

    describe('Detect Error', function(){
        var badString = './test/data/data.doc';
        it('should throw an error if the convert cannot detect type of conversion',
            _handleCSVError__badType(badString));
    })
})


/**
 * convertIntoArrayWithDefinedParameters
 * @param validDataFile
 * @param definedKeys
 * @returns {Function}
 * @private
 */
function _handleCSVAsFile__convertIntoArrayWithDefinedParameters(validDataFile, definedKeys){
    return function(done) {
        CSVtoJSON
            .convert(validDataFile)
            .then(function (data) {
                //console.log('data',data);
                expect(data.length).to.equal(3);
                expect(data[0].Open).to.equal('2.58');
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
function _handleCSVAsFile__convertIntoArrayWithMultipleReturns(mtplReturnsFile, definedKeys) {
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
function _handleCSVAsFile__handleEmptyCSVFile(emptyDataFile){
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
function _handleCSVAsFile__handleEmptyCSVFileWithValidColumns(columnOnlyFile){
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
 * _handleCSVAsFile__rejectPromiseIfFileNotFound
 * @param done
 * @private
 */
function _handleCSVAsFile__rejectPromiseIfFileNotFound(done){
    CSVtoJSON
        .convert('./test/data/unknown-data.csv')
        .then(function(){

        }, function(reason){
            expect(reason).to.equal('File does not exist');
            done();
        })
}

/**
 * _handleCSVAsFile__handleExceptionForCommas
 * @param validCommaFile
 * @param definedKeys
 * @returns {Function}
 * @private
 */
function _handleCSVAsFile__handleExceptionForCommas(validCommaFile, definedKeys){
    return function(done){
        CSVtoJSON
            .convert(validCommaFile)
            .then(function(data){
                expect(data.length).to.equal(3);
                expect(data[0]['Volume']).to.equal('1045,200');
                expect(data[1]['Close']).to.equal('2.59');
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
 * This should test whether the convert can sort things
 * @param validFile
 * @private
 */
function _handleCSVAsFile__customOption_sort(validFile, definedKeys){
    return function(done){

        /** Set sort options */
        var options = {};
        options.sort = function(a,b){
            return a.Open - b.Open;
        };

        CSVtoJSON
            .convert(validFile, options)
            .then(function(data){
                expect(data.length).to.equal(3);
               // console.log('data',data);
                expect(data[0]['Open']).to.equal("2.58");
                expect(data[1]['Open']).to.equal("2.64");
                expect(data[2]['Open']).to.equal("2.73");

                for(var key in definedKeys){
                    data.forEach(function(e){
                        expect(e[definedKeys[key]]).to.be.defined;
                    })
                }

                /**
                 * Change options
                 */
                options.sort = function(b,a){
                    return a.Low - b.Low;
                };

                CSVtoJSON
                    .convert(validFile, options)
                    .then(function(data){
                        expect(data.length).to.equal(3);
                       // console.log('data',data);
                        expect(data[0]['Low']).to.equal("2.61");
                        expect(data[1]['Low']).to.equal("2.57");
                        expect(data[2]['Low']).to.equal("2.53");

                        for(var key in definedKeys){
                            data.forEach(function(e){
                                expect(e[definedKeys[key]]).to.be.defined;
                            })
                        }
                        done();
                    })
            })
    }
}

/**
 * _handleCSVAsURL__returnValidOnlineCSVURL
 * @param url
 * @returns {Function}
 * @private
 */
function _handleCSVAsURL__returnValidOnlineCSVURL(url){
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
 * _handleCSVAsURL__returnInvalidOnlineCSVURL
 * @param url
 * @returns {Function}
 * @private
 */
function _handleCSVAsURL__returnInvalidOnlineCSVURL(url){
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

/**
 * Output CSV String into JSON
 * @param string
 * @returns {Function}
 * @private
 */
function _handleCSVAsString__returnValidStringToJSON(string){
    return function(done){
        CSVtoJSON
            .convert(string)
            .then(function(data){
                expect(data).to.be.defined;
                expect(data.length).to.be.greaterThan(0);
                done();
            });
    }
}


/**
 * Handle CSV Error - bad conversion type
 * @param string
 * @returns {Function}
 * @private
 */
function _handleCSVError__badType(string){
    return function(done){
        CSVtoJSON
            .convert(string)
            .then(function(data){},function(bad){
                expect(bad).to.equal('Invalid Conversion Type');
                done();
            });
    }
}

function _handleCSVAsFile__large_data(csvstring){
    return function(done){
        CSVtoJSON
            .convert(csvstring)
            .then(function(data){
                //console.log('data',data);
                done();
            })
    }
}