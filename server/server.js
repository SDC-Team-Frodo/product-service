const express = require('express');
const router = require('./routes.js');

const app = express();
const port = 5000;

app.use(router);

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
})
