
module.exports = function () {
    var rootDir = __dirname;

    return {
        rootDir: rootDir,
        karma: {
            default: {
                configFile: rootDir + '/karma.config.js'
            },
            coverage: {
                coverageReporter: {
                    dir: rootDir + '/coverage',
                    reporters: [
                        { type: 'html', subdir: 'coverage' },
                        { type: 'text-summary' }
                    ]
                },
                preprocessors: {
                    'src/*.js': ['coverage']
                },
                reporters: ['mocha', 'coverage']
            },
            tdd: {
                singleRun: false
            }
        }
    };
};
