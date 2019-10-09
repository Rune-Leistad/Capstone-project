var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var router = express.Router();
var expressLayouts = require('express-ejs-layouts');

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
app.use(expressLayouts);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    response.render('home');
});


app.get('/style.css', function(request, response) {
	response.sendFile(__dirname + "/style.css");
});


app.get('/home', function(request, response) {
    con.query('SELECT * FROM user_information.forum_posts JOIN user_information.log_in_data ON forum_posts.user_id=log_in_data.user_id', function(error, results, fields) {
        if(error)
            console.log(error.message);
        else {
            response.render('home', {page_name: 'home',
                                logged_in: request.session.loggedin,
                                u_id: request.session.userid,
                                posts: results});
        }
    });
});

app.get('/chat', function(request, response) {
	 response.render('chat', {page_name: 'chat', logged_in: request.session.loggedin});
});

app.get('/games', function(request, response) {
	response.render('games', {page_name: 'games', logged_in: request.session.loggedin});
});

app.get('/learning-materials', function(request, response) {
	response.render('learning-materials', {page_name: 'learning-materials', logged_in: request.session.loggedin});
});

app.get('/register', function(request, response) {
	response.render('register', {page_name: 'register', logged_in: request.session.loggedin});
});

app.get('/statistics', function(request, response) {
	response.render('statistics', {page_name: 'statistics', logged_in: request.session.loggedin});
});

app.get('/tutor-request', function(request, response) {
	response.render('tutor-request', {page_name: 'tutor-request', logged_in: request.session.loggedin});
});

app.get('/video', function(request, response) {
	response.render('video', {page_name: 'video', logged_in: request.session.loggedin});
});

app.get('/changepass', function(request, response) {
	response.render('changepass', {page_name: 'changepass', logged_in: request.session.loggedin});
});

app.get('/login', function(request, response) {
	response.render('login', {page_name: 'login', logged_in: request.session.loggedin});
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
                request.session.userid = results[0].user_id; // results[0] should always be the logged in user
				response.redirect("/home");
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
    con.query('SELECT * FROM user_information.log_in_data WHERE user_email = ?;',[request.body.email], function(error, results, fields){
        if(results.length < 1) {
            con.query('INSERT INTO `user_information`.`log_in_data` (`user_name`, `user_email`, `user_password`, `user_secQ`, `user_secQAns`, `user_state`, `user_gender`, `user_phone`) VALUES (?, ?, ?, ?, ?, ?, "Male", ?);', [request.body.firstname, request.body.email, request.body.password, request.body.question,request.body.answer, request.body.state, request.body.phone], function(error, results, fields){
                request.session.loggedin = true;
              	request.session.username = request.body.email;
              	response.redirect("/home");
            });
        }
        else {
            console.log("Email is already in use.");
            request.session.loggedin = false;
            request.session.username = "";
            response.redirect("/home");
        }
    });
});

// Update password
app.post('/chng', function(request, response) {
	con.query('UPDATE `user_information`.`log_in_data` SET `user_password` = ? WHERE (`user_email` = ? AND `user_secQAns` = ?);', [request.body.password, request.body.username, request.body.answer], function(error, results, fields){});
	request.session.loggedin = true;
	request.session.username = request.body.email;
	response.redirect("/home");
});

// Creating noticeboard posts
app.post('/newpost', function(request, response) {
    con.query('INSERT INTO `user_information`.`forum_posts` (`user_id`, `post_language`, `post_topic`, `post_content`, `post_views`) VALUES (?, "ENG", ?, ?, "0");', [request.session.userid, request.body.topic, request.body.content], function(error, results, fields){console.log(error)});
    console.log("Noticeboard post successfully saved");
    response.redirect("/home");
});

app.get('/getFeatured', function(request, response) {
    con.query('SELECT * FROM user_information.forum_posts JOIN user_information.log_in_data ON forum_posts.user_id=log_in_data.user_id ORDER BY forum_posts.post_views DESC LIMIT 3', function(error, results, fields) {
        console.log(result.length);
        if(error)
            console.log(error.message);
        else
            response.render('home', {page_name: 'home',
                                logged_in: request.session.loggedin,
                                posts: results});
    });
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		request.method = 'get';
		response.render('home');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});


app.use('/', router);
app.use('/img', express.static('img'));
app.listen(process.env.port || 3000);
