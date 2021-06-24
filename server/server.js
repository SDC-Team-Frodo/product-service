const express = require('express');
const Pool = require('pg').Pool;

const dbconfig = require('./config.js').db;

const pool = new Pool(dbconfig);
pool.connect();

const app = express();
const port = 5000;

app.get('/products', (req, res) => {
  var searchParams = new URLSearchParams(req.url.replace('/products', ''));
  var page = searchParams.get('page');
  var count = searchParams.get('count');

  var start = page * count - count + 1;
  var end = page * count;
  var sql = `SELECT * FROM products WHERE id >= ${start} AND id <= ${end}`;
  pool.query(sql)
    .then(response => {
      res.end(JSON.stringify(response.rows));
    });
});

app.get('/products/:product_id', (res, req) => {

});

app.get('/products/:product_id/styles', (res, req) => {

});

app.get('/products/:product_id/related', (res, req) => {

});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
})
