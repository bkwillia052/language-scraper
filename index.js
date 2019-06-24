const request = require("request-promise");
const cheerio = require("cheerio");

const { JSDOM } = require("jsdom");
const wordDict = require("./word");

const document = new JSDOM(``, {
  url: "https://tatoeba.org/eng/sentences/show_all_in/spa/eng?page=4",
  contentType: "text/html"
}).window.document;

const URL = "https://tatoeba.org/eng/sentences/show_all_in/spa/eng";
const URL2 = "https://tatoeba.org/eng/sentences/show_all_in/spa/eng?page=2";

console.log(wordDict)(async () => {
  const response = await request(URL2);

  let $ = cheerio.load(response);

  let totalNum = $(".paging")
    .find("li:nth-last-child(2) > a")
    .first();

  console.log(`Total Pages: ${totalNum.text()}`);
  let title = $(".sentence-and-translations").each((index, elem) => {
    console.log(index);
    let translation0 = $(elem).find(".text");
    console.log(translation0.text());

    let translation1 = translation0.text().split("\n");

    console.log(translation1);
  });

  //let boxes = document.querySelectorAll(".sentence-and-translations");

  //let translations = Array.from(boxes);
})();
