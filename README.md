![TyScan logo](logo/TyScan_Horizontal.png)

# TyScan

[![npm version](https://badge.fury.io/js/tyscan.svg)](https://badge.fury.io/js/tyscan)

TyScan is a command-line tool for scanning TypeScript code by own custom rules.

## Getting started

1. Install TyScan and TypeScript:

```console
$ npm install tyscan typescript --save-dev
```

2. Verify the installation:

```console
$ npx tyscan --version
```

3. Create a rule file `tyscan.yml`:

```console
$ npx tyscan init
```

4. Scan your TypeScript files:

```console
$ npx tyscan scan
```

You can write your own rules into the generated `tyscan.yml` file.
See the [documentation](#documentation) for more details.

### Docker

We provide [Docker images](https://hub.docker.com/r/sider/tyscan) for TyScan.

```console
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
