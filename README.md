# fn-listener

#### Installation

```sh
$ npm i quasi-
```

#### Bare Bones

```javascript
const quasi = require('quasi-'); 
let message = quasi("Hello world!");
message.on("change", (newVal, oldVal) => console.log(oldVal, "changed to:", newVal));

//Variable Reassignment

message._ = "Yo wassup";
//Prints: "Hello world! changed to: Yo wassup"

//Function usage
console.log(message.slice(1));
//Prints: o wassup

```


#### Complexities

```javascript
const quasi = require('quasi-');
let message = quasi("Hello World");

message.on('change', (newMessage, old) => console.log("Value changed to:", newMessage, "From:", old));

message._ = "Hello?";
// Prints: "Value Changed to: Hello? From: Hello World"

message.on('retrieve', (valRetrieved, primitiveValue, retrievalKey) => 
    console.log("Retrieved:", valRetrieved, primitiveValue, retrievalKey));

//Use ._ to work with value itself.
message._;
//Prints "Retrieved: Hello? Hello? _

message.on('slice', 
    (func, primitive, retrievalKey) => 
    console.log(`${func} was called on ${primitive}`));
console.log(message.slice(1));
=> ello World
//Prints function slice() { [native code] } was called on Hello?
//This is called whenever a function is retrieved from an object, but not
//when the function is called. Thus it can't access the arguments.
//message.slice would produce the same result.

//Example Usage
//On change with sockets
message.on('change', (newVal) => socket.emit(newVal));

//For testing
message.on('slice', () => throw new Error("Can't call slice within overwrite of slice"));

//For immutability
let array = quasi(["CONSTANT", "ANOTHER_CONSTANT"]);
array.on('change', () => {throw new Error('Immutable Array')});
console.log(array.push(3));
=> Error: Immutable Array
```

#### Overloading

```javascript
const quasi = require('quasi-');

let funcObjCons = quasi({property: "some property"});
funcObjCons.on('call', () => console.log('Function was called'));
funcObjCons.on('new', function(arg) {return {newProp: "this was a new object called with" + arg}});
funcObjCons();
//Prints: Function was called

let test = new funcObjCons("quasi");
console.log(test);
//Prints: {newProp: "this was a new object called with quasi"};

console.log(funcObjCons.property);
//Prints: some property

```


License
----

MIT


**Free Software, Hell Yeah!**
