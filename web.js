var express = require('express');

var app = express.createServer(express.logger());

var fs = require("fs");

var buffer = new Buffer(fs.readFileSync('index.html','utf8'), "utf-8");

console.log(fs.readFileSync('index.html','utf8'));

console.log(buffer.toString('utf-8'));

app.get('/', function(request, response) {
  //response.send('Hello World 2!');
    response.send(buffer.toString('utf-8'));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
