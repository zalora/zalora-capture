describe('jira service', function () {
    beforeEach(module('app.apis'));

    beforeEach(inject(function (configService) {
        APIs = configService.get('APIs');
        serverURL = configService.get('serverUrl');
    }))

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');

        authHandler = $httpBackend
            .when('POST', serverURL + APIs.auth);

        getUserHandler = $httpBackend
            .when('GET', serverURL + APIs.auth);
    }));

    it('should successful authentication', function () {
        inject(function (jiraService) {
            authHandler.respond(200, true);

            jiraService.auth(serverURL, "username", "password", function (resp) {
                expect(resp).toBe(true);
            });

            $httpBackend.flush();
        });
    });

    it('should fail authentication', function () {
        inject(function (jiraService) {
            authHandler.respond(401, false);

            jiraService.auth(serverURL, "username", "password", function (resp) {}, function (resp) {
                expect(resp).toBe(false);
            });

            $httpBackend.flush();
        });
    });

    it('should get current user successfully', function () {
        inject(function (jiraService) {
            getUserHandler.respond(200, true);

            jiraService.getCurUser(serverURL, function (resp) {
                expect(resp).toBe(true);
            });

            $httpBackend.flush();
        });
    });

    it('should get current user failed', function () {
        inject(function (jiraService) {
            getUserHandler.respond(401, false);

            jiraService.getCurUser(serverURL, function () {}, function (resp) {
                expect(resp).toBe(false);
            });

            $httpBackend.flush();
        });
    });

    it('should fetch atlassian info successfully', function () {
        inject(function (jiraService) {
            for (var key in APIs.info) {
                $httpBackend.whenGET(serverURL + APIs.info[key]).respond(200, []);
            }

            jiraService.setServer(serverURL);
            jiraService.fetchAllAtlassianInfo(function (key, resp) {
                expect(resp).toEqual([]);
            });

            $httpBackend.flush();
        });
    });

    it('filter should remains only one valid project', function () {
        inject(function (configService, jiraService) {
            var aValidProjectKey = configService.get('projectFilter')[configService.get('serverName')][0];
            var sources = [
                {
                    key: aValidProjectKey,
                    value: 'foo'
                },
                {
                    key: 'DCMA-cannotbevalidkey',
                    value: 'bar'
                }
            ];

            resp = jiraService.filterProject(sources);
            expect(resp.length).toEqual(1);
        });
    });
});
