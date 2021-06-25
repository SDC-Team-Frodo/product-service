var router = require('express').Router();
var controller = require('./products.js');

router.get('/products', controller.getProducts);

router.get('/products/:product_id', controller.getProductDetails);

router.get('/products/:product_id/styles', controller.getStyles);

router.get('/products/:product_id/related', controller.getRelated);

module.exports = router;