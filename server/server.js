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
  var queries = [];
  var product = {};

  //Multiple Queries
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
      product['features'] = response.rows;
    })
    .catch(err => {
      console.log(err);
      res.status(500);
      res.end();
      return;
    })
  );

  Promise.all(queries)
    .then(() => {
      res.end(JSON.stringify(product));
    });
});

app.get('/products/:product_id/styles', (req, res) => {
  var styles ={
    'product_id': req.params.product_id,
    results: []
  }

  var queries = [];
  var styleQuery = `SELECT id AS style_id, name, original_price, sale_price, default_style AS "default?" FROM styles WHERE product_id=${req.params.product_id}`;
  pool.query(styleQuery)
    .then(response => {
      var queries = [];

      styles.results = response.rows;
      styles.results.forEach(style => {
        var style_id = style.style_id;
        var photoQuery = `SELECT thumbnail_url, url FROM photos WHERE style_id=${style_id}`;
        var skuQuery = `SELECT id, quantity, size FROM sku WHERE style_id=${style_id}`;

        queries.push(pool.query(photoQuery)
          .then(photos => {
            style['photos'] = photos.rows;
          })
          .catch(err => {
            console.log(err);
            res.status(500);
            res.end();
            return;
          })
        );
        queries.push(pool.query(skuQuery)
          .then(skus => {
            style.skus = {}
            skus.rows.forEach(sku => {
              style.skus[sku.id] = {
                quantity: sku.quantity,
                size: sku.size
              };
            });
          })
          .catch(err => {
            console.log(err);
            res.status(500);
            res.end();
            return;
          })
        );
      });

      Promise.all(queries)
        .then(() => {
          res.end(JSON.stringify(styles));
        });
    });

});

app.get('/products/:product_id/related', (req, res) => {

});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
})
