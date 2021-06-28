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
  pool.connect()
    .then(client => {
      client.query(sql)
        .then(response => {
          client.release();
          res.end(JSON.stringify(response.rows));
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
};

module.exports.getStyles = (req, res) => {
  var data = {
    'product_id': req.params.product_id,
    results: []
  }

  var styles = {};

  var styleQuery = `SELECT * FROM styles
                    LEFT JOIN photos ON styles.style_id=photos.style_id
                    LEFT JOIN sku ON styles.style_id=sku.style_id
                    WHERE styles.product_id=${req.params.product_id}`;
  pool.query(styleQuery)
    .then(response => {
      var rows = response.rows;
      for (var i = 0; i < rows.length; i++) {
        styles[rows[i].style_id] = styles[rows[i].style_id] ||
        {
          'style_id': rows[i].style_id,
          name: rows[i].name,
          'sale_price': rows[i].sale_price,
          'default?': rows[i].default_style,
          photos: {},
          skus: {}
        };
        var photo = {};
        photo.thumbnail_url = rows[i].thumbnail_url;
        photo.url = rows[i].url;
        styles[rows[i].style_id].photos[rows[i].photo_id] = photo;
        var sku = {};
        sku.quantity = rows[i].quantity;
        sku.size = rows[i].size;
        styles[rows[i].style_id].skus[rows[i].sku_id] = sku;
      }

      for (var style_id in styles) {
        data.results.push(styles[style_id]);
      }
      for (var x = 0; x < data.results.length; x++) {
        var photoArr = [];
        for (var key in data.results[x].photos) {
          photoArr.push(data.results[x].photos[key]);
        }
        data.results[x].photos = photoArr;
      }
      res.end(JSON.stringify(data));
    })
    .catch(err => {
      console.log(err);
    });

  //Probably need optimizing
  // Multiple Queries
  // var queries = [];
  // var styleQuery = `SELECT style_id, name, original_price, sale_price, default_style AS "default?" FROM styles WHERE product_id=${req.params.product_id}`;
  // pool.query(styleQuery)
  //   .then(response => {
  //     var queries = [];

  //     styles.results = response.rows;
  //     styles.results.forEach(style => {
  //       var style_id = style.style_id;
  //       var photoQuery = `SELECT thumbnail_url, url FROM photos WHERE style_id=${style_id}`;
  //       var skuQuery = `SELECT sku_id, quantity, size FROM sku WHERE style_id=${style_id}`;
  //       queries.push(pool.query(photoQuery)
  //         .then(photos => {
  //           style['photos'] = photos.rows;
  //         })
  //         .catch(err => {
  //           console.log(err);
  //           res.status(500);
  //           res.end();
  //           return;
  //         })
  //       );
  //       queries.push(pool.query(skuQuery)
  //         .then(skus => {
  //           style.skus = {}
  //           skus.rows.forEach(sku => {
  //             style.skus[sku.sku_id] = {
  //               quantity: sku.quantity,
  //               size: sku.size
  //             };
  //           });
  //         })
  //         .catch(err => {
  //           console.log(err);
  //           res.status(500);
  //           res.end();
  //           return;
  //         })
  //       );
  //     });

  //     Promise.all(queries)
  //       .then(() => {
  //         res.end(JSON.stringify(styles));
  //       });
  //   });

};

module.exports.getRelated = (req, res) => {
  var relatedQuery = `SELECT related_product_id FROM related WHERE product_id=${req.params.product_id}`;
  var related = [];
  pool.query(relatedQuery)
    .then(response => {
      response.rows.forEach(relate => {
        related.push(relate.related_product_id);
      });
      res.end(JSON.stringify(related));
    })
    .catch(err => {
      console.log(err);
      res.status(500);
      res.end();
      return;
    });
};
