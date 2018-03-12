Transparently store JSONable data into localStorage

localStorage provides a simple key - string value storage.
This module behaves like a regular object and stores its data to localStorage on the background.

Requires browsers that support [Proxy object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy):
* Chrome 49+
* Firefox 18+
* Edge
* Safari 10+

Usage
=====

```
var storage = require('structured-localstorage');

storage.key = { subkey: 'value' };
storage.key.subkey = 'new value';

storage.clear(/k*/);
storage.clear(['key1', 'key2']);
storage.clear();
```
