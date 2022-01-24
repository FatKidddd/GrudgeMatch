let csv = require("csvtojson");
let fs = require('fs');

const csvFilePath = "C:\\Users\\justi\\Desktop\\golf.csv";
// Convert a csv file with csvtojson
const arr = ['clubName', 'name', 'location', 'hole', 'handicapIndexArr', 'parArr'];

const dataLen = arr.length;

const ans = [];

function processData(s, num) {
  let n = s.length;
  let i = n;
  for (; i >= 0; i--) {
    if (s[i - 1] !== ',') break;
  }
  const cleanedBack = s.slice(0, i).replaceAll('"', '');
  if (num == arr.length - 1 || num == arr.length - 2) {
    const arr = [];
    let s = '';
    for (const char of cleanedBack) {
      if (char === ',') {
        arr.push(Number(s));
        s = '';
        continue;
      }
      s += char;
    }
    if (s!='') arr.push(Number(s));
    return arr;
  }
  return cleanedBack;
};

let a = 0;

csv({ output: 'line' })
  .fromFile(csvFilePath)
  .then((res) => { //when parse finished, result will be emitted here.
    // console.log(res);
    let obj = {};
    let c = 0;
    for (const row of res) {
      if (c == 6) {
        for (const [key, val] of Object.entries(obj)) {
          console.log(key, key == 'handicapIndexArr' || key == 'parArr' ? val.length : val);
        }
        ans.push(obj);
        // console.log(obj);
        obj = {};
        c = 0;
        continue;
      }

      if (c === 3) {
        c++;
        continue;
      }

      let data = "";
      for (let i = 0; i < row.length; i++) {
        if (row[i] === ',') {
          data = row.slice(i + 1);
          break;
        }
      }
      obj[arr[c]] = processData(data, c);
      
      c++;
    }
    fs.writeFileSync('./data.json', JSON.stringify(ans, null, 2), 'utf-8');
  });


// // Parse large csv with stream / pipe (low mem consumption)
// csv()
//   .fromStream(readableStream)
//   .subscribe(function(jsonObj){ //single json object will be emitted for each csv line
//      // parse each json asynchronousely
//      return new Promise(function(resolve,reject){
//          asyncStoreToDb(json,function(){resolve()})
//      })
//   }) 
