var KEY_TAB = 9;
var KEY_SHIFT = 16;
var KEY_UP = 38;
var KEY_DOWN = 40;
var KEY_ENTER = 13;

app.controller('SearchboxController', function($scope, $element) {

    var autosuggest = $scope.autosuggest = {};

    $scope.blur = function () {
        if (event.relatedTarget && event.relatedTarget.id === 'searchbox-autosuggest-holder') { return; }
        autosuggest.clear();
    };

    $scope.handleKeyDown = function ($event) {
        var dir = 0;

        switch ($event.which) {
            case KEY_TAB:
                dir = $event.shiftKey ? -1 : 1;
                break;
            case KEY_UP:
                dir = -1;
                break;
            case KEY_DOWN:
                dir = 1;
                break;
        }

        if (dir !== 0) {
            autosuggest.nextSuggestion(dir);
            $event.preventDefault();
        }
    };

    $scope.handleKeyUp = function ($event) {
        if ([KEY_TAB,KEY_SHIFT,KEY_UP,KEY_DOWN,KEY_ENTER].indexOf($event.which) === -1) {
            autosuggest.autosuggest();
        }

        if (KEY_ENTER === $event.which) {
            autosuggest.choose(autosuggest.activeSuggestion);
        }
    };

});
