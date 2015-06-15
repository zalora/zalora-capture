# zalora-capture ![](https://magnum.travis-ci.com/zalora/zalora-capture.svg?token=EJPnCXSMvAJhC2R2BsbU&branch=master)

### Reporting bugs from Chrome browser.

Zalora Capture provides many tools, where:

- Testers can report bugs from the browser with just one click on Chrome extension icon. With a drawing board, they can hight light the part of the page where the bug lives or what was wrong. The tester can also add more text to describe the problem. But the bug has the most interesting and tedious information added to it automatically: page URL, OS and browser stats, chrome console log, and a screenshot. 
- Developers can reproduce reported bugs with a simple playback tool.

![](https://github.com/zalora/zalora-capture/raw/master/docs/images/2015-06-05_16-56-37.png)


## Changelogs
#### v0.1.4 (comming soon)
- Support Shop or Blank template.
- Attach random file types.

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
- Locate to the repository directory

### Get started
- Go to `src/js/CaptureConfigs.js` to disable liveReload: false, debugMode: false.
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

## Build
Run command
```
grunt build
```
