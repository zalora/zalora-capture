# zalora-capture

### Reporting bugs from Chrome browser.

When the tester finds a bug on a web application she is testing, she can make one click on the Chrome extension icon, and then select which part of page is buggy. The tester can highlight the part of the page where the bug lives and with one more click, automatically file that as a bug. The tester can add more text to describe the problem. But the bug already has the most interesting and tedious information added to it automatically: page url, OS and browser stats, the offending element/text on the page, chrome console log, browser history leading to the buggy page, and a screenshot. 

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

## Use

- Click `Extension Button` on Chrome navigation bar on any web page to reporting bugs.

## Test
### JS Lint
Run command:
``` 
grunt
```

to run jshint tool.
