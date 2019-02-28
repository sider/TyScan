class Foo {
  bar(...objects: any) {
  }
}

function bar(...objects: any) {
}

new Foo().bar(1);
bar(1);
