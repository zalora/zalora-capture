/* jshint strict: false */

'use strict';

module.exports  = function (grunt) {
    var _configs = {
        app: 'app',
        dist: 'dist',
        release: 'release'
    }, _manifest = grunt.file.readJSON('app/manifest.json');

    _configs.dist = _configs.dist + '/' + _manifest.version;

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: [
                'Gruntfile.js',
                _configs.app + '/src/js/{,*/}*.js',
                '!' + _configs.app + '/src/js/third-party/*.js',
            ],
            options: {
                globalstrict: true,
                newcap: false,
                globals: {
                    module: true,
                    console: true,
                    angular: true,
                    window: true
                }
            }
        },

        clean: {
            dist: [_configs.dist]
        },

        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: _configs.app,
                        src: [
                            'manifest.json',
                            'src/images/**/*.png',
                            'src/*.html',
                            'src/js/third-party/*.js',
                            'src/templates/*.*'
                        ],
                        dest: _configs.dist
                    },
                    {
                        expand: true,
                        cwd: _configs.app + '/bower_components/font-awesome',
                        src: 'fonts/*.*',
                        dest: _configs.dist + '/src'
                    }
                ]
            }
        },

        compress: {
            dist: {
                options: {
                    archive: _configs.release + '/' + _manifest.name + ' ' + _manifest.version + '.zip'
                },
                files: [{
                    expand: true,
                    cwd: _configs.dist,
                    src: ['**']
                }]
            }
        },

        useminPrepare: {
            dist: {
                options: {
                    root: _configs.app + '/src',
                    dest: _configs.dist + '/src'
                },
                files: [{
                    expand: true,
                    src: ['src/*.html'],
                    cwd: _configs.app
                }]
            }
        },

        usemin: {
            html: [_configs.dist + '/src/*.html'],
            css: [_configs.dist + '/src/css/*.css'],
            options: {
            }
        },

        uglify: {
            options: {
                // sourceMap: true
                compress: {
                    drop_console: true
                },
                beautify: {
                    ascii_only: true
                },
                ASCIIOnly: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: _configs.app,
                    src: 'src/js/console-listener.js',
                    dest: _configs.dist
                }]
            }
        },

        karma: {
            unit: {
                configFile: 'my.conf.js'
            }
        },

        'string-replace': {
            files: {
                src: _configs.app + '/src/js/core/config.service.js',
                dest: _configs.app + '/src/js/core/config.service.js'
            },
            options: {
                replacements: [
                    {
                        pattern: /liveReload: (true|false)/,
                        replacement: 'liveReload: false'
                    },
                    {
                        pattern: /serverName: '([a-zA-Z]*)'/,
                        replacement: "serverName: 'zalora'"
                    }
                ]
            }
        },

        bump: {
            options: {
                files: [
                    'package.json',
                    _configs.app + '/manifest.json'
                ],
                updateConfigs: [],
                commit: false,
                createTag: false,
                push: false
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-bump');

    grunt.registerTask('build', [
        'string-replace',

        'clean',
        'uglify:dist',

        'useminPrepare',
        'cssmin:generated',
        'concat:generated',
        'uglify:generated',
        'copy',

        'usemin',

        'compress'
    ]);

    grunt.registerTask('test', ['jshint', 'karma']);

    grunt.registerTask('default', ['test', 'build']);
};

