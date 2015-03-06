angular.module('app').controller('AppController', [AppController]);

function AppController(utilsService) {
    var self = this;

    self.name = 'hello';


    self.init = function () {
        var element = document.getElementById('autocomplete-1');




        var options = {
            lookup: lookup.suggestions,
            minChars: 1,
            autoSelectFirst: true,
            appendTo: element.parentNode,
            formatResult: function (suggestion) {
                return "<span class='suggestion-img'><img src='" + suggestion.data.img + "'/>" +
                    "</span><span class='suggestion-wrapper'><span class='suggestion-value'>" + suggestion.value + "</span>" +
                    "<span class='sub-text'>" + suggestion.data.location + "</span>" +
                    "<span class='sub-text'>" + suggestion.data.likes + "</span></span>";
            }
        };

        var instance = new VanillaAutocomplete(element, options);

        var element2 = document.getElementById('autocomplete-2');

        var options2 = {
            lookup: lookup.suggestions,
            minChars: 1,
            autoSelectFirst: true,
            appendTo: element2.parentNode
        };

        var instance2 = new VanillaAutocomplete(element2, options2);

        console.log('Page loaded: ', instance);
        console.log('Page loaded: ', instance2);
    };

    self.init();
    hljs.initHighlightingOnLoad();

}
