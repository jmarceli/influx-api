// @flow
import axiosBase from 'axios';
import { write, query, buildUrl } from './index';

// TODO: this might have better Flow annotations
// https://github.com/flow-typed/flow-typed/issues/291
const mock = (mockObject: any): any => mockObject;
const axios = mock(axiosBase);

// $FlowFixMe
const get = require('./index').__get__;

test('.buildUrl', () => {
  expect(buildUrl({ host: 'test.test', ssl: true, port: 8081 })).toEqual('https://test.test:8081');
  expect(buildUrl({ host: 'test.test' })).toEqual('http://test.test:8086');
});

describe('.query', () => {
  test('query JSON response', async () => {
    axios.mockResolvedValueOnce({
      data: {
        results: [{ series: [{ values: [['db12'], ['db34']] }] }],
      },
    });
    const data = await query({
      url: 'any.localhost',
      q: 'SELECT * FROM test..test',
    });
    expect(data).toEqual({
      data: {
        results: [{ series: [{ values: [['db12'], ['db34']] }] }],
      },
    });
  });
});

describe('.write', () => {
  test('write data', async () => {
    axios.mockResolvedValueOnce('');
    const data = await write({
      url: 'any.localhost',
      data: 'meas_1 tag_1=1 field_1=1 123123123',
      db: 'mydb',
    });
    expect(data).toEqual('');
  });
});

describe('.postParams', () => {
  const postParams = get('postParams');

  test('empty params', () => {
    expect(() => postParams()).toThrow();
  });

  test('minimal params', () => {
    expect(postParams({
      url: 'any.test.com',
    })).toEqual({
      url: 'any.test.com',
      method: 'POST',
    });
  });

  test('all params', () => {
    expect(postParams({
      url: 'any.test.com',
      u: 'username',
    })).toEqual({
      url: 'any.test.com',
      method: 'POST',
      auth: {
        username: 'username',
        password: '',
      },
    });

    expect(postParams({
      url: 'any.test.com',
      u: 'username',
      p: 'password',
    })).toEqual({
      url: 'any.test.com',
      method: 'POST',
      auth: {
        username: 'username',
        password: 'password',
      },
    });
  });
});

describe('.post', () => {
  const post = get('post');

  test('csv return', async () => {
    axios.mockResolvedValueOnce('name\nmeas_1');
    expect(await post({
      url: 'any.test.com',
      responseType: 'csv',
    })).toEqual('name\nmeas_1');
  });

  test('network error', async () => {
    axios.mockRejectedValueOnce({ response: undefined });
    try {
      await post({ url: 'network.error' });
    } catch (err) {
      expect(err.response.status).toBe(400);
      expect(err.response.data).toBe('This might be a CORS error, network problem or invalid HTTPS redirect, invalid URL. Please check your connection configuration once more.');
    }
  });

  test('unauthorized', async () => {
    axios.mockRejectedValueOnce({ response: { status: 401 } });
    try {
      await post({ url: 'any.test.com' });
    } catch (err) {
      expect(err.response.status).toBe(401);
    }
  });
});

describe('.queryParams', () => {
  const queryParams = get('queryParams');

  test('empty params', () => {
    expect(() => queryParams()).toThrow();
  });

  test('responseTypes', () => {
    expect(queryParams({
      url: 'any.test.com',
      q: 'SHOW DATABASES',
      responseType: 'csv',
    }).headers.Accept).toEqual('application/csv');
    expect(queryParams({
      url: 'any.test.com',
      q: 'SHOW DATABASES',
      responseType: 'msgpack',
    }).headers.Accept).toEqual('application/x-msgpack');
  });

  test('minimal params', () => {
    expect(queryParams({
      url: 'any.test.com',
      q: 'SHOW DATABASES',
    })).toEqual({
      url: 'any.test.com',
      data: 'q=SHOW%20DATABASES',
      headers: { Accept: 'application/json' },
      method: 'POST',
    });
  });

  test('some params', () => {
    expect(queryParams({
      url: 'any.test.com',
      q: 'SHOW DATABASES',
      db: 'mydb',
    })).toEqual({
      url: 'any.test.com',
      data: 'q=SHOW%20DATABASES',
      headers: { Accept: 'application/json' },
      method: 'POST',
      params: { db: 'mydb' },
    });

    expect(queryParams({
      url: 'any.test.com',
      q: 'SHOW DATABASES',
      epoch: 'm',
    })).toEqual({
      url: 'any.test.com',
      data: 'q=SHOW%20DATABASES',
      headers: { Accept: 'application/json' },
      method: 'POST',
      params: { epoch: 'm' },
    });
  });

  test('all params', () => {
    expect(queryParams({
      url: 'any.test.com',
      q: 'SHOW DATABASES',
      u: 'username',
      p: 'password',
      db: 'mydb',
      epoch: 'ms',
    })).toEqual({
      auth: { password: 'password', username: 'username' },
      data: 'q=SHOW%20DATABASES',
      headers: { Accept: 'application/json' },
      method: 'POST',
      params: { db: 'mydb', epoch: 'ms' },
      url: 'any.test.com',
    });
  });
});

describe('.writeParams', () => {
  const writeParams = get('writeParams');

  test('empty params', () => {
    expect(() => writeParams()).toThrow();
  });

  test('minimal params', () => {
    expect(writeParams({
      url: 'any.test.com',
      db: 'mydb',
      data: 'meas_1 tag_1=1 field_1=123 123123123',
    })).toEqual({
      url: 'any.test.com',
      data: 'meas_1 tag_1=1 field_1=123 123123123',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      params: { db: 'mydb' },
    });
  });

  test('some params', () => {
    expect(writeParams({
      url: 'any.test.com',
      db: 'mydb',
      data: 'meas_1 tag_1=1 field_1=123 123123123',
      consistency: 'all',
    })).toEqual({
      url: 'any.test.com',
      data: 'meas_1 tag_1=1 field_1=123 123123123',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      params: { db: 'mydb', consistency: 'all' },
    });
  });

  test('all params', () => {
    expect(writeParams({
      url: 'any.test.com',
      u: 'username',
      p: 'password',
      db: 'mydb',
      data: 'meas_1 tag_1=1 field_1=123 123123123',
      precision: 'ns',
      consistency: 'one',
      rp: 'somerp',
    })).toEqual({
      auth: { password: 'password', username: 'username' },
      data: 'meas_1 tag_1=1 field_1=123 123123123',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      params: {
        db: 'mydb', precision: 'ns', consistency: 'one', rp: 'somerp',
      },
      url: 'any.test.com',
    });
  });
});
