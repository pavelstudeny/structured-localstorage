describe('storage object', function () {
    var storage;

    beforeAll(function () {
        var LocalStorage = require('node-localstorage').LocalStorage;
        global.localStorage = new LocalStorage('./tmp');
    });
    afterAll(function () {
        delete global.localStorage;
        var rm = require('rimraf').sync;
        rm('./tmp');
    });
    beforeEach(function () {
        localStorage.clear();
        storage = require('../index.js');
    });

    it("persists a simple value", function () {
        storage.key = 'value';
        expect(storage.key).toBe('value');
        expect(localStorage.getItem('key')).toBe('value');
    });

    it("returns null on no value", function () {
        expect(storage.nokey).toBeNull();
    });

    it("persists an object value", function () {
        storage.key = { subkey: 'value' };
        expect(storage.key.subkey).toBe('value');
        expect(localStorage.getItem('key')).toBe('{"subkey":"value"}');
    });

    it("persists an array value", function () {
        storage.key = [ 1, 2 ];
        expect(storage.key).toEqual(jasmine.arrayContaining([1, 2]));
        expect(localStorage.getItem('key')).toBe('[1,2]');
    });

    it("manipulates an array", function () {
        storage.key = [ 1 ];
        storage.key.push(2);
        expect(storage.key).toEqual(jasmine.arrayContaining([1, 2]));
        expect(localStorage.getItem('key')).toBe('[1,2]');
    });

    it("persists an array of objects", function () {
        storage.key = [ { key: 1} , {key: 2} ];
        expect(storage.key).toEqual(jasmine.arrayContaining([ jasmine.objectContaining({ key: 1}) , jasmine.objectContaining({key: 2}) ]));
        expect(localStorage.getItem('key')).toBe('[{"key":1},{"key":2}]');
    });

    it("persists an object subkey value", function () {
        storage.key = { subkey: 'value' };
        storage.key.subkey = 'new value'
        expect(storage.key.subkey).toBe('new value');
        expect(localStorage.getItem('key')).toBe('{"subkey":"new value"}');
    });

    it("returns null on no subkey value", function () {
        storage.key = { subkey: 'value' };
        expect(storage.key.nokey).toBeNull();
    });

    it("persists an object sub-subkey value", function () {
        storage.key = { intermediate: { subkey: 'value' } };
        storage.key.intermediate.subkey = 'new value'
        expect(storage.key.intermediate.subkey).toBe('new value');
        expect(localStorage.getItem('key')).toBe('{"intermediate":{"subkey":"new value"}}');
    });

    it("persists an object subkey subkey value", function () {
        storage.key = { intermediate: { subkey: 'value' } };
        storage.key.intermediate = { subkey: 'new value' };

        expect(storage.key.intermediate.subkey).toBe('new value');
        expect(localStorage.getItem('key')).toBe('{"intermediate":{"subkey":"new value"}}');

        storage.key.intermediate.subkey = 'newest value'

        expect(storage.key.intermediate.subkey).toBe('newest value');
        expect(localStorage.getItem('key')).toBe('{"intermediate":{"subkey":"newest value"}}');
    });

    it("persists ad-hoc iteration", function () {
        var path = [ 'key', 'intermediate'];
        storage.key = {};
        var s = storage;
        while (path.length > 0) {
            var k = path.shift();
            if (!s[k]) {
                s[k] = {};
            }
            s = s[k];
        }
        s['subkey'] = 'value';
        expect(localStorage.getItem('key')).toBe('{"intermediate":{"subkey":"value"}}');
    });

    it("deletes keys", function () {
        storage.key = 1;
        expect(Object.keys(storage).length).toBe(1);
        delete storage.key;
        expect(Object.keys(storage).length).toBe(0);
    });

    it("deletes sub-keys", function () {
        storage.key = { value: 1 };
        expect(Object.keys(storage.key).length).toBe(1);
        delete storage.key.value;
        expect(Object.keys(storage.key).length).toBe(0);
    });

    it("enumerates keys", function () {
        storage.key = 1;
        var hit = false;
        var count = 0;
        for (var key in storage) {
            ++count;
            if (key == 'key')
                hit = true;
        }
        expect(hit).toBeTruthy();
        expect(count).toBe(1);
    });

    it("enumerates sub-keys", function () {
        storage.key = { value: 1 };
        var hit = false;
        var count = 0;
        for (var key in storage.key) {
            ++count;
            if (key == 'value')
                hit = true;
        }
        expect(hit).toBeTruthy();
        expect(count).toBe(1);
    });
});
