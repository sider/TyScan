# TyScan

TyScan is a command line tool for scanning TypeScript sources.

## Usage

```
Usage: tyscan [options] [command]

Command line tool for scanning TypeScript sources

Options:
  -v, --version             output the version number
  -h, --help                output usage information

Commands:
  scan [options] [path...]  scan pattern(s)
  test [options]            test pattern(s)
```

## Sample tyscan.yml

```yml
rules:
  - id: sample
    message: Do not use `console`
    pattern: '(_: Console)._(...)'  # Matches all method calls to Console instance.
```

## Contributing

Bug reports and pull requests are welcome on GitHub at [https://github.com/sider/TyScan](https://github.com/sider/TyScan).
