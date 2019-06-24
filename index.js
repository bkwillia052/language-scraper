const request = require("request-promise");
const cheerio = require("cheerio");

const URL = "https://tatoeba.org/eng/sentences/show_all_in/spa/eng";
const URL2 = "https://tatoeba.org/eng/sentences/show_all_in/spa/eng?page=4";

(async () => {
  const response = await request(URL2);

  let $ = cheerio.load(response);

  let title = $('div[class="sentence-and-translations"]');
  let rating = $('div[class="text"]').text();
  let num = $.querySelector(".translations");

  console.log(
    "Title\n",
    title,
    "Rating: \n \n",
    rating,
    "\n \n \n _____ \n ",
    num
  );
})();
