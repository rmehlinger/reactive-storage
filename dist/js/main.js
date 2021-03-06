// Generated by CoffeeScript 1.10.0
(function() {
  var __boolPrefix, __jsonPrefix, __nullPrefix, __numberPrefix, __prefix, __storageTypeKey, boolPrefix, factory, getType, jsonPrefix, nullPrefix, numberPrefix, prefixFuncs, storageMapObject, types;

  __prefix = "__4511cb3d-d420-4a8c-8743-f12ef5e45c3e__reactive__storage";

  __storageTypeKey = __prefix + "__type";

  __jsonPrefix = __prefix + "__json__";

  __boolPrefix = __prefix + "__bool__";

  __numberPrefix = __prefix + "__number__";

  __nullPrefix = __prefix + "__null__";

  jsonPrefix = function(k) {
    return "" + __jsonPrefix + k;
  };

  boolPrefix = function(k) {
    return "" + __boolPrefix + k;
  };

  numberPrefix = function(k) {
    return "" + __numberPrefix + k;
  };

  nullPrefix = function(k) {
    return "" + __nullPrefix + k;
  };

  types = {
    string: {
      prefixFunc: _.identity,
      serialize: _.identity,
      deserialize: _.identity,
      name: 'string'
    },
    number: {
      prefixFunc: numberPrefix,
      serialize: _.identity,
      deserialize: parseFloat,
      name: 'number'
    },
    array: {
      prefixFunc: jsonPrefix,
      serialize: JSON.stringify,
      deserialize: JSON.parse,
      name: 'array'
    },
    object: {
      prefixFunc: jsonPrefix,
      serialize: JSON.stringify,
      deserialize: JSON.parse,
      name: 'object'
    },
    boolean: {
      prefixFunc: boolPrefix,
      serialize: function(v) {
        if (v) {
          return "true";
        } else {
          return "false";
        }
      },
      deserialize: function(v) {
        if (v === 'true') {
          return true;
        } else if (v === 'false') {
          return false;
        } else {
          return void 0;
        }
      },
      name: 'boolean'
    },
    "null": {
      prefixFunc: nullPrefix,
      serialize: (function() {
        return 'null';
      }),
      name: 'null',
      deserialize: function() {
        console.log('null!');
        return null;
      }
    }
  };

  prefixFuncs = _.chain(types).values().pluck('prefixFunc').uniq().value();

  getType = function(v) {
    if (v === null) {
      return types["null"];
    } else {
      return types[typeof v];
    }
  };

  storageMapObject = function(storageType, _, rx) {
    var _getItem, _removeItem, _safeRemove, _setItem, defaultState, storageMap, windowStorage, writeGuard;
    windowStorage = window[storageType + "Storage"];
    if (windowStorage[__storageTypeKey] == null) {
      windowStorage[__storageTypeKey] = storageType;
    }
    defaultState = function() {
      return new Map([[__storageTypeKey, storageType]]);
    };
    storageMap = rx.map(_.pairs(windowStorage));
    writeGuard = false;
    window.addEventListener('storage', function(arg) {
      var key, newValue, oldValue, storageArea;
      key = arg.key, newValue = arg.newValue, oldValue = arg.oldValue, storageArea = arg.storageArea;
      if (key == null) {
        return storageMap.update(defaultState());
      } else if (storageArea[__storageTypeKey] === storageType && newValue !== oldValue) {
        writeGuard = true;
        storageMap.put(key, newValue);
        return writeGuard = false;
      }
    });
    rx.autoSub(storageMap.onAdd, function(dict) {
      if (!writeGuard) {
        return dict.forEach(function(n, k) {
          return windowStorage.setItem(k, n);
        });
      }
    });
    rx.autoSub(storageMap.onChange, function(dict) {
      if (!writeGuard) {
        return dict.forEach(function(arg, k) {
          var n, o;
          o = arg[0], n = arg[1];
          return windowStorage.setItem(k, n);
        });
      }
    });
    rx.autoSub(storageMap.onRemove, function(dict) {
      return dict.forEach(function(v, k) {
        return windowStorage.removeItem(k);
      });
    });
    _safeRemove = function(k) {
      if (rx.snap(function() {
        return storageMap.has(k);
      })) {
        return storageMap.remove(k);
      }
    };
    _removeItem = function(k) {
      if (k !== __storageTypeKey) {
        return rx.transaction(function() {
          return prefixFuncs.forEach(function(func) {
            return _safeRemove(func(k));
          });
        });
      }
    };
    _getItem = function(k) {
      var t;
      t = _.chain(types).values().find(function(v) {
        return storageMap.get(v.prefixFunc(k));
      }).value();
      return t != null ? t.deserialize(storageMap.get(t.prefixFunc(k))) : void 0;
    };
    _setItem = function(k, v) {
      if (k !== __storageTypeKey) {
        return rx.transaction(function() {
          var o, ref, type;
          o = _getItem(k);
          if (o !== v) {
            if (o === void 0 || getType(o).name !== ((ref = getType(v)) != null ? ref.name : void 0)) {
              _removeItem(k);
            }
            type = getType(v);
            return storageMap.put(type.prefixFunc(k), type.serialize(v));
          }
        });
      }
    };
    return {
      getItem: function(k) {
        return rx.snap(function() {
          return _getItem(k);
        });
      },
      getItemBind: function(k) {
        return rx.bind(function() {
          return _getItem(k);
        });
      },
      removeItem: function(k) {
        return rx.transaction(function() {
          return _removeItem(k);
        });
      },
      setItem: function(k, v) {
        return _setItem(k, v);
      },
      clear: function() {
        return storageMap.update(defaultState());
      },
      all: function() {
        return storageMap.all();
      },
      onAdd: storageMap.onAdd,
      onRemove: storageMap.onRemove,
      onChange: storageMap.onChange
    };
  };

  factory = function(_, rx) {
    return {
      __storageTypeKey: __storageTypeKey,
      __jsonPrefix: jsonPrefix,
      __boolPrefix: boolPrefix,
      __numberPrefix: numberPrefix,
      __nullPrefix: nullPrefix,
      local: storageMapObject("local", _, rx),
      session: storageMapObject("session", _, rx)
    };
  };

  (function(root) {
    var _, deps, rx;
    deps = ['underscore', 'bobtail'];
    if ((typeof define !== "undefined" && define !== null ? define.amd : void 0) != null) {
      return define(deps, factory);
    } else if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
      _ = require('underscore');
      rx = require('bobtail');
      return module.exports = factory(_, rx);
    } else if ((root._ != null) && (root.rx != null)) {
      _ = root._, rx = root.rx;
      return root.rxStorage = factory(_, rx);
    } else {
      throw "Dependencies are not met for reactive: _ and $ not found";
    }
  })(this);

}).call(this);

//# sourceMappingURL=main.js.map
