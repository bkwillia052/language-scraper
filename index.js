const request = require("request-promise");
const cheerio = require("cheerio");

const { JSDOM } = require("jsdom");
const wordDict = require("./word");

const URL1 = "https://tatoeba.org/eng/sentences/show_all_in/spa/eng";
const URL2 = "https://tatoeba.org/eng/sentences/show_all_in/spa/eng?page=2";
let wordKeys = Object.keys(wordDict);
let cards = [];

let getCards = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let word = wordKeys.map(async word => {
        let URL = `https://tatoeba.org/eng/sentences/search?query=${word}&from=spa&to=eng`;

        let cardData = {
          word: word,
          sentences: []
        };
        let pages = 1;
        let limit = null;
        while (limit === null || limit >= pages) {
          const response = await request(URL);

          let $ = cheerio.load(response);

          let totalNum = $(".paging")
            .find("li:nth-last-child(2) > a")
            .first();
          limit = parseInt(totalNum.text());

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
          //console.log(cardData);
        }
        cards.push(cardData);
      });
      return resolve(cards);
    } catch (err) {
      return reject(err);
    }
  });
};

getCards()
  .then(res => console.log("hi"))
  .catch(err => console.log("FUcK"));

module.exports.handler = () => {};
