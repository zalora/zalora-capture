var CapturePopup = (function (CaptureStorage) {
    var _el = {};

    var _init = function () {
        _el = {
            start: document.getElementById('start-record'),
            stop: document.getElementById('stop-record'),
            report: document.getElementById('report-bug')
        };

        _el.start.addEventListener('click', function () {
            _startRecord();
            CaptureStorage.saveData({recording: true});
        });

        _el.stop.addEventListener('click', function () {
            _stopRecord();
            CaptureStorage.saveData({recording: false});
        });

        _el.report.addEventListener('click', function () {
            _reportBug();
        });

        var isRecording = false;

        CaptureStorage.getData('recording', function (data) {
            console.log(data);
            if (data && data.recording) {
                isRecording = data.recording;
            }

            if (isRecording) {
                _el.start.style.display = "none";
                _el.stop.style.display = "block";
            } else {
                _el.stop.style.display = "none";
                _el.start.style.display = "block";
            }

        });
    },
    _startRecord = function () {
        chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
            console.log(tab);
            chrome.runtime.sendMessage({
                type: 'startRecording',
                data: {
                    tabId: tab[0].id,
                    windowId: tab[0].windowId
                }
            });

            _el.start.style.display = "none";
            _el.stop.style.display = "block";
        });
    },
    _stopRecord = function () {
        chrome.runtime.sendMessage({
            type: 'stopRecording'
        });

        _el.stop.style.display = "none";
        _el.start.style.display = "block";
    };
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

