const request = require("request-promise");
const cheerio = require("cheerio");

const wordDict = require("./word");

(async () => {
  let wordKeys = Object.keys(wordDict);
  let word = "cuestion";
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

    let title = $(".sentence-and-translations").each((index, elem) => {
      let translation0 = $(elem).find(".text");

      let translation1 = translation0.text().split("\n");
      let translationSet = {
        sp: translation1[1].trim(),
        en: translation1[2].trim()
      };
      cardData.sentences.push(translationSet);
      console.log(cardData);
    });
    pages += 1;
    console.log(`Next Page: ${pages}, Limit: ${limit}`);
    URL = `https://tatoeba.org/eng/sentences/search?query=${word}&from=spa&to=eng&page=${pages}`;
  }

  //let boxes = document.querySelectorAll(".sentence-and-translations");

  //let translations = Array.from(boxes);
})();
