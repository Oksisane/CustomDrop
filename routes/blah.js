var express = require('express');
var fs = require('fs');
var busboy = require('connect-busboy');
var inspect = require('util').inspect;
var router = express.Router();
var path = require('path')
var Dropbox = require("dropbox");
var cookieParser = require('cookie-parser');
var client = new Dropbox.Client({
    key: "ddipg1nxhdfzhly",
    secret: "2kpkhfvwt8dkd9l",
    sandbox: false,
    token: "K30O7901GxwAAAAAAAAEtrrf97vO6tTSyHd1I4MU7Gn0ojMm900yvsmuRUcFQZ1v"
});
/* GET home page. */
router.get('/', function(req, res, next) {
 console.log("Cookies: ", req.cookies); 
    if (req.cookies.period && req.cookies.lastname && req.cookies.firstname && req.cookies.secret)
     res.render('index.html',req.cookies);
 else
     res.render('index.html',{period:"",lastname:"",firstname:"",secret:""});
});
router.get('/testfile', function(req, res, next) {
  client.writeFile("test.txt", "sometext", function (error, stat) {
        if (error) {
          console.log(error);
          return;
        }
    });
    res.render('index.html');
});
router.post('/upload', function(req, res) {
    var fstream,lastname,period,firstname,secret,assignment,extension;
    req.pipe(req.busboy);
    req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
      	console.log('Field [' + fieldname + ']: value: ' + inspect(val));
      	if (fieldname == "lastname"){lastname = val;}
        if (fieldname == "firstname"){firstname = val;}
	if (fieldname == "period"){period = val;}
	if (fieldname == "secret"){secret = val;}
	if (fieldname == "assignment"){
		req.busboy.on('file', function (fieldname, file, filename) {
       		 console.log("Uploading: " + filename);
       		 file.on('data', function(data) {
		 var finalfilename = period + "/" + lastname + firstname + secret + "_" + val + path.extname(filename);
           	 console.log("Final file name:",finalfilename);
		 client.writeFile(finalfilename, data, function (error, stat) {
               		 if (error) {
                	  console.log(error);
                	  return;
                	 }
        	    });
       		 });
	    });
             res.cookie('period', period, { maxAge: 365*24*60*60*1000 });
	     res.cookie('lastname', lastname, { maxAge: 365*24*60*60*1000 });
             res.cookie('firstname', firstname, { maxAge: 365*24*60*60*1000 });
             res.cookie('secret', secret, { maxAge: 365*24*60*60*1000 });
	     res.render('success.html');    	
	}
    });
});
module.exports = router;