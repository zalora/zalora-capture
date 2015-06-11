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
