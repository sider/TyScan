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

## Sample Config

```yml
# tyscan.yml
rules:
  - id: sample
    message: Do not use console.log
    pattern: console.log
    tests:
      match:
        - console.log("abc")
        - console. # Broken test
      unmatch:
        - console.error("abc");
```
