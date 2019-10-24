var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var router = express.Router();
var expressLayouts = require('express-ejs-layouts');

const {check,validationResult} = require('express-validator');


const uploadFolder = './uploads/';
const fs = require('fs');

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
app.use(express.static(__dirname + '/resources'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    con.query('SELECT * FROM user_information.forum_posts JOIN user_information.log_in_data ON forum_posts.user_id=log_in_data.user_id;', function(error, results, fields) {
        if(error)
            console.log(error.message);
        else {
            response.render('home', {page_name: 'home',
                                logged_in: request.session.loggedin,
                                u_id: request.session.userid,
                                u_name: request.session.username,
                                posts: results});
        }
    });
});


app.get('/style.css', function(request, response) {
	response.sendFile(__dirname + "/style.css");
});


app.get('/home', function(request, response) {
    con.query('SELECT * FROM user_information.forum_posts JOIN user_information.log_in_data ON forum_posts.user_id=log_in_data.user_id  ORDER BY post_id DESC;', function(error, results, fields) {
        if(error)
            console.log(error.message);
        else {
            response.render('home', {page_name: 'home',
                                logged_in: request.session.loggedin,
                                u_id: request.session.userid,
                                u_name: request.session.username,
                                posts: results});
        }
    });
});


app.get('/chat', function(request, response) {
	if (request.session.loggedin) {
        con.query('SELECT * FROM user_information.log_in_data WHERE log_in_data.user_id != ?;', [request.session.userid], function(error, results, fields) {
    		response.render('chat', {page_name: 'chat',
                                    u_id: request.session.userid,
                                    u_name: request.session.username,
                                    u_email: request.session.email,
                                    logged_in: request.session.loggedin,
                                    other: {user_id: request.session.userid,
                                            u_name: request.session.username,
                                            u_email: request.session.email},
                                    users: results});
            });
	} else {
		response.render('login', {page_name: 'login', u_name: request.session.username, logged_in: request.session.loggedin, error_msg: 0});
	}

});

app.post('/chat', function(request, response) {
    con.query('SELECT * FROM user_information.log_in_data', function(error, results, fields) {
        var reqUserAt = 0;
        var selfUserAt = 0;
        // Finding array index of user of which to initate chat with
        for(var i = 0; i < results.length; i++) {
            if(results[i].user_id == request.body.id)
                reqUserAt = i;
            else if(results[i].user_id == request.session.userid) {
                selfUserAt = i;
            }
        }
        var otherUser = results.splice(reqUserAt, 1);
        results.splice(selfUserAt, 1);
        response.render('chat', {page_name: 'chat',
                                u_id: request.session.userid,
                                u_name: request.session.username,
                                u_email: request.session.email,
                                logged_in: request.session.loggedin,
                                other: otherUser,
                                users: results});
    });
});

app.get('/games', function(request, response) {
	response.render('games', {page_name: 'games',
                                u_name: request.session.username,
                                logged_in: request.session.loggedin,
                                game: 'none'});
});

app.post('/games', function(request, response) {
	response.render('games', {page_name: 'games',
                                u_name: request.session.username,
                                logged_in: request.session.loggedin,
                                game: request.body.gameChoose});
});

app.get('/learning-materials', function(request, response) {
	var file_names = [];
	fs.readdir(uploadFolder, (err, files) => {
		files.forEach(file => {
			file_names.push(file);
		});
	
		response.render('learning-materials', {page_name: 'learning-materials',
                                logged_in: request.session.loggedin,
                                u_id: request.session.userid,
                                u_name: request.session.username,
								file_names: file_names});
		console.log(files);
	});
	
	
	
	
	//response.render('learning-materials', {page_name: 'learning-materials', u_name: request.session.username, logged_in: request.session.loggedin});
});

app.get('/register', function(request, response) {
	response.render('register', {page_name: 'register', u_name: request.session.username, logged_in: request.session.loggedin});
});

