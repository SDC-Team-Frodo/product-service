import http from 'k6/http';

export let options = {
  scenarios: {
    'load': {
      // name of the executor to use
      executor: 'constant-arrival-rate',

      // common scenario configuration
      exec: 'products',
      startTime: '1s',
      gracefulStop: '10s',
      env: { EXAMPLEVAR: 'testing' },
      tags: { example_tag: 'testing' },

      // executor-specific configuration
      duration: '15s',
      rate: '1000',
      preAllocatedVUs: 1000,
      timeUnit: '1s'
    }
  }
}

if (__ENV.exec) {
  options.scenarios.load.exec = __ENV.exec;
  options.scenarios.load.rate = __ENV.rate;
}


export function products() {
  var url = 'http://18.117.110.92:5000/products';
  var count = 200;
  var page = Math.floor(Math.random() * 5000);
  var params = {
    page,
    count
  };

  http.get(url, params);
}

export function productDetails() {
  var id = Math.floor(Math.random() * 1000012);
  var url = `http://localhost:5000/products/${id}`;

  http.get(url);
};

export function styles() {
  var id = Math.floor(Math.random() * 1000012);
  var url = `http://localhost:5000/products/${id}/styles`;

  http.get(url);
};

export function related() {
  var id = Math.floor(Math.random() * 1000012);
  var url = `http://localhost:5000/products/${id}/related`;

  http.get(url);
};