describe('chrome service', function () {
    var barFunc = function () {},
        fooObject = {foo: 777},
        fooString = 'foo';

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
            chromeService.sendRequest(fooString, fooObject, function () {});
            chromeService.sendMessage(fooString, fooObject, function () {});
            chromeService.sendMessageToTab(777, fooString, fooObject, function () {});

            chromeService.setStorage(fooObject);
            chromeService.getStorage(fooObject);

            chromeService.addMessageListener({foo: function () {}});

            chromeService.createWindow(fooObject);
            chromeService.createWindow(fooObject, barFunc);
            chromeService.getWindow(777);
            chromeService.getWindow(777, barFunc);
            chromeService.updateWindow(777, fooObject);

            done();
        });
    });

    it('format of sent runtime message was right', function () {
        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({type: fooString, data: fooObject}, jasmine.any(Function));
    });

    it('format of sent tab message was right', function () {
        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(777, {type: fooString, data: fooObject}, jasmine.any(Function));
    });

    it('format of sent extension request was right', function () {
        expect(chrome.extension.sendRequest).toHaveBeenCalledWith({command: fooString, params: fooObject}, jasmine.any(Function));
    });

    it('chrome.storage.sync.get was called', function () {
        expect(chrome.storage.sync.get).toHaveBeenCalledWith(fooObject, undefined);
    });

    it('chrome.storage.sync.set was called', function () {
        expect(chrome.storage.sync.set).toHaveBeenCalledWith(fooObject, undefined);
    });

    it('chrome.runtime.onMessage.addListener was called with right arguments', function () {
        expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(jasmine.any(Function));
    });

    it('chrome.windows.create was called', function () {
        expect(chrome.windows.create).toHaveBeenCalledWith(fooObject, undefined);
    });

    it('chrome.windows.create was called with callback', function () {
        expect(chrome.windows.create).toHaveBeenCalledWith(fooObject, barFunc);
    });

    it('chrome.windows.get was called', function () {
        expect(chrome.windows.get).toHaveBeenCalledWith(777, undefined);
    });

    it('chrome.windows.get was called with callback', function () {
        expect(chrome.windows.get).toHaveBeenCalledWith(777, barFunc);
    });

    it('chrome.windows.update was called', function () {
        expect(chrome.windows.update).toHaveBeenCalledWith(777, fooObject);
    });

});