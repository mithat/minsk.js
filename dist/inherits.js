/**
 * Make one Object "inherit" from another.
 * 
 * @param {any} ctor
 * @param {any} superCtor
 */
function inherits (ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable:    false,
      writable: true,
      configurable: true
    }
  });
}
