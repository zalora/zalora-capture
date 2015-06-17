describe('storage service', function () {
    var chromeService;

    beforeEach(module('app.core', function ($provide) {
        chromeService = {
            setStorage: function () {},
            getStorage: function () {}
        };

        spyOn(chromeService, 'setStorage');
        spyOn(chromeService, 'getStorage');

        $provide.value('chromeService', chromeService);
    }));

    beforeEach(inject(function (storageService) {
        storageService.saveData({
            a: 6,
            b: 11
        }, function () {});

        storageService.getData('a', function () {});
    }));

    it('chromeService.setStorage was called with right arguments', function () {
        expect(chromeService.setStorage).toHaveBeenCalledWith({ 'com.zalora.capture.a': 6, 'com.zalora.capture.b': 11 }, jasmine.any(Function));
    });

    it('chromeService.getStorage was called with right arguments', function () {
        expect(chromeService.getStorage).toHaveBeenCalledWith('com.zalora.capture.a', jasmine.any(Function));
    });
});