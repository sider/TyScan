function foo(...objects: any) {
}

foo(1);

foo('bar', 1, 2);  // `foo` in this line is not captured since the argument is not a number.

console.log(foo);
