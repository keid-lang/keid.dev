---
{"name": "Objects", "major": 2, "minor": 3}
---

# Declaring Types
There are three different declarable types in Keid: class types, struct types, and interface types. 

## Class Types
Class types are stored in the heap and have their managed by the Keid runtime. Their memory is diposed of using reference counting. Instances of class types can simply be thought of as a reference to memory in the heap.

```keid
class Person {
    age: uint32
    name: string

    say_hello() {
        std::io::println("Hello, I am ", this.name, "!")
    }
}
```

## Struct Types
Struct types are syntactically declared nearly identially to classes.
The only difference is that the `class` keyword becomes the `struct` keyword.

```keid
struct Person {
    age: uint32
    name: string

    say_hello() {
        std::io::println("Hello, I am ", this.name, "!")
    }
}
```

This code will produce the same output at the class declaration, but structs and classes don't have identical behavior.
There is a fundamental difference in how class types and struct types are stored in memory.

Structs are stored on the stack and are treated the same as primitive types.
When passed to functions, a full copy of the struct is made.
Simply put, structs types are pass-by-value.

## Interface Types
Interfaces are very different than classes and structs.
Interfaces can only declare function and accessor headers, as well as associated types.

```keid
interface Foo {
    type Output

    do_a_foo(x: string, y: uint32): Output
}

implement Foo for Bar {
    type Output = int8

    do_a_foo(x: string, y: uint32): int8 {
        ...
    }
}
```

### Associated Types
TODO

# Structs and Objects

The term "object" is abstract by nature and can mean various things in various contexts. In Keid, an object is defined as "an instance of a class or interface type". Another way to conceptualize this is that something is an object if its data stored in the heap.

Per this definition, struct types and primitives (i.e. anything pass-by-value) are not objects. Struct types are are not assignable to a `core::object::Object`.
