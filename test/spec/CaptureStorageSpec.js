describe('Capture Storage', function () {
    var result;

    beforeEach(module('CaptureStorage'));

    beforeEach(function (done) {
        var chrome = {
            storage: {
                sync: {
                    get: function (key, callback) {
                        var data = {
                            a: 6,
                            b: 11
                        };
                        callback(data);
                    },
                    set: function (object, callback) {
                        callback(true);
                    }
                }
            }
        };

        spyOn(chrome.storage.sync, 'get');
        spyOn(chrome.storage.sync, 'set');

        inject(function (CaptureStorage) {
            CaptureStorage.saveData({
                a: 6,
                b: 11
            }, function (resp) {
                CaptureStorage.getData('a', function (resp) {
                    result = resp;
                    done();
                });
            });
        });
    });

    it('chrome.storage.sync was called', function () {
        expect(chrome.storage.sync.get).toHaveBeenCalled();
    }, 1000);

    it('save and get data', function (done) {
        expect(result.a).toBe(6);
        done();
    });
});