import test from 'blue-tape';

import { buildQueryString } from 'src/util';

// Super Simple Sanity tests
test(async (t) => {
    t.equal(buildQueryString({}, ['London']), '?action=query&format=json&prop=&titles=London', 'Very simple query works');

    t.equal(buildQueryString({}, ['London', 'Paris']), '?action=query&format=json&prop=&titles=London%7CParis', 'Multiple Titles Works');

    t.equal(buildQueryString({
        categories: {},
    }, ['London', 'Paris']), '?action=query&format=json&prop=categories&titles=London%7CParis', 'Single Prop Works');

    t.equal(buildQueryString({
        categories: {},
        redirects: {},
    }, ['London', 'Paris']), '?action=query&format=json&prop=categories%7Credirects&titles=London%7CParis', 'Multiple Props Work');

    t.equal(buildQueryString({
        categories: {
            cllimit: 40,
        },
        redirects: {
            rdlimit: 'max',
        },
    }, ['London', 'Paris']), '?action=query&format=json&prop=categories%7Credirects&cllimit=40&rdlimit=max&titles=London%7CParis', 'Module Options Work');

    t.equal(buildQueryString({
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
    }, ['London', 'Paris']), '?action=query&format=json&prop=coordinates%7Ccategories%7Credirects&coprop=type&cllimit=40&rdlimit=max&titles=London%7CParis', 'Complex Object Option Works');
});
