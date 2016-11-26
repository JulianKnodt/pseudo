/**
 * Invokes a function with the given arguments if it's a function
 * @param {function} Function? - Function? to be invoked.
 * @param Arguments - Arguments for Function? to be invoked with.
 */
const ifFunctionInvoke = (fn, ...args) => {
  if (typeof fn === 'function') {
    return fn(...args);
  } else {
    return false;
  }
}

/**
 * Clones something, removing reference to original object.
 * @param something - Object to clone.
 */
const makeClone = (thing) => {
  if(Array.isArray(thing)) {
    return thing.slice(0);
  } else if (typeof thing === 'object') {
    return Object.assign({}, thing);
  } else if (typeof thing === 'function') {
    return thing.bind();
  } else {
    return JSON.parse(JSON.stringify(thing));
  }
};

class mockFunc extends Function{
  constructor(primitive) {
    super();
    this._ = primitive;
  }
};

/**
 * Creates a pseudo-primitive 
 * @param thing - Thing to create a pseudo from. Can be an array, object, number, boolean, string, etc.
 */
const pseudo = (primitiveVar) => {
  //Variables enclosed for internal use.
  let __onChange = [];
  let __onRetrieve = [];
  let simpleAccess = false;
  let __applyFunc;
  let __functionCalls = {};
  return new Proxy(new mockFunc(primitiveVar), {
    get: (target, prop, receiver) => {
      if (prop === 'on') {
        return (event, cb) => {
          let index;
          if(typeof cb !== 'function') {
            throw new Error(`Callback of must be a Function`);
          }
          if (event.toLowerCase() === 'change') {
            index = __onChange.push(cb);
          } else if (event.toLowerCase() === 'retrieve') {
            index = __onRetrieve.push(cb);
          } else if (event.toLowerCase() === 'call') {
            __applyFunc = cb;
            index = 1;
          } else if (typeof target._[event] === 'function') {
            __functionCalls[event] = Array.isArray(__functionCalls[event]) ? __functionCalls[event] : [];
            index = __functionCalls[event].push(cb);
          }
          return index;
        }
      } else {
        __onRetrieve.forEach((callback) => {
          ifFunctionInvoke(callback, target[prop], target._, prop, receiver);
        });
      }
      if (typeof target._[prop] === 'function' && Array.isArray(__functionCalls[prop])) {
        __functionCalls[prop].forEach((callback) => {
          ifFunctionInvoke(callback, target._[prop], target._, prop, receiver);
        });
      }
      if (simpleAccess && prop.toString() === 'Symbol(Symbol.toPrimitive)') {
        return () => target._;
      } else if (prop === '_') {
        return target._;
      } else if (typeof target._[prop] === 'function') {
        let prev = makeClone(target._);
        return (...args) => {
          let newVal = target._[prop](...args);
          if(target._.toString() !== prev.toString()) {
            __onChange.forEach((callback) => {
              ifFunctionInvoke(callback, newVal, target[prop], prop, target)
            });
          }
          return newVal;
        }
      } else {
        return target._[prop];
      }
    },
    set: (target, prop, newVal) => {
      __onChange.forEach((callback) => {
        ifFunctionInvoke(callback, newVal, target[prop], prop, target)
      });
      if(prop === 'simpleAccess') {
        //Special case where the user has interfaced with module
        //and wants to do things which could lead to worse behaviour but simpler reading.
        return simpleAccess = newVal;
      } else if (prop !== '_' && typeof target._ !== 'object') {
        //Case where trying to set property of proxy, but should only work if the object s
        throw new Error("Can't define property of pseudo-primitive");
      } else if (prop === '_') {
        //Case where trying to change the entire stored value
        return target[prop] = newVal;
      } else {
        //Case where stored is an object, and trying to set a propert on it.
        return target._[prop] = newVal;
      }
      // target[prop] = newVal;
    },
    //Apply is here in case the user wants to set up convenient calling for a function that might be used a lot,
    //or the primitive is a function.
    apply: (target, thisArg, argumentsList) => {
      if (typeof __applyFunc === 'function') {
        return __applyFunc.bind(thisArg, ...argumentsList)();
      } else if (typeof target._ === 'function') {
        return target._.bind(thisArg, ...argumentsList)();
      } else if (__applyFunc === undefined) {
        throw new Error('No function set on pseudo: set using pseudo.on("call", functionToBeCalled)');
      } else {
        throw new Error(`Unexpected value for __applyFunc, should be of type function, was of type ${typeof __applyFunc}`);
      }
    },
    has: (target, prop) => {
      if(prop === 'on' || prop === '_') {
        return true;
      } else {
        return target._[prop] !== undefined;
      }
    }
  });
};

let test = pseudo([1, 2, 77]);
console.log(test.includes(77));

module.exports = pseudo;