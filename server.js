'use strict';

var myApp = require('./app');
     
var port=process.env.PORT || 3000;
myApp.set('port', port);


myApp.listen(port, function() {
  console.log('Express server listening on port ' + port);
});

//http://adrianmejia.com/blog/2014/10/01/creating-a-restful-api-tutorial-with-nodejs-and-mongodb/
