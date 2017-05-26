const rpn = require('request-promise-native')
const cheerio = require('cheerio')

// define our headers
const options = {
  headers: {'user-agent': 'node.js'}
}

rpn('https://mondotees.com/collections/archive/Posters?page=1', options)
  .then(function (response) {
  // create our Jquery world be setting the response = to
  const $ = cheerio.load(response)
  // log a sample of our returned data
  console.log($('title').text())
}).catch(function (error) {
  // define a promise catch in case it failed along the way
  console.log('Promise Error:', error)
})
