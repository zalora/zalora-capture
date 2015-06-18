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
                },
                lastError: fooString
            },
            extension: {
                sendRequest: function () {}
            },
            tabs: {
                sendMessage: function () {},
                create: function () {},
                get: function () {},
                update: function () {},
                query: function () {},
                captureVisibleTab: function () {}
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

        spyOn(chrome.tabs, 'create');
        spyOn(chrome.tabs, 'get');
        spyOn(chrome.tabs, 'update');
        spyOn(chrome.tabs, 'query');
        spyOn(chrome.tabs, 'captureVisibleTab');

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

            chromeService.createTab(fooObject);
            chromeService.createTab(fooObject, barFunc);
            chromeService.getTab(777);
            chromeService.getTab(777, barFunc);
            chromeService.updateTab(777, fooObject);
            chromeService.queryTab(fooObject);
            chromeService.queryTab(fooObject, barFunc);
            chromeService.captureVisibleTab(777, fooObject);
            chromeService.captureVisibleTab(777, fooObject, barFunc);

            lastError = chromeService.getLastError();

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

    it('chrome.tabs.create was called', function () {
        expect(chrome.tabs.create).toHaveBeenCalledWith(fooObject, undefined);
    });

    it('chrome.tabs.create was called with callback', function () {
        expect(chrome.tabs.create).toHaveBeenCalledWith(fooObject, barFunc);
    });

    it('chrome.tabs.get was called', function () {
        expect(chrome.tabs.get).toHaveBeenCalledWith(777, undefined);
    });

    it('chrome.tabs.get was called with callback', function () {
        expect(chrome.tabs.get).toHaveBeenCalledWith(777, barFunc);
    });

    it('chrome.tabs.update was called', function () {
        expect(chrome.tabs.update).toHaveBeenCalledWith(777, fooObject);
    });

    it('chrome.tabs.query was called', function () {
        expect(chrome.tabs.query).toHaveBeenCalledWith(fooObject, undefined);
    });

    it('chrome.tabs.query was called with callback', function () {
        expect(chrome.tabs.query).toHaveBeenCalledWith(fooObject, barFunc);
    });

    it('chrome.tabs.captureVisibleTab was called', function () {
        expect(chrome.tabs.captureVisibleTab).toHaveBeenCalledWith(777, fooObject, undefined);
    });

    it('chrome.tabs.captureVisibleTab was called with callback', function () {
        expect(chrome.tabs.captureVisibleTab).toHaveBeenCalledWith(777, fooObject, barFunc);
    });

    it('chrome.runtime.getLastError was referenced', function () {
        expect(lastError).toBe(fooString);
    });
});