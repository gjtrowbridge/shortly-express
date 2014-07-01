var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

var checkUser = function(req, res, next) {
  res.locals.loggedIn = false;
  // if (req.cookies === undefined) {
  //   res.redirect('/login');
  // } else {
  new User({ id: req.session.user_id }).fetch().then(function(user) {
    if (user) {
      if (user.checkToken(req.session.token)) {
        res.locals.loggedIn = true;
        next();
      } else {
        res.redirect('/login');
      }
    } else {
      res.redirect('/login');
    }
  });
  // }
};

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(partials());
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser('Greg and Alex rule!!!!'));
  app.use(express.session());
});

app.get('/', checkUser, function(req, res) {
  res.render('index');
});

app.get('/create', checkUser, function(req, res) {
  res.render('index');
});

app.get('/links', checkUser, function(req, res) {
  // new User({ id: req.cookies.user_id }).fetch({withRelated: ['links']}).then(function(user) {
  //   if (user) {
  //     console.log(user.related('link'));//links().models);
  //     res.send(200, user.links().models);
  //   } else {
  //     //should never get here
  //     res.redirect('/');
  //   }
  // });
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links', checkUser, function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login', function(req, res) {
  var username = req.body.username;
  new User({name: username}).fetch().then(function(user) {
    if (user) {
      user.login(req.body.password, function(err, token) {
        if (err) {
          res.render('login', {
            messages: 'Invalid username/password combination'
          });
        } else {
          user.save().then(function(newUser) {
            req.session.token = newUser.get('token');
            req.session.user_id = newUser.get('id');
            res.redirect('/');
          });
        }
      });
    } else {
      res.render('login', {
        messages: 'Invalid username/password combination'
      });
    }
  });
});

app.get('/logout', function(req, res) {
  req.session.destroy(function () {
    res.redirect('/login');
  });
});

app.get('/signup', function(req, res) {
  res.render('signup');
});

app.post('/signup', function(req, res) {
  new User({name: req.body.username}).fetch().then(function(found) {
    if (found) {
      res.render('signup', {
        messages: 'User already exists!'
      });
    } else {
      util.hasValidUserCredentials(req, function(err) {
        if (err) {
          res.render('signup', {
            messages: err.message
          });
        } else {
          var user = new User({
            name: req.body.username,
            password: req.body.password
          });
          user.createToken(function() {
            user.save().then(function(newUser) {
              Users.add(newUser);
              req.session.token = newUser.get('token');
              req.session.user_id = newUser.get('id');
              res.redirect('/');
            });
          });
        }
      });
    }
  });
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('links')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});




console.log('Shortly is listening on 4568');
app.listen(4568);
