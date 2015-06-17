describe('rpf service', function () {
    var barFunc = function () {},
        fooObject = {
            Utils: {
                getInstance: function () {
                    return barFunc;
                }
            }
        };

    beforeEach(module('app.core'));

    beforeEach(function (done) {
        inject(function ($window) {
            $window.rpf = fooObject;
            done();
        });
    });

    it('rpfService is attached with right object', function (done) {
        inject(function (rpfService) {
            expect(rpfService).toBe(barFunc);
            done();
        });
    });
});