var fs = require('fs'),
    readline = require('readline'),
    outstream = new (require('stream'))();

const fileReader = function(inputFile, cb, done) {
    var instream = fs.createReadStream(inputFile),
        rl = readline.createInterface(instream, outstream);
    
    rl.on('line', function (line) {
        // console.log(line);
        if(cb) cb(line);
    });
   
    rl.on('close', function (line) {
        // console.log(line);
        // console.log('done reading file.');
        if(done) done();
    });
}

const fileWriter = function(file, contents) {
    fs.writeFileSync(file, contents, (err) => {
        // throws an error, you could also catch it here
        if (err) throw err;

        // success case, the file was saved
        // console.log('Lyric saved!');
    });
}

module.exports = { fileReader, fileWriter };
// fileReader('testing.txt');