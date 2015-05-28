describe('Capture Storage Test', function () {
    var result;

    beforeEach(function (done) {
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

    it('test save and get data', function (done) {
        expect(true).toBe(true);
        expect(result.a).toBe(6);
        done();
    });
});