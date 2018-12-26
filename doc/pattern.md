# Pattern syntax

## Usage by example

- Find `foo` calls:

  ```
  foo(...)
  ```

- Find `foo` calls with two arguments:

  ```
  foo(_, _)
  ```

- Find `foo` calls with one or more arguments:

  ```
  foo(_, ...)
  ```

- Find calls to the method `foo`:

  ```
  _.foo(...)
  ```

- Find calls to `Console.log`:

  ```
  (_: Console).log(...)
  ```

- Find `bar` calls with one `number` argument:

  ```
  bar(_: number)
  ```

- Find calls to `baz` that takes an object literal with `key`:

  ```
  baz({key: _})      # Has `key` and does not have any other keys.
  baz({key: _, ...}) # Has `key` and possibly has other keys.
  ```
