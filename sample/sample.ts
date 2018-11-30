// const y = new Range();

// class C {}

namespace ns1 {
  export namespace ns2 {
    export class D {}
  }
}

// let c: C;
let d: ns1.ns2.D;

function f(a: any) {}
// f(c);
f(d);
