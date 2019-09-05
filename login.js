var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var router = express.Router();

var sql = "SELECT * FROM user_information.log_in_data WHERE user_id = 1;"
var sql1 = "SELECT * FROM user_information.forum_posts WHERE user_id = 1;"

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password"
});

app.use(session({
	secret: '84614549846164',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		con.query('SELECT * FROM user_information.log_in_data WHERE user_email = ? AND user_password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				console.log("MATCH");
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		console.log("Logged in!");
		response.sendFile(path.join(__dirname + '/home.html'));
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});
app.use('/', router);
app.listen(process.env.port || 3000);