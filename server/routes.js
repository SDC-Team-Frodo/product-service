var router = require('express').Router();
var controller = require('./products.js');

router.get('/loaderio-a449af48e5413b242b61f3925effefee', controller.getLoaderIO);

router.get('/products', controller.getProducts);

router.get('/products/:product_id', controller.getProductDetails);

router.get('/products/:product_id/styles', controller.getStyles);

router.get('/products/:product_id/related', controller.getRelated);

module.exports = router;