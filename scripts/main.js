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
        // lookup: ['Chicago Blackhawks', 'Chicago Bulls', 'New York', 'Miami'],
        serviceUrl: '/scripts/suggestions.json',
        minChars: 1,
        autoSelectFirst: true
    };

    var instance = new Autocomplete(element, options);

    console.log('Page loaded: ', instance);
});