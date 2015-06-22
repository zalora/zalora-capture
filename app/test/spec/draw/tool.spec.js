describe('tool service', function () {
    beforeEach(module('app.draw'));

    beforeEach(inject(function ($injector) {
        toolService = $injector.get('toolService');
    }));

    it('should throw an undefined error', function () {
        expect(function () {
            var tool = toolService.factory();
        }).toThrowError('You must define `createElement` method in `params` to create a tool instance.');
    });

    it('should throw an undefined error', function () {
        expect(function () {
            var params, tool;
            params = {
                createElement: function () {}
            };
            tool = toolService.factory(params);
        }).toThrowError('You must define `render` method in `params` to create a tool instance.');
    });

    it('should throw an invalid error', function () {
        expect(function () {
            var params, tool;

            params = {
                createElement: function () {},
                render: function () {}
            };
            tool = toolService.factory(params);
            tool.mousedown(6, 11);
        }).toThrowError('The `createElement` does not return a valid object.');
      });

    it('should throw nothing and `render` have been called', function () {
        expect(function () {
            var params = {
                createElement: function () {
                    return {};
                },
                render: jasmine.createSpy('render')
            };
            var tool = toolService.factory(params);
            tool.mousedown(6, 11);
            tool.mousemove(6, 12);
            tool.mouseup(6, 12);
            expect(params.render).toHaveBeenCalled();
        }).not.toThrowError();
    });

    it('should throw nothing', function () {
        expect(function () {
            var params = {
                createElement: function () {
                    return {};
                },
                render: function () {},
            };
            var tool = toolService.factory(params);
            tool.runHook('foo');
        }).not.toThrowError();
    });
});