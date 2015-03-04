module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-uglify');

    var pkg = grunt.file.readJSON('package.json');

    var banner = [
            '/**',
            '*  Devbridge Vanilla Autocomplete, version ' + pkg.version,
            '*  (c) 2015 Tomas Kirda',
            '*',
            '*  Devbridge Vanilla Autocomplete is freely distributable under the terms of an MIT license.',
            '*  For details visit: https://github.com/devbridge/Vanilla-Autocomplete',
            '*/'].join('\n') + '\n';

    // Project configuration.
    grunt.initConfig({
        pkg: pkg,
        uglify: {
            options: {
                banner: banner
            },
            build: {
                src: 'dist/devbridge-vanilla-autocomplete.js',
                dest: 'dist/devbridge-vanilla-autocomplete.min.js'
            }
        }
    });

    grunt.task.registerTask('build', function() {
        var version = pkg.version,
            src = banner + grunt.file.read('src/devbridge-autocomplete.js').replace('%version%', version),
            filePath = 'dist/devbridge-vanilla-autocomplete.js';

        // Update not minimized release version:
        console.log('Updating: ' + filePath);
        grunt.file.write(filePath, src);

        // Minify latest version:
        grunt.task.run('uglify');

        // Update bower version:
        var bowerJson = 'bower.json';
        var bower = grunt.file.readJSON(bowerJson);

        bower.version = version;
        grunt.file.write(bowerJson, JSON.stringify(bower, null, 4));
    });
};