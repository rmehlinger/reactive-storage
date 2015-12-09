// Generated by CoffeeScript 1.9.2
(function() {
  var _, jsonPrefix, rx, storageMapObject;

  rx = window.rx, _ = window._;

  window.rxStorage = {};

  window.rxStorage.__jsonPrefix = "__4511cb3d-d420-4a8c-8743-f12ef5e45c3e__reactive__storage__json__";

  jsonPrefix = function(k) {
    return "" + window.rxStorage.__jsonPrefix + k;
  };

  storageMapObject = function(windowStorage) {
    var safeRemove, storageMap;
    if (windowStorage == null) {
      windowStorage = {};
    }
    storageMap = rx.map(windowStorage);
    $(window).bind('storage', function(event) {
      if (event.storageAreaArg === windowStorage) {
        if (event.key === null) {
          return windowStorage.update({});
        } else {
          return windowStorage.put(event.key, event.newValueArg);
        }
      }
    });
    rx.autoSub(storageMap.onAdd, function(arg) {
      var k, n;
      k = arg[0], n = arg[1];
      return window.localStorage.setItem(k, n);
    });
    rx.autoSub(storageMap.onChange, function(arg) {
      var k, n, o;
      k = arg[0], o = arg[1], n = arg[2];
      return window.localStorage.setItem(k, n);
    });
    rx.autoSub(storageMap.onRemove, function(arg) {
      var k, o;
      k = arg[0], o = arg[1];
      return window.localStorage.removeItem(k);
    });
    safeRemove = function(k) {
      var map;
      map = rx.snap(function() {
        return storageMap.all();
      });
      if (k in map) {
        return storageMap.remove(k);
      }
    };
    return {
      getItem: function(k) {
        var jsonV;
        jsonV = storageMap.get(jsonPrefix(k));
        if (jsonV != null) {
          return JSON.parse(jsonV);
        } else {
          return storageMap.get(k);
        }
      },
      removeItem: function(k) {
        safeRemove(k);
        return safeRemove(jsonPrefix(k));
      },
      setItem: function(k, v) {
        var ref, toStore;
        toStore = {
          k: k,
          v: v
        };
        if ((ref = typeof v) === 'array' || ref === 'object') {
          safeRemove(k);
          toStore.k = jsonPrefix(k);
          toStore.v = JSON.stringify(v);
        } else {
          safeRemove(jsonPrefix(k));
        }
        return storageMap.put(toStore.k, toStore.v);
      },
      clear: function() {
        return storageMap.update({});
      },
      update: function(contents) {
        return storageMap.update(contents);
      },
      onAdd: storageMap.onAdd,
      onRemove: storageMap.onRemove,
      onChange: storageMap.onChange
    };
  };

  window.rxStorage.localStorage = storageMapObject(window.localStorage);

  window.rxStorage.sessionStorage = storageMapObject(window.sessionStorage);

}).call(this);

//# sourceMappingURL=main.js.map
