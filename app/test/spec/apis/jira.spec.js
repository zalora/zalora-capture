describe('jira service', function () {
    var barFunc = function () {},
        fooObject = {foo: 777},
        fooString = 'foo';

    beforeEach(function () {
        module('app.core', function ($provide) {
            $provide.service('storageService', function () {
                this.getData = function (url, callback) {
                    callback({
                        sourceUrl: fooString
                    });
                }
            })
        });
        module('app.apis');
    });

    beforeEach(inject(function (configService) {
        APIs = configService.get('APIs');
        serverURL = configService.get('serverUrl');
    }));

    beforeEach(inject(function ($injector) {
        jiraService    = $injector.get('jiraService');
        configService  = $injector.get('configService');
        storageService = $injector.get('storageService');
        $httpBackend   = $injector.get('$httpBackend');

        authHandler = $httpBackend
            .when('POST', serverURL + APIs.auth);

        getUserHandler = $httpBackend
            .when('GET', serverURL + APIs.auth);
    }));

    // auth()
    it('should call http post and get successful response', function () {
        authHandler.respond(200, true);

        jiraService.auth(serverURL, "username", "password", function (resp) {
            expect(resp).toBe(true);
        });

        $httpBackend.flush();
    });

    // auth()
    it('should not throw any exception without callback in auth func', function () {
        authHandler.respond(200, true);

        expect(function () {
            jiraService.auth(serverURL, "username", "password");
        }).not.toThrow();

        $httpBackend.flush();
    });

    // auth()
    it('should get a fail authentication', function () {
        authHandler.respond(401, false);

        jiraService.auth(serverURL, "username", "password", function (resp) {}, function (resp) {
            expect(resp).toBe(false);
        });

        $httpBackend.flush();
    });

    // getCurUser()
    it('should get current user successfully', function () {
        getUserHandler.respond(200, true);

        jiraService.getCurUser(serverURL, function (resp) {
            expect(resp).toBe(true);
        });

        $httpBackend.flush();
    });

    // getCurUser()
    it('should get current user failed', function () {
        getUserHandler.respond(401, false);

        jiraService.getCurUser(serverURL, function () {}, function (resp) {
            expect(resp).toBe(false);
        });

        $httpBackend.flush();
    });

    // fetchAllAtlassianInfo()
    it('should fetch atlassian info successfully', function () {
        for (var key in APIs.info) {
            $httpBackend.whenGET(serverURL + APIs.info[key]).respond(200, []);
        }

        jiraService.setServer(serverURL);
        jiraService.fetchAllAtlassianInfo(function (key, resp) {
            expect(resp).toEqual([]);
        });

        $httpBackend.flush();
    });

    // filterProject()
    it('should remains only one valid project after filtering projects', function () {
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

        var resp = jiraService.filterProject(sources);
        expect(resp.length).toEqual(1);
    });

    // _postAttachmentToIssue()
    it('should post an attachment to issue successfully', function () {
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

    // attachScreenshotToIssue()
    it('should attach a screenshot to issue successfully', function () {
        var url = serverURL + APIs.attachToIssue.replace('{issueId}', 777);
        $httpBackend.whenPOST(url).respond(200, true);

        jiraService.setServer(serverURL);
        jiraService.attachScreenshotToIssue(777, fooString, function (resp) {
            expect(resp).toBe(true);
        });

        $httpBackend.flush();
    });

    // getProjects()
    it('should get projects successfully', function () {
        var url = serverURL + APIs.info.projects;
        $httpBackend.whenGET(url).respond(200, []);

        jiraService.setServer(serverURL);
        jiraService.getProjects(function (resp) {
            expect(resp).toEqual([]);
        });

        $httpBackend.flush();
    });

    // getIssues()
    it('should get issues successfully', function () {
        var url = serverURL + APIs.searchIssue.replace('{query}', encodeURIComponent('project=777 and status != Resolved and status != Closed'));
        $httpBackend.whenGET(url).respond(200, []);

        jiraService.setServer(serverURL);
        jiraService.getIssues(777, function (resp) {
            expect(resp).toEqual([]);
        });

        $httpBackend.flush();
    });

    // getAttachments()
    it('should get attachments successfully', function () {
        var url = serverURL + APIs.getAttachment.replace('{issueId}', 777);
        $httpBackend.whenGET(url).respond(200, []);

        jiraService.setServer(serverURL);
        jiraService.getAttachments(777, function (resp) {
            expect(resp).toEqual([]);
        });

        $httpBackend.flush();
    });

    // generateMetaData()
    it('should call storage service to get sourceUrl', function () {
        jiraService.generateMetaData(true, function (resp) {
            expect(resp).toContain(fooString);
        });
    });

    // generateMetaData()
    it('should not call storage service', function () {
        jiraService.generateMetaData('', function (resp) {
            expect(resp).toEqual('');
        });
    });

    // createIssue()
    it('should call http post to fetch issue data', function () {
        $httpBackend.whenPOST(serverURL + APIs.createIssue).respond(200, fooObject);
        jiraService.setServer(serverURL);
        jiraService.createIssue(1, 2, 3, 'summary', 'desc', true, function (resp) {
            expect(resp).toEqual(fooObject);
        });

        $httpBackend.flush();
    });

    // getAttachments()
    it('should call http post to fetch attachments', function () {
        $httpBackend.whenGET(serverURL + APIs.getAttachment.replace('{issueId}', 777)).respond(200, fooObject);

        jiraService.setServer(serverURL);
        jiraService.getAttachments(777, function (resp) {
            expect(resp).toEqual(fooObject);
        });

        $httpBackend.flush();
    });


    // logOut()
    it('should call http delete', function () {
        $httpBackend.whenDELETE(serverURL + APIs.logOut).respond(200, fooObject);

        jiraService.setServer(serverURL);
        jiraService.logOut(function (resp) {
            expect(resp).toEqual(fooObject);
        });

        $httpBackend.flush();
    });
});
