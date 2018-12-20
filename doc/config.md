# Configuration

The following shows an example rule definition that finds `console` uses:

```yml
rules:
  - id: sample                     # required, string

    message: Do not use `console`  # required, string

    pattern: '(_: Console)._(...)' # required, string or string list

    tests:                         # optional

      match:                       # optional, string or string list
        - console.log("...");

      unmatch:                     # optional, string or string list
        - console.log("...");      # this test fails since it matches the pattern
```

- `id`: The rule id

- `message`: The message to display when a match is found

- `pattern`: See [Pattern syntax](pattern.md)

- `tests`: See [Test your patterns](cli.md#test-your-patterns)
