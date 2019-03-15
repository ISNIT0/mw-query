import { queryMw } from 'src/index';

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
    debugger;
});
