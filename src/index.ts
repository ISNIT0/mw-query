// tslint:disable-next-line:no-reference
///<reference path="./types.ts" />

import { buildQueryString, getJSON, normalizeResponse } from './util';
import deepmerge from 'deepmerge';

const defaultMwConfig: MWApi = {
    apiUrl: 'https://en.wikipedia.org/w/api.php',
    retryAttempts: 5,
    requestSize: 50,
};

export async function queryMw(_mwConfig: MWApi, opts: QueryOpts, articleIds?: string[]): Promise<QueryMwRet> {
    if (articleIds && !articleIds.length) {
        return {};
    }

    const mwConfig = Object.assign({}, defaultMwConfig, _mwConfig);

    const articleIdsBatch = (articleIds || []).slice(0, mwConfig.requestSize);

    const queryStr = buildQueryString(opts, articleIdsBatch);

    const queryUrl = `${mwConfig.apiUrl.replace('?', '')}${queryStr}`;

    // "continue" is a reserved word, using "_continue"
    let resp: MwApiResponse;

    try {
        resp = await getJSON<MwApiResponse>(queryUrl, mwConfig.retryAttempts);
        if (resp.warnings) {
            console.warn(`The response contained warnings:`, resp.warnings);
        }
    } catch (err) {
        if (mwConfig.requestSize < 20) {
            throw err;
        } else {
            mwConfig.requestSize *= 0.9;
            return queryMw(
                mwConfig,
                opts,
                articleIds,
            );
        }
    }

    let processedResponse = normalizeResponse(resp.query);

    if (resp.continue) {
        const nextResp = await queryMw(
            _mwConfig,
            {
                ...opts,
                continue: resp.continue,
            },
            articleIds,
        );

        processedResponse = deepmerge(processedResponse, nextResp);
    }

    if (resp['query-continue']) {
        const nextResp = await queryMw(
            _mwConfig,
            {
                ...opts,
                _opts: Object.assign({}, opts._opts || {}, resp['query-continue'].allpages),
            },
            articleIds,
        );

        processedResponse = deepmerge(processedResponse, nextResp);
    }

    if (articleIds) {
        const nextResp = queryMw(
            mwConfig,
            opts,
            articleIds.slice(mwConfig.requestSize),
        );

        return deepmerge(processedResponse, nextResp);
    } else {
        return processedResponse;
    }
}
