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
        document.addEventListener('CaptureLog', _onError);
    },
    _initListener = function () {
        var _padStr = function(i) {
            return (i < 10) ? "0" + i : "" + i;
        },
        _getTime = function () {
            var temp = new Date();
            return _padStr(temp.getFullYear()) + '-'
                + _padStr(1 + temp.getMonth()) + '-'
                + _padStr(temp.getDate()) + ' '
                + _padStr(temp.getHours()) + ':'
                + _padStr(temp.getMinutes()) + ':'
                + _padStr(temp.getSeconds());
        },
        _getStackTrace = function() {
            var obj = {};
            Error.captureStackTrace(obj, _getStackTrace);
            return obj.stack;
        };

        // listern error event
        window.addEventListener('error', function (error) {
            document.dispatchEvent(new CustomEvent('CaptureLog', {
                detail: {
                    time: _getTime(),
                    type: 'error',
                    stack: error.error ? error.error.stack : null,
                    url: error.filename,
                    line: error.lineno,
                    col: error.colno,
                    text: error.message
                }
            }));
        });


        // override console's functions
        var backupConsole = window.console;

        window.console = {
            logs: []
        };

        for(var func in backupConsole) {
            if(typeof backupConsole[func] === 'function') {
                window.console[func] = (function (func) {
                    return function () {
                        document.dispatchEvent(new CustomEvent('CaptureLog', {
                            detail: {
                                time: _getTime(),
                                type: 'console.' + func,
                                stack: _getStackTrace(),
                                arguments: arguments
                            }
                        }));
                        backupConsole[func].apply(backupConsole, arguments);
                    };
                })(func);
            }
        };
    },
    _injectScript = function () {
        var script = document.createElement('script');
        script.textContent = '(' + _initListener + '())';
        (document.head || document.documentElement).appendChild(script);
        script.parentNode.removeChild(script);
    },
    _onError = function (data) {
        _errors.push(data.detail);
    },
    _onMessage = function (request, sender, sendResponse) {
        if (typeof request.type === 'undefined' || typeof _messageActions[request.type] === 'undefined') {
            return false;
        }

        var resp = _messageActions[request.type](request.data);

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
