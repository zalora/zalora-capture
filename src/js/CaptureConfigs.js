/**
 * CaptureConfigs
 *
 * @author VinhLH
 * @copyright May 2015
 */

'use strict';

angular.module('CaptureConfigs', [])
.factory('CaptureConfigs', ['$rootScope', '$sce', function ($rootScope, $sce) {
    var _configs = {
        debugMode: true,
        liveReload: true,
        serverName: 'lehungvinh',
        serverUrl: 'https://{serverName}.atlassian.net',
        projectFilter: {
            'zalora': [ // project KEY
                'CORE',
                'SEAOPS',
                'SHOP',
                'ZOPS'
            ],
            'lehungvinh': [
                'OMS',
                'VP'
            ]
        },
        canvas: {
            colors: ['#c0392b', '#d35400', '#f39c12', '#f1c40f', '#16a085', '#2cc36b', '#2980b9', '#8e44ad', '#2c3e50', '#ecf0f1']
        },
        APIs: {
            auth: '/rest/auth/latest/session?os_authType=none',
            info: {
                projects: '/rest/api/2/project',
                priorities: '/rest/api/2/priority',
                issueTypes: '/rest/api/2/issuetype',
                // issueTypes: '/rest/api/2/issue/createmeta'
            },
            search: '/rest/api/2/search',
            searchIssue: '/rest/api/2/search?jql={query}&maxResults=1000&fields=id,key,summary',
            getAttachment: '/rest/api/2/issue/{issueId}?fields=attachment',
            createIssue: '/rest/api/2/issue',
            attachToIssue: '/rest/api/2/issue/{issueId}/attachments',
            logOut: '/rest/auth/latest/session',
        },
        app: {
            url: 'src/app.html'
        },
        storage: {
            prefix: 'com.zalora.capture.'
        },
        playback: {
            url: 'src/playback.html',
            type: 'popup',
            left: 5,
            top: 5,
            width: 500,
            height: 800
        },
        icons: {
            default: {
                "19": "images/icons/icon19.png"
            },
            recording: {
                "19": "images/icons/recording-icon19.png"
            }
        }
    },
    _initLiveReload = function () {
        if (window.location.href.indexOf('background.html') != -1) {
            return false;
        }

        angular.element(document).ready(function () {
            var script = document.createElement('script');
            script.src = 'http://localhost:35729/livereload.js?snipver=1';
            document.body.appendChild(script);
        });
    },
    _init = function () {
        if (_configs.liveReload) {
            _initLiveReload();
        }

        _configs.serverUrl = _configs.serverUrl.replace('{serverName}', _configs.serverName);
    };

    _init();

    return {
        get: function (group, key) {
            if (typeof _configs[group] === 'undefined') {
                throw "No group config '" + group + "'  available!";
            }

            if (typeof key === 'undefined') {
                return _configs[group];
            }

            if (typeof _configs[group][key] === 'undefined') {
                throw "No config '" + key + "'  available in group '" + group + "'!";
            }

            return _configs[group][key];
        }
    };
}]);

