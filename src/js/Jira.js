/**
 * Jira
 *
 * @author VinhLH
 */

"use strict";

angular.module('Jira', []).factory('JiraAPIs', ['$http', '$filter', function($http, $filter){
    var _configs = {
        APIs: CaptureConfigs.get('APIs')
    }, _data = {}, _reporterId = null;

    var _setServer = function (server) {
        _data['server'] = server;
    },
    _auth = function (server, username, password, onSuccess, onError) {
        $http.post(server + _configs.APIs.auth, {
            username: username,
            password, password
        }).success(function (data, status) {
            console.log(data, status);

            _reporterId = data.name;
            _setServer(server);
            typeof onSuccess !== 'undefined' &&  onSuccess(data, status);
        }).error(function (data, status) {
            console.log(data, status);
            typeof onError !== 'undefined' && onError(data, status);
        });
    },
    _getCurUser = function (server, onSuccess, onError) {
        $http.get(server + _configs.APIs.auth).success(function (data, status) {
            _reporterId = data.name;
            _setServer(server);
            typeof onSuccess !== 'undefined' &&  onSuccess(data, status);
        }).error(function (data, status) {
            console.log(data, status);
            typeof onError !== 'undefined' && onError(data, status);
        });
    },
    _parseAPIData = function (data, type) {
        if (type == 'issue_types') {
            return data['projects'][0]['issuetypes'];
        }
        return data;
    },
    _fetchAllAtlassianInfo = function (callback) {
        angular.forEach(_configs.APIs.info, function(value, key){
            _basicGet(value, function (resp) {
                console.log('[set]', key, resp);
                callback(key, resp);
            });
        });
    },
    _generateMetaData = function (isIncludeEnv, callback) {
        if (!isIncludeEnv) {
            callback('');
            return;
        }

        var URLs;
        CaptureStorage.getData('source_url', function (results) {
            URLs = results['source_url'];
            var screenRes = screen.width + 'x' + screen.height,
                userAgent = navigator.userAgent;

            var data = "\n\n\n *Zalora Capture Environment Information* \n- URL: " + URLs + "\n- Screen Resolution: " + screenRes + "\n- User Agent: " + userAgent;
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
            $http.post(_data['server'] + _configs.APIs.create_issue, data).success(function (resp) {
                onSuccess(resp);
            }).error(function (resp) {
                onError(resp);
            });
        });
    },
    _dataURLToBlob = function(dataURL) {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = decodeURIComponent(parts[1]);

            return new Blob([raw], {type: contentType});
        }

        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
    },
    _attachToIssue = function (key, data, fileName, onSuccess, onError) {
        var url = _data['server'] + _configs.APIs.attach_to_issue.replace('{issueId}', key);

        var fd = new FormData(),
            fileName = fileName.replace('%s', $filter('date')(Date.now(), "yyyy-MM-dd 'at' h:mma"));

        fd.append('file', data, fileName);

        console.log(fileName);

        $http.post(url, fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined,
                'X-Atlassian-Token': 'nocheck'
            }
        }).success(function (resp) {
            typeof onSuccess !== 'undefined' && onSuccess(resp);
        }).error(function (resp) {
            typeof onError !== 'undefined' && onError(resp);
        });
    },
    _attachScreenshotToIssue = function (key, data, onSuccess, onError) {
        _attachToIssue(key, _dataURLToBlob(data), 'Screen Shot %s.png', onSuccess, onError);
    },
    _attachRecordingData = function (key, data, onSuccess, onError) {
        var data = new Blob([JSON.stringify(data)], {
            type: 'application/json'
        });
        _attachToIssue(key, data, 'Recording Data %s.json', onSuccess, onError);
    },
    _logOut = function (onSuccess, onError) {
        $http.delete(_data['server'] + _configs.APIs.log_out).success(function (resp) {
            onSuccess(resp);
        });
    },
    _basicGet = function (url, onSuccess, onError) {
        async.series([
            function (callback) {
                if (!_data['server']) {
                    CaptureStorage.getData('server', function (resp) {
                        _data['server'] = resp.server;
                        callback(null, null);
                    });
                } else {
                    callback(null, null);
                }
            },
            function (callback) {
                $http.get(_data['server'] + url).success(function (resp) {
                    typeof onSuccess !== 'undefined' && onSuccess(resp);
                    callback(null, null);
                }).error(function (resp) {
                    typeof onError !== 'undefined' && onError(resp);
                    callback(null, null);
                });
            }
        ]);
    },
    _getProjects = function (onSuccess, onError) {
        _basicGet(_configs.APIs.info.projects, onSuccess, onError);
    },
    _getIssues = function (projectId, onSuccess, onError) {
        _basicGet(_configs.APIs['search_issue'].replace('{projectId}', projectId), onSuccess, onError);
    },
    _getAttachments = function (issueId, onSuccess, onError) {
        _basicGet(_configs.APIs['get_attachment'].replace('{issueId}', issueId), onSuccess, onError);
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
        generateMetaData: _generateMetaData,
        logOut: _logOut,
        getProjects: _getProjects,
        getIssues: _getIssues,
        getAttachments: _getAttachments,
        getScripts: _getScripts,
        getJsonFromUrl: _getJsonFromUrl
    };
}]);
