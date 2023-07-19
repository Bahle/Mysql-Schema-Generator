const fs = require('fs');
const readline = require('readline');

// Read from the source file and write to the destination file
function copyFile(sourceFile, destinationFile) {
  fs.readFile(sourceFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    fs.writeFile(destinationFile, data, 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return;
      }

      console.log('File copied successfully!');
    });
  });
}

// Create a readline interface for reading user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Welcome message and prompts for input/output file names
console.log('Welcome to the File Copy Utility!');
rl.question('Enter the input file name: ', (sourceFile) => {
  rl.question('Enter the output file name: ', (destinationFile) => {
    copyFile(sourceFile, destinationFile);
    rl.close();
  });
});
