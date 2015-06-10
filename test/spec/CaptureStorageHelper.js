describe('Capture Config', function () {
    var result;

    beforeEach(module('CaptureConfigs'));

    it('get group config', inject(function (CaptureConfigs) {
        expect(CaptureConfigs.get('debugMode')).toMatch(/true|false/);
    }));

    it('get config', inject(function (CaptureConfigs) {
        expect(CaptureConfigs.get('app', 'url')).toBe('src/app.html');
    }));

    it('get invalid config', inject(function (CaptureConfigs) {
        expect(function () {
            CaptureConfigs.get('anyKey');
        }).toThrow("No group config 'anyKey' available!");
    }));

});

describe('Capture Storage', function () {
    var result;

    beforeEach(module('CaptureStorage'));

    beforeEach(function (done) {
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

    it('save and get data', function (done) {
        expect(result.a).toBe(6);
        done();
    });
});