---
{"name": "Undefined Behavior", "major": 1, "minor": 2}
---

# Undefined Behavior

Keid is designed so that it is impossible for the compiler to output any code with undefined behavior. Any bug that causes this to happen should be reported!

If you're not familiar with what undefined behavior is, [this Wikipedia page](https://en.wikipedia.org/wiki/Undefined_behavior) on the topic is a useful introduction.

As a short summary, undefined behavior (UB) is behavior that is not defined by the specification of the language. (This definition is simplified for the sake of brevity here.) For example, booleans in Keid are defined to either have a value of `0` or `1` and that any other value is *undefined behavior*. `2` is not true or false, and any boolean operations or if statements using the value will have unpredicatable *undefined behavior*.

The Keid compiler makes a guarantee to the programmer that it will never output code with undefined behavior. With that being said, programmers can hack and circumvent this; perhaps with *unsafe* pointer operations. It is the responsibility of the programmer to ensure that their *unsafe* code does not actually cause UB.
