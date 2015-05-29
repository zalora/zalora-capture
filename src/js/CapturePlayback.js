/**
 * CapturePlayback
 *
 * @author VinhLH
 */

"use strict";

var app = angular.module('CapturePlayback', ['Jira', 'ngPrism']);

app.controller('MainController', ['$scope', 'JiraAPIs', function ($scope, JiraAPIs) {
    $scope.projects = null;
    $scope.issues = null;
    $scope.scripts = null;
    $scope.scriptKeys = null;
    $scope.selected = {
        'project': null
    };

    $scope.loading = 'Fetching project list..';
    JiraAPIs.getProjects(function (resp) {
        $scope.projects = resp;
        $scope.loading = null;

        if ($scope.projects.length) {
            $scope.selected['project'] = $scope.projects[0].id;
            $scope.getIssues();
        }
    });

    $scope.getIssues = function () {
        $scope.loading = 'Fetching issue list..';
        $scope.issues = null;

        JiraAPIs.getIssues($scope.selected['project'], function (resp) {
            $scope.issues = resp.issues;
            $scope.loading = null;

            if ($scope.issues.length) {
                $scope.selected['issue'] = '10130';
                // $scope.selected['issue'] = $scope.issues[0].id;
                $scope.getScripts();
            }
        });
    };

    $scope.getScripts = function () {
        $scope.loading = 'Fetching script list..';
        $scope.scripts = null;
        $scope.scriptKeys = null;

        JiraAPIs.getScripts($scope.selected['issue'], function (resp) {
            $scope.scripts = resp;
            $scope.loading = null;

            $scope.scriptKeys = Object.keys($scope.scripts);
            if ($scope.scriptKeys.length) {
                $scope.selected['script'] = $scope.scripts[$scope.scriptKeys[0]].id;
                $scope.getScriptDetail();
            }
        });
    };

    $scope.getScriptDetail = function () {
        if (!$scope.selected['script']) {
            return;
        }

        $scope.loading = 'Fetching script detail..';
        $scope.startUrl = null;

        JiraAPIs.getJsonFromUrl($scope.scripts[$scope.selected['script']].content, function (resp) {
            $scope.loading = null;
            $scope.actions = resp.script.join("\n").trim();
            $scope.startUrl = resp.startUrl;
        });
    };
}]);

