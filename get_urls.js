const cheerio = require('cheerio')
const jsonfile = require('jsonfile')
const rpn = require('request-promise-native')

/********************************
* Include some extra params we'll need.
* 'headers' is particularly important to define because the
* server will reject the request without it.
*********************************/
const url = 'https://mondotees.com'
const options = {
  headers: {'user-agent': 'node.js'}
}
// define our output file
const file = './poster_urls.json'

function getUrls (page, url, options) {
  rpn(url + '/collections/archive/Posters?page=' + page, options)
    .then(function (response) {
    // load the DOM with Cheerio so we can access the URLs we need
    const $ = cheerio.load(response)
    const pageUrls = []
    $('div.collection-products').children('.product-grid-item').children('a').each(function (j) {
      pageUrls.push(($(this).attr('href')))
    })
    // once we've created a page with of URLs in an array, update master.
    update.done(pageUrls)
  }).catch(function (error) {
    console.error(error)
  })
}

/********************
* every time a request returns, add the Url the list and incremenent.
* Once it hits the number of pages, write to the JSON file
********************/
const update = (function (urls) {
  let y = 0
  this.allUrls = []

  function writeToFile () {
    jsonfile.writeFile(file, this.allUrls, {flag: 'a'}, function (err) {
      console.error(err)
    })
  }
  function addOne () {
    y++
    if (y === 51) {
      writeToFile()
    }
  }
  function addUrls (urls) {
    this.allUrls = [...this.allUrls, ...urls]
  }
  return {
    done: (urls) => {
      addUrls(urls)
      addOne()
    }
  }
})()

function scrape () {
  // I know there are 51 pages of pagination so I'm doing this the easy way
  for (let i = 0; i <= 51; i++) {
    getUrls(i, url, options)
  }
}

scrape()
