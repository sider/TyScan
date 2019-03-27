# Pattern syntax

## Usage by example

### Function/Method calls

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

### Filter by type

- Find calls to `Console.log`:

  ```
  (_: Console).log(...)
  ```

- Find `bar` calls with one `number` argument:

  ```
  bar(_: number)
  ```

### Object literals

- Find calls to `baz` that takes an object literal with `key`:

  ```
  baz({key: _})      # Has `key` and does not have any other keys.
  baz({key: _, ...}) # Has `key` and possibly has other keys.
  ```

### JSX elements

- Find any `div`:

  ```
  <div>
  ```

- Find `div`s that have the attribute `id`:

  ```
  <div id={_}>
  ```

- Find `div`s whose `id` is `"foo"`:

  ```
  <div id="foo">
  ```

- Find `div`s whose `id` is the result of a `foo` call:

  ```
  <div id={foo(...)}>
  ```

- Find `div`s whose `id` is NOT `"foo"`:

  ```
  <div id!="foo">  # This also matches `<div></div>` (div with no id)
  ```

- Find `div`s that do NOT have `id`s.

  ```
  <div !id>
  ```
