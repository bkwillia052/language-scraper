const request = require("request-promise");
const cheerio = require("cheerio");
const utf8 = require("utf8");
//request.debug = 1;

const { wordDict, translationDict } = require("./word");
let wordKeys = Object.keys(wordDict);
let currentLength = 0; // this is set inside of the poller interval function
let failed = 0;
let runs = 0;
let retries = {};
let returned = [];
let failArr = {};
let start = Date.now();

console.log(`Start Time: ${start}`);
let sentenceFetch = async word => {
  try {
    let newWord = utf8.encode(word);
    let URL = `https://tatoeba.org/eng/sentences/search?query=${newWord}&from=spa&to=eng`;

    let cardData = {
      word: word,
      translation: translationDict[word],
      sentences: []
    };

    const response = await request(URL);
    console.log(`${word} response at ${Date.now() - start}`);
    if (word === "mañana") {
      console.log(response);
    }
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

    return JSON.stringify(cardData);
  } catch (err) {
    console.log(`${word} failed`);
    let newCardData = await sentenceFetch(word);
    return newCardData;
    /* failed += 1;

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
    } */
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
    reject("Failure.");
  }
});

let allProms = [];
for (let i = 0; i < wordKeys.length; i++) {
  allProms.push(
    sentenceFetch(wordKeys[i]).catch(err => allProms.push(sentenceFetch(err)))
  );
}

Promise.all(allProms)
  .then(res => res.forEach(thing => console.log(`\n\nSuccess: ${thing}\n\n`)))
  .catch(err => console.log(failed));

/* while (true) {
  console.log(ally.next());
} */

module.exports.handler = () => {};
