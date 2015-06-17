describe('chrome service', function () {
    var bar = function () {};

    beforeEach(module('app.core'));

    beforeEach(function (done) {
        chrome = {
            runtime: {
                sendMessage: function () {},
                onMessage: {
                    addListener: function () {}
                }
            },
            extension: {
                sendRequest: function () {}
            },
            tabs: {
                sendMessage: function () {}
            },
            storage: {
                sync: {
                    get: function () {},
                    set: function () {}
                }
            },
            windows: {
                create: function () {},
                get: function () {},
                update: function () {},
            }
        };

        spyOn(chrome.runtime, 'sendMessage');
        spyOn(chrome.tabs, 'sendMessage');
        spyOn(chrome.extension, 'sendRequest');

        spyOn(chrome.storage.sync, 'get');
        spyOn(chrome.storage.sync, 'set');

        spyOn(chrome.runtime.onMessage, 'addListener');

        spyOn(chrome.windows, 'create');
        spyOn(chrome.windows, 'get');
        spyOn(chrome.windows, 'update');

        done();
    });

    beforeEach(function (done) {
        inject(function (chromeService) {
            chromeService.sendRequest('foo', {bar: true}, function () {});
            chromeService.sendMessage('foo', {bar: true}, function () {});
            chromeService.sendMessageToTab(777, 'foo', {bar: true}, function () {});

            chromeService.setStorage({foo: true});
            chromeService.getStorage({foo: true});

            chromeService.addMessageListener({foo: function () {}});

            chromeService.createWindow({foo: true});
            chromeService.createWindow({foo: true}, bar);
            chromeService.getWindow(777);
            chromeService.getWindow(777, bar);
            chromeService.updateWindow(777, {foo: true});

            done();
        });
    });

    it('format of sent runtime message was right', function () {
        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({type: 'foo', data: {bar: true}}, jasmine.any(Function));
    });

    it('format of sent tab message was right', function () {
        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(777, {type: 'foo', data: {bar: true}}, jasmine.any(Function));
    });

    it('format of sent extension request was right', function () {
        expect(chrome.extension.sendRequest).toHaveBeenCalledWith({command: 'foo', params: {bar: true}}, jasmine.any(Function));
    });

    it('chrome.storage.sync.get was called', function () {
        expect(chrome.storage.sync.get).toHaveBeenCalledWith({foo: true}, undefined);
    });

    it('chrome.storage.sync.set was called', function () {
        expect(chrome.storage.sync.set).toHaveBeenCalledWith({foo: true}, undefined);
    });

    it('chrome.runtime.onMessage.addListener was called with right arguments', function () {
        expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(jasmine.any(Function));
    });

    it('chrome.windows.create was called', function () {
        expect(chrome.windows.create).toHaveBeenCalledWith({foo: true}, undefined);
    });

    it('chrome.windows.create was called with callback', function () {
        expect(chrome.windows.create).toHaveBeenCalledWith({foo: true}, bar);
    });

    it('chrome.windows.get was called', function () {
        expect(chrome.windows.get).toHaveBeenCalledWith(777, undefined);
    });

    it('chrome.windows.get was called with callback', function () {
        expect(chrome.windows.get).toHaveBeenCalledWith(777, bar);
    });

    it('chrome.windows.update was called', function () {
        expect(chrome.windows.update).toHaveBeenCalledWith(777, {foo: true});
    });

});