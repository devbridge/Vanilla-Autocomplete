(function(root) {
    'use strict';

    var keys = {
        ESC: 27,
        TAB: 9,
        RETURN: 13,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40
    };

    var utils = {};

    utils.ajax = function (settings, done, error) {
        var xhr = new XMLHttpRequest();
        var headers = settings.headers || {};
        var method = settings.method || settings.type || 'GET';
        var requestedWith = 'X-Requested-With';
        var url = method === 'GET'
            ? settings.url + '?' + utils.param(settings.data)
            : settings.url;

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    done(xhr.responseText);
                } else {
                    error(xhr);
                }
            }
        };

        if (!settings.crossDomain && !headers[requestedWith]){
            headers[requestedWith] = "XMLHttpRequest";
        }

        xhr.open(method, url, true);

        for (var header in headers) {
            if (headers.hasOwnProperty(header)){
                xhr.setRequestHeader(header, headers[header]);
            }
        }

        xhr.send(null);

        return xhr;
    };

    utils.ajaxAbort = function (xhr) {
        if (xhr && xhr.abort) {
            xhr.abort();
        }
    };

    utils.param = function (obj) {
        var params = [];
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)){
                params.push(encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop]));
            }
        }
        return params.join('&').replace(/%20/g, '+');
    };

    utils.escapeRegExChars = function (value) {
        return value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };

    utils.createNode = function (containerClass) {
        var div = document.createElement('div');
        div.className = containerClass;
        div.style.position = 'absolute';
        div.style.display = 'none';
        return div;
    };

    utils.hasClass = function (domElement, className) {
        var classes = (domElement.className || '').split(' ');
        return utils.inArray(className, classes) > -1;
    };

    utils.getData = function (domElement, dataName) {
        return domElement.dataset ? domElement.dataset[dataName] : domElement.getAttribute("data-" + dataName);
    };

    utils.matchElement = function (event, className, context) {
        var el = event.target;

        while (el){
            if (utils.hasClass(el, className)) {
                return el;
            }

            el = el.parentNode;

            if (!el || el === context){
                return null;
            }
        }
    };

    utils.extend = function (target){
        var len = arguments.length,
            i;

        function extendInternal(destination, source) {
            var key;
            for (key in source) {
                if (source.hasOwnProperty(key)) {
                    var value = source[key];
                    if (destination.hasOwnProperty(key) && typeof destination[key] === "object" && utils.isPlainObject(value) && !utils.isArray(value)) {
                        extendInternal(destination[key], value);
                    } else {
                        destination[key] = value;
                    }
                }
            }

            return destination;
        }

        for (i = 1; i < len; i++){
            target = extendInternal(target, arguments[i]);
        }

        return target;
    };

    utils.isArray = function (value) {
        return Array.isArray ? Array.isArray(value) : Object.prototype.toString.call(value) === '[object Array]';
    };

    utils.inArray = function (value, array) {
        var index = -1,
            len = array.length,
            i;

        for (i = 0; i < len; i++) {
            if (value === array[i]) {
                index = i;
                break;
            }
        }

        return index;
    };

    utils.toCamelCase = function (input) {
        return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
            return group1.toUpperCase();
        });
    };

    utils.css = function (element, cssObj){
        if (typeof cssObj === 'string'){
            return window.getComputedStyle(element).getPropertyValue(cssObj);
        }
        var style = element.style,
            key;
        for(key in cssObj){
            if (cssObj.hasOwnProperty(key)){
                var prop = utils.toCamelCase(key);
                var value = cssObj[key];
                if (typeof value === 'number' && utils.inArray(prop, ['width', 'height', 'top', 'left', 'right', 'bottom']) > -1){
                    value += 'px';
                }
                style[prop] = value;
            }
        }
    };

    utils.isPlainObject = function (value) {
        return Object.prototype.toString.call(value) === "[object Object]";
    };

    utils.isFunction = function (value) {
        return typeof value === 'function';
    };

    utils.noop = function () { return; };

    utils.each = function (collection, callback) {
        var len = collection.length;
        for (var i = 0; i < len; i++) {
            callback(collection[i], i);
        }
    };

    utils.removeClass = function (element, className) {
        var classes = element.className.split(' ');
        var list = [];

        utils.each(classes, function (name) {
            if (className !== name) {
                list.push(name);
            }
        });

        element.className = list.join(' ');
    };

    utils.addClass = function (element, className) {
        element.className = element.className + ' ' + className;
    };

    utils.show = function (element) {
        element.style.display = 'block';
    };

    utils.hide = function (element) {
        element.style.display = 'none';
    };

    utils.on = function (element, event, callback) {
        element.addEventListener(event, callback, false);
    };

    function VanillaAutocomplete(el, options) {
        var noop = function () { },
            that = this,
            defaults = {
                ajaxSettings: {},
                autoSelectFirst: false,
                appendTo: document.body,
                serviceUrl: null,
                lookup: null,
                onSelect: null,
                width: 'auto',
                minChars: 1,
                maxHeight: 300,
                deferRequestBy: 0,
                params: {},
                formatResult: VanillaAutocomplete.formatResult,
                delimiter: null,
                zIndex: 9999,
                type: 'GET',
                noCache: false,
                onSearchStart: noop,
                onSearchComplete: noop,
                onSearchError: noop,
                containerClass: 'autocomplete-suggestions',
                tabDisabled: false,
                dataType: 'text',
                currentRequest: null,
                triggerSelectOnValidInput: false,
                preventBadQueries: true,
                lookupFilter: function (suggestion, originalQuery, queryLowerCase) {
                    return suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1;
                },
                paramName: 'query',
                transformResult: function (response) {
                    return typeof response === 'string' ? JSON.parse(response) : response;
                },
                forceFixPosition: false,
                formatGroup: function (value) {
                    return '<div class="autocomplete-group"><strong>' + value + '</strong></div>';
                }
            };

        // Shared variables:
        that.element = el;
        that.suggestions = [];
        that.badQueries = [];
        that.selectedIndex = -1;
        that.currentValue = that.element.value;
        that.intervalId = 0;
        that.cachedResponse = {};
        that.onChangeInterval = null;
        that.onChange = null;
        that.isLocal = false;
        that.suggestionsContainer = null;
        that.options = utils.extend({}, defaults, options);
        that.classes = {
            selected: 'autocomplete-selected',
            suggestion: 'autocomplete-suggestion'
        };
        that.hint = null;
        that.hintValue = '';
        that.selection = null;
        that.visible = false;

        // Initialize and set options:
        that.initialize();
        that.setOptions(options);
    }

    VanillaAutocomplete.utils = utils;

    VanillaAutocomplete.formatResult = function (suggestion, currentValue) {
        var pattern = '(' + utils.escapeRegExChars(currentValue) + ')';

        return suggestion.value.replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>');
    };

    VanillaAutocomplete.prototype = {

        initialize: function () {
            var that = this,
                selected = that.classes.selected,
                options = that.options,
                element = that.element,
                container;

            // Remove autocomplete attribute to prevent native suggestions:
            element.setAttribute('autocomplete', 'off');

            that.killerFn = function () {
                that.killSuggestions();
                that.disableKillerFn();
            };

            that.suggestionsContainer = utils.createNode(options.containerClass);

            container = that.suggestionsContainer;

            options.appendTo.appendChild(container);

            // Only set width if it was provided:
            if (options.width !== 'auto') {
                utils.css(that.suggestionsContainer, { width: options.width });
            }


            // Listen for mouse over event on suggestions list:
            utils.on(container, 'mouseover', function (event) {
                var el = utils.matchElement(event, that.classes.suggestion, container);

                if (el) {
                    that.activate(utils.getData(el, 'index'));
                }
            });

            // Deselect active element when mouse leaves suggestions container:
            utils.on(container, 'mouseout', function () {
                that.selectedIndex = -1;
                var elements = container.getElementsByClassName(selected);

                utils.each(elements, function (el) {
                    utils.removeClass(el, selected);
                });
            });

            utils.on(container, 'click', function (event) {
                var el = utils.matchElement(event, that.classes.suggestion, container);

                if (el){
                    that.select(utils.getData(el, 'index'));
                    event.stopPropagation();
                }
            });

            that.fixPositionCapture = function () {
                if (that.visible) {
                    that.fixPosition();
                }
            };

            utils.on(window, 'resize', that.fixPositionCapture);

            function bind(fn) {
                return function (e) {
                    fn.call(that, e);
                }
            }

            utils.on(element, 'keydown', bind(that.onKeyDown));
            utils.on(element, 'keyup', bind(that.onKeyUp));
            utils.on(element, 'change', bind(that.onKeyUp));
            utils.on(element, 'blur', bind(that.onBlur));
            utils.on(element, 'focus', bind(that.onFocus));
        },

        onFocus: function () {
            var that = this;
            if (that.options.minChars <= that.element.value.length) {
                that.onValueChange();
            }
            that.fixPosition();
        },

        onBlur: function () {
            this.enableKillerFn();
        },

        setOptions: function (suppliedOptions) {
            var that = this,
                options = that.options;

            utils.extend(options, suppliedOptions);

            that.isLocal = utils.isArray(options.lookup);

            if (that.isLocal) {
                options.lookup = that.verifySuggestionsFormat(options.lookup);
            }

            // Adjust height, width and z-index:
            utils.css(that.suggestionsContainer, {
                'max-height': options.maxHeight + 'px',
                'width': options.width + 'px',
                'z-index': options.zIndex
            });
        },

        clearCache: function () {
            this.cachedResponse = {};
            this.badQueries = [];
        },

        clear: function () {
            this.clearCache();
            this.currentValue = '';
            this.suggestions = [];
        },

        disable: function () {
            var that = this;
            that.disabled = true;
            clearInterval(that.onChangeInterval);
            if (that.currentRequest) {
                utils.ajaxAbort(that.currentRequest);
                that.currentRequest = null;
            }
        },

        enable: function () {
            this.disabled = false;
        },

        fixPosition: function () {
            var that = this,
                container = that.suggestionsContainer,
                containerParent = container.parentNode;

            // Fix position only when appended to body.
            if (containerParent !== document.body) {
                return;
            }

            var height = that.element.offsetHeight,
                offset = {
                    top: that.element.offsetTop,
                    left: that.element.offsetLeft
                },
                styles = {
                    top: offset.top + height,
                    left: offset.left
                };

            // -2px to account for suggestions border.
            if (that.options.width === 'auto') {
                styles.width = (that.element.offsetWidth - 2) + 'px';
            }

            utils.css(container, styles);
        },

        enableKillerFn: function () {
            var that = this;
    //            $(document).on('click.autocomplete', that.killerFn);
            document.addEventListener('click', that.killerFn);
        },

        disableKillerFn: function () {
            var that = this;
    //            $(document).off('click.autocomplete', that.killerFn);
            document.removeEventListener('click', that.killerFn);
        },

        killSuggestions: function () {
            var that = this;
            that.stopKillSuggestions();
            that.intervalId = window.setInterval(function () {
                that.hide();
                that.stopKillSuggestions();
            }, 50);
        },

        stopKillSuggestions: function () {
            window.clearInterval(this.intervalId);
        },

        isCursorAtEnd: function () {
            var that = this,
                valLength = that.element.value.length,
                selectionStart = that.element.selectionStart,
                range;

            if (typeof selectionStart === 'number') {
                return selectionStart === valLength;
            }
            if (document.selection) {
                range = document.selection.createRange();
                range.moveStart('character', -valLength);
                return valLength === range.text.length;
            }
            return true;
        },

        onKeyDown: function (e) {
            var that = this;

            // If suggestions are hidden and user presses arrow down, display suggestions:
            if (!that.disabled && !that.visible && e.which === keys.DOWN && that.currentValue) {
                that.suggest();
                return;
            }

            if (that.disabled || !that.visible) {
                return;
            }

            switch (e.which) {
                case keys.ESC:
                    that.element.value = that.currentValue;
                    that.hide();
                    break;
                case keys.RIGHT:
                    if (that.hint && that.options.onHint && that.isCursorAtEnd()) {
                        that.selectHint();
                        break;
                    }
                    return;
                case keys.TAB:
                    if (that.hint && that.options.onHint) {
                        that.selectHint();
                        return;
                    }
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    if (that.options.tabDisabled === false) {
                        return;
                    }
                    break;
                case keys.RETURN:
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    break;
                case keys.UP:
                    that.moveUp();
                    break;
                case keys.DOWN:
                    that.moveDown();
                    break;
                default:
                    return;
            }

            // Cancel event if function did not return:
            e.stopImmediatePropagation();
            e.preventDefault();
        },

        onKeyUp: function (e) {
            var that = this;

            if (that.disabled) {
                return;
            }

            switch (e.which) {
                case keys.UP:
                case keys.DOWN:
                    return;
            }

            clearInterval(that.onChangeInterval);

            if (that.currentValue !== that.element.value) {
                that.findBestHint();
                if (that.options.deferRequestBy > 0) {
                    // Defer lookup in case when value changes very quickly:
                    that.onChangeInterval = setInterval(function () {
                        that.onValueChange();
                    }, that.options.deferRequestBy);
                } else {
                    that.onValueChange();
                }
            }
        },

        changeValue: function (value) {
            var that = this;

            that.element.value = value;
            that.onValueChange();
        },

        onValueChange: function () {
            var that = this,
                options = that.options,
                value = that.element.value,
                query = that.getQuery(value),
                index;

            if (that.selection && that.currentValue !== query) {
                that.selection = null;
                (options.onInvalidateSelection || utils.noop).call(that.element);
            }

            clearInterval(that.onChangeInterval);
            that.currentValue = value;
            that.selectedIndex = -1;

            // Check existing suggestion for the match before proceeding:
            if (options.triggerSelectOnValidInput) {
                index = that.findSuggestionIndex(query);
                if (index !== -1) {
                    that.select(index);
                    return;
                }
            }

            if (query.length < options.minChars) {
                that.hide();
            } else {
                that.getSuggestions(query);
            }
        },

        findSuggestionIndex: function (query) {
            var that = this,
                index = -1,
                queryLowerCase = query.toLowerCase();

            that.suggestions.forEach(function (suggestion, i) {
                if (suggestion.value.toLowerCase() === queryLowerCase) {
                    index = i;
                    return false;
                }
            });

            return index;
        },

        getQuery: function (value) {
            var delimiter = this.options.delimiter,
                parts;

            if (!delimiter) {
                return value;
            }
            parts = value.split(delimiter);

            return (parts[parts.length - 1]).trim();
        },

        getSuggestionsLocal: function (query) {
            var that = this,
                options = that.options,
                queryLowerCase = query.toLowerCase(),
                filter = options.lookupFilter,
                limit = parseInt(options.lookupLimit, 10),
                data;

            data = {
                suggestions: options.lookup.filter(function (suggestion) {
                    return filter(suggestion, query, queryLowerCase);
                })
            };

            if (limit && data.suggestions.length > limit) {
                data.suggestions = data.suggestions.slice(0, limit);
            }

            return data;
        },

        getSuggestions: function (q) {
            var response,
                that = this,
                options = that.options,
                serviceUrl = options.serviceUrl,
                params,
                cacheKey,
                ajaxSettings;

            options.params[options.paramName] = q;
            params = options.ignoreParams ? null : options.params;

            if (options.onSearchStart.call(that.element, options.params) === false) {
                return;
            }

            if (utils.isFunction(options.lookup)){
                options.lookup(q, function (data) {
                    that.suggestions = data.suggestions;
                    that.suggest();
                    options.onSearchComplete.call(that.element, q, data.suggestions);
                });
                return;
            }

            if (that.isLocal) {
                response = that.getSuggestionsLocal(q);
            } else {
                if (utils.isFunction(serviceUrl)) {
                    serviceUrl = serviceUrl.call(that.element, q);
                }
                cacheKey = serviceUrl + '?' + utils.param(params || {});
                response = that.cachedResponse[cacheKey];
            }

            if (response && utils.isArray(response.suggestions)) {
                that.suggestions = response.suggestions;
                that.suggest();
                options.onSearchComplete.call(that.element, q, response.suggestions);
            } else if (!that.isBadQuery(q)) {
                if (that.currentRequest) {
                    utils.ajaxAbort(that.currentRequest);
                    that.currentRequest = null;
                }

                ajaxSettings = {
                    url: serviceUrl,
                    data: params,
                    type: options.type,
                    dataType: options.dataType
                };

                utils.extend(ajaxSettings, options.ajaxSettings);

                that.currentRequest = utils.ajax(ajaxSettings,
                    function(data){
                        that.currentRequest = null;
                        var result = options.transformResult(data);
                        that.processResponse(result, q, cacheKey);
                        options.onSearchComplete.call(that.element, q, result.suggestions);
                    },
                    function(xhr) {
                        options.onSearchError.call(that.element, q, xhr);
                    });
            } else {
                options.onSearchComplete.call(that.element, q, []);
            }
        },

        isBadQuery: function (q) {
            var that = this,
                badQueries = that.badQueries,
                i = badQueries.length;

            if (!that.options.preventBadQueries){
                return false;
            }

            while (i--) {
                if (q.indexOf(badQueries[i]) === 0) {
                    return true;
                }
            }

            return false;
        },

        hide: function () {
            var that = this;
            that.visible = false;
            that.selectedIndex = -1;
            clearInterval(that.onChangeInterval);
            utils.hide(that.suggestionsContainer);
            that.signalHint(null);
        },

        suggest: function () {
            if (this.suggestions.length === 0) {
                this.hide();
                return;
            }

            var that = this,
                options = that.options,
                groupBy = options.groupBy,
                formatResult = options.formatResult,
                value = that.getQuery(that.currentValue),
                className = that.classes.suggestion,
                classSelected = that.classes.selected,
                container = that.suggestionsContainer,
                beforeRender = options.beforeRender,
                html = '',
                category,
                formatGroup = function (suggestion) {
                        var currentCategory = suggestion.data[groupBy];

                        if (category === currentCategory){
                            return '';
                        }

                        category = currentCategory;

                        return options.formatGroup(category);
                    },
                index;

            if (options.triggerSelectOnValidInput) {
                index = that.findSuggestionIndex(value);
                if (index !== -1) {
                    that.select(index);
                    return;
                }
            }

            // Build suggestions inner HTML:
            that.suggestions.forEach(function (suggestion, i) {
                if (groupBy){
                    html += formatGroup(suggestion, value, i);
                }

                html += '<div class="' + className + '" data-index="' + i + '">' + formatResult(suggestion, value) + '</div>';
            });

            this.adjustContainerWidth();

            container.innerHTML = html;

            if (utils.isFunction(beforeRender)) {
                beforeRender.call(that.element, container);
            }

            that.fixPosition();
            utils.show(container);

            // Select first value by default:
            if (options.autoSelectFirst) {
                that.selectedIndex = 0;
                container.scrollTop = 0;
                utils.addClass(container.firstChild, classSelected);
            }

            that.visible = true;
            that.findBestHint();
        },

        adjustContainerWidth: function() {
            var that = this,
                options = that.options,
                width,
                container = that.suggestionsContainer;

            // If width is auto, adjust width before displaying suggestions,
            // because if instance was created before input had width, it will be zero.
            // Also it adjusts if input width has changed.
            // -2px to account for suggestions border.
            if (options.width === 'auto') {
                width = that.element.offsetWidth - 2;
                container.style.width = (width > 0 ? width : 300) + 'px';
            }
        },

        findBestHint: function () {
            var that = this,
                value = that.element.value.toLowerCase(),
                bestMatch = null;

            if (!value) {
                return;
            }

            that.suggestions.every(function (suggestion) {
                var foundMatch = suggestion.value.toLowerCase().indexOf(value) === 0;
                if (foundMatch) {
                    bestMatch = suggestion;
                }
                return !foundMatch;
            });

            that.signalHint(bestMatch);
        },

        signalHint: function (suggestion) {
            var hintValue = '',
                that = this;
            if (suggestion) {
                hintValue = that.currentValue + suggestion.value.substr(that.currentValue.length);
            }
            if (that.hintValue !== hintValue) {
                that.hintValue = hintValue;
                that.hint = suggestion;
                (this.options.onHint || utils.noop)(hintValue);
            }
        },

        verifySuggestionsFormat: function (suggestions) {
            // If suggestions is string array, convert them to supported format:
            if (suggestions.length && typeof suggestions[0] === 'string') {
                return suggestions.map(function (value) {
                    return { value: value, data: null };
                });
            }

            return suggestions;
        },

        processResponse: function (result, originalQuery, cacheKey) {
            var that = this,
                options = that.options;

            result.suggestions = that.verifySuggestionsFormat(result.suggestions);

            // Cache results if cache is not disabled:
            if (!options.noCache) {
                that.cachedResponse[cacheKey] = result;
                if (options.preventBadQueries && result.suggestions.length === 0) {
                    that.badQueries.push(originalQuery);
                }
            }

            // Return if originalQuery is not matching current query:
            if (originalQuery !== that.getQuery(that.currentValue)) {
                return;
            }

            that.suggestions = result.suggestions;
            that.suggest();
        },

        activate: function (index) {
            if (typeof index !== 'number') {
                index = parseInt(index, 10);
            }

            var that = this,
                selected = that.classes.selected,
                container = that.suggestionsContainer,
                children = container.getElementsByClassName(that.classes.suggestion),
                activeItem = children[index];

            utils.each(container.getElementsByClassName(selected), function (el) {
                utils.removeClass(el, selected);
            });

            that.selectedIndex = index;

            utils.addClass(activeItem, selected);

            return activeItem;
        },

        selectHint: function () {
            var that = this,
                i = utils.inArray(that.hint, that.suggestions);

            that.select(i);
        },

        select: function (i) {
            var that = this;
            that.hide();
            that.onSelect(i);
        },

        moveUp: function () {
            var that = this;

            if (that.selectedIndex === -1) {
                return;
            }

            if (that.selectedIndex === 0) {
                utils.removeClass(that.suggestionsContainer.children[0], that.classes.selected);
                that.selectedIndex = -1;
                that.element.value = that.currentValue;
                that.findBestHint();
                return;
            }

            that.adjustScroll(that.selectedIndex - 1);
        },

        moveDown: function () {
            var that = this;

            if (that.selectedIndex === (that.suggestions.length - 1)) {
                return;
            }

            that.adjustScroll(that.selectedIndex + 1);
        },

        adjustScroll: function (index) {
            var that = this,
                activeItem = that.activate(index),
                offsetTop = activeItem.offsetTop,
                upperBound = that.suggestionsContainer.scrollTop,
                heightDelta = activeItem.offsetHeight,
                lowerBound = upperBound + that.options.maxHeight - heightDelta;

            if (offsetTop < upperBound) {
                that.suggestionsContainer.scrollTop = offsetTop;
            } else if (offsetTop > lowerBound) {
                that.suggestionsContainer.scrollTop = (offsetTop - that.options.maxHeight + heightDelta);
            }

            that.element.value = that.getValue(that.suggestions[index].value);
            that.signalHint(null);
        },

        onSelect: function (index) {
            var that = this,
                onSelectCallback = that.options.onSelect,
                suggestion = that.suggestions[index];

            that.currentValue = that.getValue(suggestion.value);

            if (that.currentValue !== that.element.value) {
                that.element.value = that.currentValue;
            }

            that.signalHint(null);
            that.suggestions = [];
            that.selection = suggestion;

            if (utils.isFunction(onSelectCallback)) {
                onSelectCallback.call(that.element, suggestion);
            }
        },

        getValue: function (value) {
            var that = this,
                delimiter = that.options.delimiter,
                currentValue,
                parts;

            if (!delimiter) {
                return value;
            }

            currentValue = that.currentValue;
            parts = currentValue.split(delimiter);

            return currentValue.substr(0, currentValue.length - parts[parts.length - 1].length) + value;
        },

        dispose: function () {
            var that = this,
                container = that.suggestionsContainer;

            that.disableKillerFn();

            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }
    };

    // Some AMD build optimizers like r.js check for condition patterns like the following:
    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
        // Define as an anonymous module so, through path mapping, it can be
        // referenced as the "VanillaAutocomplete" module.
        define(function() {
            return VanillaAutocomplete;
        });
    }

    // Expose as global:
    root.VanillaAutocomplete = VanillaAutocomplete;

}(this));
