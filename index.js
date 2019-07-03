const request = require("request-promise");
const cheerio = require("cheerio");

const { JSDOM } = require("jsdom");
const wordDict = require("./word");
let wordKeys = Object.keys(wordDict);

let sentenceFetch = async word => {
  try {
    let URL = `https://tatoeba.org/eng/sentences/search?query=${word}&from=spa&to=eng`;
    let cardData = {
      word: word,
      sentences: []
    };
    let pages = 1;
    let limit = 10;
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
    console.log("\n\n\n\n\nERROR\n\n\n\n\n\n", word);
  }

  //let boxes = document.querySelectorAll(".sentence-and-translations");

  //let translations = Array.from(boxes);
};

let cards = wordKeys.map(word => {
  sentenceFetch(word)
    .then(res => {
      console.log(
        "\n\n\n\n\n\n\n=====================================================================SUCCESSSSSSS===================================================================================\n\n\n\n\n\n",
        res
      );
    })
    .catch(err => console.log("Hoo"));
});

module.exports.handler = () => {};
