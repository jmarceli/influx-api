const axios = params => new Promise((resolve, reject) => {
  if (params.url === 'non.existent') {
    reject(new Error('test'));
  }

  resolve({
    data: {
      results: [{
        series: [{
          values: [['db12'], ['db34']],
        }],
      }],
    },
  });
});

export default axios;
