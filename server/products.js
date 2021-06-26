const Pool = require('pg').Pool;

const dbconfig = require('./config.js').db;

const pool = new Pool(dbconfig);

module.exports.getProducts = (req, res) => {
  var page = req.query.page || 1;
  var count = req.query.count || 5;
  if (page < 1) {
    res.status(400);
    res.end();
    return;
  }

  var start = page * count - count + 1;
  var end = page * count;
  var sql = `SELECT product_id AS id, name, slogan, description, category, default_price FROM products WHERE product_id >= ${start} AND product_id <= ${end}`;
  console.time('products');
  pool.connect()
    .then(client => {
      client.query(sql)
        .then(response => {
          client.release();
          res.end(JSON.stringify(response.rows));
          console.timeEnd('products');
        })
        .catch(err => {
          client.release();
          res.status(500);
          res.end();
        });
  });
};

module.exports.getProductDetails = (req, res) => {
  var queries = [];
  var product = {};

  //Multiple Queries
  var productQuery = `SELECT product_id AS id, name, slogan, description, category, default_price FROM products WHERE product_id=${req.params['product_id']}`;
  var featureQuery = `SELECT feature, value FROM features WHERE product_id=${req.params['product_id']}`;
  console.time(`product ${req.params['product_id']}`)
  queries.push(pool.query(productQuery)
    .then(response => {
      for (var key in response.rows[0]) {
        product[key] = response.rows[0][key];
      }
      console.timeEnd(`product ${req.params['product_id']}`);
    })
    .catch(err => {
      res.status(500);
      res.end();
      return;
    })
  );
  console.time(`feature ${req.params['product_id']}`);
  queries.push(pool.query(featureQuery)
    .then(response => {
      product['features'] = response.rows;
      console.timeEnd(`feature ${req.params['product_id']}`);
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
};

module.exports.getStyles = (req, res) => {
  var styles ={
    'product_id': req.params.product_id,
    results: []
  }
  //Probably need optimizing
  var queries = [];
  var styleQuery = `SELECT style_id, name, original_price, sale_price, default_style AS "default?" FROM styles WHERE product_id=${req.params.product_id}`;
  pool.query(styleQuery)
    .then(response => {
      var queries = [];

      styles.results = response.rows;
      styles.results.forEach(style => {
        var style_id = style.style_id;
        var photoQuery = `SELECT thumbnail_url, url FROM photos WHERE style_id=${style_id}`;
        var skuQuery = `SELECT sku_id, quantity, size FROM sku WHERE style_id=${style_id}`;
        console.time(`style ${style_id}`);
        queries.push(pool.query(photoQuery)
          .then(photos => {
            style['photos'] = photos.rows;
            console.timeEnd(`style ${style_id}`);
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
              style.skus[sku.sku_id] = {
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

};

module.exports.getRelated = (req, res) => {
  var relatedQuery = `SELECT related_product_id FROM related WHERE product_id=${req.params.product_id}`;
  var related = [];

  console.time('related');
  pool.query(relatedQuery)
    .then(response => {
      response.rows.forEach(relate => {
        related.push(relate.related_product_id);
      })
      console.timeEnd('related');
      res.end(JSON.stringify(related));
    })
    .catch(err => {
      console.log(err);
      res.status(500);
      res.end();
      return;
    });
};
