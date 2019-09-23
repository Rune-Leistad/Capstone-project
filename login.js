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

app.get('/style.css', function(request, response) {
	response.sendFile(__dirname + "/style.css");
});

app.get('/home.html', function(request, response) {
	response.sendFile(__dirname + "/home.html");
	if (request.session.loggedin) {
		console.log("Logged in!");
	}
});

app.get('/chat.html', function(request, response) {
	response.sendFile(__dirname + "/chat.html");
});

app.get('/games.html', function(request, response) {
	response.sendFile(__dirname + "/games.html");
});

app.get('/learning-materials.html', function(request, response) {
	response.sendFile(__dirname + "/learning-materials.html");
});

app.get('/register.html', function(request, response) {
	response.sendFile(__dirname + "/register.html");
});

app.get('/statistics.html', function(request, response) {
	response.sendFile(__dirname + "/statistics.html");
});

app.get('/tutor-request.html', function(request, response) {
	response.sendFile(__dirname + "/tutor-request.html");
});

app.get('/video.html', function(request, response) {
	response.sendFile(__dirname + "/video.html");
});

app.get('/changepass.html', function(request, response) {
	response.sendFile(__dirname + "/changepass.html");
});

app.get('/login.html', function(request, response) {
	response.sendFile(__dirname + "/login.html");
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
        con.connect(function(err) {
            console.log(err);
    });
		con.query('SELECT * FROM user_information.log_in_data WHERE user_email = ? AND user_password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
                
				console.log("MATCH");
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect("/home.html");
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


// Register user
app.post('/reg', function(request, response) {
	con.query('INSERT INTO `user_information`.`log_in_data` (`user_name`, `user_email`, `user_password`, `user_secQ`, `user_secQAns`, `user_state`, `user_gender`, `user_phone`) VALUES (?, ?, ?, ?, ?, ?, "Male", ?);', [request.body.firstname, request.body.email, request.body.password, request.body.question,request.body.answer, request.body.state, request.body.phone], function(error, results, fields){});
	request.session.loggedin = true;
	request.session.username = request.body.email;
	response.redirect("/home.html");
});

// Update password
app.post('/chng', function(request, response) {
	con.query('UPDATE `user_information`.`log_in_data` SET `user_password` = ? WHERE (`user_email` = ? AND `user_secQAns` = ?);', [request.body.password, request.body.username, request.body.answer], function(error, results, fields){});
	request.session.loggedin = true;
	request.session.username = request.body.email;
	response.redirect("/home.html");
});

// Creating noticeboard posts
app.post('/newpost', function(request, response) {
    con.query('INSERT INTO `user_information`.`forum_posts` (`user_id`, `post_language`, `post_topic`, `post_content`) VALUES ("1", "ENG", ?, ?);', [request.body.topic, request.body.content], function(error, results, fields){console.log(error)});
    response.redirect("/home.html");
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		request.method = 'get';
		response.sendFile(__dirname + "/home.html");
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});
app.use('/', router);
app.use('/img', express.static('img'));
app.listen(process.env.port || 3000);
