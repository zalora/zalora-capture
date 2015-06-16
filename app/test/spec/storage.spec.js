describe('storage service', function () {
    var result;

    beforeEach(module('app.core'));

    beforeEach(function (done) {
        chrome = {
            storage: {
                sync: {
                    get: function () {},
                    set: function () {}
                }
            }
        };

        spyOn(chrome.storage.sync, 'get');
        spyOn(chrome.storage.sync, 'set');

        done();
    });

    beforeEach(function (done) {
        inject(function (storageService) {
            storageService.saveData({
                a: 6,
                b: 11
            }, function () {});

            storageService.getData('a', function () {});

            done();
        });
    });

    it('chrome.storage.sync.set was called', function (done) {
        expect(chrome.storage.sync.set).toHaveBeenCalledWith({ 'com.zalora.capture.a': 6, 'com.zalora.capture.b': 11 }, jasmine.any(Function));

        done();
    }, 1000);


    it('chrome.storage.sync.get was called', function (done) {
        expect(chrome.storage.sync.get).toHaveBeenCalledWith('com.zalora.capture.a', jasmine.any(Function));

        done();
    }, 1000);
});