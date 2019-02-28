function foo(f: () => void, g: (s: string) => number) {
}

foo(
  () => {},
  (s) => { return 1 }
);
