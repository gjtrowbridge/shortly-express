var Bookshelf = require('bookshelf');
var path = require('path');

var db = Bookshelf.initialize({
  client: 'sqlite3',
  connection: {
    charset: 'utf8',
    filename: path.join(__dirname, '../db/shortly.db')
  }
});

// db.knex.schema.dropTableIfExists('links').then(function() {
//   db.knex.schema.createTable('links', function(link) {
//     link.increments('id').primary();
//     link.string('url', 255);
//     link.string('base_url', 255);
//     link.string('code', 100);
//     link.string('title', 255);
//     link.integer('visits');
//     link.timestamps();
//   }).catch(function(err) {
//     console.log('links', err);
//   });
// });

// db.knex.schema.dropTableIfExists('clicks').then(function() {
//   db.knex.schema.createTable('clicks', function(click) {
//     click.increments('id').primary();
//     click.integer('link_id');
//     click.timestamps();
//   }).catch(function(err) {
//     console.log('clicks', err);
//   });
// });

// db.knex.schema.dropTableIfExists('users').then(function() {
//   db.knex.schema.createTable('users', function(user) {
//     user.increments('id').primary();
//     user.string('name', 255).unique();
//     user.string('password', 255);
//     user.string('token', 255);
//     user.string('salt', 255);
//     user.timestamps();
//   }).catch(function(err) {
//     console.log('users', err);
//   });
// });

// db.knex.schema.dropTableIfExists('links_users').then(function() {
//   db.knex.schema.createTable('links_users', function(click) {
//     click.increments('id').primary();
//     click.integer('link_id');
//     click.integer('user_id');
//     click.timestamps();
//   }).catch(function(err) {
//     console.log('links_users', err);
//   });
// });

module.exports = db;
