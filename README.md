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
  - id: sample1
    message: Do not use console.log
    pattern: console.log
    tests:
      match:
        - console.log("abc")
        - console.log( # Broken test
      unmatch:
        - console.error("abc");

  - id: sample2
    message: Do not use sample.f
    pattern: ./sample/sample.f
    tests:
      match:
        - import * as sample from './sample/sample';  sample.f();
        - import { f as g } from './sample/sample'; g();
      unmatch:
        - sample.f();

  - id: sample3
    message: Do not use sample.ns.f
    pattern: ./sample/sample.ns.f
    tests:
      match:
        - import * as sample from './sample/sample'; sample.ns.f();
        - import { ns as xxx } from './sample/sample'; xxx.f();
      unmatch:
        - ns.f();
```
