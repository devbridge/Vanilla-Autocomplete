/*global document*/

require.config({
    urlArgs: '',
    baseUrl: '/scripts/',
    paths: {
        Autocomplete: '../src/devbridge-autocomplete'
    },
    shim: {
        Autocomplete: {
            exports: 'Autocomplete'
        }
    }
});

require(['Autocomplete'], function (Autocomplete) {
    'use strict';

    var element = document.getElementById('autocomplete-1');

    var options = {
        serviceUrl: '/scripts/suggestions-fb.json',
        minChars: 1,
        autoSelectFirst: true,
        appendTo: element.parentNode,
        formatResult: function (suggestion) {
            return '<span class="suggestion-img"><img src="'+ suggestion.data.img +'"/></span> \
                <span class="suggestion-wrapper"> \
                <span class="suggestion-value">' + suggestion.value + '</span> \
                <span class="sub-text">' + suggestion.data.location + '</span> \
                <span class="sub-text">' + suggestion.data.likes + '</span></span>'
        }
    };

    var instance = new Autocomplete(element, options);

    console.log('Page loaded: ', instance);
});