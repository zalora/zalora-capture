/**
 * CaptureConfigs
 *
 * @author VinhLH
 */

'use strict';

var CaptureConfigs = (function () {
    var _configs = {
        canvas: {
            colors: ['#c0392b', '#d35400', '#f39c12', '#f1c40f', '#16a085', '#2cc36b', '#2980b9', '#8e44ad', '#2c3e50', '#ecf0f1']
        },
        APIs: {
            auth: '/rest/auth/latest/session?os_authType=none',
            info: {
                projects: '/rest/api/2/project',
                priorities: '/rest/api/2/priority',
                issue_types: '/rest/api/2/issuetype',
                // issue_types: '/rest/api/2/issue/createmeta'
            },
            search: '/rest/api/2/search',
            search_issue: '/rest/api/2/search?jql=project={projectId}&maxResults=1000&fields=id,key,summary',
            get_attachment: '/rest/api/2/issue/{issueId}?fields=attachment',
            create_issue: '/rest/api/2/issue',
            attach_to_issue: '/rest/api/2/issue/{issueId}/attachments',
            log_out: '/rest/auth/latest/session',
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
    };

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
})();