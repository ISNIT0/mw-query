// tslint:disable-next-line:no-reference
///<reference path="./types.ts" />

import { buildQueryString, makeMwUrl, getJSON, normalizeResponse } from './util';
import deepmerge from 'deepmerge';

const defaultMwConfig: MWApi = {
    apiUrl: 'https://en.wikipedia.org/w/api.php',
    retryAttempts: 5,
    requestSize: 50,
};

export async function queryMw(_mwConfig: MWApi, opts: QueryOpts, articleIds: string[]): Promise<QueryMwRet> {
    if (!articleIds.length) {
        return {};
    }

    const mwConfig = Object.assign({}, defaultMwConfig, _mwConfig);

    const articleIdsBatch = articleIds.slice(0, mwConfig.requestSize);

    const mwUrl = makeMwUrl(mwConfig);
    const queryStr = buildQueryString(opts, articleIdsBatch);

    const queryUrl = `${mwUrl}${queryStr}`;

    // "continue" is a reserved word, using "_continue"
    let query: MwApiQueryResponse;
    let _continue;

    try {
        const resp = await getJSON<MwApiResponse>(queryUrl, mwConfig.retryAttempts);
        query = resp.query;
        _continue = resp.continue;
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

    let processedResponse = normalizeResponse(query);

    if (_continue) {
        const nextResp = await queryMw(
            _mwConfig,
            {
                ...opts,
                continue: _continue,
            },
            articleIds,
        );

        processedResponse = deepmerge(processedResponse, nextResp);
    }

    const nextResp = queryMw(
        mwConfig,
        opts,
        articleIds.slice(mwConfig.requestSize),
    );

    return deepmerge(processedResponse, nextResp);
}
