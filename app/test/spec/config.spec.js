describe('Capture Config', function () {
    var result;

    beforeEach(module('app.core'));

    it('get group config', inject(function (configService) {
        expect(configService.get('liveReload')).toMatch(/true|false/);
    }));

    it('get config', inject(function (configService) {
        expect(configService.get('app', 'url')).toBe('src/report.html');
    }));

    it('get invalid config', inject(function (configService) {
        expect(function () {
            configService.get('anyKey');
        }).toThrow("No group config 'anyKey' available!");
    }));

});
