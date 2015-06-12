/**
 * Jira
 *
 * @author VinhLH
 */

'use strict';

var jira = angular.module('Jira', ['CaptureConfigs', 'CaptureStorage']);

jira.factory('JiraAPIs', ['$http', '$filter', 'CaptureConfigs', 'CaptureStorage', function($http, $filter, CaptureConfigs, CaptureStorage){
    var _configs = {
        APIs: CaptureConfigs.get('APIs')
    }, _data = {}, _reporterId = null;

    var _setServer = function (server) {
        _data.server = server;
    },
    _auth = function (server, username, password, onSuccess, onError) {
        var data = {
            username: username,
            password: password
        };
        $http.post(server + _configs.APIs.auth, data).success(function (data, status) {
            console.log(data, status);

            _reporterId = data.name;
            _setServer(server);
            if (onSuccess !== 'undefined') {
                onSuccess(data, status);
            }
        }).error(function (data, status) {
            console.log(data, status);
            if (typeof onError !== 'undefined') {
                onError(data, status);
            }
        });
    },
    _getCurUser = function (server, onSuccess, onError) {
        $http.get(server + _configs.APIs.auth).success(function (data, status) {
            _reporterId = data.name;
            _setServer(server);
            if (onSuccess !== 'undefined') {
                onSuccess(data, status);
            }
        }).error(function (data, status) {
            console.log(data, status);
            if (typeof onError !== 'undefined') {
                onError(data, status);
            }
        });
    },
    _parseAPIData = function (data, type) {
        if (type == 'issueTypes') {
            return data.projects[0].issuetypes;
        }
        return data;
    },
    _filterProject = function (data) {
        var projects = [],
            filter,
            serverName,
            filterProjects;

        filter = CaptureConfigs.get('projectFilter');
        serverName = CaptureConfigs.get('serverName');
        if (!filter[serverName]) {
            return data;
        }

        filterProjects = filter[serverName];

        for (var i = 0; i < data.length; i++) {
            if (filterProjects.indexOf(data[i].key) !== -1) {
                projects.push(data[i]);
            }
        }

        return projects;
    },
    _fetchAllAtlassianInfo = function (callback) {
        angular.forEach(_configs.APIs.info, function(value, key){
            _basicGet(value, function (resp) {
                if (key == 'projects') {
                    resp = _filterProject(resp);
                }
                callback(key, resp);
            });
        });
    },
    _generateMetaData = function (isIncludeEnv, callback) {
        if (!isIncludeEnv) {
            callback('');
            return;
        }

        CaptureStorage.getData('sourceUrl', function (results) {
            var URLs, screenRes, data;

            URLs = results.sourceUrl;
            screenRes = window.screen.width + 'x' + window.screen.height;

            data = "\n\n\n *Zalora Capture Environment Information* \n- URL: " + URLs + "\n- Screen Resolution: " + screenRes + "\n- User Agent: " + window.navigator.userAgent;
            callback(data);
        });
    },
    _createIssue = function (projectId, issueTypeId, priorityId, summary, description, isIncludeEnv, onSuccess, onError) {
        _generateMetaData(isIncludeEnv, function (metaData) {
            var data = {
                fields: {
                    summary: summary,
                    description: description + metaData,
                    priority: {
                        id: priorityId
                    },
                    project: {
                        id: projectId
                    },
                    issuetype: {
                        id: issueTypeId
                    }
                }
            };
            // console.log(data); return;
            $http.post(_data.server + _configs.APIs.createIssue, data).success(function (resp) {
                onSuccess(resp);
            }).error(function (resp) {
                onError(resp);
            });
        });
    },
    _dataURLToBlob = function(dataURL) {
        var contentType,
            raw,
            parts,
            rawLength,
            uInt8Array,
            BASE64_MARKER = ';base64,';

        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            parts = dataURL.split(',');
            contentType = parts[0].split(':')[1];
            raw = decodeURIComponent(parts[1]);

            return new Blob([raw], {type: contentType});
        }

        parts = dataURL.split(BASE64_MARKER);
        contentType = parts[0].split(':')[1];
        raw = window.atob(parts[1]);
        rawLength = raw.length;

        uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
    },
    _postAttachmentToIssue = function (url, fd, onSuccess, onError) {
        $http.post(url, fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined,
                'X-Atlassian-Token': 'nocheck'
            }
        }).success(function (resp) {
            if (onSuccess) {
                onSuccess(resp);
            }
        }).error(function (resp) {
            if (onError) {
                onError(resp);
            }
        });
    },
    _addAttachmentToIssue = function (key, data, fileName, onSuccess, onError) {
        var url = _data.server + _configs.APIs.attachToIssue.replace('{issueId}', key);

        var fd = new FormData();

        fileName = fileName.replace('%s', $filter('date')(Date.now(), "yyyy-MM-dd 'at' h:mma"));
        fd.append('file', data, fileName);

        _postAttachmentToIssue(url, fd, onSuccess, onError);
    },
    _addMultipleAttachmentsToIssue = function (key, files, onSuccess, onError) {
        var url = _data.server + _configs.APIs.attachToIssue.replace('{issueId}', key);

        var fd = new FormData();
        for (var i = 0; i < files.length; i++) {
            fd.append('file', files[i]._file, files[i]._file.name);
        }

        _postAttachmentToIssue(url, fd, onSuccess, onError);
    },
    _attachScreenshotToIssue = function (key, data, onSuccess, onError) {
        _addAttachmentToIssue(key, _dataURLToBlob(data), 'Screen Shot %s.png', onSuccess, onError);
    },
    _attachImages = function (key, files, onSuccess, onError) {
        _addMultipleAttachmentsToIssue(key, files, onSuccess, onError);
    },
    _attachJsonData = function (prefix, key, data, onSuccess, onError) {
        data = new Blob([JSON.stringify(data)], {
            type: 'application/json'
        });
        _addAttachmentToIssue(key, data, prefix + ' %s.json', onSuccess, onError);
    },
    _attachRecordingData = function (key, data, onSuccess, onError) {
        _attachJsonData('Recording Data', key, data, onSuccess, onError);
    },
    _attachJavascriptErrors = function (key, data, onSuccess, onError) {
        _attachJsonData('Javascript errors', key, data, onSuccess, onError);
    },

    _logOut = function (onSuccess, onError) {
        $http.delete(_data.server + _configs.APIs.logOut).success(function (resp) {
            onSuccess(resp);
        });
    },
    _basicGet = function (url, onSuccess, onError) {
        $http.get(_data.server + url).success(function (resp) {
            if (typeof onSuccess !== 'undefined') {
                onSuccess(resp);
            }
        }).error(function (resp) {
            if (typeof onError !== 'undefined') {
                onError(resp);
            }
        });
    },
    _getProjects = function (onSuccess, onError) {
        _basicGet(_configs.APIs.info.projects, onSuccess, onError);
    },
    _getIssues = function (projectId, onSuccess, onError) {
        var query = encodeURIComponent('project=' + projectId + ' and status != Resolved and status != Closed');
        _basicGet(_configs.APIs.searchIssue.replace('{query}', query), onSuccess, onError);
    },
    _getAttachments = function (issueId, onSuccess, onError) {
        _basicGet(_configs.APIs.getAttachment.replace('{issueId}', issueId), onSuccess, onError);
    },
    _getScripts = function (issueId, onSuccess, onError) {
        _getAttachments(issueId, function (resp) {
            var results = {};
            for (var key in resp.fields.attachment) {
                var attach = resp.fields.attachment[key];
                if (attach.mimeType == 'application/json' && attach.filename.indexOf('Recording Data') != -1) {
                    results[attach.id] = attach;
                }
            }

            onSuccess(results);
        }, function (resp) {
            onError(resp);
        });
    },
    _getJsonFromUrl = function (url, onSuccess, onError) {
        $http.get(url).success(function (resp) {
            onSuccess(resp);
        }).error(function (resp) {
            onError(resp);
        });
    };

    return {
        auth: _auth,
        getCurUser: _getCurUser,
        fetchAllAtlassianInfo: _fetchAllAtlassianInfo,
        createIssue: _createIssue,
        attachScreenshotToIssue: _attachScreenshotToIssue,
        attachRecordingData: _attachRecordingData,
        attachJavascriptErrors: _attachJavascriptErrors,
        attachImages: _attachImages,
        generateMetaData: _generateMetaData,
        logOut: _logOut,
        getProjects: _getProjects,
        getIssues: _getIssues,
        getAttachments: _getAttachments,
        getScripts: _getScripts,
        getJsonFromUrl: _getJsonFromUrl,
        setServer: _setServer,
        filterProject: _filterProject
    };
}]);
