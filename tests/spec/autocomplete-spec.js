describe("Autocomplete", function () {

    var keys = {
        ESC: 27,
        TAB: 9,
        RETURN: 13,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40
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
        var input = document.createElement('input');

        document.body.appendChild(input);

        var selectedSuggestion = null;
        var options = {
            lookup: ['Chicago Bulls', 'Chicago Blackhawks', 'Miami Heat'],
            autoSelectFirst: true,
            onSelect: function (suggestion) {
                selectedSuggestion = suggestion;
            },
            onHint: function () {

            }
        };
        var instance = new Autocomplete(input, options);

        it ("should set autocomplete attribute to 'off'", function () {
            expect(input.getAttribute('autocomplete')).toEqual('off');
        });

        it ("should execute local lookup", function () {
            instance.changeValue('Chi');
            expect(instance.suggestions.length).toEqual(2);
            expect(instance.suggestions[0].value).toEqual('Chicago Bulls');
            expect(instance.suggestions[1].value).toEqual('Chicago Blackhawks');
        });


        it ("after key press RIGHT should select hint", function () {
            instance.changeValue('Chi');
            expect(instance.selectedIndex).toEqual(0);

            // Hit RIGHT:
            instance.onKeyDown(generateEvent(keys.RIGHT));
            expect(instance.selectedIndex).toEqual(-1);

            // Hit UP again:
            instance.onKeyDown(generateEvent(keys.UP));
            expect(instance.selectedIndex).toEqual(-1);
        });

        it ("after key press DOWN should move cursor down", function () {
            instance.changeValue('Chi');
            var index = instance.selectedIndex + 1;

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
            var i = 73;
            instance.value = 'Chi';
            instance.onKeyUp(generateEvent(i));

            expect(instance.visible).toBe(true);
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
            selectedSuggestion = null;
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

    });

    describe("Autocomplete triggerSelectOnValidInput: true", function () {
        var input = document.createElement('input');
        var appendTo = document.createElement('div');
        var selected = null;
        var options = {
            lookup: ['Chicago', 'New York', 'Miami'],
            appendTo: appendTo,
            triggerSelectOnValidInput: true,
            onSelect: function (suggestion) {
                selected = suggestion.value;
            }
        };
        var instance = new Autocomplete(input, options);

        it("should select matching suggestion", function () {
            expect(selected).toBeNull();
            instance.changeValue('Chicag');
            instance.changeValue('Chicago');
            expect(selected).toEqual('Chicago');
        });
    });

    describe("Autocomplete option width", function () {
        var input = document.createElement('input');
        var appendTo = document.createElement('div');

        document.body.appendChild(appendTo);

        var options = {
            lookup: ['Chicago', 'New York', 'Miami'],
            appendTo: appendTo,
            width: 300
        };
        var instance = new Autocomplete(input, options);

        it("should set container width", function () {
            instance.changeValue('Chi');
            var width = utils.css(appendTo.firstChild, 'width');
            expect(width).toEqual('300px');
        });
    });

    describe("Autocomplete should use custom lookup", function () {
        var input = document.createElement('input');
        var selected = null;
        var options = {
            lookup: function (q, callback) {
                callback({ suggestions: [{ value:'Chicago', data: 1 }] });
            }
        };
        var instance = new Autocomplete(input, options);

        it("should select matching suggestion", function () {
            expect(instance.suggestions.length).toEqual(0);
            instance.changeValue('Chi');
            expect(instance.suggestions.length).toEqual(1);
        });
    });

    describe("Autocomplete methods", function () {

        var input = document.createElement('input');
        var appendTo = document.createElement('div');
        var options = {
            lookup: ['Chicago', 'New York', 'Miami'],
            appendTo: appendTo
        };
        var instance = new Autocomplete(input, options);

        it ('#disable() should disable functionality', function () {
            instance.disable();
            expect(instance.disabled).toBe(true);
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
        beforeEach(function() {
            jasmine.Ajax.install();
        });

        var input = document.createElement('input');
        var appendTo = document.createElement('div');
        var options = {
            serviceUrl: '/suggest',
            appendTo: appendTo
        };
        var instance = new Autocomplete(input, options);


        it ('#ajax() should get ajax data', function (done) {
            instance.setOptions({
                onSearchComplete: function (q, suggestions) {
                    expect(suggestions.length).toEqual(1);
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

    });

    describe('Autocomplete events', function () {
        var input = document.createElement('input');
        var selected = false;
        var options = {
            lookup: ['AA1', 'AA2', 'BB1', 'BB2'],
            onSelect: function () {
                selected = true;
            }
        };
        var instance = new Autocomplete(input, options);
        instance.changeValue('A');
        var index = 1;
        var element = instance.suggestionsContainer.children[index];

        it ('mouseover should activate element', function () {
            var event = document.createEvent('CustomEvent');
            event.initEvent('mouseover', true, false);
            element.dispatchEvent(event);

            expect(instance.selectedIndex).toBe(index);
        });

        it ('mouseout should deactivate element', function () {
            var event = document.createEvent('CustomEvent');
            event.initEvent('mouseout', true, false);
            element.dispatchEvent(event);

            expect(instance.selectedIndex).toBe(-1);
        });

        it ('click should select value', function () {
            expect(selected).toBe(false);

            var event = document.createEvent('CustomEvent');
            event.initEvent('click', true, false);
            element.dispatchEvent(event);

            expect(selected).toBe(true);
        });

        it ('keydown should...', function () {
            instance.value = 'B';

            var event = document.createEvent('CustomEvent');
            event.initEvent('keydown', true, false);
            element.dispatchEvent(event);

            expect(selected).toBe(true);
        });


    });
});