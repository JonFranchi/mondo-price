const cheerio = require('cheerio')
const jsonfile = require('jsonfile')
const rpn = require('request-promise-native')

// define our input and output files
const readFile = './urls.json'
const detailsFile = './poster_details.json'
const errFile = './detail_scrape_errors.json'

/********************************
* Include some extra params we'll need.
* 'headers' is particularly important to define because the
* server will reject the request without it.
*********************************/
const options = {
  headers: {'user-agent': 'node.js'}
}
const url = 'https://mondotees.com'

// jsonfile library formatting option for prettier output
jsonfile.spaces = 2

/* track and limit our progress in fetching requests so
* we don't get blocked for sending too many at once
*/
const fetchCounter = (function () {
  this.startCount = 0
  this.endCount = 99
  return {
    next: () => {
      this.startCount += 100
      this.endCount += 100
    },
    start: () => {
      return this.startCount
    },
    end: () => {
      return this.endCount
    }
  }
})()

/*
* this sets up the blank file so
* the first appended object wont fail
*/
jsonfile.writeFileSync(detailsFile, {})

jsonfile.readFile(readFile, 'utf8', (err, data) => {
  if (err) {
    if (err.code === 'ENOENT') {
      console.error('myfile does not exist')
      return
    }
    throw err
  }

  const totalUrlCount = data.length

  const runFetch = setInterval(() => {
    console.log(`Fetching from ${fetchCounter.start()} to ${fetchCounter.end()}`)
    for (var i = fetchCounter.start(); i < fetchCounter.end(); i++) {
      if (data[i]) {
        getPage(data[i])
      }
    }
    fetchCounter.next()

    if (fetchCounter.start > totalUrlCount) {
      console.log('Killing Fetch')
      clearInterval(runFetch)
    }
  }, 30000)
  // getPage(data[0])
})

// make a counter accessible when our requests return
const countPage = (() => {
  let pageCounter = 0
  return function () {
    return pageCounter++
  }
})()

function getPage (subUrl, retry, callback) {
  let scrapeUrl = ''
  if (retry) {
    scrapeUrl = subUrl
    console.error('RETRYING: ', subUrl)
  } else {
    scrapeUrl = url + subUrl
  }
  rpn(scrapeUrl, options)
  .then(function (response) {
    // load the DOM with Cheerio, then scrape our 3 data points
    const $ = cheerio.load(response, {normalizeWhitespace: true})
    const title = $('.product-title').text()
    const artist = $('.product-vendor').find('a').text()
    const imageUrl = $('#product-image').attr('src')
    console.log(title)
    console.log(artist)
    console.log(imageUrl)
    console.log('*************************************')

    //
    /* tracking how many pages have returned, since we have
    * no way to know in which order they'll return
    * and use that value to Give this poster object an identifier
    */
    const currentPoster = 'poster' + countPage()

    let obj = jsonfile.readFileSync(detailsFile)
    obj[currentPoster] = {
      title: title,
      artist: artist,
      imageUrl: imageUrl
    }
    jsonfile.writeFileSync(detailsFile, obj)
  }).catch(function (error) {
    jsonfile.writeFile(errFile, error, {flag: 'a'}, function (err) {
      console.error(err)
    })
    /* this can be dangerous, so please note this
    * is retrying on failure.  If you do this too fast
    * and get temporarily blocked somewhere, this will keep
    * repeating and send thousands of failed retrying requests
    * very quickly.  That would be bad.  Don't do that.
    */
    getPage(error.options.uri, true)
  })
}
