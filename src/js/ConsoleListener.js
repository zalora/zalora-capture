/**
 * ConsoleListener
 *
 * @author VinhLH
 * @copyright Jun 2015
 */

'use strict';

var ConsoleListener = (function () {
    var _errors = [],
    _init = function () {
        // console.log('addListener');
        chrome.runtime.onMessage.addListener(_onMessage);

        // init error listener
        _errors = [];
        _injectScript();
        document.addEventListener('CaptureError', _onError);
    },
    _initListener = function () {
        window.addEventListener('error', function (error) {
            // console.log(error);

            document.dispatchEvent(new CustomEvent('CaptureError', {
                detail: {
                    stack: error.error ? error.error.stack : null,
                    url: error.filename,
                    line: error.lineno,
                    col: error.colno,
                    text: error.message
                }
            }));
        });
    },
    _injectScript = function () {
        var script = document.createElement('script');
        script.textContent = '(' + _initListener + '())';
        (document.head || document.documentElement).appendChild(script);
        script.parentNode.removeChild(script);
    },
    _onError = function (data) {
        _errors.push(data.detail);
        // console.log('captureError', data);
        // console.log(_errors);
    },
    _onMessage = function (request, sender, sendResponse) {
        // console.log('[ConsoleListener] comming request > ', request, sender);
        if (typeof request.type === 'undefined' || typeof _messageActions[request.type] === 'undefined') {
            return false;
        }

        var resp = _messageActions[request.type](request.data);
        // console.log('[ConsoleListener] send response > ', resp);

        sendResponse(resp);
    },
    _messageActions = {
        getErrors: function (data) {
            return _errors;
        }
    };

    return {
        init: _init
    };
})();

ConsoleListener.init();
