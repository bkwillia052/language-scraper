const request = require("request-promise");
const cheerio = require("cheerio");
//request.debug = 1;

const { wordDict, translationDict } = require("./word");
let wordKeys = Object.keys(wordDict);
let currentLength = 0; // this is set inside of the poller interval function
let failed = 0;
let runs = 0;
let retries = {};
let returned = [];
let failArr = {};

let sentenceFetch = async word => {
  try {
    let URL = `https://tatoeba.org/eng/sentences/search?query=${word}&from=spa&to=eng`;

    let cardData = {
      word: word,
      sentences: []
    };
    let pages = 1;
    let limit = 3;

    while (limit >= pages) {
      const response = await request(URL);

      let $ = cheerio.load(response);

      let totalNum = $(".paging")
        .find("li:nth-last-child(2) > a")
        .first();

      let title = $(".sentence-and-translations").each((index, elem) => {
        let translation0 = $(elem).find(".text");

        let translation1 = translation0.text().split("\n");
        let translationSet = {
          sp: translation1[1].trim(),
          en: translation1[2].trim()
        };
        cardData.sentences.push(translationSet);
      });
      pages += 1;

      URL = `https://tatoeba.org/eng/sentences/search?query=${word}&from=spa&to=eng&page=${pages}`;
    }

    return cardData;
  } catch (err) {
    failed += 1;
    failArr[word] = 0;
    if (err.name == "StatusCodeError") {
      if (!retries[word]) {
        retries[word] = 0;
      }
      retries[word] += 1;
      if (retries[word] < 3) {
        //console.log(`Retries for ${word}: ${retries[word]}`);
        sentenceFetch(word)
          .then(res => {
            if (removeFromFailed(res)) {
              //console.log("Passed in the Retry");
              return res;
            } else {
              //console.log(`Retry for ${word} failed. `);
            }
          })
          .catch((
            err //console.log("Hoo")
          ) => {});
      }
    }
  }
};

let removeFromFailed = res => {
  if (res !== undefined) {
    returned.push(JSON.stringify(res));
    let failed = Object.keys(failArr);
    failed.forEach(obj => {
      if (obj === res.word) {
        delete failArr[obj];
        //console.log(`${res.word} removed from failed list.`);
      }
    });
    return true;
  }
};

let allSentences = new Promise(async (resolve, reject) => {
  try {
    let array = await wordKeys.map(async word => {
      sentenceFetch(word)
        .then(res => {
          if (removeFromFailed(res)) {
            return res;
          } else {
            //console.log("Failed in the original");
          }
        })
        .catch((
          err //console.log("Hoo")
        ) => {});
    });
    resolve(returned);
  } catch (err) {
    reject("Failure");
  }
});

let ender = () => {
  let enderInterval = setInterval(() => {
    /* //console.log(
      `Dict Length: ${wordKeys.length}, Failed+ Returned: ${failed +
        returned.length}, Returned: ${returned.length}, Runs: ${runs}`
    ); */
    runs += 1;
    returned = returned.filter(thing => typeof thing !== "undefined");
    currentLength = returned.length;

    if (runs > 40) {
      //console.log("Returned Length:", returned.length);
      //console.log("Returned:", returned);
      //console.log("Failed", failArr);
      clearInterval(enderInterval);
      wordKeys = Object.keys(failArr);
      console.log(returned);
      return returned;
    }
  }, 1000);
};

const wholething = async () => {
  allSentences.then(res => {});

  try {
    let thing = await ender();
    await console.log(`THING: ${thing}`);
    return thing;
  } catch (err) {}
};

wholething();

module.exports.handler = () => {};
