app.factory('AutosuggestService', function ($q, $http, AlgoliaService) {

    var topicsAlgolia = function (query, indexName) {
        return AlgoliaService.search(query, indexName);
    };

    var usersAlgolia = function (query, indexName) {
        return AlgoliaService.search(query, indexName);
    };


    var topicsAndUsers = new Bloodhound({
        datumTokenizer: _.property('names'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: '%QUERY',
            rateLimitBy: "throttle",
            rateLimitWait: 0,
            transport: function (searchTerms, options, onSuccess, onError) {

                console.log('search-terms (topics and users):', searchTerms);

                $q.all([
                    //$http({method: 'GET', url: '/api/topics?q=' + url}),
                    //$http({method: 'GET', url: '/api/users?q=' + url}),
                    AlgoliaService.search('topics', searchTerms),
                    AlgoliaService.search('users', searchTerms)

                ]).then(function (resp) {

                    if (resp instanceof Array) {
                        console.log('resp:', resp);
                        var results = _.map(resp, function (item) {
                            return item.hits;
                        });
                        results = _.flatten(results).map(function (result) {
                            result.image = {};
                            result.image.small = (result.picture || {}).small;

                            switch (result.kind) {
                                case 'USER':
                                    result.handle = result.username;
                                    result.name = result.fullname;
                                    break;
                                case 'TOPIC':
                                    result.handle = result.hashtag;
                                    break;
                                default:
                                    console.error('no kind property match for algolia search result');
                            }
                            return result;
                        });
                        console.log('topics and users results:', results);
                        onSuccess(results); //note: you can see what kind of data is returned by Algolia by querying our own API
                    }
                    else {
                        console.error(resp);
                    }

                }).catch(onError);
            }
        }
    });

    topicsAndUsers.initialize();


    var topics = new Bloodhound({
        datumTokenizer: _.property('names'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: '%QUERY',
            rateLimitBy: "throttle",
            rateLimitWait: 0,
            transport: function (searchTerms, options, onSuccess, onError) {

                console.log('search-terms(topics):', searchTerms);

                $q.all([
                    //$http({method: 'GET', url: '/api/topics?q=' + url}),
                    AlgoliaService.search('topics', searchTerms)
                ]).then(function (resp) {

                    if (resp instanceof Array) {
                        console.log('resp:', resp);
                        var results = _.map(resp, function (item) {
                            return item.hits;
                        });
                        results = _.flatten(results).map(function (result) {
                            result.image = {};
                            result.image.small = (result.picture || {}).small;
                            result.handle = result.hashtag;
                            return result;
                        });
                        console.log('topics results:', results);
                        onSuccess(results); //note: you can see what kind of data is returned by Algolia by querying our own API
                    }
                    else {
                        console.error(resp);
                    }
                }).catch(onError);
            }
        }
    });

    topics.initialize();


    return {
        get: function (query, arg, cb) {

            if (arguments.length < 3) {
                arg = null;
                cb = arg;
            }

            var getter = arg === 'topics' ? topics : topicsAndUsers;
            getter.get(query, cb);
        },

        clearCache: function () {
            topics.clearRemoteCache();
            topicsAndUsers.clearRemoteCache();
        },

        getTopics: topics.get.bind(topics)
    };
});