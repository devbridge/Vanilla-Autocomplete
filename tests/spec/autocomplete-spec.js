describe("Autocomplete", function () {

    var keys = {
        ESC: 27,
        TAB: 9,
        RETURN: 13,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        LETTER_i: 73
    };

    function generateEvent(keyCode) {
        return {
            which: keyCode,
            stopImmediatePropagation: function () {},
            preventDefault: function () {}
        }
    }

    describe('Autocomplete utils AJAX', function () {
        beforeEach(function() {
            jasmine.Ajax.install();
        });

        it ('#ajax() should get ajax data', function (done) {
            var settings = { url: '/suggestions' };

            utils.ajax(settings, function (response) {
                expect(typeof response).toBe('string');
                done();
            });

            var request = jasmine.Ajax.requests.mostRecent();

            request.respondWith({
                status: 200,
                responseText: '{ "suggestions": [{ "value": "Chicago", "data": 1 }] }'
            });
        });

        it ('#ajaxAbort() should get ajax data', function () {
            var settings = { url: '/suggestions' };

            var xhr = utils.ajax(settings, function () {
                // Do nothing
            });

            spyOn(xhr, 'abort');

            utils.ajaxAbort(xhr);

            expect(xhr.abort).toHaveBeenCalled();
        });
    });

    describe('Autocomplete utils', function () {

        it ('#param() should convert object into query string', function () {
            var obj = { query: 'John Doe', test: 1 };
            var result = utils.param(obj);

            expect(result).toEqual('query=John+Doe&test=1');
        });

        it ('#hasClass() should check if element has class', function () {
            var el = document.createElement('div');
            el.className = 'one two';

            expect(utils.hasClass(el, 'one')).toBe(true);
            expect(utils.hasClass(el,'two')).toBe(true);
            expect(utils.hasClass(el, 'three')).toBe(false);
        });

        it ('#extend() should extend object', function () {
            var target = { a: 1, c: 3, complex: { a: 1 } };
            var source = { b: 2, f: function () {}, complex: { b: 2 } };

            utils.extend(target, source);

            expect(target.a).toEqual(1);
            expect(target.b).toEqual(2);
            expect(target.c).toEqual(3);
            expect(target.complex.a).toEqual(1);
            expect(target.complex.b).toEqual(2);
            expect(typeof target.f).toBe('function');
        });

        it ('#createNode: should create node with provided class name', function () {
            var className = 'test';
            var div = utils.createNode(className);

            expect(div.className).toEqual(className);
        });

        it ('#createNode() should create node with provided class name', function () {
            var className = 'test';
            var div = utils.createNode(className);

            expect(div.className).toEqual(className);
        });

        it ('#escapeRegExChars() should escape special regex characters', function () {
            var value = 'test/string';
            var escapedValue = utils.escapeRegExChars(value);

            expect(escapedValue).toEqual('test\\/string');
        });

        it ('#getData() should get data from element', function () {
            var div = document.createElement('div');
            div.innerHTML = '<div data-test="testValue"></div>';
            var value = utils.getData(div.firstChild, 'test');

            expect(value).toEqual('testValue');
        });

        it ('#matchElement() should match element by class', function () {
            var div = document.createElement('div');
            div.innerHTML = '<div class="test"><div></div></div>';

            var event = {
                target: div.firstChild.firstChild
            };

            var value = utils.matchElement(event, 'test', div);

            expect(value).toBe(div.firstChild);
        });

        it ('#matchElement() should not match element by class', function () {
            var div = document.createElement('div');
            div.innerHTML = '<div class="test"><div></div></div>';

            var event = {
                target: div.firstChild.firstChild
            };

            var value = utils.matchElement(event, 'non-existing-class', div);

            expect(value).toBeNull();
        });

        it ('#isArray() should return true when array is passed', function () {
            expect(utils.isArray([])).toBe(true);

            if (Array.isArray){
                delete Array.isArray;
                expect(utils.isArray([])).toBe(true);
            }
        });

        it ('#toCamelCase() should convert value to camelCase', function () {
            var value = utils.toCamelCase('min-height');
            expect(value).toEqual('minHeight');
        });

        it ('#css() should set css values to element', function () {
            var div = document.createElement('div');

            // Need to append to the document in order to read style:
            document.body.appendChild(div);

            var css = {
                'display' : 'none',
                'min-height': '100px',
                'width': 200
            };

            utils.css(div, css);

            expect(div.style.display).toEqual('none');
            expect(div.style.minHeight).toEqual('100px');
            expect(div.style.width).toEqual('200px');

            var display = utils.css(div, 'display');
            var minHeight = utils.css(div, 'min-height');
            var width = utils.css(div, 'width');

            expect(display).toEqual('none');
            expect(minHeight).toEqual('100px');
            expect(width).toEqual('200px');
        });
    });

    describe("By default", function () {
        var instance, input, selectedSuggestion;

        beforeEach(function () {
            selectedSuggestion = null;
            input = document.createElement('input');

            document.body.appendChild(input);

            var options = {
                lookup: [
                    { value: 'Chicago Bulls'      , data: { category: 'NBA' } },
                    { value: 'Chicago Blackhawks' , data: { category: 'NHL' } },
                    { value: 'Chicago Wolves'     , data: { category: 'NHL' } },
                    { value: 'Miami Heat'         , data: { category: 'NBA' } }
                ],
                autoSelectFirst: true,
                onSelect: function (suggestion) {
                    selectedSuggestion = suggestion;
                },
                onHint: function () {

                }
            };
            instance = new Autocomplete(input, options);
        });

        afterEach(function () {
            instance.dispose();
            input.parentNode.removeChild(input);
        });

        it ("should set autocomplete attribute to 'off'", function () {
            expect(input.getAttribute('autocomplete')).toEqual('off');
        });

        it ("should execute local lookup", function () {
            instance.changeValue('Chi');
            expect(instance.suggestions.length).toEqual(3);
            expect(instance.suggestions[0].value).toEqual('Chicago Bulls');
            expect(instance.suggestions[1].value).toEqual('Chicago Blackhawks');
            expect(instance.suggestions[2].value).toEqual('Chicago Wolves');
        });

        it ("after key press RIGHT should select hint", function () {
            function moveCaretToEnd(el) {
                if (typeof el.selectionStart == "number") {
                    el.selectionStart = el.selectionEnd = el.value.length;
                } else if (typeof el.createTextRange != "undefined") {
                    el.focus();
                    var range = el.createTextRange();
                    range.collapse(false);
                    range.select();
                }
            }

            instance.changeValue('Chi');
            expect(instance.selectedIndex).toEqual(0);
            moveCaretToEnd(instance.element);

            // Hit RIGHT:
            instance.onKeyDown(generateEvent(keys.RIGHT));
            expect(instance.selectedIndex).toEqual(-1);

            // Hit UP again:
            instance.onKeyDown(generateEvent(keys.UP));
            expect(instance.selectedIndex).toEqual(-1);
        });

        it ("after key press RIGHT should NOT select hint", function () {
            instance.setOptions({ onHint: null });
            instance.changeValue('Chi');
            expect(instance.selectedIndex).toEqual(0);

            // Hit RIGHT:
            instance.onKeyDown(generateEvent(keys.RIGHT));
            expect(instance.selectedIndex).toEqual(0);
        });

        it ("after key press DOWN should move cursor down", function () {
            instance.changeValue('Chi');
            var index = instance.selectedIndex + 2;

            // Hit down twice:
            instance.onKeyDown(generateEvent(keys.DOWN));
            instance.onKeyDown(generateEvent(keys.DOWN));

            expect(instance.selectedIndex).toEqual(index);
        });

        it ("after key press DOWN should display list if hidden", function () {
            instance.changeValue('Chi');
            instance.hide();

            // Hit down, should display suggestions:
            instance.onKeyDown(generateEvent(keys.DOWN));

            expect(instance.selectedIndex).toEqual(0);
        });

        it ("after key press UP should move cursor up", function () {
            instance.changeValue('Chi');

            instance.onKeyDown(generateEvent(keys.DOWN));
            expect(instance.selectedIndex).toEqual(1);

            // Hit UP:
            instance.onKeyDown(generateEvent(keys.UP));

            expect(instance.selectedIndex).toEqual(0);
        });

        it ("after key press UP should deselect if at index zero", function () {
            instance.changeValue('Chi');
            expect(instance.selectedIndex).toEqual(0);

            // Hit UP:
            instance.onKeyDown(generateEvent(keys.UP));
            expect(instance.selectedIndex).toEqual(-1);

            // Hit UP again:
            instance.onKeyDown(generateEvent(keys.UP));
            expect(instance.selectedIndex).toEqual(-1);
        });

        it ("after key press ESCAPE should hide suggestions", function () {
            instance.changeValue('Chi');
            expect(instance.visible).toBe(true);
            instance.onKeyDown(generateEvent(keys.ESC));
            expect(instance.visible).toBe(false);
        });

        it ("after key press TAB should select suggestions", function () {
            instance.changeValue('Chi');
            instance.selection = null;
            instance.options.onHint = function () {};
            instance.onKeyDown(generateEvent(keys.TAB));

            expect(instance.selection).toBeTruthy();
        });

        it ("after key press TAB should select suggestions 2", function () {
            instance.changeValue('Chi');
            instance.selection = null;
            instance.options.onHint = null;
            instance.onKeyDown(generateEvent(keys.TAB));

            expect(instance.selection).toBeTruthy();
        });

        it ("after key press TAB should hide suggestions", function () {
            instance.changeValue('Chi');
            instance.selection = null;
            instance.options.onHint = null;

            // Reset selected index:
            instance.selectedIndex = -1;
            instance.onKeyDown(generateEvent(keys.TAB));

            expect(instance.visible).toBe(false);
        });

        it ("after key press TAB should hide suggestions 2", function () {
            instance.changeValue('Chi');
            instance.selection = null;
            instance.options.onHint = null;
            instance.options.tabDisabled = true;

            // Reset selected index:
            instance.selectedIndex = -1;
            instance.onKeyDown(generateEvent(keys.DOWN));
            instance.onKeyDown(generateEvent(keys.TAB));

            expect(instance.visible).toBe(false);
        });

        it ("after key press RETURN should hide suggestions", function () {
            instance.changeValue('Chi');
            expect(instance.visible).toBe(true);

            // Reset selected index:
            instance.selectedIndex = -1;
            instance.onKeyDown(generateEvent(keys.RETURN));

            expect(instance.visible).toBe(false);
        });

        it ("after key press A should not call preventDefault", function () {
            instance.changeValue('Chi');

            var preventDefaultCalls = 0;
            var event = generateEvent(keys.DOWN);

            event.preventDefault = function () {
                preventDefaultCalls += 1;
            };

            expect(preventDefaultCalls).toBe(0);
            instance.onKeyDown(event);
            expect(preventDefaultCalls).toBe(1);

            event.which = 65;
            instance.onKeyDown(event);
            expect(preventDefaultCalls).toBe(1);
        });

        it ("after key up should call onValueChange", function () {
            instance.element.value = 'Chi';
            instance.onKeyUp(generateEvent(keys.LETTER_i));

            expect(instance.visible).toBe(true);

            // Expand code coverage for keys.UP:
            instance.onKeyUp(generateEvent(keys.UP));

            // Expand code coverage when plugin disabled:
            instance.disable();
            instance.onKeyUp(generateEvent(keys.LETTER_i));
            instance.enable();
        });

        it ("after key up should call onValueChange but do nothing when query is shorter than minChars", function () {
            instance.setOptions({ minChars: 2 });
            instance.changeValue('C');

            expect(instance.visible).toBe(false);
        });

        it ("should do nothing when onSearchStart returns false", function () {
            instance.setOptions({
                onSearchStart: function () {
                    return false;
                }
            });
            instance.changeValue('Chi');

            expect(instance.visible).toBe(false);
            instance.setOptions({ onSearchStart: function () { return true; } });
        });

        it ("on focus should display suggestions", function () {
            instance.changeValue('Chi');
            instance.onKeyDown(generateEvent(keys.ESC));
            expect(instance.visible).toBe(false);

            instance.onFocus();
            expect(instance.visible).toBe(true);
        });

        it ("on blur should enable killer function", function (done) {
            instance.changeValue('Chi');
            instance.onBlur();

            expect(instance.visible).toBe(true);

            instance.killerFn();

            // Suggestions killed in 50 ms:
            setTimeout(function () {
                expect(instance.visible).toBe(false);
                done();
            }, 100);
        });

        it ("after key press ENTER should select suggestion", function () {
            expect(selectedSuggestion).toBeNull();

            instance.changeValue('Chi');
            instance.moveDown();

            // Hit Enter:
            instance.onKeyDown(generateEvent(keys.RETURN));

            expect(selectedSuggestion).not.toBeNull();
            expect(selectedSuggestion.value).toEqual('Chicago Blackhawks');
        });

        it ("should not have suggestions for invalid input", function () {
            instance.changeValue('Zzz');
            expect(instance.suggestions.length).toEqual(0);
            expect(instance.visible).toBe(false);
        });

        it ("should defer request when deferRequestBy is specified", function (done) {
            instance.setOptions({ deferRequestBy: 50 });
            instance.element.value = 'Chi';
            instance.onKeyUp(generateEvent(keys.LETTER_i));

            expect(instance.suggestions.length).toEqual(0);

            setTimeout(function () {
                expect(instance.suggestions.length).toBeGreaterThan(0);
                done();
            }, 100);

        });

        it ("should group data by specified field.", function () {
            instance.setOptions({ groupBy: 'category' });
            instance.changeValue('Chi');

            var groups = instance.suggestionsContainer.getElementsByClassName('autocomplete-group');

            expect(groups.length).toBeGreaterThan(0);
        });

        it ("should limit suggestion number.", function () {
            instance.setOptions({ lookupLimit: 1 });
            instance.changeValue('Chi');

            expect(instance.suggestions.length).toBe(1);
        });

        it ("should split by specified delimiter.", function () {
            instance.setOptions({ delimiter: ',' });
            instance.changeValue('Test,Chi');

            expect(instance.suggestions[0].value).toBe('Chicago Bulls');

            instance.select(0);
            expect(instance.element.value).toBe('Test,Chicago Bulls');
        });

        it("should select matching suggestion when triggerSelectOnValidInput is set to true", function () {
            var selected = null;

            instance.setOptions({
                triggerSelectOnValidInput: true,
                onSelect: function (suggestion) {
                    selected = suggestion.value;
                }
            });

            instance.changeValue('Chicago');
            expect(selected).toBeNull();

            instance.changeValue('Chicago Bulls');
            expect(selected).toEqual('Chicago Bulls');
        });
    });

    describe("Autocomplete option width", function () {
        var input,
            instance,
            appendTo;

        beforeEach(function () {
            input = document.createElement('input');
            appendTo = document.createElement('div');

            document.body.appendChild(input);
            document.body.appendChild(appendTo);

            var options = {
                lookup: ['Chicago', 'New York', 'Miami'],
                appendTo: appendTo,
                width: 300
            };

            instance = new Autocomplete(input, options);
        });

        afterEach(function () {
            instance.dispose();
            input.parentNode.removeChild(input);
            appendTo.parentNode.removeChild(appendTo);
        });

        it("should set container width", function () {
            instance.changeValue('Chi');
            var width = utils.css(appendTo.firstChild, 'width');
            expect(width).toEqual('300px');
        });
    });

    describe("Autocomplete should use custom lookup", function () {
        var input,
            instance;

        beforeEach(function () {
            input = document.createElement('input');

            document.body.appendChild(input);

            var options = {
                lookup: function (q, callback) {
                    callback({ suggestions: [{ value:'Chicago', data: 1 }] });
                }
            };

            instance = new Autocomplete(input, options);
        });

        afterEach(function () {
            instance.dispose();
            input.parentNode.removeChild(input);
        });

        it("should select matching suggestion", function () {
            expect(instance.suggestions.length).toEqual(0);
            instance.changeValue('Chi');
            expect(instance.suggestions.length).toEqual(1);
        });
    });

    describe("Autocomplete methods", function () {
        var input,
            instance,
            appendTo;

        beforeEach(function () {
            input = document.createElement('input');
            appendTo = document.createElement('div');

            document.body.appendChild(input);
            document.body.appendChild(appendTo);

            var options = {
                lookup: ['Chicago', 'New York', 'Miami'],
                appendTo: appendTo
            };

            instance = new Autocomplete(input, options);
        });

        afterEach(function () {
            instance.dispose();
            input.parentNode.removeChild(input);
            appendTo.parentNode.removeChild(appendTo);
        });

        it ('#disable() should disable functionality', function () {
            var abortCalled = false;

            instance.changeValue('B');
            instance.currentRequest = {
                abort: function () {
                    abortCalled = true;
                }
            };
            instance.disable();

            expect(instance.disabled).toBe(true);
            expect(abortCalled).toBe(true);
        });

        it ('#enable() should disable functionality', function () {
            instance.disable();
            instance.enable();
            expect(instance.disabled).toBe(false);
        });

        it ('#clearCache() should clear bad queries', function () {
            instance.changeValue('zzz');
            instance.clearCache();
            expect(instance.badQueries.length).toEqual(0);
        });

        it ('#clear() should clear bad queries', function () {
            instance.clear();
            expect(instance.badQueries.length).toEqual(0);
        });

        it ('#dispose() should remove itself and cleanup events', function () {
            expect(appendTo.children.length).toEqual(1);
            instance.dispose();
            expect(appendTo.children.length).toEqual(0);
        });
    });

    describe("Autocomplete AJAX", function () {
        var input,
            instance,
            appendTo;

        beforeEach(function() {
            jasmine.Ajax.install();

            input = document.createElement('input');
            appendTo = document.createElement('div');

            document.body.appendChild(input);
            document.body.appendChild(appendTo);

            var options = {
                serviceUrl: '/suggest',
                appendTo: appendTo
            };

            instance = new Autocomplete(input, options);
        });

        afterEach(function () {
            instance.dispose();
            input.parentNode.removeChild(input);
            appendTo.parentNode.removeChild(appendTo);
        });

        it ('#ajax() should get ajax data', function (done) {
            var called = false;

            instance.setOptions({
                serviceUrl: function () {
                    called = true;
                    return '/suggest';
                },
                onSearchComplete: function (q, suggestions) {
                    expect(suggestions.length).toEqual(1);
                    expect(called).toBe(true);
                    done();
                }
            });

            instance.changeValue('Chi');

            var request = jasmine.Ajax.requests.mostRecent();

            request.respondWith({
                status: 200,
                responseText: '{ "suggestions": [{ "value": "Chicago", "data": 1 }] }'
            });
        });

        it ('#ajax() should prevent bad queries', function (done) {
            instance.setOptions({
                onSearchComplete: function (q, suggestions) {
                    expect(suggestions.length).toEqual(0);
                    done();
                }
            });

            // Call twice:
            instance.changeValue('ZZZ');
            instance.changeValue('ZZZ');

            var request = jasmine.Ajax.requests.mostRecent();

            request.respondWith({
                status: 200,
                responseText: '{ "suggestions": [] }'
            });
        });

        it ('#ajax() handle ajax error', function (done) {
            instance.setOptions({
                onSearchError: function (q, xhr) {
                    expect(xhr.status).toEqual(500);
                    done();
                }
            });

            instance.changeValue('Test for error');

            var request = jasmine.Ajax.requests.mostRecent();

            request.respondWith({
                status: 500,
                responseText: 'Error'
            });
        });
    });

    describe('Autocomplete events', function () {
        var input,
            instance,
            element;

        beforeEach(function() {
            input = document.createElement('input');
            document.body.appendChild(input);

            var options = {
                lookup: ['AA1', 'AA2', 'BB1', 'BB2'],
            };

            instance = new Autocomplete(input, options);
            instance.changeValue('A');
            element = instance.suggestionsContainer.children[1];
        });

        afterEach(function () {
            instance.dispose();
            input.parentNode.removeChild(input);
        });

        it ('mouseover should activate element', function () {
            var event = document.createEvent('CustomEvent');
            event.initEvent('mouseover', true, false);
            element.dispatchEvent(event);

            expect(instance.selectedIndex).toBe(1);
        });

        it ('mouseout should deactivate element', function () {
            var event = document.createEvent('CustomEvent');
            event.initEvent('mouseout', true, false);
            element.dispatchEvent(event);

            expect(instance.selectedIndex).toBe(-1);
        });

        it ('click should select value', function () {
            var selected = false;
            var event = document.createEvent('CustomEvent');

            instance.setOptions({
                onSelect: function () {
                    selected = true;
                }
            });

            event.initEvent('click', true, false);
            element.dispatchEvent(event);

            expect(selected).toBe(true);
        });

        it ('keydown should...', function () {
            input.value = 'B';

            var event = document.createEvent('CustomEvent');

            event.initEvent('keydown', true, false);
            element.dispatchEvent(event);

            expect(instance.visible).toBe(true);
        });

        it ("should adjust position on window resize.", function () {
            spyOn(instance, 'fixPosition');

            instance.changeValue('B');

            var event = document.createEvent('CustomEvent');
            event.initEvent('resize', true, false);
            window.dispatchEvent(event);

            expect(instance.fixPosition).toHaveBeenCalled();
        });
 });
});