app.controller('AutosuggestController', function($scope, AutosuggestService) {

    var autosuggest = $scope.autosuggest = $scope.autosuggest || {};

    _.defaults(autosuggest, {
        query: '',
        suggestions: [],
        activeSuggestion: null,
        defaultHighlight: true,
        collection: null
    });

    var lastQuery = '';

    autosuggest.autosuggest = function () {
        var query = autosuggest.query;
        if (query === lastQuery) { return; }
        lastQuery = query;

        autosuggest.activeSuggestion = autosuggest.defaultHighlight ? 0 : null;

        if (query.length === 0) {
            autosuggest.suggestions.splice(0);
            return;
        }

        AutosuggestService.get(query, autosuggest.collection, function (suggestions) {

            console.log('suggestions:',suggestions);

            if (query === autosuggest.query) {
                autosuggest.suggestions.splice(0);
                autosuggest.suggestions.push.apply(autosuggest.suggestions, suggestions);
                $scope.$apply();
            }
        });
    };


    autosuggest.clear = function () {
        autosuggest.suggestions.splice(0);
    };

    autosuggest.highlight = function (row) {
        autosuggest.activeSuggestion = row;
    };

    autosuggest.navigate = autosuggest.navigate || function (selected) {
        document.location.href = '/' + selected.handle;
    };

    autosuggest.choose = function (row) {
        var selected = autosuggest.suggestions[row];
        if (!selected) { return; }
        autosuggest.highlight(row);
        autosuggest.query = selected.name;
        autosuggest.navigate(selected);
    };

    autosuggest.nextSuggestion = function (dir) {
        var length = autosuggest.suggestions.length;

        if (length > 0) {
            if (autosuggest.activeSuggestion === null) {
                autosuggest.activeSuggestion = dir < 0 ? -1 : length;
            } else {
                autosuggest.activeSuggestion += dir || 1;
            }

            if (autosuggest.activeSuggestion < 0) {
                autosuggest.activeSuggestion = length - 1;
            } else if (autosuggest.activeSuggestion > length-1) {
                autosuggest.activeSuggestion = 0;
            }

            autosuggest.query = autosuggest.suggestions[autosuggest.activeSuggestion].name;
        } else {
            autosuggest.activeSuggestion = autosuggest.defaultHighlight ? 0 : null;
        }
    };

});
