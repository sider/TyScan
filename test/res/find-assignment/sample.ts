interface Hello {
  bar: string
}

function foo(): string {
  return ""
}

const x: Hello = { bar: "123" }
x.bar = foo();
