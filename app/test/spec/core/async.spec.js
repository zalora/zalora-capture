describe('async service', function () {
    var fooObject = {foo: 777};

    beforeEach(module('app.core'));

    beforeEach(function (done) {
        inject(function ($window) {
            $window.async = fooObject;
            done();
        });
    });

    it('asyncService is attached with right object', function (done) {
        inject(function (asyncService) {
            expect(asyncService).toBe(fooObject);
            done();
        });
    });
});