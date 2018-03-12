'use strict';

var pstorage = new Proxy({
}, {
    get: function (target, name, receiver) {
        var strValue = localStorage.getItem(name);
        try {
            // null i parsed as null succesfully
            var data = JSON.parse(strValue);
            return proxify(data);
        }
        catch (ex) {
            return strValue;
        }

        /**
         * this will recursively return Proxies on obj members and sub-members that are also objects
         * @param obj the full object
         * @param path member and sub...-members path, e.g. [a, c] for { a: { c: { d: 1 } }, b: 2 }
         */
        function proxify(obj, path) {
            if (obj === null || typeof obj === 'undefined') {
                return null;
            }

            if (!path) {
                path = [];
            }

            // get to the sub-member in question
            var p = path.slice();
            var o = obj;
            while (p.length > 0) {
                o = o[p.shift()];
            }
            if (o === null || typeof o === 'undefined') {
                return null;
            }
            if (typeof o !== 'object') {
                // nothing to proxy
                return o;
            }
            var p = new Proxy(Array.isArray(o) ? [] : {}, {
                get: function(t, n) {
                    return proxify(obj, path.concat([n]));  // keep appending path
                },
                set: function (t, n, v) {
                    o[n] = v;  // this updates 'o' within 'obj'
                    receiver[name] = obj;  // now write the full 'obj' to localStorage
                    return true;
                },
                ownKeys: function() {
                    return Object.keys(o);
                },
                has: function(t, n) {
                    return typeof o[n] !== 'undefined';
                },
                getOwnPropertyDescriptor: function(t, n) {
                    if (typeof o[n] === 'undefined') {
                        return;  // undefined
                    }
                    return { writable: true, enumerable: true, configurable: true };
                },
                deleteProperty(t, n) {
                    delete o[n];
                    receiver[name] = obj;
                    return true;
                }
            });
            return p;
        }
    },
    set: function (target, name, value, receiver) {
        var strValue;
        if (value === null) {
            localStorage.removeItem(name);
            return true;
        }
        switch (typeof value) {
        case 'string': strValue = value; break;
        case 'object': strValue = JSON.stringify(value); break;
        case 'undefined': localStorage.removeItem(name); return true;
        default: strValue = value.toString();
        }
        localStorage.setItem(name, strValue);
        return true;
    },
    ownKeys: function() {
        var keys = [];
        for (var i = 0; i < localStorage.length; ++i) {
            keys.push(localStorage.key(i));
        }
        return keys;
    },
    has: function(t, n) {
        return localStorage.getItem(n) !== null;
    },
    getOwnPropertyDescriptor: function(t, n) {
        if (localStorage.getItem(n) === null) {
            return;  // undefined
        }
        return { writable: true, enumerable: true, configurable: true };
    },
    deleteProperty(t, n) {
        localStorage.removeItem(n);
        return true;
    }
});

module.exports = pstorage;
