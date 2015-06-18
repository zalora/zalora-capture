describe('jira service', function () {
    var barFunc = function () {},
        fooObject = {foo: 777},
        fooString = 'foo';

    beforeEach(module('app.apis'));

    beforeEach(inject(function (configService) {
        APIs = configService.get('APIs');
        serverURL = configService.get('serverUrl');
    }));

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');

        authHandler = $httpBackend
            .when('POST', serverURL + APIs.auth);

        getUserHandler = $httpBackend
            .when('GET', serverURL + APIs.auth);
    }));

    it('should get a successful authentication', function () {
        inject(function (jiraService) {
            authHandler.respond(200, true);

            jiraService.auth(serverURL, "username", "password", function (resp) {
                expect(resp).toBe(true);
            });

            $httpBackend.flush();
        });
    });

    it('should not throw any exception without callback in auth func', function () {
        inject(function (jiraService) {
            authHandler.respond(200, true);

            expect(function () {
                jiraService.auth(serverURL, "username", "password");
            }).not.toThrow();

            $httpBackend.flush();
        });
    });


    it('should get a fail authentication', function () {
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

    it('should remains only one valid project after filtering projects', function () {
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

    it('should post an attachment to issue successfully', function () {
        inject(function (jiraService) {
            var url = serverURL + APIs.attachToIssue.replace('{issueId}', 777),
                formData = new FormData();
            formData.append('file', fooString, fooString);

            $httpBackend.whenPOST(url, formData, function (headers) {
                return headers['X-Atlassian-Token'] == 'nocheck'
                        && headers['Content-Type'] == undefined;
            }).respond(200, true);

            jiraService.setServer(serverURL);
            jiraService._postAttachmentToIssue(url, formData, function (resp) {
                expect(resp).toBe(true);
            });

            $httpBackend.flush();
        });
    });

    it('should attach a screenshot to issue successfully', function () {
        inject(function (jiraService) {
            var url = serverURL + APIs.attachToIssue.replace('{issueId}', 777);
            $httpBackend.whenPOST(url).respond(200, true);

            jiraService.setServer(serverURL);
            jiraService.attachScreenshotToIssue(777, fooString, function (resp) {
                expect(resp).toBe(true);
            });

            $httpBackend.flush();
        });
    });

    it('should get projects successfully', function () {
        inject(function (jiraService) {
            var url = serverURL + APIs.info.projects;
            $httpBackend.whenGET(url).respond(200, []);

            jiraService.setServer(serverURL);
            jiraService.getProjects(function (resp) {
                expect(resp).toEqual([]);
            });

            $httpBackend.flush();
        });
    });

    it('should get issues successfully', function () {
        inject(function (jiraService) {
            var url = serverURL + APIs.searchIssue.replace('{query}', encodeURIComponent('project=777 and status != Resolved and status != Closed'));
            $httpBackend.whenGET(url).respond(200, []);

            jiraService.setServer(serverURL);
            jiraService.getIssues(777, function (resp) {
                expect(resp).toEqual([]);
            });

            $httpBackend.flush();
        });
    });

    it('should get attachments successfully', function () {
        inject(function (jiraService) {
            var url = serverURL + APIs.getAttachment.replace('{issueId}', 777);
            $httpBackend.whenGET(url).respond(200, []);

            jiraService.setServer(serverURL);
            jiraService.getAttachments(777, function (resp) {
                expect(resp).toEqual([]);
            });

            $httpBackend.flush();
        });
    });
});
