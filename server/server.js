const express = require('express');
const Pool = require('pg').Pool;

const dbconfig = require('./config.js').db;

const pool = new Pool(dbconfig);

const app = express();
const port = 5000;

app.get('/products', (res, req) => {

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
