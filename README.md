Influx API
===

[![Build Status](https://travis-ci.org/jmarceli/influx-api.svg?branch=master)](https://travis-ci.org/jmarceli/influx-api) [![dependencies Status](https://david-dm.org/jmarceli/influx-api/status.svg)](https://david-dm.org/jmarceli/influx-api) [![devDependencies Status](https://david-dm.org/jmarceli/influx-api/dev-status.svg)](https://david-dm.org/jmarceli/influx-api?type=dev) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Thin wrapper around [Axios HTTP client](https://github.com/axios/axios) which works with [InfluxDB HTTP API](https://docs.influxdata.com/influxdb/v1.6/tools/api/).

# Installation

```js
yarn add influx-api
```

or

```js
npm install --save influx-api
```

# Examples

## Simple

### Query

Probably simplest possible query which will return database names in JSON format.

```js
import { query } from 'influx-api';

const result = await query({
  url: 'https://yourinflux.test:8086',
  q: 'SHOW DATABASES',
});

console.log(result);
```

### Write

Writing **field** (`field_1`) value to selected **measurement** (`measurement_1`).

```js
import { write } from 'influx-api';

const result = await write({
  url: 'https://yourinflux.test:8086',
  data: 'measurement_1 field_1=123',
});

console.log(result); // empty string on success
```

## (A little) more complex

### Query

Execute on **db** (`influx_db`) using selected **u** (`username`) and **p** (`password`) with given **precision** (`ms`) expecting **responseType** (`csv` string) as a result.

```js
import { query } from 'influx-api';

const result = await query({
  url: 'https://yourinflux.test:8086',
  q: 'SHOW MEASUREMENTS',
  u: 'username',
  p: 'password',
  db: 'influx_db',
  precision: 'ms',
  responseType: 'csv',
});

console.log(result);
```

### Write

Writing some **tag**s and **field**s to a **measurement**s (`measurement_1`, `measurement_2`) with selected timestamp `1532041200123`.

```js
import { write } from 'influx-api';

const result = await write({
  url: 'https://yourinflux.test:8086',
  // NOTE: use of `...` instead of '...' to preserve new lines! (which are important for Line Protocol)
  data: `measurement_1 tag_1=123 field_1=11,field_2=12,field_3=123 1532041200123
measurement_2 tag_1=123 field_1=1,field_2=2,field_3=3 1532041200123`
});

console.log(result); // empty string on success
```

# API

## query(params)

**params** - object with following properties, see official [Influx HTTP API query endpoint](https://docs.influxdata.com/influxdb/v1.6/tools/api/#query-string-parameters-1)

- **url** (string) - (required) Influx URL
- **q** (string) - (required) Query to execute
- **db** (string) - (required for most `SELECT` and `SHOW` queries) Influx database name
- **u** (string) - Influx username
- **p** (string) - Influx password
- **epoch** (string) - Time precision in query response, available values are: (default) `ns`, `u`, `ms`, `s`, `m`, `h`
- **responseType** (string) - Response data type, available values are: (default) `json`, `csv`, `msgpack`

## write(params)

**params** - object with following properties, see official [Influx HTTP API write endpoint](https://docs.influxdata.com/influxdb/v1.6/tools/api/#query-string-parameters-2)

- **url** (string) - (required) Influx URL
- **db** (string) - (required) Influx database name for measurements
- **data** (string) - [InfluxDB Line Protocol](https://docs.influxdata.com/influxdb/v1.6/write_protocols/line_protocol_reference/) compatible string
- **u** (string) - Influx username
- **p** (string) - Influx password
- **rp** (string) - Retention Policy name
- **precision** (string) - Time precision for time provided in data, available values: (default) `ns`, `u`, `ms`, `s`, `m`, `h`
- **consistency** (string) - Used in InfluxDB Enterprise to ensure write consistency, available values: (default) `one`, `any`, `quorum`, `all`

# Features

- Uses Basic Authentication headers - never sends authentication credentials as query parameters
- Allows to select prefered responseType - default is JSON but you may also select CSV or [MSGPACK](https://msgpack.org/index.html) if you want
- Supports all Influx Data Types - use [Influx Line Protocol format](https://docs.influxdata.com/influxdb/v1.6/write_protocols/line_protocol_reference/) types for writing data e.g. (`123i` for Integer)
- Follows Influx HTTP API conventions - it uses same parameters notation as official Influx HTTP API and allows you to write points directly in Line Protocol format
- Stateless - like Influx HTTP API itself, there is no need to create any kind of client object
- Ease of use - correct me if I'm wrong :)

# WHY?

Most features listed in [Features](#features) section are unavailable in the most popular [node-influx](https://github.com/node-influx/node-influx) package.

# FAQ

**Does it have a stable API?**

I don't have any plans for changing the API but don't consider it stable until version **1.x.x**.

**Why arguments has such strage names: u, p etc.?**

I want to make it as close as possible to original Influx HTTP API documented on https://docs.influxdata.com/influxdb/v1.6/tools/api/.

# License

[MIT](./LICENSE)

# Author

Jan Grzegorowski
