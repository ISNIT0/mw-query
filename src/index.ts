// tslint:disable-next-line:no-reference
///<reference path="./types.ts" />

import { buildQueryString, getJSON, normalizeResponse } from './util';
import deepmerge from 'deepmerge';

const defaultMwConfig: MWApi = {
    apiUrl: 'https://en.wikipedia.org/w/api.php',
    retryAttempts: 5,
    requestSize: 50,
};

export async function queryMw(_mwConfig: MWApi, opts: QueryOpts, articleIds?: string[], handleBatch?: (ret: QueryMwRet) => Promise<void>): Promise<QueryMwRet> {
    if (articleIds && !articleIds.length) {
        return {};
    }

    const mwConfig = Object.assign({}, defaultMwConfig, _mwConfig);

    const articleIdsBatch = (articleIds || []).slice(0, mwConfig.requestSize);

    const queryStr = buildQueryString(opts, articleIdsBatch);

    const queryUrl = `${mwConfig.apiUrl.replace('?', '')}${queryStr}`;

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
                handleBatch,
            );
        }
    }

    let processedResponse = normalizeResponse(resp.query || { normalized: [], pages: {} });

    if (handleBatch) {
        await handleBatch(processedResponse);
    }

    if (resp['query-continue']) {

        const cont: any = {
            picontinue: undefined,
        };

        if (resp['query-continue'].pageimages) {
            cont.picontinue = resp['query-continue'].pageimages.picontinue;
        } else {
            cont.gapcontinue = resp['query-continue'].allpages.gapcontinue;
        }

        const _optsObj = Object.entries(
            Object.assign(
                {},
                opts._opts || {},
                cont,
            ),
        )
            .reduce((acc: any, [key, value]) => {
                if (value) {
                    acc[key] = value;
                }
                return acc;
            }, {});

        const nextResp = await queryMw(
            _mwConfig,
            {
                ...opts,
                _opts: _optsObj,
            },
            articleIds,
            handleBatch,
        );

        if (handleBatch) {
            return nextResp;
        } else {
            processedResponse = deepmerge(processedResponse, nextResp);
        }
    } else if (resp.continue) {

        const cont = opts.continue || {};
        const propContinues = Object.keys(resp.continue).filter((a) => a !== 'continue');

        if (propContinues.length) {
            delete resp.continue.continue;
            Object.assign(cont, resp.continue || {});
        } else {
            opts.continue = resp.continue;
        }

        const nextResp = await queryMw(
            _mwConfig,
            {
                ...opts,
                continue: cont,
            },
            articleIds,
            handleBatch,
        );

        if (handleBatch) {
            return nextResp;
        } else {
            processedResponse = deepmerge(processedResponse, nextResp);
        }
    }

    if (articleIds) {
        const nextResp = await queryMw(
            mwConfig,
            opts,
            articleIds.slice(mwConfig.requestSize),
            handleBatch,
        );

        if (handleBatch) {
            return nextResp;
        } else {
            return deepmerge(processedResponse, nextResp);
        }
    } else {
        return processedResponse;
    }
}
