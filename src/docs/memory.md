---
{"name": "Memory", "major": 1, "minor": 1}
---

# Memory

**Keid is a memory-safe language.** Unless there is explicitly unsafe code (e.g. calling an external C function), a Keid program should never have a segmentation fault.

## Object Reference Counting

The Keid runtime manages the allocation and freeing of objects stored in the heap. Garbage collectors are a common implementation of determining when memory should be freed. This is how languages like Java, C#, Go, and many other languages free memory.

Instead of garbage collection, Keid uses Object Reference Counting (ORC) in its memory model. This is used in languages like Swift and Objective-C.

Each object in the heap has a metadata value representing how many active references there are to the object.

When an object enters a new context, its reference count is increased by one.

When an object exits the context, its reference count is decreased by one. If the result is equal to zero, meaning that there are zero references to the object, its [destructor](#Destructors) is invoked and then its memory is freed.

## Destructors

Destructors are functions that are invoked on every object immediately before they are freed.
The compiler automatically generates destructors to free its fields.
In Keid you can define a destructor that will be invoked before the compiler-generated part of the destructor executes.

```keid
class HandleHolder {
    handle: Pointer<void>

    destructor {
        // call into the external C library to close the handle
        unsafe {
            libhandle_close(this.handle)
        }
    }
}
```
