var axios = require('axios');
var expect = require('chai').expect;
const Pool = require('pg').Pool;

const dbconfig = require('../config.js').db;

const pool = new Pool(dbconfig);
pool.connect();

describe('Product service endpoints', function() {
  describe('/products', function() {
    it('should get 5 results if page and count are not provided', function(done){
      axios({
        method: 'GET',
        url: 'http://localhost:5000/products',
        params: {}
      })
        .then(response => {
          expect(response.data.length).to.equal(5);
          done();
        });
    });

    it('should get the first 10 results if page = undefined, count = 10', function(done){
      axios({
        method: 'GET',
        url: 'http://localhost:5000/products',
        params: {
          count: 10
        }
      })
        .then(response => {
          expect(response.data.length).to.equal(10);
          for (var i = 0; i < response.data.length; i++) {
            expect(response.data[i].id).to.equal(i + 1);
          }
          done();
        });
    });

    it('should get results with ids 31-40 results if page = 4, count = 10', function(done){
      axios({
        method: 'GET',
        url: 'http://localhost:5000/products',
        params: {
          page: 4,
          count: 10
        }
      })
        .then(response => {
          expect(response.data.length).to.equal(10);
          for (var i = 0; i < response.data.length; i++) {
            expect(response.data[i].id).to.equal(i + 31);
          }
          done();
        });
    });
  });

  describe('/products/:product_id', function() {
    it('should respond with the correct product_id', function() {
      for (var id = 1; id < 10; id++) {
        axios({
          method: 'GET',
          url: `http://localhost:5000/products/${id}`,
        })
        .then(response => {
          expect(response.data.id).to.equal(id);
          done();
        });
      }
    });

    it('should get the corresponding features', function() {
      var id = 5;

      //Features for product_id 5
      var features = [
        {
          feature: 'Material',
          value: 'FullControlSkin'
        },
        {
          feature: 'Mid-Sole',
          value: 'ControlSupport Arch Bridge'
        },
        {
          feature: 'Stitching',
          value: 'Double Stitch'
        }
      ];

      var containsFeatures = (actual, expected) => {
        if (actual.length !== expected.length) {
          return false;
        }
        for (var i = 0; i < actual.length; i++) {
          var contains = false;
          for (var j = 0; j < expected.length; j++) {
            if (expected[j].feature === actual[i].feature && expected[j].value === actual[i].value) {
              contains = true;
            }
          }
          if (!contains) {
            return false;
          }
        }
        return true;
      };

      axios({
        method: 'GET',
        url: `http://localhost:5000/products/${id}`
      })
        .then(response => {
          expect(containsFeatures(features, response.data.features)).to.be(true);
          done();
        });
    });
  });

  describe('/products/:product_id/styles', function() {
    it('should respond with the correct product_id', function() {
      var id = 10;
      axios({
        method: 'GET',
        url: `http://localhost:5000/products/${id}/styles`
      })
        .then(response => {
          expect(response.data.product_id).to.equal(id);
          done();
        });
    });

    it('should get the corresponding styles', function() {
      var id = 3;
      axios({
        method: 'GET',
        url: `http://localhost:5000/products/${id}/styles`
      })
        .then(response => {
          var results = response.data.results;
          expect(results.length).to.equal(6);

          for (var i = 0; i < results.length; i++) {
            expect(results[i].style_id).to.equal(i + 11);
          }
          done();
        });
    });

    it('should get the corresponding skus for each style', function() {
      var id = 3;
      axios({
        method: 'GET',
        url: `http://localhost:5000/products/${id}/styles`
      })
        .then(response => {
          response.data.results.forEach(style => {
            var style_id = style.style_id;
            var expectedSkus = response.data.results[0].skus;
            var skuQuery = `SELECT * FROM sku WHERE style_id=${style_id}`;
            pool.query(skuQuery)
            .then(skus => {
              skus.forEach(sku => {
                expect(expectedSkus[sku.sku_id].quantity).to.equal(sku.quantity);
                expect(expectedSkus[sku.sku_id].size).to.equal(sku.size);
              });
              done();
            });

          })
        });
    });

    it('should get the corresponding photos for each style', function() {
      var id = 3;

      var containsPhotos = (actual, expected) => {
        if (actual.length !== expected.length) {
          return false;
        }
        for (var i = 0; i < actual.length; i++) {
          var contains = false;
          for (var j = 0; j < expected.length; j++) {
            if (expected[j].thumbnail_url === actual[i].thumbnail_url && expected[j].url === actual[i].url) {
              contains = true;
            }
          }
          if (!contains) {
            return false;
          }
        }
        return true;
      };

      axios({
        method: 'GET',
        url: `http://localhost:5000/products/${id}/styles`
      })
        .then(response => {
          response.data.results.forEach(style => {
            var style_id = style.style_id;
            var expectedPhotos = response.data.results[0].photos;
            var photoQuery = `SELECT * FROM photos WHERE style_id=${style_id}`;
            pool.query(photoQuery)
              .then(photos => {
                expect(containsPhotos(photos, expectedPhotos)).to.be(true);
                done();
              });
          });
        });
    });
  });

  describe('/products/:product_id/related', function() {
    it('should get the related product ids', function() {
      var id = 3;
      axios({
        method: 'GET',
        url: `http://localhost:5000/products/${id}/related`
      })
        .then(response => {
          var relatedQuery = `SELECT * FROM related WHERE product_id=${id}`;
          pool.query(relatedQuery)
            .then(relatedProducts => {
              expect(relatedProducts.length).to.equal(response.data.length);
              relatedProducts.forEach(related => {
                expect(response.data.includes(related.related_product_id)).to.be(true);
              });
              done();
            });
        });

    });

  });

});
