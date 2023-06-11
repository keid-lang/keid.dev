---
{"name": "Types", "major": 2, "minor": 2}
---

# Types

All variables in Keid are strongly typed, along with polymorphic behavior for object types.

### Primitive Types

* `void` - At compile time, `void` can be used in generic arguments or as a function return value to indicate a lack of data. Variables cannot be `void`.
* `bool` - 8-bit integer; a value of `0` is false, a value of `1` is true, and any other value is [undefined behavior](undefined-behavior).
* `char` - 8-bit integer representing an ASCII character
* `int8` - 8-bit signed integer
* `int16` - 16-bit signed integer
* `int32` - 32-bit signed integer
* `int64` - 64-bit signed integer
* `isize` - architecture-bit signed integer (e.g. 32-bit when targeting `i386`, 64-bit when targeting `x86_64`)
* `uint8` - 8-bit unsigned integer
* `uint16` - 16-bit unsigned integer
* `uint32` - 32-bit unsigned integer
* `uint64` - 64-bit unsigned integer
* `usize` - architecture-bit unsigned integer (e.g. 32-bit when targeting `i386`, 64-bit when targeting `x86_64`)
* `float32` - 32-bit IEEE-754 floating point number
* `float64` - 64-bit IEEE-754 floating point number

### Nullable Types

All variables in Keid need to be initialized at declaration.
To represent an abscence of a value, Keid has nullable types.

```keid
let x: ?int32 = null
...
if x != null {
    // x is guaranteed to not be null at this point
    // thus, inside of this code block, the type of the variable `x` is `int32` and not `?int32`
    std::io::println("x = ", x.to_string())
} else {
    std::io::println("x is null!")
}
```

To make a type nullable, just prefix it with the `?` type modifier.

### Slice Types

Slices are a view of contiguous elements in an underlying heap-stored array.
This sounds complicated at first, but slices are actually really simple!

To get a slice, we need to first create an array:
```keid
let my_slice: [int32] = new int32[default(int32); 5] // initialized to have 5 elements, each equal to `default(int32)`
```
In this example, the slice `my_slice` has a view of the entire underlying aray.
Slices can be derived from other slices to contain a different offset or length of elements.
```keid
let my_slice: [int32] = new int32[default(int32); 5]
let my_view = my_slice[1:2] // this slice only has 1 element, the second element in `my_slice`
```
Deriving slices does not create a copy of the underlying array.
Slices are references to memory on the heap.
Any changes to the array via any slice will be reflected to every other slice.

If you actually want a copy of an array, use `core::array::copy<T>`.

### Type Literals

Integer literals can be written simply as `123` in decimal or `0xff` for hex. To specify the type of the integer literal, you can suffix it with the name of the type, e.g. `0x7f:uint8` or `100.0:float64`.
```keid
let w: uint32 = 0         // works
let x: uint32 = 10:uint32 // works
let y: uint32 = 20:uint64 // compile error
let z = 5:float32         // works
```

Boolean literals are either `true` or `false`. 
```keid
let x: bool = true // works
let y = false      // works
```

String literals are surrounded with double quotes.
```keid
let x = "hello, world!"
```

Character literals are surrounded with single quotes.
```keid
let x = 'h'
```

Nullable types can be assigned the null literal.
```keid
let x: ?uint8 = null
```
