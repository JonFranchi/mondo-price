const rpn = require('request-promise-native')
const cheerio = require('cheerio')

// define our headers
const options = {
  headers: {'user-agent': 'node.js'}
}

rpn('https://mondotees.com/collections/archive/Posters?page=1', options, function (error, response, body) {
  if (error) {
    // Print the error if one occurred
    console.error('error:', error)
  } else if (response.statusCode !== 200) {
    // Print the response status code if a response was received
    console.error('Failed with status code: ', response.statusCode)
  } else if (response.statusCode === 200) {
    // everything A-OK
  }
}).then(function (response) {
  // create our Jquery world be setting the response = to
  const $ = cheerio.load(response)
  // log a sample of our returned data
  console.log($('title').text())
}).catch(function (error) {
  // define a promise catch in case it failed along the way
  console.log('Promise Error:', error)
})
