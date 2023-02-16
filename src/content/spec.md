---
slug: "/spec"
date: "2023-02-16"
title: "Keid Language Specification"
---
# The Keid Programming Language

Keid is a memory safe, object-oriented, ahead-of-time compiled programming language.
As an LLVM frontend, Keid is able to be compiled (and cross compiled) for various architectures and operating systems.

# Language Concepts
## Operator Overloading
Operators can be overriden multiple times to facilitate different types that can be used on the right-hand side of a formula.

## ~(Function Overloading)
(i.e. multiple functions with the same name but different paramters) is NOT supported.
Overloading has the caveat that two functions with the same name can have completely different behavior and side effects depending on parameter types.
 
## Returning values from code blocks.
 
// TODO: Contexts needs a better/more descriptive name.
## Contexts
Antipatterns such as global variables and singletons are often used when an application has a common object that most of the various compartmentalized pieces of the application's codebase are dependent on.
Passing down the same commonly used object or shared state to each function call in the application causes code bloat and limits readability and clarity.
This often pushes developers into using unsafe or unpreferred (anti)patterns.
Keid has contexts as a means to remedy this issue.
Contexts are structures defined by a top-level function and are implicitly passed down to // TODO.

### Defining
To define a context type, define a type with the `context` keyword:
```keidmd
context FooContext {
    bop: string;
    pop: bool;
}
```

### Requiring
To define a function which requires a context, use the `uses` keyword:
```keidmd
function my_context_dependent(bar: u32): usize uses FooContext {
    // ...
    return 0;
}
```

### Providing
To call a function with an explicit context, use the `with` keyword:
```keidmd
let foo_context = FooContext {
    bop = "some string value",
    pop = true,
};
with foo_context my_context_dependent(777);
```

### Advanced Providing
Context can be applied to an entire block of code too, or with multiple contexts simultaneously:
```keidmd
with foo_context, bar_context, baz_context {
    my_context_dependent(737);
    my_other_context_dependent(747);
}
```

### Using
To interact with a context field, just reference it like a structure or class field:
```keidmd
function my_context_dependent(bar: u32): usize uses FooContext {
    let bot = bar as usize;
    if context.pop { // "context" keyword can be used to access fields of required contexts
        bot += 1;
    }
    return bot;
}
```

Contexts are subject to several rules:

1. Functions which require context cannot be `public`. It is not the responsibility of an application to understand the implementation of the interfaces it interacts with, and call stack contexts are a tool of implementations. Note that you can store contexts in private or package-private member fields of objects returned by public functions.
2. Functions which call other functions which require context are required to have a `uses` declaration in their signature.
3. When calling a function that is dependent upon a specific context type, if that context dependency is not passed down implicitly via the caller exposing a `uses` declaration, the context must be provided explicitly using `with`.

## Constructors
    * No function overloading makes constructors less useful. A pros/cons list of function overloading is probably in order (especially since it is supported for operators).

## Memory Safety Features

### Reference Counted Memory

### Destructors

### Opt-In Nullable Types

Types call be nullable if explicitly declared to be with the `?T` type modifier.
* Class fields are expected to be initialized before the end of the constructor or defined as nullable.
* The optional chaining operator `x?.y` can be used to retrieve a value only if the preceding structure is non-null; otherwise the result of the entire expression is `null`.
* The null coalescing operator `x ?? y` can be read as "if `x` is null then return `y`; otherwise return `x`".
* The null asserting operator 'x!.y' expects that the preceeding value is not `null`; otherwise it will throw a `NullValueError`.

## Raw Pointers

The unsafe reference operator `ref` can be used to create a raw pointer `*T`; consequently the `deref` operator can be used to dereference a pointer.
* Note that raw pointers cannot be returned from a function when the pointee is data allocated on that function's stack.

## Basic Types

The basic defineable types include `class`, `struct`, `enum`, `interface`, and `context`.

### Class

Class types are single-inheritance and behavior-extensible. This means that while the class can extend the fields and behaviors of only one parent, interface behaviors can be implemented by any consumer to make class behavior extensible.

```keidmd
class Foo {
    foo_field: i32;

    public print_foo_field() {
        io::println("Foo field: {i}.", foo_field);
    }
}

class Bar extends Foo {
    bar_field: string;
}

interface BehaviorSet {
    void perform_operation();
}

implement BehaviorSet for Bar {
    void perform_operation() {
        this.print_foo_field();
        io::println("{s}", this.bar_field);
    }
}

int main() {
    let obj: Foo = new Bar() {
        bar_field = "Hello, World!",
        foo_field = 71,
    };
    obj.perform_operation(); // prints "Foo field: 7. Hello, World!"

    return 0;
}
```

## Strings

Strings are internally fat pointers with a length component, representing the length of UTF-8 bytes pointed to by the reference.

# Internal ABI

* Nullable types have the following internal ABI:
    ```c
    struct KeidAbiNullableData {
        uint8_t is_null; // boolean
        void data; // the actual data (i.e. `T`) in a `?T`
    }
    ```
* The `new T(params)` operator allocates and constructs a value of type `T` which is internally a counted reference to the newly instantiated object.
* Class types support basic object-oriented features such as inheritance and interface implementation.
    * The ABI of a class object (i.e. the pointee data of a `T`) looks like:
        ```c
        struct KeidAbiClassData {
            uint64_t ref_count; // the amount of currently held references to the data
            KeidAbiClassInfo* info; // pointer to the class `KeidAbiClassInfo` in constant memory
            void fields[]; // contains all fields values, from superclass to subclass
        }

        struct KeidAbiInterfaceImpl {
            uint32_t interface_id; // the unique ID of the interface (sequential value)
            uint32_t method_count; // the length of the `methods[]` field
            KeidAbiMethodImpl methods[]; // contains the pointers to this interface's methods
        }

        struct KeidAbiClassInfo {
            KeidAbiClassInfo* superclass; // the pointer to the superclass, null if Object
            KeidAbiMethodImpl* methods; // points to an offset in a global array of the pointers to the class' methods, including superclass methods
            KeidAbiInterfaceImpl interfaces[]; // contains all interfaces the class type implements
        }

        typedef void (*KeidAbiMethodImpl)(void); // pointer to a method
        ```

* Basic `struct` types are supported as well:
    ```keidmd
    [Alignment(4)]
    public struct MyStruct {
        fieldA: i32,
        fieldB: &f64,
    }
    // core::mem::size_of<MyStruct>() == 12
    ```
    * Struct types cannot be heap allocated; they can only be used on the local stack.
    * Struct types are copy-on-write when passed by value, but can also be passed by reference.
    * Struct types have a transparent and explicit ABI. Alignment, offsets, and padding are all able to be defined. It is the job of the struct's author to ensure that it is compatible with the ABI of the platform and language.


    * The Keid class type ABI is opaque, meaning that any code that attempts to interact with the ABI directly is fundamentally unstable. From the perspective of consuming code, the Keid ABI should be thought of as "changing endianness at a random interval each compiler update." Therefore, class types are explicitly not allowed to be passed to `extern` functions. Only `struct` types can be passed to `extern` functions since the struct ABI is transparent and explicitly defined.
