/**
 * Jira Service
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.apis')
        .factory('jiraService', jiraService);

    jiraService.$inject = ['configService', 'storageService', '$http', '$filter'];

    /* @ngInject */
    function jiraService(configService, storageService, $http, $filter) {
        var service = {
            auth: auth,
            getCurUser: getCurUser,
            fetchAllAtlassianInfo: fetchAllAtlassianInfo,
            createIssue: createIssue,
            attachScreenshotToIssue: attachScreenshotToIssue,
            attachRecordingData: attachRecordingData,
            attachJavascriptErrors: attachJavascriptErrors,
            attachImages: attachImages,
            generateMetaData: generateMetaData,
            logOut: logOut,
            getProjects: getProjects,
            getIssues: getIssues,
            getAttachments: getAttachments,
            getScripts: getScripts,
            getJsonFromUrl: getJsonFromUrl,
            setServer: setServer,
            filterProject: filterProject
        },
        configs = {
            APIs: configService.get('APIs')
        },
        reporterId = null;

        return service;

        ////////////////

        function setServer (server) {
            configs.server = server;
        }

        function auth (server, username, password, onSuccess, onError) {
            var data = {
                username: username,
                password: password
            };
            $http.post(server + configs.APIs.auth, data).success(function (data, status) {
                console.log(data, status);

                reporterId = data.name;
                setServer(server);
                if (onSuccess !== 'undefined') {
                    onSuccess(data, status);
                }
            }).error(function (data, status) {
                console.log(data, status);
                if (typeof onError !== 'undefined') {
                    onError(data, status);
                }
            });
        }

        function getCurUser (server, onSuccess, onError) {
            $http.get(server + configs.APIs.auth).success(function (data, status) {
                reporterId = data.name;
                setServer(server);
                if (onSuccess !== 'undefined') {
                    onSuccess(data, status);
                }
            }).error(function (data, status) {
                console.log(data, status);
                if (typeof onError !== 'undefined') {
                    onError(data, status);
                }
            });
        }

        function parseAPIData (data, type) {
            if (type == 'issueTypes') {
                return data.projects[0].issuetypes;
            }
            return data;
        }

        function filterProject (data) {
            var projects = [],
                filter,
                serverName,
                filterProjects;

            filter = configService.get('projectFilter');
            serverName = configService.get('serverName');
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
        }

        function fetchAllAtlassianInfo (callback) {
            angular.forEach(configs.APIs.info, function(value, key){
                basicGet(value, function (resp) {
                    if (key == 'projects') {
                        resp = filterProject(resp);
                    }
                    callback(key, resp);
                });
            });
        }

        function generateMetaData (isIncludeEnv, callback) {
            if (!isIncludeEnv) {
                callback('');
                return;
            }

            storageService.getData('sourceUrl', function (results) {
                var URLs, screenRes, data;

                URLs = results.sourceUrl;
                screenRes = window.screen.width + 'x' + window.screen.height;

                data = "\n\n\n *Zalora Capture Environment Information* \n- URL: " + URLs + "\n- Screen Resolution: " + screenRes + "\n- User Agent: " + window.navigator.userAgent;
                callback(data);
            });
        }

        function createIssue (projectId, issueTypeId, priorityId, summary, description, isIncludeEnv, onSuccess, onError) {
            generateMetaData(isIncludeEnv, function (metaData) {
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
                $http.post(configs.server + configs.APIs.createIssue, data).success(function (resp) {
                    onSuccess(resp);
                }).error(function (resp) {
                    onError(resp);
                });
            });
        }

        function dataURLToBlob (dataURL) {
            var contentType,
                raw,
                parts,
                rawLength,
                uInt8Array,
                BASE64MARKER = ';base64,';

            if (dataURL.indexOf(BASE64MARKER) == -1) {
                parts = dataURL.split(',');
                contentType = parts[0].split(':')[1];
                raw = decodeURIComponent(parts[1]);

                return new Blob([raw], {type: contentType});
            }

            parts = dataURL.split(BASE64MARKER);
            contentType = parts[0].split(':')[1];
            raw = window.atob(parts[1]);
            rawLength = raw.length;

            uInt8Array = new Uint8Array(rawLength);

            for (var i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }

            return new Blob([uInt8Array], {type: contentType});
        }

        function postAttachmentToIssue (url, fd, onSuccess, onError) {
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
        }

        function addAttachmentToIssue (key, data, fileName, onSuccess, onError) {
            var url = configs.server + configs.APIs.attachToIssue.replace('{issueId}', key);

            var fd = new FormData();

            fileName = fileName.replace('%s', $filter('date')(Date.now(), "yyyy-MM-dd 'at' h:mma"));
            fd.append('file', data, fileName);

            postAttachmentToIssue(url, fd, onSuccess, onError);
        }

        function addMultipleAttachmentsToIssue (key, files, onSuccess, onError) {
            var url = configs.server + configs.APIs.attachToIssue.replace('{issueId}', key);

            var fd = new FormData();
            for (var i = 0; i < files.length; i++) {
                fd.append('file', files[i]._file, files[i]._file.name);
            }

            postAttachmentToIssue(url, fd, onSuccess, onError);
        }

        function attachScreenshotToIssue (key, data, onSuccess, onError) {
            addAttachmentToIssue(key, dataURLToBlob(data), 'Screen Shot %s.png', onSuccess, onError);
        }

        function attachImages (key, files, onSuccess, onError) {
            addMultipleAttachmentsToIssue(key, files, onSuccess, onError);
        }

        function attachJsonData (prefix, key, data, onSuccess, onError) {
            data = new Blob([JSON.stringify(data)], {
                type: 'application/json'
            });
            addAttachmentToIssue(key, data, prefix + ' %s.json', onSuccess, onError);
        }

        function attachRecordingData (key, data, onSuccess, onError) {
            attachJsonData('Recording Data', key, data, onSuccess, onError);
        }

        function attachJavascriptErrors (key, data, onSuccess, onError) {
            attachJsonData('Javascript errors', key, data, onSuccess, onError);
        }

        function logOut (onSuccess, onError) {
            $http.delete(configs.server + configs.APIs.logOut).success(function (resp) {
                onSuccess(resp);
            });
        }

        function basicGet (url, onSuccess, onError) {
            $http.get(configs.server + url).success(function (resp) {
                if (typeof onSuccess !== 'undefined') {
                    onSuccess(resp);
                }
            }).error(function (resp) {
                if (typeof onError !== 'undefined') {
                    onError(resp);
                }
            });
        }

        function getProjects (onSuccess, onError) {
            basicGet(configs.APIs.info.projects, onSuccess, onError);
        }

        function getIssues (projectId, onSuccess, onError) {
            var query = encodeURIComponent('project=' + projectId + ' and status != Resolved and status != Closed');
            basicGet(configs.APIs.searchIssue.replace('{query}', query), onSuccess, onError);
        }

        function getAttachments (issueId, onSuccess, onError) {
            basicGet(configs.APIs.getAttachment.replace('{issueId}', issueId), onSuccess, onError);
        }

        function getScripts (issueId, onSuccess, onError) {
            getAttachments(issueId, function (resp) {
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
        }

        function getJsonFromUrl (url, onSuccess, onError) {
            $http.get(url).success(function (resp) {
                onSuccess(resp);
            }).error(function (resp) {
                onError(resp);
            });
        }
    }
})();
