import http from 'k6/http';

var scenarios = {
  'products': {
    // name of the executor to use
    executor: 'constant-arrival-rate',

    // common scenario configuration
    exec: 'products',
    startTime: '1s',
    gracefulStop: '5s',
    env: { EXAMPLEVAR: 'testing' },
    tags: { example_tag: 'testing' },

    // executor-specific configuration
    duration: '15s',
    rate: '1000',
    preAllocatedVUs: 1000,
    timeUnit: '1s'
  }
};


export let options = {
  scenarios: {
    'products': {
      // name of the executor to use
      executor: 'constant-arrival-rate',

      // common scenario configuration
      exec: 'products',
      startTime: '1s',
      gracefulStop: '5s',
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

if (__ENV.scenario) {
  options.scenarios[__ENV.scenario] = scenarios[__ENV.scenario];
  options.scenarios[__ENV.scenario].rate = __ENV.rate;
}


export function products() {
  var url = 'http://localhost:5000/products';
  var count = 200;
  var page = Math.floor(Math.random() * 5000);
  var params = {
    page,
    count
  };

  http.get(url, params);
}