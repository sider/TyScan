![TyScan logo](logo/TyScan_Horizontal.png)

# TyScan

[![npm version](https://badge.fury.io/js/tyscan.svg)](https://badge.fury.io/js/tyscan)
[![CircleCI](https://circleci.com/gh/sider/TyScan.svg?style=svg)](https://circleci.com/gh/sider/TyScan)

TyScan is a command line tool for scanning TypeScript code.

## Installation

1. Install TyScan and TypeScript with `npm`:

```shell
$ npm install tyscan typescript --save-dev
```

2. Check the installation:

```shell
$ npx tyscan  # Should print help message
```

### Docker

We provide [Docker images](https://hub.docker.com/r/sider/tyscan) for TyScan.

```shell
$ docker run -it --rm -v "$PWD":/work sider/tyscan
```

You can pick a tag for the version you want to use or try with the `latest` tag (default).

Also, you can try with the `master` tag which points to the latest version on the `master` branch!

## Documentation

- [Sample configuration and its description](doc/config.md)
- [Pattern syntax](doc/pattern.md)
- [Command line options](doc/cli.md)

## Contributing

Bug reports, feature requests, and pull requests are welcome on GitHub at [https://github.com/sider/TyScan](https://github.com/sider/TyScan).
