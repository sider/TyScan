# Command line options

## Scan your TypeScript code

```
Usage: tyscan scan [options] [path...]

Options:
  -c, --config <path>  path to configration file (default: "tyscan.yml")
  -j, --json           output json
```

### Examples

- Scan 'main.ts':

  ```sh
  tyscan scan main.ts
  ```

- Scan 'main.ts' using the rules in 'myconfig.yml':

  ```sh
  tyscan scan -c myconfig.yml main.ts
  ```

- Scan all .ts files in the directory "src":

  ```sh
  tyscan scan src/
  ```

- Scann all .ts files in "src" and print the results in JSON format:

  ```sh
  tyscan scan -j src/
  ```

## Test your patterns

TyScan provides a feature for testing your patterns against small code pieces. Assume that you want to find `parseInt` calls but mistakingly put `perseInt` into your configuration file. In such cases, TyScan does not report any violations even if your code contains a `parseInt` call. The test feature we describe below is to avoid this kind of accidents.

The following block shows the usage of the testing feature.

```
Usage: tyscan test [options]

Options:
  -c, --config <path>  path to configration file (default: "tyscan.yml")
```

The command `tyscan test` checks if each pattern in your configuraton file mathc/unmatch its tests. The tests can be written in your configuration file as follows:

```yml
rules:
  - id: sample.find_parseInt
    message: Let's find `parseInt` calls in your code
    pattern: perseInt(...) # Typo!
    tests:
      match:
        - parseInt("1");
      unmatch:
        - parseFloat("1");
```

TyScan reports a test failure when running `tyscan test` with this configuration file:

```
No match found in match test #1 in sample.find_parseInt
Summary:
 - Success: 1 test(s)
 - Failure: 1 test(s)
 - Skipped: 0 test(s)
```
