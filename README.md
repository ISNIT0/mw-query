# MW-Query
![npm](https://img.shields.io/npm/v/mw-query.svg)
[![Build Status](https://travis-ci.org/ISNIT0/mw-query.svg?branch=master)](https://travis-ci.org/ISNIT0/mw-query)
[![codecov](https://codecov.io/gh/ISNIT0/mw-query/branch/master/graph/badge.svg)](https://codecov.io/gh/ISNIT0/mw-query)
[![CodeFactor](https://www.codefactor.io/repository/github/isnit0/mw-query/badge)](https://www.codefactor.io/repository/github/isnit0/mw-query)
![NPM License](https://img.shields.io/npm/l/mw-query.svg)

## Example
```typescript
import { queryMw } from 'mw-query';

queryMw(
    {
        apiUrl: 'https://en.wikipedia.org/w/api.php',
    }, {
        coordinates: {
            coprop: {
                type: true,
                dim: false,
            },
        },
        categories: {
            cllimit: 40,
        },
        redirects: {
            rdlimit: 'max',
        },
    }, ['London', 'Paris'],
).then((out) => {
    console.log('Got Data:', out);
});
```

## Building
```bash
> ./build.sh
```

## Testing
```bash
> npm t
```

## License
[MIT](./LICENSE)