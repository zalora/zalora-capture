describe('ga service', function () {
    var fooObject = {foo: 777};

    beforeEach(module('app.core'));

    beforeEach(function (done) {
        inject(function ($window) {
            $window._gaq = fooObject;
            done();
        });
    });

    it('gaService is attached with right object', function (done) {
        inject(function ($window, gaService) {
            $window._gaq = null;
            expect(gaService).toBe(fooObject);
            done();
        });
    });

});