![TyScan logo](logo/TyScan_Horizontal.png)

# TyScan

[![CircleCI](https://circleci.com/gh/sider/TyScan.svg?style=svg)](https://circleci.com/gh/sider/TyScan)

TyScan is a command line tool for scanning TypeScript code.

## Installation

1. Install TyScan with `npm`

```sh
npm install -g tyscan
```

2. Check the installation

```sh
tyscan  # Should print help message
```

### Docker images

We provide [Docker images](https://hub.docker.com/r/sider/tyscan) for TyScan.

```sh
$ docker pull sider/tyscan
$ docker run -it --rm -v `pwd`:/work sider/tyscan
```

You can pick a tag for the version you want to use or try with `latest` (the default.)
(You can try with `master` tag with the latest version on `master` branch!)

## Documentation

- [Sample configuration and its description](doc/config.md)

- [Pattern syntax](doc/pattern.md)

- [Command line options](doc/cli.md)

## Contributing

Bug reports, feature requests, and pull requests are welcome on GitHub at [https://github.com/sider/TyScan](https://github.com/sider/TyScan).
