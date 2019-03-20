declare module 'backoff';

interface MWApi {
    apiUrl: string;
    retryAttempts?: number;
    requestSize?: number;
}

interface QueryCategories {
    clprop?: {
        sortkey?: true,
        timestamp?: true,
        hidden?: true,
    };
    clshow?: {
        hidden: true,
        '!hidden': true,
    };
    cllimit?: number | 'max';
}

interface QueryRevisions {
    rvlimit?: number | 'max';
}

interface QueryCoordinates {
    colimit?: number | 'max';
    coprop?: {
        type?: boolean,
        name?: boolean,
        dim?: boolean,
        country?: boolean,
        region?: boolean,
        globe?: boolean,
    };
    coprimary?: 'primary' | 'secondary' | 'all';
}

interface QueryRedirects {
    rdlimit?: number | 'max';
}

interface QueryPageImages {
    pilimit?: number | 'max';
}

interface QueryOpts {
    _opts?: {
        [key: string]: string;
        generator?: GeneratorOpts;
    };
    continue?: {
        [key: string]: string;
    };
    categories?: QueryCategories;
    revisions?: QueryRevisions;
    coordinates?: QueryCoordinates;
    redirects?: QueryRedirects;
    pageimages?: QueryPageImages;
}

interface Page {
    pageid: number;
    ns: number;
    title: string;
}

type QueryCategoriesRet = Page[];

type QueryRevisionsRet = Array<{
    revid: number,
    parentid: number,
    minor: string,
    user: string,
    timestamp: string,
    comment: string,
}>;

type QueryCoordinatesRet = Array<{
    lat: number,
    lon: number,
    primary: string,
    globe: string,
}>;

type QueryRedirectsRet = Page[];

interface QueryRet {
    categories?: QueryCategoriesRet;
    revisions?: QueryRevisionsRet;
    coordinates?: QueryCoordinatesRet;
    redirects?: QueryRedirectsRet;

    thumbnail?: {
        source: string
        width: number
        height: number,
    };

    pageimage?: string;
}

interface MwApiQueryResponse {
    normalized?: Array<{ from: string, to: string }>;
    pages: {
        [pageId: string]: Page & QueryRet,
    };
}

interface MwApiResponse {
    batchcomplete: string;
    query: MwApiQueryResponse;
    continue?: {
        [key: string]: string;
    };
    'query-continue'?: {
        allpages: {
            [key: string]: string;
        },
        pageimages: {
            picontinue: string;
        },
    };
    warnings?: {
        [key: string]: {
            [key: string]: string;
        },
    };
}

interface QueryMwRet {
    [articleId: string]: Page & QueryRet;
}

type QueryTarget = { articleIds: string[] } | { namespaces: string[] };

type GeneratorOpts =
    'allcategories' |
    'alldeletedrevisions' |
    'allfileusages' |
    'allimages' |
    'alllinks' |
    'allpages' |
    'allredirects' |
    'allrevisions' |
    'alltransclusions' |
    'backlinks' |
    'categories' |
    'categorymembers' |
    'contenttranslation' |
    'contenttranslationsuggestions' |
    'deletedrevisions' |
    'duplicatefiles' |
    'embeddedin' |
    'exturlusage' |
    'fileusage' |
    'geosearch' |
    'gettingstartedgetpages' |
    'images' |
    'imageusage' |
    'iwbacklinks' |
    'langbacklinks' |
    'links' |
    'linkshere' |
    'mostviewed' |
    'pageswithprop' |
    'prefixsearch' |
    'projectpages' |
    'protectedtitles' |
    'querypage' |
    'random' |
    'readinglistentries' |
    'recentchanges' |
    'redirects' |
    'revisions' |
    'search' |
    'templates' |
    'transcludedin' |
    'watchlist' |
    'watchlistraw' |
    'wblistentityusage' |
    'oldreviewedpages';
