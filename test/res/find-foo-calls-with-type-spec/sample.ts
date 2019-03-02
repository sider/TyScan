function foo(...objects: any) {
}

foo(1);

foo('bar', 'baz', 2);

foo('bar', 1, 'baz');

console.log(foo);
