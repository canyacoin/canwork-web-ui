const filePath = 'dist-ssr/functions/server/main.js'
console.log('start')
var fs = require('fs')
fs.readFile(filePath, 'utf8', function (err, data) {
  if (err) {
    return console.log(err)
  }
  console.log('original file read')
  var result1 = data.replace(
    /urlParsingNode\.pathname\.charAt\(0\)/,
    'urlParsingNode.pathname?.charAt(0)'
  )
  console.log('urlParsingNode.pathname.charAt(0) replaced')
  var result2 = result1.replace(
    /\(self,/,
    "(typeof self !== 'undefined' && self,"
  )
  console.log('(self, replaced')

  console.log('writing file ..')

  fs.writeFile(filePath, result2, 'utf8', function (err) {
    if (err) return console.log(err)
    console.log('new file ready')
  })
})
