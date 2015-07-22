
# zalora-capture ![](https://travis-ci.org/zalora/zalora-capture.svg?branch=public-master)

### Reporting bugs from Chrome browser.

Zalora Capture provides many tools, where:

- Testers can report bugs from the browser with just one click on Chrome extension icon. With a drawing board, they can hight light the part of the page where the bug lives or what was wrong. The tester can also add more text to describe the problem. But the bug has the most interesting and tedious information added to it automatically: page URL, OS and browser stats, chrome console log, and a screenshot. 
- Developers can reproduce reported bugs with a simple playback tool.

### Official release
Download here: https://chrome.google.com/webstore/detail/ohbdhojbmiakhddcglnmjgcdfghhnkaj.


![](https://github.com/zalora/zalora-capture/raw/master/docs/images/2015-06-05_16-56-37.png)


## Changelogs
#### v0.2.0
- Support Shop/Blank templates.
- Support attaching random file types.

## Install
### Install dependencies
Run command:
```sh
$ npm install
``` 
to install all dependencies.

Note: Feature "Record and Playback" of this project is based on BiTE project.
Two dependency files is generated from this repository https://github.com/vinhlh/bite-project.

### Install the extension

- Go to `chrome://extensions`
- Choose `Load unpacked extension`
- Locate to the repository directory: /app or /dist/<version>

### Get started
- Go to `app/src/js/core/config.service.js` to set liveReload: false.
- Change `serverName` to `zalora`.
- Check your project is already in projectFilter (define valid projects of a serverName) list or not. If not, add your project key into this list.

## Usage

- Click `Extension Button` on Chrome navigation bar on any web page to reporting bugs.

See details:
- [For testers](https://github.com/zalora/zalora-capture/wiki/User-Guides-(for-testers))
- [For developers](https://github.com/zalora/zalora-capture/wiki/User-Guides-(for-developers))


## Test
### JS Lint
Run command:
``` 
grunt jshint
```
to run jshint tool.

### Unit test
Open browser with URL ```chrome-extension://{extensionId}/test/SpecRunner.html``` to run test.
Or run command
``` 
grunt test
```

## Build
Run command
```
grunt build
```

## Credits

This project used many open source libraries, including:
- [AngularJS](https://github.com/angular/angular.js).
- AngularJS modules: angular-file-upload, angular-material...
- [Async](https://github.com/caolan/async).
- [Twitter Bootstrap](http://getbootstrap.com).
- [Font Awesome](http://fortawesome.github.io/Font-Awesome/).
- [Jasmine](http://jasmine.github.io).
- [SnapSVG](http://snapsvg.io/).
- [BITE project](https://code.google.com/p/bite-project/).

## License
Zalora Capture is licensed under the MIT Open Source license. For more information, see the LICENSE file in this repository.
