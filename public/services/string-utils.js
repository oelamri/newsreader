app.factory('StringUtilsService', function() {
    return {
        replaceOffsets: function(src, searchValue, newValue, obj) {
            var a, argLen, b, i, isFunction, newIndex, newLen, newValueFn, oldIndex, ret;
            a = b = oldIndex = newIndex = 0;
            argLen = 0;
            i = 1;
            if (isFunction = typeof newValue === 'function') {
                newValueFn = newValue;
            } else {
                newLen = newValue.length;
            }
            ret = src.replace(searchValue, function(match) {
                var equivLength, oldLen;
                if (isFunction) {
                    newLen = (newValue = newValueFn(match)).length;
                }
                if ((oldLen = match.length) === newLen) {
                    return newValue;
                }
                argLen || (argLen = arguments.length);
                oldIndex += (equivLength = arguments[argLen - 2] - oldIndex) + oldLen;
                newIndex += equivLength + newLen;
                if (!a) {
                    a = [0];
                    b = [0];
                }
                a[i] = oldIndex;
                b[i] = newIndex;
                ++i;
                return newValue;
            });
            if (i > 1) {
                a[i] = src.length;
                b[i] = ret.length;
                obj.push(a, b);
            }
            return ret;
        },

        getOffset: function(offset, obj, reverse) {
            var a, a0, a1, b, b0, b1, j, len, max, mid, min;
            if (!(len = obj.length)) {
                return offset;
            }
            j = reverse ? len - 2 : 0;
            while (true) {
                if (reverse) {
                    b = obj[j];
                    a = obj[j + 1];
                } else {
                    a = obj[j];
                    b = obj[j + 1];
                }
                if (!a) {
                    return offset;
                }
                min = 0;
                max = a.length - 1;
                mid = max;
                while (min < mid) {
                    if (offset >= a[mid]) {
                        min = mid;
                    } else {
                        max = mid;
                    }
                    mid = Math.floor(min + (max - min) / 2);
                }
                a1 = a0 = a[mid];
                b1 = b0 = b[mid];
                if (a0 === offset) {
                    offset = b0;
                } else {
                    if (mid !== max) {
                        a1 = a[mid + 1];
                        b1 = b[mid + 1];
                    }
                    offset = b0 + Math.min(offset - a0, b1 - b0);
                }
                j += reverse ? -2 : 2;
            }
        },
    };
});