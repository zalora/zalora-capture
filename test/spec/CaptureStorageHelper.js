describe('Capture Storage Test', function () {
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
            console.log('ok');
        });
    });

    it('test save and get data', function (done) {
        expect(result.a).toBe(6);
        done();
    });
});