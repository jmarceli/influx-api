// @flow
import axios from 'axios';
import qs from 'qs';

import type { AxiosXHRConfig } from 'axios';
import type {
  QueryParams, WriteParams, InfluxResponse, UrlParams,
} from './types';

// Returns base post params
const postParams = (params: WriteParams | QueryParams) => ({
  url: params.url,
  method: 'POST',
  // use Basic Auth headers if username is provided
  auth: params.u ? {
    username: params.u,
    password: params.p || '',
  } : undefined,
});

// Returns params for Influx query request
const queryParams = (params: QueryParams): AxiosXHRConfig<string> => {
  const headers = {
    Accept: 'application/json',
  };
  if (params.responseType && params.responseType === 'csv') {
    headers.Accept = 'application/csv';
  }
  if (params.responseType && params.responseType === 'msgpack') {
    headers.Accept = 'application/x-msgpack';
  }
  return {
    ...postParams(params),
    headers,
    data: qs.stringify({ q: params.q }),
    // use db, precision params if provided
    params: {
      db: params.db ? params.db : undefined,
      epoch: params.epoch ? params.epoch : 'ns', // 'ns' by default
    },
  };
};

// Returns params for Influx write request
const writeParams = (params: WriteParams): AxiosXHRConfig<string> => ({
  ...postParams(params),
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded', // required to send query in POST body
    Accept: 'application/json',
  },
  data: params.data,
  // use precision param if provided
  params: {
    db: params.db,
    precision: params.precision ? params.precision : 'ns', // 'ns' by default
    rp: params.rp ? params.rp : undefined,
    consistency: params.consistency ? params.consistency : undefined,
  },
});

// Execute Influx request using POST
const post = async (config: AxiosXHRConfig<string>): Promise<InfluxResponse> => {
  try {
    // $FlowFixMe
    return await axios(config);
  } catch (error) {
    if (typeof error.response === 'undefined') {
      // ensure some .response in case of
      // possibly preflight/CORS error (see: https://github.com/axios/axios/issues/838)
      error.response = {
        status: 400,
        statusText: error.message,
        data: 'This might be a CORS error, network problem or invalid HTTPS redirect, invalid URL. Please check your connection configuration once more.',
      };
    }

    throw error;
  }
};

// Execute Influx query
export const query = async (params: QueryParams): Promise<InfluxResponse> => (
  post(queryParams({ ...params, url: `${params.url}/query` }))
);

// Write points to Influx
export const write = async (params: WriteParams): Promise<InfluxResponse> => (
  post(writeParams({ ...params, url: `${params.url}/write` }))
);

// Converts connection params to URL
export const buildUrl = ({ host, ssl = false, port = 8086 }: UrlParams): string => (
  `http${ssl ? 's' : ''}://${host}:${port}`
);