app.get('/statistics', function(request, response) {
	//response.render('statistics', {page_name: 'statistics', u_name: request.session.username, logged_in: request.session.loggedin});

	con.query('SELECT user_gender, user_state FROM user_information.log_in_data', function(error, results, fields) {
        if(error)
            console.log(error.message);
        else {

			var states = ["QLD", "NSW", "VIC", "SA", "WA", "NT", "TAS"];
			var counts_states = [0, 0, 0, 0, 0, 0, 0];
			var genders = ["Male", "Female"];
			var gender_counts = [0, 0];

			for (var i = 0; i < results.length; i++) {
				switch (results[i].user_state){
					case "QLD":
						counts_states[0] += 1;
						break;
					case "NSW":
						counts_states[1] += 1;
						break;
					case "VIC":
						counts_states[2] += 1;
						break;
					case "SA":
						counts_states[3] += 1;
						break;
					case "WA":
						counts_states[4] += 1;
						break;
					case "NT":
						counts_states[5] += 1;
						break;
					case "TAS":
						counts_states[6] += 1;
						break;
				}
				switch (results[i].user_gender) {
					case "Male":
						gender_counts[0] += 1;
						break;
					case "Female":
						gender_counts[1] += 1;
						break;
				}
			}

            response.render('statistics', {page_name: 'statistics',
                                logged_in: request.session.loggedin,
                                u_id: request.session.userid,
                                u_name: request.session.username,
                                states: states,
								counts_states: counts_states,
								genders: genders,
								gender_counts: gender_counts});
        }
    });
});

app.get('/tutor-request', function(request, response) {
	if (request.session.loggedin) {
		response.render('tutor-request', {page_name: 'tutor-request', u_name: request.session.username, logged_in: request.session.loggedin});
	} else {
		response.render('login', {page_name: 'login', u_name: request.session.username, logged_in: request.session.loggedin, error_msg: 0});
	}

});

app.get('/video', function(request, response) {
	//response.render('video', {page_name: 'video', u_name: request.session.username, logged_in: request.session.loggedin});


	con.query('SELECT * FROM user_information.videos JOIN user_information.log_in_data ON videos.uploaders_id=log_in_data.user_id WHERE videos.approved = 1 ORDER BY video_id DESC', function(error, results, fields) {
        if(error)
            console.log(error.message);
        else {
            response.render('video', {page_name: 'video',
                                logged_in: request.session.loggedin,
                                u_id: request.session.userid,
                                u_name: request.session.username,
                                posts: results});
        }
    });
});

app.get('/changepass', function(request, response) {
	response.render('changepass', {page_name: 'changepass', u_name: request.session.username, logged_in: request.session.loggedin});
});

app.get('/login', function(request, response) {
	response.render('login', {page_name: 'login', u_name: request.session.username, logged_in: request.session.loggedin, error_msg: 0});
});

app.get('/profile', function(request, response) {
    con.query('SELECT * FROM user_information.log_in_data WHERE log_in_data.user_id = ?',[request.session.userid], function(error, results, fields) {
        if(error)
            console.log(error.message);
        else {
            response.render('profile', {page_name: 'profile',
                                logged_in: request.session.loggedin,
                                u_id: request.session.userid,
                                u_name: request.session.username,
                                user_data: results});
        }
    });
});

