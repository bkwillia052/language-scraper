const request = require("request-promise");
const cheerio = require("cheerio");

const { wordDict, translationDict } = require("./word");
let wordKeys = Object.keys(wordDict);
let failed = 0;

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
      //console.log(word, "gobierno");
      const response = await request(URL);

      if (word === "gobierno") {
        // console.log("RESPONSE\n\n\n\n\n\n\n\n\n: ", response);
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
      pages += 1;
      //console.log(`Next Page: ${pages}, Limit: ${limit}`);
      URL = `https://tatoeba.org/eng/sentences/search?query=${word}&from=spa&to=eng&page=${pages}`;
    }

    //console.log("Inner:", word, cardData);
    return JSON.stringify(cardData);
  } catch (err) {
    //console.log("ERROR:", word);
    failed += 1;

    /* if (err.name == "StatusCodeError") {
      if (!retries[word]) {
        console.log("testing");
        retries[word] = 0;
      }
      retries[word] += 1;
      if (retries[word] < 3) {
        console.log(`Retries for ${word}: ${retries[word]}`);
        sentenceFetch(word)
          .then(res => {
            console.log(`The Retry Response: ${res}\n`, res);
          })
          .catch(err => console.log("Hoo"));
      } */
  }
};
let returned = [];
let allSentences = new Promise(async (resolve, reject) => {
  try {
    let array = await wordKeys.map(async word => {
      setTimeout(
        sentenceFetch(word)
          .then(res => {
            returned.push(res);

            console.log(
              // NOTE: Whenever I console log the response here, which is 'cardData' in the sentenceFetch function, it will console log eventually
              "\n\n\n\n\n\n\n===SUCCESS===\n\n\n\n\n\n",
              returned
            );
            return res;
          })
          .catch(err => console.log("Hoo")),
        2500
      );
    });
    resolve(returned);
  } catch (err) {
    reject("Failure");
  }
});

//NOTE: The promise allways returns "undefined" even though the I can confirm via console.log in sentenceFetch.then() that an object is returned at some point
let currentLength = 0;
allSentences.then(res => console.log("FINAL RESULT", res));
let poller = setInterval(() => {
  if (currentLength < returned.length) {
    console.log(
      `Prev Returned Length: ${currentLength}, Current Returned Length: ${
        returned.length
      }`
    );
    returned = returned.filter(thing => typeof thing !== "undefined");
    currentLength = returned.length;
  } else {
    console.log(returned);
    clearInterval(poller);
  }
}, 15000);
let runs = 0;
let ender = setInterval(() => {
  console.log(wordKeys.length, failed + returned.length);
  runs += 1;

  /* if (wordKeys.length === failed + returned.length) {
    clearInterval(poller);
    clearInterval(ender);
    console.log("Returned Length:", returned.length);
  } */
}, 1000);
module.exports.handler = () => {};
