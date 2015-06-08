/* jshint strict: false */

'use strict';

module.exports  = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', 'src/js/*.js'],
            options: {
                globalstrict: true,
                newcap: false,
                globals: {
                    module: true,
                    console: true,
                    angular: true,
                    document: true,
                    chrome: true,
                    window: true,
                    Snap: true,
                    Image: true,
                    XMLSerializer: true,
                    CustomEvent: true,
                    async: true,
                    rpf: true,
                    Blob: true,
                    FormData: true,
                    Uint8Array: true,
                    Prism: true,
                    FileReader: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.registerTask('default', ['jshint']);
};