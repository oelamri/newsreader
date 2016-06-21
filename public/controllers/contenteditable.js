var KEY_TAB = 9;
var KEY_SHIFT = 16;
var KEY_UP = 38;
var KEY_DOWN = 40;
var KEY_ENTER = 13;

app.controller('ContenteditableController', function($scope, $element, $window, $document, StringUtilsService) {


    var contenteditable = $scope.contenteditable || {};
    contenteditable.data = contenteditable.data || [];
    var autosuggest = $scope.autosuggest || {};
    contenteditable.completing = null;

    contenteditable.completeWithTag = function (selected) {
        if (contenteditable.completing) {
            if (selected) {
                var handle = selected.handle || selected.hashtag;

                contenteditable.data.push(_.defaults({type: 'tag', text: '#' + handle},selected));
                var text = $element.text();
                fixData(text.substr(0, contenteditable.completing.start) + '#' + handle + text.substr(contenteditable.completing.end));
                fixDom(contenteditable.data);
                $.selection($element.textOffsetToPos(contenteditable.completing.start + handle.length + 1));
                contenteditable.completing = null;
            } else {
                $.selection($element.textOffsetToPos(contenteditable.completing.offset));
            }
        }
    };

    autosuggest.navigate = function (selected) {
        if (!contenteditable.completing) { return; }
        contenteditable.completeWithTag(selected);
        autosuggest.clear();
    };

    /**
     * updates the internal data structure given a text value
     */
    function fixData(text) {
        var tags = {};

        (contenteditable.data || []).forEach(function (obj) {
            if (obj.type === 'tag') {
                tags[obj.text] = obj;
            }
        });

        contenteditable.data = text.split(/(#[A-Za-z0-9_]{1,15})/g).map(function (part) {
            return tags[part] || {
                type: 'text',
                text: part,
            };
        });
    }

    function fixDom(data) {
        // TODO: do a legitimate update instead of re-creating the dom every time
        $element.html('');
        var element = $element[0];
        contenteditable.data.forEach(function (obj) {
            if (obj.type === 'text') {
                element.appendChild($.textNode(obj.text));
            } else {
                var span = document.createElement('span');
                span.className = obj.type;
                span.appendChild($.textNode(obj.text));
                element.appendChild(span);
            }
        });
    }

    $element.on('keydown', function ($event) {
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
            case KEY_ENTER:
                autosuggest.choose(autosuggest.activeSuggestion);
                $event.preventDefault();
                return;
        }

        if (dir !== 0 && autosuggest) {
            autosuggest.nextSuggestion(dir);
            $scope.$apply();
            $event.preventDefault();
        }
    });

    $element.bind('keyup mouseup input', function ($event) {
        var selection = $.selection();
        if (!selection || !$element.contains(selection.start)) { return; }
        contenteditable.completing = null;

        if (KEY_ENTER === $event.which) {
            $scope.$apply();
            return;
        }

        var text = $element.text();
        var offset = $element.textOffset(selection.start); 

        if (contenteditable.html !== $element.html()) {
            var offsetShifts = [];
            text = StringUtilsService.replaceOffsets(text, /[\t\n\r]+/g, '', offsetShifts);
            offset = StringUtilsService.getOffset(offset, offsetShifts);

            contenteditable.text = text;
            fixData(text);
            fixDom(contenteditable.data || []);
            $.selection($element.textOffsetToPos(offset));
            // $element.keepSelection(selection, function () { fixDom(contenteditable.data || []); });
        }

        if (autosuggest) {
            var startTag = text.substr(0,offset).lastIndexOf('#');
            var endTag = text.substr(offset).search(/\s|$/);
            endTag = endTag < 0 ? offset : offset + endTag;

            if (startTag === -1 || endTag - startTag < 2 ||
                /\s/.test(text.charAt(endTag-1)||'') // if there's whitespace immediately preceding the end offset, don't complete
            ) {
                autosuggest.clear();
            } else {
                contenteditable.completing = {
                    start: startTag,
                    end: endTag,
                    offset: offset,
                };
                autosuggest.query = text.substring(startTag+1, endTag);
                autosuggest.autosuggest();
            }
        }

        contenteditable.html = $element.html();

        $scope.$apply();

    });

});