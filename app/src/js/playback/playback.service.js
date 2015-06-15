/**
 * Playback Service
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

(function() {
    'use strict';

    angular
        .module('app.playback')
        .factory('playbackService', playbackService);

    playbackService.$inject = ['chromeService', '$rootScope'];

    /* @ngInject */
    function playbackService(chromeService, $rootScope) {
        var service = {
            handlers: handlers
        }, handlers = {
            updatePlaybackStatus: actionUpdatePlaybackStatus,
            updateCurrentStep: actionUpdateCurrentStep,
            updateWhenOnFailed: actionUpdateWhenOnFailed
        };

        init();

        return service;

        ////////////////

        function init() {
            chromeService.addMessageListener(handlers);
        }

        function actionUpdatePlaybackStatus (resp) {
            console.log('actionUpdatePlaybackStatus');
            $rootScope.$apply(function () {
                $rootScope.playbackStatus.push(resp);
            });
        }

        function actionUpdateCurrentStep (resp) {
            $rootScope.$apply(function () {
                $rootScope.currentStep = resp.curStep + 1;
            });
        }

        function actionUpdateWhenOnFailed (resp) {
            $rootScope.$apply(function () {
                $rootScope.currentStep = resp.currentStep;
                $rootScope.playbackStatus.push({
                    text: 'Failed to execute this command!',
                    color: 'red'
                });
            });
        }

    }
})();