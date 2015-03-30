# node-csvjsonlite [![Build Status](https://travis-ci.org/tak215/node-csvjsonlite.svg?branch=master)](https://travis-ci.org/tak215/node-csvjsonlite) [![npm version](https://badge.fury.io/js/node-csvjsonlite.svg)](http://badge.fury.io/js/node-csvjsonlite)
###Lightweight CSV to JSON for Node.JS

# Usage

```js

    var csv  = require('node-csvjsonlite');

    var filename = './path/to/your.csv';
    // OR this can be a URL like
    // filename = 'http://sample.com/data.csv';
    // OR filename can be a string of CSV data
    //
    // Suppose your.csv is following:
    //
    // Date,Open,High,Low
    // 2015-03-27,2.58,2.65,2.53
    // 2015-03-26,2.73,2.74,2.57
    // 2015-03-25,2.64,2.73,2.61

    csv
        .convert(filename)
            // Detects whether filname is
            // a local file, URL, or string of data
        .then(function(successData){
            console.log('CSV in JSON', successData);
            // resolves to
            // [{ Date: 2015-03-27, Open: 2.58, High: 2.65, Low: 2.53 },
            //  { Date: 2015-03-26, Open: 2.73, High: 2.74, Low: 2.57 },
            //  { Date: 2015-03-25, Open: 2.64, High: 2.73, Low: 2.61 }]
        });

```

Or you can be specific

```js
    var promiseFile = csv.convertFile(filename);
    var promiseURL  = csv.convertURL(fileURL);
    var promiseStr  = csv.convertString(stringData);

```

# Get Started

```js
npm install node-csvjsonlite
```


```js
var csv = require('node-csvjsonlite');
```

# Features
###Bluebird as promise

[Bluebird](https://github.com/petkaantonov/bluebird) is used as promise to keep it lightweight.


###Commas within double quotes

```js

    var csv  = require('node-csvjsonlite');

    var filename = './path/to/your.csv';

    // where your.csv has the following data:
    // Date, Value
    // 2015-02-14,"2,2"
    // 2015-02-15,"4,3"
    // 2015-02-16,"1,2"
    // resolves to
    // [{ Date: 2015-02-14, Value: 2,2 },
    //  { Date: 2015-02-15, Value: 4,3 },
    //  { Date: 2015-02-16, Value: 1,2 }]


```

###CSV from online source

```js

    var csv  = require('node-csvjsonlite');

    var filename = 'http://something.com';

```
where filename can be HTTP or HTTPS.

Note: If file does not exist, then it will reject the promise.


###Error Handling

Error will be resolved in the Promise rejection.



```js

    var csv  = require('node-csvjsonlite');

    var badFilename = './path/to/invalid.csv';

    csv
        .convert(badFilename)
        .then(function(successData){
            console.log('This shouldn\'t show');
        }, function(errorReason){
            console.log(errorReason);
            // Error Reason is either a string ("File does not exist")
            // or an error object returned from require('fs').readFile
        });

```


Note that since it uses bluebird as promise,
if the promise is rejected and there is no rejection handler,
**it will throw an error.**
