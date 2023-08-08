/*
Desired output will be similar format to:

{
	"Episode Number": "1",
	"Episode Title": "Corona Lessons Volume 1, Tom Bukovac, \"The Coolest Chord of All Time\"",
	"URL": "https://www.youtube.com/embed/4LO_Az2B76g?autoplay=1",
	"Content": [{
		"Timestamp": "00:00",
		"Text": "hello everybody corona lessons part 1 as"
	}, ...

  sample usage:
  node app.js episodeNumber "Title" "google.com"

*/

let fs = require("fs");

var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

let epNumber = myArgs[0]; // To be moved to input param
let epTitle = JSON.stringify(myArgs[1]); // To be moved to input param
let epUrl = "https://www.youtube.com/embed/"+myArgs[2]+"?autoplay=1"; // To be moved to input param
let innerContent = ''; // Comes from input text file which should come from param

const checkForTrailingComma = (input) => {
  //remove trailing comma so output will be valid when placed in an array to form JSON
  if(input.charAt(input.length - 2) === ','){
    input = input.slice(0, -2);
    console.log('++ comma removed');
  }else{
    console.log('++ comma not removed.');
    console.log('['+input.charAt(input.length - 2)+']');
  }
  return input;
}

const writeOutput = () => {
  console.log('+++ writing lines start');
  var lineWriter = fs.createWriteStream(`output/intl_en.arb`, { // not always English
    flags: 'a' // 'a' means appending (old data will be preserved)
  })
  lineWriter.write('{\n');
  lineWriter.write('"@@locale": "en",') // this line changes based on the language translated
  lineWriter.write(innerContent);
  lineWriter.write('}');
  lineWriter.end();
  console.log('++++ writing lines end');
}

const readLinesForContent = () =>{
  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(`input/${epNumber}`)
  });
  let currentLine = 1;
  
  console.log('starting line reading');
  lineReader.on('line', function (line) {
    //Need to modify data in json k/v pairs to be Arb file compliant 
    /*
      - Split k/v pairs
      - Update key to be camelCased and remove period
    */

    if(line.includes('"')){
      var kvSplit = line.split(':');
      var oldKey = kvSplit[0];
      var newKey = oldKey.split('.').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join('');
      var newLine = newKey+':'+kvSplit[1];
      console.log(newLine);  

      //Output those lines
      let formedLine = newLine;
      innerContent = innerContent + formedLine+ '\n';
      currentLine++;
    }

  
  }).on('close', () => {

    // clean innerContent
    innerContent = checkForTrailingComma(innerContent);
    writeOutput(innerContent);
  });

}

readLinesForContent();


