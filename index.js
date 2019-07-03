const request = require("request-promise");
const cheerio = require("cheerio");

const { JSDOM } = require("jsdom");
const { wordDict, translationDict } = require("./word");
let wordKeys = Object.keys(wordDict);
let retries = {};

let sentenceFetch = async word => {
  try {
    let URL = `https://tatoeba.org/eng/sentences/search?query=${word}&from=spa&to=eng`;

    let cardData = {
      word: word,
      sentences: []
    };
    let pages = 1;
    let limit = 3;
    console.log(`word inside of try ${word} \n URL: ${URL}`);
    while (limit >= pages) {
      const response = await request(URL);

      let $ = cheerio.load(response);

      let totalNum = $(".paging")
        .find("li:nth-last-child(2) > a")
        .first();
      //limit = parseInt(totalNum.text());

      //console.log(`Total Pages: ${limit}`);
      let title = $(".sentence-and-translations").each((index, elem) => {
        //console.log(index);
        let translation0 = $(elem).find(".text");
        //console.log(translation0.text());

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

    //console.log(cardData);
    return cardData;
  } catch (err) {
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

/* let cards = wordKeys.map(word => {
  sentenceFetch(word)
    .then(res => {
      console.log(
        "\n\n\n\n\n\n\n=====================================================================SUCCESSSSSSS===================================================================================\n\n\n\n\n\n",
        res
      );
    })
    .catch(err => console.log("Hoo"));
}); */

let allSentences = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let returned = await [];
      let array = await wordKeys.map(word => {
        sentenceFetch(word)
          .then(res => {
            returned.push(res);
            /* console.log(
              "\n\n\n\n\n\n\n===SUCCESS===================================================================================\n\n\n\n\n\n",
              
            ); */
          })
          .catch(err => console.log("Hoo"));
      });
      resolve(returned);
    } catch (err) {}
  });
};

Promise.all([allSentences()]).then(res => console.log("FINAL RESULT", res));
module.exports.handler = () => {};
