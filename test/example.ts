import { queryMw } from 'src/index';

queryMw(
    {
        host: 'en.wikipedia.org',
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
    debugger;
});
