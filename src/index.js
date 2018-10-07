// @flow
import axios from 'axios';
import qs from 'qs';

import type { $AxiosXHRConfig } from 'axios';
// eslint-disable-next-line
import type { QueryParams, WriteParams, UrlParams, InfluxResponse, JSONResponse, ResponseType } from '.';

type PostParams = { url: string, method: string, auth?: { username: string, password: string } };

// Returns base post params
const postParams = (params: WriteParams | QueryParams<ResponseType>) => {
  const result: PostParams = {
    url: params.url,
    method: 'POST',
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
const queryParams = (params: QueryParams<ResponseType>) => {
  const headers = {
    Accept: 'application/json',
  };
  if (params.responseType && params.responseType === 'csv') {
    headers.Accept = 'application/csv';
  }
  if (params.responseType && params.responseType === 'msgpack') {
    headers.Accept = 'application/x-msgpack';
  }

  const result: $AxiosXHRConfig<string> = {
    ...postParams(params),
    headers,
    data: qs.stringify({ q: params.q }),
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
const writeParams = (params: WriteParams) => {
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
const post = async (config: $AxiosXHRConfig<string>) => {
  try {
    return await axios(config);
  } catch (error) {
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
    // rethrow after ensuring response property
    throw error;
  }
};

// Execute Influx query
export const query = (params: QueryParams<ResponseType>) => {
  const args = params;
  args.url += '/query';
  return post(queryParams(params));
};
// { ...params, url: `${params.url}/query` }))

// Write points to Influx
export const write = (params: WriteParams) => {
  const args = params;
  args.url += '/write';
  return post(writeParams(args));
};
// { ...params, url: `${params.url}/write` }))

// Converts connection params to URL
export const buildUrl = ({ host, ssl = false, port = 8086 }: UrlParams): string => (
  `http${ssl ? 's' : ''}://${host}:${port}`
);
