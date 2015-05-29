/**
 * CapturePlayback
 *
 * @author VinhLH
 */

"use strict";

var app = angular.module('CapturePlayback', ['Jira', 'ngPrism']);

app.controller('MainController', ['$scope', 'JiraAPIs', function ($scope, JiraAPIs) {
    $scope.projects = {};
    $scope.issues = {};
    $scope.scripts = {};
    $scope.scriptKeys = {};
    $scope.selected = {
        'project': null
    };

    JiraAPIs.getProjects(function (resp) {
        $scope.projects = resp;

        if ($scope.projects.length) {
            $scope.selected['project'] = $scope.projects[0].id;
            $scope.getIssues();
        }
    });

    $scope.getIssues = function () {
        JiraAPIs.getIssues($scope.selected['project'], function (resp) {
            $scope.issues = resp.issues;

            if ($scope.issues.length) {
                $scope.selected['issue'] = '10130';
                // $scope.selected['issue'] = $scope.issues[0].id;
                $scope.getScripts();
            }
        });
    };

    $scope.getScripts = function () {
        JiraAPIs.getScripts($scope.selected['issue'], function (resp) {
            $scope.scripts = resp;

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

        JiraAPIs.getJsonFromUrl($scope.scripts[$scope.selected['script']].content, function (resp) {
            console.log(resp);
            $scope.actions = resp.script.join("\n").trim();
            $scope.startUrl = resp.startUrl;
        });
    };
}]);

