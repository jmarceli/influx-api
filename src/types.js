// @flow
type Consistency = 'any' | 'one' | 'quorum' | 'all';
type Precision = 'ns' | 'u' | 'ms' | 's' | 'm' | 'h';
type Chunked = true | number;

type InfluxParams = {|
  url: string,
  u?: string,
  p?: string,
|};

export type UrlParams = { host: string, ssl?: boolean, port?: number };

export type QueryParams = {
  ...InfluxParams,
  db?: string, // required for most SELECT and SHOW queries
  chunked?: Chunked,
  pretty?: boolean,
  q: string, // query without a query string makes no sense
  responseType?: 'json' | 'csv' | 'msgpack', // json is the default response type
  epoch?: Precision,
};

export type WriteParams = {
  ...InfluxParams,
  db: string, // required in case of write
  data: string, // Line Protocol compatible string
  precision?: Precision,
  consistency?: Consistency, // makes sense only with cluster
  rp?: string,
};

export type InfluxResponse = { data: { results: { series: { values: any[] }[] }[] } };
