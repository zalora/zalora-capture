describe('draw service', function () {
    var barObject = {};

    beforeEach(module('app.draw'));

    beforeEach(function () {
        module(function ($provide) {
            $provide.service('toolService', function () {
                this.factory = jasmine.createSpy('factory');
            });
        });
    });

    beforeEach(inject(function ($injector) {
        drawService = $injector.get('drawService');
        toolService = $injector.get('toolService');
        console.log('drawService', drawService, toolService);
    }));

    it('should call factory() to init a tool', function () {
        drawService.addTool('foo', barObject);

        expect(toolService.factory).toHaveBeenCalledWith(barObject, {});
    });

    it('should having 2 tools', function () {
        drawService.addTool('foo', barObject);
        drawService.addTool('bar', barObject);

        var tools = drawService.getTools();

        expect(Object.keys(tools).length).toEqual(2);
    });

    it('should get tool successfully', function () {
        drawService.addTool('foo', barObject);
        var tool = drawService.getTool('foo');
    });

});