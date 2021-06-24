const express = require('express');
const Pool = require('pg').Pool;

const dbconfig = require('./config.js').db;

const pool = new Pool(dbconfig);
pool.connect();

const app = express();
const port = 5000;

app.get('/products', (req, res) => {
  var page = req.query.page || 1;
  var count = req.query.count || 5;
  if (page < 1) {
    res.status(400);
    res.end();
    return;
  }

  var start = page * count - count + 1;
  var end = page * count;
  var sql = `SELECT * FROM products WHERE id >= ${start} AND id <= ${end}`;
  pool.query(sql)
    .then(response => {
      res.end(JSON.stringify(response.rows));
    })
    .catch(err => {
      res.status(500);
      res.end();
    });
});

app.get('/products/:product_id', (req, res) => {
  console.log(req.params);
  var queries = [];
  var product = {};

  var productQuery = `SELECT * FROM products WHERE id=${req.params['product_id']}`;
  var featureQuery = `SELECT feature, value FROM features WHERE product_id=${req.params['product_id']}`;
  queries.push(pool.query(productQuery)
    .then(response => {
      for (var key in response.rows[0]) {
        product[key] = response.rows[0][key];
      }
    })
    .catch(err => {
      res.status(500);
      res.end();
      return;
    })
  );
  queries.push(pool.query(featureQuery)
    .then(response => {
      console.log(response.rows);
      // for (var key in response.rows[0]) {
      //   product[key] = response.rows[0][key];
      // }
    })
    .catch(err => {
      console.log(err);
      res.status(500);
      res.end();
      return;
    })
  );

  Promise.all(queries)
    .then()
});

app.get('/products/:product_id/styles', (res, req) => {

});

app.get('/products/:product_id/related', (res, req) => {

});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
})