app.post('/auth', function(request, response) {
	var email = request.body.email;
	var password = request.body.password;
	if (email && password) {
		con.query('SELECT * FROM user_information.log_in_data WHERE user_email = ? AND user_password = ?', [email, password], function(error, results, fields) {
			if (results.length > 0) {

				console.log("MATCH");
				request.session.loggedin = true;
				request.session.username = results[0].user_name;
                request.session.email = email;
                request.session.userid = results[0].user_id; // results[0] should always be the logged in user
				response.redirect("/home");
			} else {
				response.render('login',
                                {page_name: 'login',
                                u_name: request.session.username,
                                logged_in: request.session.loggedin,
                                error_msg: 'Email or password is incorrect.'});
			}
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.post('/tutorrequest', function(request, response) {
	con.query('INSERT INTO `user_information`.`tutor_requests` (`student_id`, `subject`, `request_info`) VALUES (?, ?, ?);', [request.session.userid, request.body.subject, request.body.request], function(error, results, fields){
		console.log(error);
	});
	console.log("Added to table")
	response.redirect("/tutor-request");
});


// Register user
/*app.post('/reg', function(request, response) {
	con.query('INSERT INTO user_information.log_in_data (user_name, user_last_name, user_email, user_password, user_secQ, user_secQAns, user_state, user_gender, user_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',[request.body.firstname, request.body.lastname, request.body.email, request.body.password, request.body.question,request.body.answer, request.body.state, request.body.gender, request.body.phone], function(error, results, fields){
		console.log(request.body);
		response.render('login', {page_name: 'login', 
								u_name: request.session.username, 
								logged_in: request.session.loggedin, 
								error_msg: 0});

	});
}); */

app.post('/reg', function(request, response) {
	con.query('INSERT INTO `user_information`.`log_in_data` (`user_name`, `user_email`, `user_password`, `user_secQ`, `user_secQAns`, `user_state`, `user_gender`, `user_phone`) VALUES (?, ?, ?, ?, ?, ?, ?, ?);', [request.body.firstname, request.body.email, request.body.password, request.body.question,request.body.answer, request.body.state, request.body.gender ,request.body.phone], function(error, results, fields){});
	request.session.loggedin = true;
	request.session.username = request.body.firstname;
	response.render('login',
					{page_name: 'login',
					u_name: "",
					logged_in: false,
					error_msg: 0});
});

// Update password
app.post('/chng',
        [check('username', 'Email is invalid').isEmail(),
        check('passwordCheck').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
            }

            return true;
      })], (request, response) => {
              //check validate data
    const result= validationResult(request);
    var errors = result.errors;
    for (var key in errors) {
        console.log(errors[key].value);
    }
    if (!result.isEmpty()) {
        //response validate data to changepass.ejs
        response.render('changepass', {page_name: 'changepass',
                                    u_name: request.session.username,
                                    logged_in: request.session.loggedin,
                                    errors: errors});
    }
    else  {
        con.query('UPDATE `user_information`.`log_in_data` SET `user_password` = ? WHERE (`user_email` = ? AND `user_secQAns` = ?);', [request.body.password, request.body.username, request.body.answer], function(error, results, fields){
            response.redirect("/");
        });
    }
});

// Creating noticeboard posts
app.post('/newpost', function(request, response) {
    con.query('INSERT INTO `user_information`.`forum_posts` (`user_id`, `post_language`, `post_topic`, `post_content`, `post_views`) VALUES (?, "ENG", ?, ?, "0");', [request.session.userid, request.body.topic, request.body.content], function(error, results, fields){console.log(error)});
    console.log("Noticeboard post successfully saved");
    response.redirect("/home");
});


app.post('/newvid', function(request, response) {
    con.query('INSERT INTO `user_information`.`videos` (`uploaders_id`, `title`, `url`, `approved`) VALUES (?, ?, ?, 0);', [request.session.userid, request.body.title, request.body.url], function(error, results, fields){console.log(error)});
    console.log("New video post successfully saved");
    response.redirect("/video");
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

app.get('/logout', function(request, response, next) {
  if (request.session) {
    // delete session object
    request.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return response.redirect('/');
      }
    });
  }
});


app.post('/download', function(req, res){
	console.log(req.body.dl);
  const file = 'uploads/' + req.body.dl;
  res.download(file, req.body.dl); // Set disposition and send it.
});

app.use('/', router);
app.use('/img', express.static('img'));
app.listen(process.env.port || 3000);


