// @flow
import axios from 'axios';
import qs from 'qs';

// eslint-disable-next-line
import type { QueryParams, WriteParams, UrlParams, Config, Response } from '.';

// Returns base post params
const postParams = (params: WriteParams | QueryParams) => {
  const result = {
    url: params.url,
    method: 'POST',
    auth: undefined,
  };

  if (params.u) {
  // use Basic Auth headers if username is provided
    result.auth = {
      username: params.u,
      password: params.p || '',
    };
  }

  return result;
};

// Returns params for Influx query request
const queryParams = (params: QueryParams): Config => {
  const headers = {
    Accept: 'application/json',
  };
  if (params.responseType && params.responseType === 'csv') {
    headers.Accept = 'application/csv';
  }
  if (params.responseType && params.responseType === 'msgpack') {
    headers.Accept = 'application/x-msgpack';
  }

  const result = {
    ...postParams(params),
    headers,
    data: qs.stringify({ q: params.q }),
    params: undefined,
  };

  // handle conditional params
  if (params.db && params.epoch) {
    result.params = { db: params.db, epoch: params.epoch };
  } else if (params.db) {
    result.params = { db: params.db };
  } else if (params.epoch) {
    result.params = { epoch: params.epoch };
  }

  return result;
};

// Returns params for Influx write request
const writeParams = (params: WriteParams): Config => {
  const result = {
    ...postParams(params),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', // required to send query in POST body
      Accept: 'application/json',
    },
    data: params.data,
    params: {
      db: params.db,
      precision: undefined,
      rp: undefined,
      consistency: undefined,
    },
  };

  // handle conditional params
  if (params.precision) {
    result.params.precision = params.precision;
  }
  if (params.rp) {
    result.params.rp = params.rp;
  }
  if (params.consistency) {
    result.params.consistency = params.consistency;
  }
  return result;
};

// Execute Influx request using POST
const post = (config: Config): Promise<Response> => (
  new Promise((resolve, reject) => axios(config)
    .then(result => resolve(result))
    .catch((error) => {
      if (typeof error.response === 'undefined') {
        // ensure some .response in case of
        // possibly preflight/CORS error (see: https://github.com/axios/axios/issues/838)
        // eslint-disable-next-line
        error.response = {
          status: 400,
          statusText: error.message,
          data: 'This might be a CORS error, network problem or invalid HTTPS redirect, invalid URL. Please check your connection configuration once more.',
        };
      }

      reject(error);
    }))
);

// Execute Influx query
export const query = (params: QueryParams): Promise<Response> => (
  post(queryParams({ ...params, url: `${params.url}/query` }))
);

// Write points to Influx
export const write = (params: WriteParams): Promise<Response> => (
  post(writeParams({ ...params, url: `${params.url}/write` }))
);

// Converts connection params to URL
export const buildUrl = ({ host, ssl = false, port = 8086 }: UrlParams): string => (
  `http${ssl ? 's' : ''}://${host}:${port}`
);
