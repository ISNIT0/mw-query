import * as backoff from 'backoff';
import axios from 'axios';

export function buildQueryString(opts: QueryOpts, articleIds: string[]) {
    const modules = Object.entries(opts)
        .reduce((acc: any, [module, moduleOpts]) => {
            const optsStr = Object.entries(moduleOpts)
                .reduce((query: string[], [optKey, optValue]) => {
                    if (typeof optValue === 'object') {
                        if (Array.isArray(optValue)) {
                            return query.concat(`${optKey}=${encodeURIComponent(optValue.join('|'))}`);
                        } else {
                            const str = Object.entries(optValue)
                                .map(([key, val]) => {
                                    if (val) {
                                        return key;
                                    }
                                })
                                .filter((a) => a)
                                .join('|');
                            return query.concat(`${optKey}=${encodeURIComponent(str)}`);
                        }
                    } else {
                        return query.concat(`${optKey}=${encodeURIComponent(optValue as string)}`);
                    }
                }, [])
                .join('&');

            acc[module] = optsStr;
            return acc;
        }, {});
    const modulesStr = Object.keys(modules).filter((a) => a !== 'continue' && a !== '_opts').join('|');
    const modulesOptsStr = Object.values(modules).filter((a) => a).join('&');
    return `?action=query&format=json&prop=${encodeURIComponent(modulesStr)}${modulesOptsStr ? `&${modulesOptsStr}` : ''}${articleIds.length ? `&titles=${encodeURIComponent(articleIds.join('|'))}` : ''}`;
}

export function getJSON<T>(url: string, retryAttempts: number) {
    console.info(`Getting JSON from [${url}]`);
    return new Promise<T>((resolve, reject) => {
        const call = backoff.call(getJSONCb, url, (err: any, val: any) => {
            if (err) {
                console.warn(`Failed to get [${url}] [${call.getNumRetries()}] times`);
                reject(err);
            } else {
                resolve(val);
            }
        });
        call.setStrategy(new backoff.ExponentialStrategy());
        call.failAfter(retryAttempts);
        call.start();
    });
}

function getJSONCb<T>(url: string, handler: any) {
    return axios.get<T>(url, { responseType: 'json' }).then((a) => handler(null, a.data), handler);
}

export function normalizeResponse(response: MwApiQueryResponse): QueryMwRet {
    const { normalized: _normalized, pages } = response;

    const normalized = (_normalized || []).reduce((acc: any, { from, to }) => {
        acc[to] = from;
        return acc;
    }, {});

    return Object.values(pages)
        .reduce((acc, page) => {
            const articleId = normalized[page.title] || page.title;
            return {
                ...acc,
                [articleId]: page,
            };
        }, {});
}
