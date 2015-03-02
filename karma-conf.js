module.exports = function(config) {
  config.set({
    basePath: '',
    autoWatch: true,
    frameworks: ['jasmine-ajax', 'jasmine'],
    files: [
      'src/devbridge-autocomplete.js',
      'tests/spec/*.js'
    ],
    browsers: ['PhantomJS'],
    reporters: ['progress', 'coverage'],
    preprocessors: { 'src\\*.js': ['coverage'] },
    singleRun: true
  });
};
