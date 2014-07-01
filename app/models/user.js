var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var Link = require('./link');
var crypto = require('crypto');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  links: function () {
    return this.belongsToMany(Link);
  },
  initialize: function() {
    this.on('creating', function(model, attrs, options){
      model.saltAndHashPassword(model);
    });
    // this.on('created')
  },
  saltAndHashPassword: function(model) {
    var pass = model.get('password');
    // var salt = (new Date()).toString() + Math.random().toString() + model.get('name');
    var salt = bcrypt.genSaltSync();
    model.set('salt', salt);
    var hash = bcrypt.hashSync(pass, salt);
    model.set('password', hash);
  },
  login: function(password, cb) {
    var hash = bcrypt.hashSync(password, this.get('salt'));
    if (hash === this.get('password')) {
      this.createToken(function(err, token) {
        cb(err, token);
      });
    } else {
      cb(new Error(''));
    }
  },
  createToken: function(cb) {
    crypto.randomBytes(48, function (err, buff) {
      var token = buff.toString('hex');
      this.set('token', token);
      cb(err, token);
    }.bind(this));
  },
  checkToken: function(token) {
    return token === this.get('token');
    //check expiration
  }
});

module.exports = User;
