# node-csvjsonlite
Lightweight CSV to JSON for Node.JS



# Usage

```
    var csv  = require('node-csvjsonlite');
    var filename = './path/to/your.csv';
    // or this can be a URL like
    // filename = 'http://sample.com/data.csv';
    csv
        .convert(filename)
        .then(function(successData){
            console.log('CSV in JSON', successData);
        });

```