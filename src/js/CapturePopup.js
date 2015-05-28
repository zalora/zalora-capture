/**
 * CapturePopup
 *
 * @author VinhLH
 */

"use strict";

var CapturePopup = (function (CaptureStorage) {
    var _el = {};

    var _init = function () {
        _el = {
            start: document.getElementById('start-record'),
            stop: document.getElementById('stop-record'),
            report: document.getElementById('report-bug'),
            alert: document.getElementById('alert')
        };

        _el.start.addEventListener('click', function () {
            _setRecordingTab();
        });

        _el.stop.addEventListener('click', function () {
            _stopRecord();
        });

        _el.report.addEventListener('click', function () {
            _reportBug();
        });

        var isRecording = false;

        chrome.runtime.sendMessage({
            type: 'isRecording',
            data: {}
        }, function (isRecording) {
            console.log(isRecording);
            if (isRecording) {
                _el.start.style.display = "none";
                _el.stop.style.display = "block";
            } else {
                _el.stop.style.display = "none";
                _el.start.style.display = "block";
            }

        });
    },
    _setRecordingTab = function () {
        chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
            chrome.runtime.sendMessage({// createRpfWindow
                type: 'setRecordingTab',
                data: tab[0]
            }, function (resp) {
                if (resp) {
                    _el.alert.style.display = "none";

                    CaptureStorage.saveData({recoding_start_url: tab[0].url});
                    _startRecord();
                } else {
                    _el.alert.style.display = "block";
                }
            });
        });
    },
    _startRecord = function () {
        chrome.runtime.sendMessage({
            type: 'startRecording',
            data: {}
        }, function (resp) {

        });

        _el.start.style.display = "none";
        _el.stop.style.display = "block";
    },
    _stopRecord = function () {
        chrome.runtime.sendMessage({
            type: 'stopRecording'
        }, function (resp) {

        });

        _el.stop.style.display = "none";
        _el.start.style.display = "block";
    },
    _reportBug = function () {
        chrome.runtime.sendMessage({
            type: 'reportBug'
        });
    };

    return {
        init: _init,
        startRecord: _startRecord,
        stopRecord: _stopRecord
    }
})(CaptureStorage);

document.addEventListener('DOMContentLoaded', function () {
    CapturePopup.init();
});

