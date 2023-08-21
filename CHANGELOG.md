# Changelog

All notable changes to this project will be documented in this file.

Release dates (and times) are in UTC+0 timezone, unless otherwise stated.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [2.2.1] - 2023-08-21

### Fixed

- Fixed removeOldData() in background.js: "TypeError: store.limitTable.entries is not a function"

## [2.2.0] - 2023-08-20

### Added

- Support dark theme.

### Changed

- Generate zip on build.
- Change the reload icon.
- Data older than 12 hours will be deleted.

### Fixed

- The reload button tooltip was not translated correctly.

## [2.1.0] - 2023-08-19

### Added

- Support for [OldTweetDeck](https://github.com/dimdenGD/OldTweetDeck).

### Changed

- Develop and build with Parcel.
- Changed the event used from `onResponseStarted` to `onHeadersReceived`.

### Fixed

- Fixed popup width too narrow on Chrome.

## [2.0.0] - 2023-08-10

### Added

- Store data using `chrome.storage` API.
- Support Japanese.

### Changed

- Develop MV2 and MV3 on the same branch.
- Set icon for Reload button, and moved it from bottom to top left.
- Stop using sendMessage/onMessage, use chrome.storage
- Remove permission for mobile.twitter.com as it doesn't seem to be used

and other minor changes.

## [1.1.0] - 2023-08-07 19:00

### Added

- Use the screen name when available.
- Same font family as Twitter's website.
- Support Manifest V3.

### Changed

- Run background.js as event page.

and other minor changes.

## [1.0.0] - 2023-08-07 05:13

### Added

- Gets and displays status of API limits from response headers.

[unreleased]: https://github.com/funame0/check-x-rate-limits/compare/v2.2.1...HEAD
[2.2.1]: https://github.com/funame0/check-x-rate-limits/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/funame0/check-x-rate-limits/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/funame0/check-x-rate-limits/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/funame0/check-x-rate-limits/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/funame0/check-x-rate-limits/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/funame0/check-x-rate-limits/releases/tag/v1.0.0
