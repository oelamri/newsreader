app.factory('AlgoliaService', function ($q, algolia, CONFIG) {


    var applicationId = CONFIG.ALGOLIA.APPLICATION_ID;
    var apiKey = CONFIG.ALGOLIA.API_KEY;

    //var client = algolia.Client('O1JG6K31FG', '32048f791371872f2f02dee69e2e30d6'); // TODO: just delete this line soon

    var client = algolia.Client(applicationId, apiKey);

    var indices = {
        users: client.initIndex('users'),
        topics: client.initIndex('topics')
    };

    return {

        search: function (indexName, searchTerms) {

            var index = indices[indexName];

            if (index) {
                return index.search(searchTerms); //note: returns a promise, deal with it
            }
            else {
                return $q.reject('No algolia index matched.');
            }
        }

    }

});