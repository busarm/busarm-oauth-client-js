(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.BusarmOAuth = {}));
})(this, (function (exports) { 'use strict';

  var axios$2 = {exports: {}};

  var bind$2 = function bind(fn, thisArg) {
    return function wrap() {
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      return fn.apply(thisArg, args);
    };
  };

  var bind$1 = bind$2;

  // utils is a library of generic helper functions non-specific to axios

  var toString = Object.prototype.toString;

  /**
   * Determine if a value is an Array
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Array, otherwise false
   */
  function isArray(val) {
    return Array.isArray(val);
  }

  /**
   * Determine if a value is undefined
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if the value is undefined, otherwise false
   */
  function isUndefined(val) {
    return typeof val === 'undefined';
  }

  /**
   * Determine if a value is a Buffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Buffer, otherwise false
   */
  function isBuffer(val) {
    return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
      && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
  }

  /**
   * Determine if a value is an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an ArrayBuffer, otherwise false
   */
  function isArrayBuffer(val) {
    return toString.call(val) === '[object ArrayBuffer]';
  }

  /**
   * Determine if a value is a FormData
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an FormData, otherwise false
   */
  function isFormData(val) {
    return toString.call(val) === '[object FormData]';
  }

  /**
   * Determine if a value is a view on an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
   */
  function isArrayBufferView(val) {
    var result;
    if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
      result = ArrayBuffer.isView(val);
    } else {
      result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
    }
    return result;
  }

  /**
   * Determine if a value is a String
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a String, otherwise false
   */
  function isString(val) {
    return typeof val === 'string';
  }

  /**
   * Determine if a value is a Number
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Number, otherwise false
   */
  function isNumber(val) {
    return typeof val === 'number';
  }

  /**
   * Determine if a value is an Object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Object, otherwise false
   */
  function isObject(val) {
    return val !== null && typeof val === 'object';
  }

  /**
   * Determine if a value is a plain Object
   *
   * @param {Object} val The value to test
   * @return {boolean} True if value is a plain Object, otherwise false
   */
  function isPlainObject(val) {
    if (toString.call(val) !== '[object Object]') {
      return false;
    }

    var prototype = Object.getPrototypeOf(val);
    return prototype === null || prototype === Object.prototype;
  }

  /**
   * Determine if a value is a Date
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Date, otherwise false
   */
  function isDate(val) {
    return toString.call(val) === '[object Date]';
  }

  /**
   * Determine if a value is a File
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a File, otherwise false
   */
  function isFile(val) {
    return toString.call(val) === '[object File]';
  }

  /**
   * Determine if a value is a Blob
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Blob, otherwise false
   */
  function isBlob(val) {
    return toString.call(val) === '[object Blob]';
  }

  /**
   * Determine if a value is a Function
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Function, otherwise false
   */
  function isFunction(val) {
    return toString.call(val) === '[object Function]';
  }

  /**
   * Determine if a value is a Stream
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Stream, otherwise false
   */
  function isStream(val) {
    return isObject(val) && isFunction(val.pipe);
  }

  /**
   * Determine if a value is a URLSearchParams object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a URLSearchParams object, otherwise false
   */
  function isURLSearchParams(val) {
    return toString.call(val) === '[object URLSearchParams]';
  }

  /**
   * Trim excess whitespace off the beginning and end of a string
   *
   * @param {String} str The String to trim
   * @returns {String} The String freed of excess whitespace
   */
  function trim(str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
  }

  /**
   * Determine if we're running in a standard browser environment
   *
   * This allows axios to run in a web worker, and react-native.
   * Both environments support XMLHttpRequest, but not fully standard globals.
   *
   * web workers:
   *  typeof window -> undefined
   *  typeof document -> undefined
   *
   * react-native:
   *  navigator.product -> 'ReactNative'
   * nativescript
   *  navigator.product -> 'NativeScript' or 'NS'
   */
  function isStandardBrowserEnv() {
    if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                             navigator.product === 'NativeScript' ||
                                             navigator.product === 'NS')) {
      return false;
    }
    return (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined'
    );
  }

  /**
   * Iterate over an Array or an Object invoking a function for each item.
   *
   * If `obj` is an Array callback will be called passing
   * the value, index, and complete array for each item.
   *
   * If 'obj' is an Object callback will be called passing
   * the value, key, and complete object for each property.
   *
   * @param {Object|Array} obj The object to iterate
   * @param {Function} fn The callback to invoke for each item
   */
  function forEach(obj, fn) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
      return;
    }

    // Force an array if not already something iterable
    if (typeof obj !== 'object') {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }

    if (isArray(obj)) {
      // Iterate over array values
      for (var i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // Iterate over object keys
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(null, obj[key], key, obj);
        }
      }
    }
  }

  /**
   * Accepts varargs expecting each argument to be an object, then
   * immutably merges the properties of each object and returns result.
   *
   * When multiple objects contain the same key the later object in
   * the arguments list will take precedence.
   *
   * Example:
   *
   * ```js
   * var result = merge({foo: 123}, {foo: 456});
   * console.log(result.foo); // outputs 456
   * ```
   *
   * @param {Object} obj1 Object to merge
   * @returns {Object} Result of all merge properties
   */
  function merge(/* obj1, obj2, obj3, ... */) {
    var result = {};
    function assignValue(val, key) {
      if (isPlainObject(result[key]) && isPlainObject(val)) {
        result[key] = merge(result[key], val);
      } else if (isPlainObject(val)) {
        result[key] = merge({}, val);
      } else if (isArray(val)) {
        result[key] = val.slice();
      } else {
        result[key] = val;
      }
    }

    for (var i = 0, l = arguments.length; i < l; i++) {
      forEach(arguments[i], assignValue);
    }
    return result;
  }

  /**
   * Extends object a by mutably adding to it the properties of object b.
   *
   * @param {Object} a The object to be extended
   * @param {Object} b The object to copy properties from
   * @param {Object} thisArg The object to bind function to
   * @return {Object} The resulting value of object a
   */
  function extend(a, b, thisArg) {
    forEach(b, function assignValue(val, key) {
      if (thisArg && typeof val === 'function') {
        a[key] = bind$1(val, thisArg);
      } else {
        a[key] = val;
      }
    });
    return a;
  }

  /**
   * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
   *
   * @param {string} content with BOM
   * @return {string} content value without BOM
   */
  function stripBOM(content) {
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    return content;
  }

  var utils$e = {
    isArray: isArray,
    isArrayBuffer: isArrayBuffer,
    isBuffer: isBuffer,
    isFormData: isFormData,
    isArrayBufferView: isArrayBufferView,
    isString: isString,
    isNumber: isNumber,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isUndefined: isUndefined,
    isDate: isDate,
    isFile: isFile,
    isBlob: isBlob,
    isFunction: isFunction,
    isStream: isStream,
    isURLSearchParams: isURLSearchParams,
    isStandardBrowserEnv: isStandardBrowserEnv,
    forEach: forEach,
    merge: merge,
    extend: extend,
    trim: trim,
    stripBOM: stripBOM
  };

  var utils$d = utils$e;

  function encode(val) {
    return encodeURIComponent(val).
      replace(/%3A/gi, ':').
      replace(/%24/g, '$').
      replace(/%2C/gi, ',').
      replace(/%20/g, '+').
      replace(/%5B/gi, '[').
      replace(/%5D/gi, ']');
  }

  /**
   * Build a URL by appending params to the end
   *
   * @param {string} url The base of the url (e.g., http://www.google.com)
   * @param {object} [params] The params to be appended
   * @returns {string} The formatted url
   */
  var buildURL$2 = function buildURL(url, params, paramsSerializer) {
    /*eslint no-param-reassign:0*/
    if (!params) {
      return url;
    }

    var serializedParams;
    if (paramsSerializer) {
      serializedParams = paramsSerializer(params);
    } else if (utils$d.isURLSearchParams(params)) {
      serializedParams = params.toString();
    } else {
      var parts = [];

      utils$d.forEach(params, function serialize(val, key) {
        if (val === null || typeof val === 'undefined') {
          return;
        }

        if (utils$d.isArray(val)) {
          key = key + '[]';
        } else {
          val = [val];
        }

        utils$d.forEach(val, function parseValue(v) {
          if (utils$d.isDate(v)) {
            v = v.toISOString();
          } else if (utils$d.isObject(v)) {
            v = JSON.stringify(v);
          }
          parts.push(encode(key) + '=' + encode(v));
        });
      });

      serializedParams = parts.join('&');
    }

    if (serializedParams) {
      var hashmarkIndex = url.indexOf('#');
      if (hashmarkIndex !== -1) {
        url = url.slice(0, hashmarkIndex);
      }

      url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
  };

  var utils$c = utils$e;

  function InterceptorManager$1() {
    this.handlers = [];
  }

  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  InterceptorManager$1.prototype.use = function use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled: fulfilled,
      rejected: rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  };

  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   */
  InterceptorManager$1.prototype.eject = function eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  };

  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   */
  InterceptorManager$1.prototype.forEach = function forEach(fn) {
    utils$c.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  };

  var InterceptorManager_1 = InterceptorManager$1;

  var utils$b = utils$e;

  var normalizeHeaderName$1 = function normalizeHeaderName(headers, normalizedName) {
    utils$b.forEach(headers, function processHeader(value, name) {
      if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
        headers[normalizedName] = value;
        delete headers[name];
      }
    });
  };

  /**
   * Update an Error with the specified config, error code, and response.
   *
   * @param {Error} error The error to update.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The error.
   */
  var enhanceError$2 = function enhanceError(error, config, code, request, response) {
    error.config = config;
    if (code) {
      error.code = code;
    }

    error.request = request;
    error.response = response;
    error.isAxiosError = true;

    error.toJSON = function toJSON() {
      return {
        // Standard
        message: this.message,
        name: this.name,
        // Microsoft
        description: this.description,
        number: this.number,
        // Mozilla
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        // Axios
        config: this.config,
        code: this.code,
        status: this.response && this.response.status ? this.response.status : null
      };
    };
    return error;
  };

  var transitional = {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  };

  var enhanceError$1 = enhanceError$2;

  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The created error.
   */
  var createError$2 = function createError(message, config, code, request, response) {
    var error = new Error(message);
    return enhanceError$1(error, config, code, request, response);
  };

  var createError$1 = createError$2;

  /**
   * Resolve or reject a Promise based on response status.
   *
   * @param {Function} resolve A function that resolves the promise.
   * @param {Function} reject A function that rejects the promise.
   * @param {object} response The response.
   */
  var settle$1 = function settle(resolve, reject, response) {
    var validateStatus = response.config.validateStatus;
    if (!response.status || !validateStatus || validateStatus(response.status)) {
      resolve(response);
    } else {
      reject(createError$1(
        'Request failed with status code ' + response.status,
        response.config,
        null,
        response.request,
        response
      ));
    }
  };

  var utils$a = utils$e;

  var cookies$1 = (
    utils$a.isStandardBrowserEnv() ?

    // Standard browser envs support document.cookie
      (function standardBrowserEnv() {
        return {
          write: function write(name, value, expires, path, domain, secure) {
            var cookie = [];
            cookie.push(name + '=' + encodeURIComponent(value));

            if (utils$a.isNumber(expires)) {
              cookie.push('expires=' + new Date(expires).toGMTString());
            }

            if (utils$a.isString(path)) {
              cookie.push('path=' + path);
            }

            if (utils$a.isString(domain)) {
              cookie.push('domain=' + domain);
            }

            if (secure === true) {
              cookie.push('secure');
            }

            document.cookie = cookie.join('; ');
          },

          read: function read(name) {
            var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
            return (match ? decodeURIComponent(match[3]) : null);
          },

          remove: function remove(name) {
            this.write(name, '', Date.now() - 86400000);
          }
        };
      })() :

    // Non standard browser env (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return {
          write: function write() {},
          read: function read() { return null; },
          remove: function remove() {}
        };
      })()
  );

  /**
   * Determines whether the specified URL is absolute
   *
   * @param {string} url The URL to test
   * @returns {boolean} True if the specified URL is absolute, otherwise false
   */
  var isAbsoluteURL$1 = function isAbsoluteURL(url) {
    // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
    // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
    // by any combination of letters, digits, plus, period, or hyphen.
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
  };

  /**
   * Creates a new URL by combining the specified URLs
   *
   * @param {string} baseURL The base URL
   * @param {string} relativeURL The relative URL
   * @returns {string} The combined URL
   */
  var combineURLs$1 = function combineURLs(baseURL, relativeURL) {
    return relativeURL
      ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
      : baseURL;
  };

  var isAbsoluteURL = isAbsoluteURL$1;
  var combineURLs = combineURLs$1;

  /**
   * Creates a new URL by combining the baseURL with the requestedURL,
   * only when the requestedURL is not already an absolute URL.
   * If the requestURL is absolute, this function returns the requestedURL untouched.
   *
   * @param {string} baseURL The base URL
   * @param {string} requestedURL Absolute or relative URL to combine
   * @returns {string} The combined full path
   */
  var buildFullPath$1 = function buildFullPath(baseURL, requestedURL) {
    if (baseURL && !isAbsoluteURL(requestedURL)) {
      return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
  };

  var utils$9 = utils$e;

  // Headers whose duplicates are ignored by node
  // c.f. https://nodejs.org/api/http.html#http_message_headers
  var ignoreDuplicateOf = [
    'age', 'authorization', 'content-length', 'content-type', 'etag',
    'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
    'last-modified', 'location', 'max-forwards', 'proxy-authorization',
    'referer', 'retry-after', 'user-agent'
  ];

  /**
   * Parse headers into an object
   *
   * ```
   * Date: Wed, 27 Aug 2014 08:58:49 GMT
   * Content-Type: application/json
   * Connection: keep-alive
   * Transfer-Encoding: chunked
   * ```
   *
   * @param {String} headers Headers needing to be parsed
   * @returns {Object} Headers parsed into an object
   */
  var parseHeaders$1 = function parseHeaders(headers) {
    var parsed = {};
    var key;
    var val;
    var i;

    if (!headers) { return parsed; }

    utils$9.forEach(headers.split('\n'), function parser(line) {
      i = line.indexOf(':');
      key = utils$9.trim(line.substr(0, i)).toLowerCase();
      val = utils$9.trim(line.substr(i + 1));

      if (key) {
        if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
          return;
        }
        if (key === 'set-cookie') {
          parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      }
    });

    return parsed;
  };

  var utils$8 = utils$e;

  var isURLSameOrigin$1 = (
    utils$8.isStandardBrowserEnv() ?

    // Standard browser envs have full support of the APIs needed to test
    // whether the request URL is of the same origin as current location.
      (function standardBrowserEnv() {
        var msie = /(msie|trident)/i.test(navigator.userAgent);
        var urlParsingNode = document.createElement('a');
        var originURL;

        /**
      * Parse a URL to discover it's components
      *
      * @param {String} url The URL to be parsed
      * @returns {Object}
      */
        function resolveURL(url) {
          var href = url;

          if (msie) {
          // IE needs attribute set twice to normalize properties
            urlParsingNode.setAttribute('href', href);
            href = urlParsingNode.href;
          }

          urlParsingNode.setAttribute('href', href);

          // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
          return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
              urlParsingNode.pathname :
              '/' + urlParsingNode.pathname
          };
        }

        originURL = resolveURL(window.location.href);

        /**
      * Determine if a URL shares the same origin as the current location
      *
      * @param {String} requestURL The URL to test
      * @returns {boolean} True if URL shares the same origin, otherwise false
      */
        return function isURLSameOrigin(requestURL) {
          var parsed = (utils$8.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
          return (parsed.protocol === originURL.protocol &&
              parsed.host === originURL.host);
        };
      })() :

    // Non standard browser envs (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return function isURLSameOrigin() {
          return true;
        };
      })()
  );

  /**
   * A `Cancel` is an object that is thrown when an operation is canceled.
   *
   * @class
   * @param {string=} message The message.
   */
  function Cancel$3(message) {
    this.message = message;
  }

  Cancel$3.prototype.toString = function toString() {
    return 'Cancel' + (this.message ? ': ' + this.message : '');
  };

  Cancel$3.prototype.__CANCEL__ = true;

  var Cancel_1 = Cancel$3;

  var utils$7 = utils$e;
  var settle = settle$1;
  var cookies = cookies$1;
  var buildURL$1 = buildURL$2;
  var buildFullPath = buildFullPath$1;
  var parseHeaders = parseHeaders$1;
  var isURLSameOrigin = isURLSameOrigin$1;
  var createError = createError$2;
  var transitionalDefaults$1 = transitional;
  var Cancel$2 = Cancel_1;

  var xhr = function xhrAdapter(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      var requestData = config.data;
      var requestHeaders = config.headers;
      var responseType = config.responseType;
      var onCanceled;
      function done() {
        if (config.cancelToken) {
          config.cancelToken.unsubscribe(onCanceled);
        }

        if (config.signal) {
          config.signal.removeEventListener('abort', onCanceled);
        }
      }

      if (utils$7.isFormData(requestData)) {
        delete requestHeaders['Content-Type']; // Let the browser set it
      }

      var request = new XMLHttpRequest();

      // HTTP basic authentication
      if (config.auth) {
        var username = config.auth.username || '';
        var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
        requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
      }

      var fullPath = buildFullPath(config.baseURL, config.url);
      request.open(config.method.toUpperCase(), buildURL$1(fullPath, config.params, config.paramsSerializer), true);

      // Set the request timeout in MS
      request.timeout = config.timeout;

      function onloadend() {
        if (!request) {
          return;
        }
        // Prepare the response
        var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
        var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
          request.responseText : request.response;
        var response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config: config,
          request: request
        };

        settle(function _resolve(value) {
          resolve(value);
          done();
        }, function _reject(err) {
          reject(err);
          done();
        }, response);

        // Clean up request
        request = null;
      }

      if ('onloadend' in request) {
        // Use onloadend if available
        request.onloadend = onloadend;
      } else {
        // Listen for ready state to emulate onloadend
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }
          // readystate handler is calling before onerror or ontimeout handlers,
          // so we should call onloadend on the next 'tick'
          setTimeout(onloadend);
        };
      }

      // Handle browser request cancellation (as opposed to a manual cancellation)
      request.onabort = function handleAbort() {
        if (!request) {
          return;
        }

        reject(createError('Request aborted', config, 'ECONNABORTED', request));

        // Clean up request
        request = null;
      };

      // Handle low level network errors
      request.onerror = function handleError() {
        // Real errors are hidden from us by the browser
        // onerror should only fire if it's a network error
        reject(createError('Network Error', config, null, request));

        // Clean up request
        request = null;
      };

      // Handle timeout
      request.ontimeout = function handleTimeout() {
        var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
        var transitional = config.transitional || transitionalDefaults$1;
        if (config.timeoutErrorMessage) {
          timeoutErrorMessage = config.timeoutErrorMessage;
        }
        reject(createError(
          timeoutErrorMessage,
          config,
          transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
          request));

        // Clean up request
        request = null;
      };

      // Add xsrf header
      // This is only done if running in a standard browser environment.
      // Specifically not if we're in a web worker, or react-native.
      if (utils$7.isStandardBrowserEnv()) {
        // Add xsrf header
        var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

        if (xsrfValue) {
          requestHeaders[config.xsrfHeaderName] = xsrfValue;
        }
      }

      // Add headers to the request
      if ('setRequestHeader' in request) {
        utils$7.forEach(requestHeaders, function setRequestHeader(val, key) {
          if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
            // Remove Content-Type if data is undefined
            delete requestHeaders[key];
          } else {
            // Otherwise add header to the request
            request.setRequestHeader(key, val);
          }
        });
      }

      // Add withCredentials to request if needed
      if (!utils$7.isUndefined(config.withCredentials)) {
        request.withCredentials = !!config.withCredentials;
      }

      // Add responseType to request if needed
      if (responseType && responseType !== 'json') {
        request.responseType = config.responseType;
      }

      // Handle progress if needed
      if (typeof config.onDownloadProgress === 'function') {
        request.addEventListener('progress', config.onDownloadProgress);
      }

      // Not all browsers support upload events
      if (typeof config.onUploadProgress === 'function' && request.upload) {
        request.upload.addEventListener('progress', config.onUploadProgress);
      }

      if (config.cancelToken || config.signal) {
        // Handle cancellation
        // eslint-disable-next-line func-names
        onCanceled = function(cancel) {
          if (!request) {
            return;
          }
          reject(!cancel || (cancel && cancel.type) ? new Cancel$2('canceled') : cancel);
          request.abort();
          request = null;
        };

        config.cancelToken && config.cancelToken.subscribe(onCanceled);
        if (config.signal) {
          config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
        }
      }

      if (!requestData) {
        requestData = null;
      }

      // Send the request
      request.send(requestData);
    });
  };

  var utils$6 = utils$e;
  var normalizeHeaderName = normalizeHeaderName$1;
  var enhanceError = enhanceError$2;
  var transitionalDefaults = transitional;

  var DEFAULT_CONTENT_TYPE = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  function setContentTypeIfUnset(headers, value) {
    if (!utils$6.isUndefined(headers) && utils$6.isUndefined(headers['Content-Type'])) {
      headers['Content-Type'] = value;
    }
  }

  function getDefaultAdapter() {
    var adapter;
    if (typeof XMLHttpRequest !== 'undefined') {
      // For browsers use XHR adapter
      adapter = xhr;
    } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
      // For node use HTTP adapter
      adapter = xhr;
    }
    return adapter;
  }

  function stringifySafely(rawValue, parser, encoder) {
    if (utils$6.isString(rawValue)) {
      try {
        (parser || JSON.parse)(rawValue);
        return utils$6.trim(rawValue);
      } catch (e) {
        if (e.name !== 'SyntaxError') {
          throw e;
        }
      }
    }

    return (encoder || JSON.stringify)(rawValue);
  }

  var defaults$3 = {

    transitional: transitionalDefaults,

    adapter: getDefaultAdapter(),

    transformRequest: [function transformRequest(data, headers) {
      normalizeHeaderName(headers, 'Accept');
      normalizeHeaderName(headers, 'Content-Type');

      if (utils$6.isFormData(data) ||
        utils$6.isArrayBuffer(data) ||
        utils$6.isBuffer(data) ||
        utils$6.isStream(data) ||
        utils$6.isFile(data) ||
        utils$6.isBlob(data)
      ) {
        return data;
      }
      if (utils$6.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils$6.isURLSearchParams(data)) {
        setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
        return data.toString();
      }
      if (utils$6.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
        setContentTypeIfUnset(headers, 'application/json');
        return stringifySafely(data);
      }
      return data;
    }],

    transformResponse: [function transformResponse(data) {
      var transitional = this.transitional || defaults$3.transitional;
      var silentJSONParsing = transitional && transitional.silentJSONParsing;
      var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
      var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

      if (strictJSONParsing || (forcedJSONParsing && utils$6.isString(data) && data.length)) {
        try {
          return JSON.parse(data);
        } catch (e) {
          if (strictJSONParsing) {
            if (e.name === 'SyntaxError') {
              throw enhanceError(e, this, 'E_JSON_PARSE');
            }
            throw e;
          }
        }
      }

      return data;
    }],

    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,

    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',

    maxContentLength: -1,
    maxBodyLength: -1,

    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    },

    headers: {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    }
  };

  utils$6.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
    defaults$3.headers[method] = {};
  });

  utils$6.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    defaults$3.headers[method] = utils$6.merge(DEFAULT_CONTENT_TYPE);
  });

  var defaults_1 = defaults$3;

  var utils$5 = utils$e;
  var defaults$2 = defaults_1;

  /**
   * Transform the data for a request or a response
   *
   * @param {Object|String} data The data to be transformed
   * @param {Array} headers The headers for the request or response
   * @param {Array|Function} fns A single function or Array of functions
   * @returns {*} The resulting transformed data
   */
  var transformData$1 = function transformData(data, headers, fns) {
    var context = this || defaults$2;
    /*eslint no-param-reassign:0*/
    utils$5.forEach(fns, function transform(fn) {
      data = fn.call(context, data, headers);
    });

    return data;
  };

  var isCancel$1 = function isCancel(value) {
    return !!(value && value.__CANCEL__);
  };

  var utils$4 = utils$e;
  var transformData = transformData$1;
  var isCancel = isCancel$1;
  var defaults$1 = defaults_1;
  var Cancel$1 = Cancel_1;

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */
  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }

    if (config.signal && config.signal.aborted) {
      throw new Cancel$1('canceled');
    }
  }

  /**
   * Dispatch a request to the server using the configured adapter.
   *
   * @param {object} config The config that is to be used for the request
   * @returns {Promise} The Promise to be fulfilled
   */
  var dispatchRequest$1 = function dispatchRequest(config) {
    throwIfCancellationRequested(config);

    // Ensure headers exist
    config.headers = config.headers || {};

    // Transform request data
    config.data = transformData.call(
      config,
      config.data,
      config.headers,
      config.transformRequest
    );

    // Flatten headers
    config.headers = utils$4.merge(
      config.headers.common || {},
      config.headers[config.method] || {},
      config.headers
    );

    utils$4.forEach(
      ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
      function cleanHeaderConfig(method) {
        delete config.headers[method];
      }
    );

    var adapter = config.adapter || defaults$1.adapter;

    return adapter(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config);

      // Transform response data
      response.data = transformData.call(
        config,
        response.data,
        response.headers,
        config.transformResponse
      );

      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);

        // Transform response data
        if (reason && reason.response) {
          reason.response.data = transformData.call(
            config,
            reason.response.data,
            reason.response.headers,
            config.transformResponse
          );
        }
      }

      return Promise.reject(reason);
    });
  };

  var utils$3 = utils$e;

  /**
   * Config-specific merge-function which creates a new config-object
   * by merging two configuration objects together.
   *
   * @param {Object} config1
   * @param {Object} config2
   * @returns {Object} New object resulting from merging config2 to config1
   */
  var mergeConfig$2 = function mergeConfig(config1, config2) {
    // eslint-disable-next-line no-param-reassign
    config2 = config2 || {};
    var config = {};

    function getMergedValue(target, source) {
      if (utils$3.isPlainObject(target) && utils$3.isPlainObject(source)) {
        return utils$3.merge(target, source);
      } else if (utils$3.isPlainObject(source)) {
        return utils$3.merge({}, source);
      } else if (utils$3.isArray(source)) {
        return source.slice();
      }
      return source;
    }

    // eslint-disable-next-line consistent-return
    function mergeDeepProperties(prop) {
      if (!utils$3.isUndefined(config2[prop])) {
        return getMergedValue(config1[prop], config2[prop]);
      } else if (!utils$3.isUndefined(config1[prop])) {
        return getMergedValue(undefined, config1[prop]);
      }
    }

    // eslint-disable-next-line consistent-return
    function valueFromConfig2(prop) {
      if (!utils$3.isUndefined(config2[prop])) {
        return getMergedValue(undefined, config2[prop]);
      }
    }

    // eslint-disable-next-line consistent-return
    function defaultToConfig2(prop) {
      if (!utils$3.isUndefined(config2[prop])) {
        return getMergedValue(undefined, config2[prop]);
      } else if (!utils$3.isUndefined(config1[prop])) {
        return getMergedValue(undefined, config1[prop]);
      }
    }

    // eslint-disable-next-line consistent-return
    function mergeDirectKeys(prop) {
      if (prop in config2) {
        return getMergedValue(config1[prop], config2[prop]);
      } else if (prop in config1) {
        return getMergedValue(undefined, config1[prop]);
      }
    }

    var mergeMap = {
      'url': valueFromConfig2,
      'method': valueFromConfig2,
      'data': valueFromConfig2,
      'baseURL': defaultToConfig2,
      'transformRequest': defaultToConfig2,
      'transformResponse': defaultToConfig2,
      'paramsSerializer': defaultToConfig2,
      'timeout': defaultToConfig2,
      'timeoutMessage': defaultToConfig2,
      'withCredentials': defaultToConfig2,
      'adapter': defaultToConfig2,
      'responseType': defaultToConfig2,
      'xsrfCookieName': defaultToConfig2,
      'xsrfHeaderName': defaultToConfig2,
      'onUploadProgress': defaultToConfig2,
      'onDownloadProgress': defaultToConfig2,
      'decompress': defaultToConfig2,
      'maxContentLength': defaultToConfig2,
      'maxBodyLength': defaultToConfig2,
      'transport': defaultToConfig2,
      'httpAgent': defaultToConfig2,
      'httpsAgent': defaultToConfig2,
      'cancelToken': defaultToConfig2,
      'socketPath': defaultToConfig2,
      'responseEncoding': defaultToConfig2,
      'validateStatus': mergeDirectKeys
    };

    utils$3.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
      var merge = mergeMap[prop] || mergeDeepProperties;
      var configValue = merge(prop);
      (utils$3.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
    });

    return config;
  };

  var data = {
    "version": "0.26.1"
  };

  var VERSION = data.version;

  var validators$1 = {};

  // eslint-disable-next-line func-names
  ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
    validators$1[type] = function validator(thing) {
      return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
    };
  });

  var deprecatedWarnings = {};

  /**
   * Transitional option validator
   * @param {function|boolean?} validator - set to false if the transitional option has been removed
   * @param {string?} version - deprecated version / removed since version
   * @param {string?} message - some message with additional info
   * @returns {function}
   */
  validators$1.transitional = function transitional(validator, version, message) {
    function formatMessage(opt, desc) {
      return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
    }

    // eslint-disable-next-line func-names
    return function(value, opt, opts) {
      if (validator === false) {
        throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
      }

      if (version && !deprecatedWarnings[opt]) {
        deprecatedWarnings[opt] = true;
        // eslint-disable-next-line no-console
        console.warn(
          formatMessage(
            opt,
            ' has been deprecated since v' + version + ' and will be removed in the near future'
          )
        );
      }

      return validator ? validator(value, opt, opts) : true;
    };
  };

  /**
   * Assert object's properties type
   * @param {object} options
   * @param {object} schema
   * @param {boolean?} allowUnknown
   */

  function assertOptions(options, schema, allowUnknown) {
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    var keys = Object.keys(options);
    var i = keys.length;
    while (i-- > 0) {
      var opt = keys[i];
      var validator = schema[opt];
      if (validator) {
        var value = options[opt];
        var result = value === undefined || validator(value, opt, options);
        if (result !== true) {
          throw new TypeError('option ' + opt + ' must be ' + result);
        }
        continue;
      }
      if (allowUnknown !== true) {
        throw Error('Unknown option ' + opt);
      }
    }
  }

  var validator$1 = {
    assertOptions: assertOptions,
    validators: validators$1
  };

  var utils$2 = utils$e;
  var buildURL = buildURL$2;
  var InterceptorManager = InterceptorManager_1;
  var dispatchRequest = dispatchRequest$1;
  var mergeConfig$1 = mergeConfig$2;
  var validator = validator$1;

  var validators = validator.validators;
  /**
   * Create a new instance of Axios
   *
   * @param {Object} instanceConfig The default config for the instance
   */
  function Axios$1(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    };
  }

  /**
   * Dispatch a request
   *
   * @param {Object} config The config specific for this request (merged with this.defaults)
   */
  Axios$1.prototype.request = function request(configOrUrl, config) {
    /*eslint no-param-reassign:0*/
    // Allow for axios('example/url'[, config]) a la fetch API
    if (typeof configOrUrl === 'string') {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }

    config = mergeConfig$1(this.defaults, config);

    // Set config.method
    if (config.method) {
      config.method = config.method.toLowerCase();
    } else if (this.defaults.method) {
      config.method = this.defaults.method.toLowerCase();
    } else {
      config.method = 'get';
    }

    var transitional = config.transitional;

    if (transitional !== undefined) {
      validator.assertOptions(transitional, {
        silentJSONParsing: validators.transitional(validators.boolean),
        forcedJSONParsing: validators.transitional(validators.boolean),
        clarifyTimeoutError: validators.transitional(validators.boolean)
      }, false);
    }

    // filter out skipped interceptors
    var requestInterceptorChain = [];
    var synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
        return;
      }

      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });

    var responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });

    var promise;

    if (!synchronousRequestInterceptors) {
      var chain = [dispatchRequest, undefined];

      Array.prototype.unshift.apply(chain, requestInterceptorChain);
      chain = chain.concat(responseInterceptorChain);

      promise = Promise.resolve(config);
      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    }


    var newConfig = config;
    while (requestInterceptorChain.length) {
      var onFulfilled = requestInterceptorChain.shift();
      var onRejected = requestInterceptorChain.shift();
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected(error);
        break;
      }
    }

    try {
      promise = dispatchRequest(newConfig);
    } catch (error) {
      return Promise.reject(error);
    }

    while (responseInterceptorChain.length) {
      promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
    }

    return promise;
  };

  Axios$1.prototype.getUri = function getUri(config) {
    config = mergeConfig$1(this.defaults, config);
    return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
  };

  // Provide aliases for supported request methods
  utils$2.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    Axios$1.prototype[method] = function(url, config) {
      return this.request(mergeConfig$1(config || {}, {
        method: method,
        url: url,
        data: (config || {}).data
      }));
    };
  });

  utils$2.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    /*eslint func-names:0*/
    Axios$1.prototype[method] = function(url, data, config) {
      return this.request(mergeConfig$1(config || {}, {
        method: method,
        url: url,
        data: data
      }));
    };
  });

  var Axios_1 = Axios$1;

  var Cancel = Cancel_1;

  /**
   * A `CancelToken` is an object that can be used to request cancellation of an operation.
   *
   * @class
   * @param {Function} executor The executor function.
   */
  function CancelToken(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }

    var resolvePromise;

    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });

    var token = this;

    // eslint-disable-next-line func-names
    this.promise.then(function(cancel) {
      if (!token._listeners) return;

      var i;
      var l = token._listeners.length;

      for (i = 0; i < l; i++) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });

    // eslint-disable-next-line func-names
    this.promise.then = function(onfulfilled) {
      var _resolve;
      // eslint-disable-next-line func-names
      var promise = new Promise(function(resolve) {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);

      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };

      return promise;
    };

    executor(function cancel(message) {
      if (token.reason) {
        // Cancellation has already been requested
        return;
      }

      token.reason = new Cancel(message);
      resolvePromise(token.reason);
    });
  }

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */
  CancelToken.prototype.throwIfRequested = function throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  };

  /**
   * Subscribe to the cancel signal
   */

  CancelToken.prototype.subscribe = function subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }

    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  };

  /**
   * Unsubscribe from the cancel signal
   */

  CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    var index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  };

  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  CancelToken.source = function source() {
    var cancel;
    var token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token: token,
      cancel: cancel
    };
  };

  var CancelToken_1 = CancelToken;

  /**
   * Syntactic sugar for invoking a function and expanding an array for arguments.
   *
   * Common use case would be to use `Function.prototype.apply`.
   *
   *  ```js
   *  function f(x, y, z) {}
   *  var args = [1, 2, 3];
   *  f.apply(null, args);
   *  ```
   *
   * With `spread` this example can be re-written.
   *
   *  ```js
   *  spread(function(x, y, z) {})([1, 2, 3]);
   *  ```
   *
   * @param {Function} callback
   * @returns {Function}
   */
  var spread = function spread(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  };

  var utils$1 = utils$e;

  /**
   * Determines whether the payload is an error thrown by Axios
   *
   * @param {*} payload The value to test
   * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
   */
  var isAxiosError = function isAxiosError(payload) {
    return utils$1.isObject(payload) && (payload.isAxiosError === true);
  };

  var utils = utils$e;
  var bind = bind$2;
  var Axios = Axios_1;
  var mergeConfig = mergeConfig$2;
  var defaults = defaults_1;

  /**
   * Create an instance of Axios
   *
   * @param {Object} defaultConfig The default config for the instance
   * @return {Axios} A new instance of Axios
   */
  function createInstance(defaultConfig) {
    var context = new Axios(defaultConfig);
    var instance = bind(Axios.prototype.request, context);

    // Copy axios.prototype to instance
    utils.extend(instance, Axios.prototype, context);

    // Copy context to instance
    utils.extend(instance, context);

    // Factory for creating new instances
    instance.create = function create(instanceConfig) {
      return createInstance(mergeConfig(defaultConfig, instanceConfig));
    };

    return instance;
  }

  // Create the default instance to be exported
  var axios$1 = createInstance(defaults);

  // Expose Axios class to allow class inheritance
  axios$1.Axios = Axios;

  // Expose Cancel & CancelToken
  axios$1.Cancel = Cancel_1;
  axios$1.CancelToken = CancelToken_1;
  axios$1.isCancel = isCancel$1;
  axios$1.VERSION = data.version;

  // Expose all/spread
  axios$1.all = function all(promises) {
    return Promise.all(promises);
  };
  axios$1.spread = spread;

  // Expose isAxiosError
  axios$1.isAxiosError = isAxiosError;

  axios$2.exports = axios$1;

  // Allow use of default import syntax in TypeScript
  axios$2.exports.default = axios$1;

  var axios = axios$2.exports;

  var buffer = {};

  var base64Js = {};

  base64Js.byteLength = byteLength;
  base64Js.toByteArray = toByteArray;
  base64Js.fromByteArray = fromByteArray;

  var lookup = [];
  var revLookup = [];
  var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }

  // Support decoding URL-safe base64 strings, as Node.js does.
  // See: https://en.wikipedia.org/wiki/Base64#URL_applications
  revLookup['-'.charCodeAt(0)] = 62;
  revLookup['_'.charCodeAt(0)] = 63;

  function getLens (b64) {
    var len = b64.length;

    if (len % 4 > 0) {
      throw new Error('Invalid string. Length must be a multiple of 4')
    }

    // Trim off extra bytes after placeholder bytes are found
    // See: https://github.com/beatgammit/base64-js/issues/42
    var validLen = b64.indexOf('=');
    if (validLen === -1) validLen = len;

    var placeHoldersLen = validLen === len
      ? 0
      : 4 - (validLen % 4);

    return [validLen, placeHoldersLen]
  }

  // base64 is 4/3 + up to two characters of the original data
  function byteLength (b64) {
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
  }

  function _byteLength (b64, validLen, placeHoldersLen) {
    return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
  }

  function toByteArray (b64) {
    var tmp;
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];

    var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));

    var curByte = 0;

    // if there are placeholders, only get up to the last complete 4 chars
    var len = placeHoldersLen > 0
      ? validLen - 4
      : validLen;

    var i;
    for (i = 0; i < len; i += 4) {
      tmp =
        (revLookup[b64.charCodeAt(i)] << 18) |
        (revLookup[b64.charCodeAt(i + 1)] << 12) |
        (revLookup[b64.charCodeAt(i + 2)] << 6) |
        revLookup[b64.charCodeAt(i + 3)];
      arr[curByte++] = (tmp >> 16) & 0xFF;
      arr[curByte++] = (tmp >> 8) & 0xFF;
      arr[curByte++] = tmp & 0xFF;
    }

    if (placeHoldersLen === 2) {
      tmp =
        (revLookup[b64.charCodeAt(i)] << 2) |
        (revLookup[b64.charCodeAt(i + 1)] >> 4);
      arr[curByte++] = tmp & 0xFF;
    }

    if (placeHoldersLen === 1) {
      tmp =
        (revLookup[b64.charCodeAt(i)] << 10) |
        (revLookup[b64.charCodeAt(i + 1)] << 4) |
        (revLookup[b64.charCodeAt(i + 2)] >> 2);
      arr[curByte++] = (tmp >> 8) & 0xFF;
      arr[curByte++] = tmp & 0xFF;
    }

    return arr
  }

  function tripletToBase64 (num) {
    return lookup[num >> 18 & 0x3F] +
      lookup[num >> 12 & 0x3F] +
      lookup[num >> 6 & 0x3F] +
      lookup[num & 0x3F]
  }

  function encodeChunk (uint8, start, end) {
    var tmp;
    var output = [];
    for (var i = start; i < end; i += 3) {
      tmp =
        ((uint8[i] << 16) & 0xFF0000) +
        ((uint8[i + 1] << 8) & 0xFF00) +
        (uint8[i + 2] & 0xFF);
      output.push(tripletToBase64(tmp));
    }
    return output.join('')
  }

  function fromByteArray (uint8) {
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
    var parts = [];
    var maxChunkLength = 16383; // must be multiple of 3

    // go through the array every three bytes, we'll deal with trailing stuff later
    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
    }

    // pad the end with zeros, but make sure to not forget the extra bytes
    if (extraBytes === 1) {
      tmp = uint8[len - 1];
      parts.push(
        lookup[tmp >> 2] +
        lookup[(tmp << 4) & 0x3F] +
        '=='
      );
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + uint8[len - 1];
      parts.push(
        lookup[tmp >> 10] +
        lookup[(tmp >> 4) & 0x3F] +
        lookup[(tmp << 2) & 0x3F] +
        '='
      );
    }

    return parts.join('')
  }

  var ieee754 = {};

  /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */

  ieee754.read = function (buffer, offset, isLE, mLen, nBytes) {
    var e, m;
    var eLen = (nBytes * 8) - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? (nBytes - 1) : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];

    i += d;

    e = s & ((1 << (-nBits)) - 1);
    s >>= (-nBits);
    nBits += eLen;
    for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

    m = e & ((1 << (-nBits)) - 1);
    e >>= (-nBits);
    nBits += mLen;
    for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : ((s ? -1 : 1) * Infinity)
    } else {
      m = m + Math.pow(2, mLen);
      e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
  };

  ieee754.write = function (buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = (nBytes * 8) - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
    var i = isLE ? 0 : (nBytes - 1);
    var d = isLE ? 1 : -1;
    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

    value = Math.abs(value);

    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0;
      e = eMax;
    } else {
      e = Math.floor(Math.log(value) / Math.LN2);
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * Math.pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }

      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = ((value * c) - 1) * Math.pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
        e = 0;
      }
    }

    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

    e = (e << mLen) | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

    buffer[offset + i - d] |= s * 128;
  };

  /*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   */

  (function (exports) {

  var base64 = base64Js;
  var ieee754$1 = ieee754;

  exports.Buffer = Buffer;
  exports.SlowBuffer = SlowBuffer;
  exports.INSPECT_MAX_BYTES = 50;

  var K_MAX_LENGTH = 0x7fffffff;
  exports.kMaxLength = K_MAX_LENGTH;

  /**
   * If `Buffer.TYPED_ARRAY_SUPPORT`:
   *   === true    Use Uint8Array implementation (fastest)
   *   === false   Print warning and recommend using `buffer` v4.x which has an Object
   *               implementation (most compatible, even IE6)
   *
   * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
   * Opera 11.6+, iOS 4.2+.
   *
   * We report that the browser does not support typed arrays if the are not subclassable
   * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
   * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
   * for __proto__ and has a buggy typed array implementation.
   */
  Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

  if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
      typeof console.error === 'function') {
    console.error(
      'This browser lacks typed array (Uint8Array) support which is required by ' +
      '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
    );
  }

  function typedArraySupport () {
    // Can typed array instances can be augmented?
    try {
      var arr = new Uint8Array(1);
      arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } };
      return arr.foo() === 42
    } catch (e) {
      return false
    }
  }

  Object.defineProperty(Buffer.prototype, 'parent', {
    enumerable: true,
    get: function () {
      if (!Buffer.isBuffer(this)) return undefined
      return this.buffer
    }
  });

  Object.defineProperty(Buffer.prototype, 'offset', {
    enumerable: true,
    get: function () {
      if (!Buffer.isBuffer(this)) return undefined
      return this.byteOffset
    }
  });

  function createBuffer (length) {
    if (length > K_MAX_LENGTH) {
      throw new RangeError('The value "' + length + '" is invalid for option "size"')
    }
    // Return an augmented `Uint8Array` instance
    var buf = new Uint8Array(length);
    buf.__proto__ = Buffer.prototype;
    return buf
  }

  /**
   * The Buffer constructor returns instances of `Uint8Array` that have their
   * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
   * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
   * and the `Uint8Array` methods. Square bracket notation works as expected -- it
   * returns a single octet.
   *
   * The `Uint8Array` prototype remains unmodified.
   */

  function Buffer (arg, encodingOrOffset, length) {
    // Common case.
    if (typeof arg === 'number') {
      if (typeof encodingOrOffset === 'string') {
        throw new TypeError(
          'The "string" argument must be of type string. Received type number'
        )
      }
      return allocUnsafe(arg)
    }
    return from(arg, encodingOrOffset, length)
  }

  // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
  if (typeof Symbol !== 'undefined' && Symbol.species != null &&
      Buffer[Symbol.species] === Buffer) {
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true,
      enumerable: false,
      writable: false
    });
  }

  Buffer.poolSize = 8192; // not used by this implementation

  function from (value, encodingOrOffset, length) {
    if (typeof value === 'string') {
      return fromString(value, encodingOrOffset)
    }

    if (ArrayBuffer.isView(value)) {
      return fromArrayLike(value)
    }

    if (value == null) {
      throw TypeError(
        'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
        'or Array-like Object. Received type ' + (typeof value)
      )
    }

    if (isInstance(value, ArrayBuffer) ||
        (value && isInstance(value.buffer, ArrayBuffer))) {
      return fromArrayBuffer(value, encodingOrOffset, length)
    }

    if (typeof value === 'number') {
      throw new TypeError(
        'The "value" argument must not be of type number. Received type number'
      )
    }

    var valueOf = value.valueOf && value.valueOf();
    if (valueOf != null && valueOf !== value) {
      return Buffer.from(valueOf, encodingOrOffset, length)
    }

    var b = fromObject(value);
    if (b) return b

    if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
        typeof value[Symbol.toPrimitive] === 'function') {
      return Buffer.from(
        value[Symbol.toPrimitive]('string'), encodingOrOffset, length
      )
    }

    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  /**
   * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
   * if value is a number.
   * Buffer.from(str[, encoding])
   * Buffer.from(array)
   * Buffer.from(buffer)
   * Buffer.from(arrayBuffer[, byteOffset[, length]])
   **/
  Buffer.from = function (value, encodingOrOffset, length) {
    return from(value, encodingOrOffset, length)
  };

  // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
  // https://github.com/feross/buffer/pull/148
  Buffer.prototype.__proto__ = Uint8Array.prototype;
  Buffer.__proto__ = Uint8Array;

  function assertSize (size) {
    if (typeof size !== 'number') {
      throw new TypeError('"size" argument must be of type number')
    } else if (size < 0) {
      throw new RangeError('The value "' + size + '" is invalid for option "size"')
    }
  }

  function alloc (size, fill, encoding) {
    assertSize(size);
    if (size <= 0) {
      return createBuffer(size)
    }
    if (fill !== undefined) {
      // Only pay attention to encoding if it's a string. This
      // prevents accidentally sending in a number that would
      // be interpretted as a start offset.
      return typeof encoding === 'string'
        ? createBuffer(size).fill(fill, encoding)
        : createBuffer(size).fill(fill)
    }
    return createBuffer(size)
  }

  /**
   * Creates a new filled Buffer instance.
   * alloc(size[, fill[, encoding]])
   **/
  Buffer.alloc = function (size, fill, encoding) {
    return alloc(size, fill, encoding)
  };

  function allocUnsafe (size) {
    assertSize(size);
    return createBuffer(size < 0 ? 0 : checked(size) | 0)
  }

  /**
   * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
   * */
  Buffer.allocUnsafe = function (size) {
    return allocUnsafe(size)
  };
  /**
   * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
   */
  Buffer.allocUnsafeSlow = function (size) {
    return allocUnsafe(size)
  };

  function fromString (string, encoding) {
    if (typeof encoding !== 'string' || encoding === '') {
      encoding = 'utf8';
    }

    if (!Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }

    var length = byteLength(string, encoding) | 0;
    var buf = createBuffer(length);

    var actual = buf.write(string, encoding);

    if (actual !== length) {
      // Writing a hex string, for example, that contains invalid characters will
      // cause everything after the first invalid character to be ignored. (e.g.
      // 'abxxcd' will be treated as 'ab')
      buf = buf.slice(0, actual);
    }

    return buf
  }

  function fromArrayLike (array) {
    var length = array.length < 0 ? 0 : checked(array.length) | 0;
    var buf = createBuffer(length);
    for (var i = 0; i < length; i += 1) {
      buf[i] = array[i] & 255;
    }
    return buf
  }

  function fromArrayBuffer (array, byteOffset, length) {
    if (byteOffset < 0 || array.byteLength < byteOffset) {
      throw new RangeError('"offset" is outside of buffer bounds')
    }

    if (array.byteLength < byteOffset + (length || 0)) {
      throw new RangeError('"length" is outside of buffer bounds')
    }

    var buf;
    if (byteOffset === undefined && length === undefined) {
      buf = new Uint8Array(array);
    } else if (length === undefined) {
      buf = new Uint8Array(array, byteOffset);
    } else {
      buf = new Uint8Array(array, byteOffset, length);
    }

    // Return an augmented `Uint8Array` instance
    buf.__proto__ = Buffer.prototype;
    return buf
  }

  function fromObject (obj) {
    if (Buffer.isBuffer(obj)) {
      var len = checked(obj.length) | 0;
      var buf = createBuffer(len);

      if (buf.length === 0) {
        return buf
      }

      obj.copy(buf, 0, 0, len);
      return buf
    }

    if (obj.length !== undefined) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  function checked (length) {
    // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
    // length is NaN (which is otherwise coerced to zero.)
    if (length >= K_MAX_LENGTH) {
      throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                           'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
    }
    return length | 0
  }

  function SlowBuffer (length) {
    if (+length != length) { // eslint-disable-line eqeqeq
      length = 0;
    }
    return Buffer.alloc(+length)
  }

  Buffer.isBuffer = function isBuffer (b) {
    return b != null && b._isBuffer === true &&
      b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
  };

  Buffer.compare = function compare (a, b) {
    if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
    if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);
    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
      throw new TypeError(
        'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
      )
    }

    if (a === b) return 0

    var x = a.length;
    var y = b.length;

    for (var i = 0, len = Math.min(x, y); i < len; ++i) {
      if (a[i] !== b[i]) {
        x = a[i];
        y = b[i];
        break
      }
    }

    if (x < y) return -1
    if (y < x) return 1
    return 0
  };

  Buffer.isEncoding = function isEncoding (encoding) {
    switch (String(encoding).toLowerCase()) {
      case 'hex':
      case 'utf8':
      case 'utf-8':
      case 'ascii':
      case 'latin1':
      case 'binary':
      case 'base64':
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return true
      default:
        return false
    }
  };

  Buffer.concat = function concat (list, length) {
    if (!Array.isArray(list)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }

    if (list.length === 0) {
      return Buffer.alloc(0)
    }

    var i;
    if (length === undefined) {
      length = 0;
      for (i = 0; i < list.length; ++i) {
        length += list[i].length;
      }
    }

    var buffer = Buffer.allocUnsafe(length);
    var pos = 0;
    for (i = 0; i < list.length; ++i) {
      var buf = list[i];
      if (isInstance(buf, Uint8Array)) {
        buf = Buffer.from(buf);
      }
      if (!Buffer.isBuffer(buf)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }
      buf.copy(buffer, pos);
      pos += buf.length;
    }
    return buffer
  };

  function byteLength (string, encoding) {
    if (Buffer.isBuffer(string)) {
      return string.length
    }
    if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
      return string.byteLength
    }
    if (typeof string !== 'string') {
      throw new TypeError(
        'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
        'Received type ' + typeof string
      )
    }

    var len = string.length;
    var mustMatch = (arguments.length > 2 && arguments[2] === true);
    if (!mustMatch && len === 0) return 0

    // Use a for loop to avoid recursion
    var loweredCase = false;
    for (;;) {
      switch (encoding) {
        case 'ascii':
        case 'latin1':
        case 'binary':
          return len
        case 'utf8':
        case 'utf-8':
          return utf8ToBytes(string).length
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return len * 2
        case 'hex':
          return len >>> 1
        case 'base64':
          return base64ToBytes(string).length
        default:
          if (loweredCase) {
            return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
          }
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer.byteLength = byteLength;

  function slowToString (encoding, start, end) {
    var loweredCase = false;

    // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
    // property of a typed array.

    // This behaves neither like String nor Uint8Array in that we set start/end
    // to their upper/lower bounds if the value passed is out of range.
    // undefined is handled specially as per ECMA-262 6th Edition,
    // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
    if (start === undefined || start < 0) {
      start = 0;
    }
    // Return early if start > this.length. Done here to prevent potential uint32
    // coercion fail below.
    if (start > this.length) {
      return ''
    }

    if (end === undefined || end > this.length) {
      end = this.length;
    }

    if (end <= 0) {
      return ''
    }

    // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
    end >>>= 0;
    start >>>= 0;

    if (end <= start) {
      return ''
    }

    if (!encoding) encoding = 'utf8';

    while (true) {
      switch (encoding) {
        case 'hex':
          return hexSlice(this, start, end)

        case 'utf8':
        case 'utf-8':
          return utf8Slice(this, start, end)

        case 'ascii':
          return asciiSlice(this, start, end)

        case 'latin1':
        case 'binary':
          return latin1Slice(this, start, end)

        case 'base64':
          return base64Slice(this, start, end)

        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return utf16leSlice(this, start, end)

        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
          encoding = (encoding + '').toLowerCase();
          loweredCase = true;
      }
    }
  }

  // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
  // to detect a Buffer instance. It's not possible to use `instanceof Buffer`
  // reliably in a browserify context because there could be multiple different
  // copies of the 'buffer' package in use. This method works even for Buffer
  // instances that were created from another copy of the `buffer` package.
  // See: https://github.com/feross/buffer/issues/154
  Buffer.prototype._isBuffer = true;

  function swap (b, n, m) {
    var i = b[n];
    b[n] = b[m];
    b[m] = i;
  }

  Buffer.prototype.swap16 = function swap16 () {
    var len = this.length;
    if (len % 2 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 16-bits')
    }
    for (var i = 0; i < len; i += 2) {
      swap(this, i, i + 1);
    }
    return this
  };

  Buffer.prototype.swap32 = function swap32 () {
    var len = this.length;
    if (len % 4 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 32-bits')
    }
    for (var i = 0; i < len; i += 4) {
      swap(this, i, i + 3);
      swap(this, i + 1, i + 2);
    }
    return this
  };

  Buffer.prototype.swap64 = function swap64 () {
    var len = this.length;
    if (len % 8 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 64-bits')
    }
    for (var i = 0; i < len; i += 8) {
      swap(this, i, i + 7);
      swap(this, i + 1, i + 6);
      swap(this, i + 2, i + 5);
      swap(this, i + 3, i + 4);
    }
    return this
  };

  Buffer.prototype.toString = function toString () {
    var length = this.length;
    if (length === 0) return ''
    if (arguments.length === 0) return utf8Slice(this, 0, length)
    return slowToString.apply(this, arguments)
  };

  Buffer.prototype.toLocaleString = Buffer.prototype.toString;

  Buffer.prototype.equals = function equals (b) {
    if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
    if (this === b) return true
    return Buffer.compare(this, b) === 0
  };

  Buffer.prototype.inspect = function inspect () {
    var str = '';
    var max = exports.INSPECT_MAX_BYTES;
    str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
    if (this.length > max) str += ' ... ';
    return '<Buffer ' + str + '>'
  };

  Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
    if (isInstance(target, Uint8Array)) {
      target = Buffer.from(target, target.offset, target.byteLength);
    }
    if (!Buffer.isBuffer(target)) {
      throw new TypeError(
        'The "target" argument must be one of type Buffer or Uint8Array. ' +
        'Received type ' + (typeof target)
      )
    }

    if (start === undefined) {
      start = 0;
    }
    if (end === undefined) {
      end = target ? target.length : 0;
    }
    if (thisStart === undefined) {
      thisStart = 0;
    }
    if (thisEnd === undefined) {
      thisEnd = this.length;
    }

    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
      throw new RangeError('out of range index')
    }

    if (thisStart >= thisEnd && start >= end) {
      return 0
    }
    if (thisStart >= thisEnd) {
      return -1
    }
    if (start >= end) {
      return 1
    }

    start >>>= 0;
    end >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;

    if (this === target) return 0

    var x = thisEnd - thisStart;
    var y = end - start;
    var len = Math.min(x, y);

    var thisCopy = this.slice(thisStart, thisEnd);
    var targetCopy = target.slice(start, end);

    for (var i = 0; i < len; ++i) {
      if (thisCopy[i] !== targetCopy[i]) {
        x = thisCopy[i];
        y = targetCopy[i];
        break
      }
    }

    if (x < y) return -1
    if (y < x) return 1
    return 0
  };

  // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
  // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
  //
  // Arguments:
  // - buffer - a Buffer to search
  // - val - a string, Buffer, or number
  // - byteOffset - an index into `buffer`; will be clamped to an int32
  // - encoding - an optional encoding, relevant is val is a string
  // - dir - true for indexOf, false for lastIndexOf
  function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
    // Empty buffer means no match
    if (buffer.length === 0) return -1

    // Normalize byteOffset
    if (typeof byteOffset === 'string') {
      encoding = byteOffset;
      byteOffset = 0;
    } else if (byteOffset > 0x7fffffff) {
      byteOffset = 0x7fffffff;
    } else if (byteOffset < -0x80000000) {
      byteOffset = -0x80000000;
    }
    byteOffset = +byteOffset; // Coerce to Number.
    if (numberIsNaN(byteOffset)) {
      // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
      byteOffset = dir ? 0 : (buffer.length - 1);
    }

    // Normalize byteOffset: negative offsets start from the end of the buffer
    if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length) {
      if (dir) return -1
      else byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
      if (dir) byteOffset = 0;
      else return -1
    }

    // Normalize val
    if (typeof val === 'string') {
      val = Buffer.from(val, encoding);
    }

    // Finally, search either indexOf (if dir is true) or lastIndexOf
    if (Buffer.isBuffer(val)) {
      // Special case: looking for empty string/buffer always fails
      if (val.length === 0) {
        return -1
      }
      return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
    } else if (typeof val === 'number') {
      val = val & 0xFF; // Search for a byte value [0-255]
      if (typeof Uint8Array.prototype.indexOf === 'function') {
        if (dir) {
          return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
        } else {
          return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
        }
      }
      return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
    }

    throw new TypeError('val must be string, number or Buffer')
  }

  function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
    var indexSize = 1;
    var arrLength = arr.length;
    var valLength = val.length;

    if (encoding !== undefined) {
      encoding = String(encoding).toLowerCase();
      if (encoding === 'ucs2' || encoding === 'ucs-2' ||
          encoding === 'utf16le' || encoding === 'utf-16le') {
        if (arr.length < 2 || val.length < 2) {
          return -1
        }
        indexSize = 2;
        arrLength /= 2;
        valLength /= 2;
        byteOffset /= 2;
      }
    }

    function read (buf, i) {
      if (indexSize === 1) {
        return buf[i]
      } else {
        return buf.readUInt16BE(i * indexSize)
      }
    }

    var i;
    if (dir) {
      var foundIndex = -1;
      for (i = byteOffset; i < arrLength; i++) {
        if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
          if (foundIndex === -1) foundIndex = i;
          if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
        } else {
          if (foundIndex !== -1) i -= i - foundIndex;
          foundIndex = -1;
        }
      }
    } else {
      if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
      for (i = byteOffset; i >= 0; i--) {
        var found = true;
        for (var j = 0; j < valLength; j++) {
          if (read(arr, i + j) !== read(val, j)) {
            found = false;
            break
          }
        }
        if (found) return i
      }
    }

    return -1
  }

  Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1
  };

  Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
  };

  Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
  };

  function hexWrite (buf, string, offset, length) {
    offset = Number(offset) || 0;
    var remaining = buf.length - offset;
    if (!length) {
      length = remaining;
    } else {
      length = Number(length);
      if (length > remaining) {
        length = remaining;
      }
    }

    var strLen = string.length;

    if (length > strLen / 2) {
      length = strLen / 2;
    }
    for (var i = 0; i < length; ++i) {
      var parsed = parseInt(string.substr(i * 2, 2), 16);
      if (numberIsNaN(parsed)) return i
      buf[offset + i] = parsed;
    }
    return i
  }

  function utf8Write (buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
  }

  function asciiWrite (buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length)
  }

  function latin1Write (buf, string, offset, length) {
    return asciiWrite(buf, string, offset, length)
  }

  function base64Write (buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length)
  }

  function ucs2Write (buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
  }

  Buffer.prototype.write = function write (string, offset, length, encoding) {
    // Buffer#write(string)
    if (offset === undefined) {
      encoding = 'utf8';
      length = this.length;
      offset = 0;
    // Buffer#write(string, encoding)
    } else if (length === undefined && typeof offset === 'string') {
      encoding = offset;
      length = this.length;
      offset = 0;
    // Buffer#write(string, offset[, length][, encoding])
    } else if (isFinite(offset)) {
      offset = offset >>> 0;
      if (isFinite(length)) {
        length = length >>> 0;
        if (encoding === undefined) encoding = 'utf8';
      } else {
        encoding = length;
        length = undefined;
      }
    } else {
      throw new Error(
        'Buffer.write(string, encoding, offset[, length]) is no longer supported'
      )
    }

    var remaining = this.length - offset;
    if (length === undefined || length > remaining) length = remaining;

    if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
      throw new RangeError('Attempt to write outside buffer bounds')
    }

    if (!encoding) encoding = 'utf8';

    var loweredCase = false;
    for (;;) {
      switch (encoding) {
        case 'hex':
          return hexWrite(this, string, offset, length)

        case 'utf8':
        case 'utf-8':
          return utf8Write(this, string, offset, length)

        case 'ascii':
          return asciiWrite(this, string, offset, length)

        case 'latin1':
        case 'binary':
          return latin1Write(this, string, offset, length)

        case 'base64':
          // Warning: maxLength not taken into account in base64Write
          return base64Write(this, string, offset, length)

        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return ucs2Write(this, string, offset, length)

        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  };

  Buffer.prototype.toJSON = function toJSON () {
    return {
      type: 'Buffer',
      data: Array.prototype.slice.call(this._arr || this, 0)
    }
  };

  function base64Slice (buf, start, end) {
    if (start === 0 && end === buf.length) {
      return base64.fromByteArray(buf)
    } else {
      return base64.fromByteArray(buf.slice(start, end))
    }
  }

  function utf8Slice (buf, start, end) {
    end = Math.min(buf.length, end);
    var res = [];

    var i = start;
    while (i < end) {
      var firstByte = buf[i];
      var codePoint = null;
      var bytesPerSequence = (firstByte > 0xEF) ? 4
        : (firstByte > 0xDF) ? 3
          : (firstByte > 0xBF) ? 2
            : 1;

      if (i + bytesPerSequence <= end) {
        var secondByte, thirdByte, fourthByte, tempCodePoint;

        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 0x80) {
              codePoint = firstByte;
            }
            break
          case 2:
            secondByte = buf[i + 1];
            if ((secondByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
              if (tempCodePoint > 0x7F) {
                codePoint = tempCodePoint;
              }
            }
            break
          case 3:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                codePoint = tempCodePoint;
              }
            }
            break
          case 4:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            fourthByte = buf[i + 3];
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                codePoint = tempCodePoint;
              }
            }
        }
      }

      if (codePoint === null) {
        // we did not generate a valid codePoint so insert a
        // replacement char (U+FFFD) and advance only 1 byte
        codePoint = 0xFFFD;
        bytesPerSequence = 1;
      } else if (codePoint > 0xFFFF) {
        // encode to utf16 (surrogate pair dance)
        codePoint -= 0x10000;
        res.push(codePoint >>> 10 & 0x3FF | 0xD800);
        codePoint = 0xDC00 | codePoint & 0x3FF;
      }

      res.push(codePoint);
      i += bytesPerSequence;
    }

    return decodeCodePointsArray(res)
  }

  // Based on http://stackoverflow.com/a/22747272/680742, the browser with
  // the lowest limit is Chrome, with 0x10000 args.
  // We go 1 magnitude less, for safety
  var MAX_ARGUMENTS_LENGTH = 0x1000;

  function decodeCodePointsArray (codePoints) {
    var len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
    }

    // Decode in chunks to avoid "call stack size exceeded".
    var res = '';
    var i = 0;
    while (i < len) {
      res += String.fromCharCode.apply(
        String,
        codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
      );
    }
    return res
  }

  function asciiSlice (buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);

    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i] & 0x7F);
    }
    return ret
  }

  function latin1Slice (buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);

    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i]);
    }
    return ret
  }

  function hexSlice (buf, start, end) {
    var len = buf.length;

    if (!start || start < 0) start = 0;
    if (!end || end < 0 || end > len) end = len;

    var out = '';
    for (var i = start; i < end; ++i) {
      out += toHex(buf[i]);
    }
    return out
  }

  function utf16leSlice (buf, start, end) {
    var bytes = buf.slice(start, end);
    var res = '';
    for (var i = 0; i < bytes.length; i += 2) {
      res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256));
    }
    return res
  }

  Buffer.prototype.slice = function slice (start, end) {
    var len = this.length;
    start = ~~start;
    end = end === undefined ? len : ~~end;

    if (start < 0) {
      start += len;
      if (start < 0) start = 0;
    } else if (start > len) {
      start = len;
    }

    if (end < 0) {
      end += len;
      if (end < 0) end = 0;
    } else if (end > len) {
      end = len;
    }

    if (end < start) end = start;

    var newBuf = this.subarray(start, end);
    // Return an augmented `Uint8Array` instance
    newBuf.__proto__ = Buffer.prototype;
    return newBuf
  };

  /*
   * Need to make sure that buffer isn't trying to write out of bounds.
   */
  function checkOffset (offset, ext, length) {
    if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
    if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
  }

  Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);

    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }

    return val
  };

  Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) {
      checkOffset(offset, byteLength, this.length);
    }

    var val = this[offset + --byteLength];
    var mul = 1;
    while (byteLength > 0 && (mul *= 0x100)) {
      val += this[offset + --byteLength] * mul;
    }

    return val
  };

  Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 1, this.length);
    return this[offset]
  };

  Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    return this[offset] | (this[offset + 1] << 8)
  };

  Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    return (this[offset] << 8) | this[offset + 1]
  };

  Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);

    return ((this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16)) +
        (this[offset + 3] * 0x1000000)
  };

  Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);

    return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
  };

  Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);

    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }
    mul *= 0x80;

    if (val >= mul) val -= Math.pow(2, 8 * byteLength);

    return val
  };

  Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);

    var i = byteLength;
    var mul = 1;
    var val = this[offset + --i];
    while (i > 0 && (mul *= 0x100)) {
      val += this[offset + --i] * mul;
    }
    mul *= 0x80;

    if (val >= mul) val -= Math.pow(2, 8 * byteLength);

    return val
  };

  Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 1, this.length);
    if (!(this[offset] & 0x80)) return (this[offset])
    return ((0xff - this[offset] + 1) * -1)
  };

  Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    var val = this[offset] | (this[offset + 1] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val
  };

  Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    var val = this[offset + 1] | (this[offset] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val
  };

  Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);

    return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
  };

  Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);

    return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
  };

  Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return ieee754$1.read(this, offset, true, 23, 4)
  };

  Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return ieee754$1.read(this, offset, false, 23, 4)
  };

  Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 8, this.length);
    return ieee754$1.read(this, offset, true, 52, 8)
  };

  Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 8, this.length);
    return ieee754$1.read(this, offset, false, 52, 8)
  };

  function checkInt (buf, value, offset, ext, max, min) {
    if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
    if (offset + ext > buf.length) throw new RangeError('Index out of range')
  }

  Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) {
      var maxBytes = Math.pow(2, 8 * byteLength) - 1;
      checkInt(this, value, offset, byteLength, maxBytes, 0);
    }

    var mul = 1;
    var i = 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF;
    }

    return offset + byteLength
  };

  Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) {
      var maxBytes = Math.pow(2, 8 * byteLength) - 1;
      checkInt(this, value, offset, byteLength, maxBytes, 0);
    }

    var i = byteLength - 1;
    var mul = 1;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF;
    }

    return offset + byteLength
  };

  Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
    this[offset] = (value & 0xff);
    return offset + 1
  };

  Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
    return offset + 2
  };

  Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
    return offset + 2
  };

  Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
    this[offset + 3] = (value >>> 24);
    this[offset + 2] = (value >>> 16);
    this[offset + 1] = (value >>> 8);
    this[offset] = (value & 0xff);
    return offset + 4
  };

  Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
    return offset + 4
  };

  Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      var limit = Math.pow(2, (8 * byteLength) - 1);

      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }

    var i = 0;
    var mul = 1;
    var sub = 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
        sub = 1;
      }
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }

    return offset + byteLength
  };

  Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      var limit = Math.pow(2, (8 * byteLength) - 1);

      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }

    var i = byteLength - 1;
    var mul = 1;
    var sub = 0;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
        sub = 1;
      }
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }

    return offset + byteLength
  };

  Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
    if (value < 0) value = 0xff + value + 1;
    this[offset] = (value & 0xff);
    return offset + 1
  };

  Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
    return offset + 2
  };

  Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
    return offset + 2
  };

  Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
    this[offset + 2] = (value >>> 16);
    this[offset + 3] = (value >>> 24);
    return offset + 4
  };

  Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    if (value < 0) value = 0xffffffff + value + 1;
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
    return offset + 4
  };

  function checkIEEE754 (buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length) throw new RangeError('Index out of range')
    if (offset < 0) throw new RangeError('Index out of range')
  }

  function writeFloat (buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 4);
    }
    ieee754$1.write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4
  }

  Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert)
  };

  Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert)
  };

  function writeDouble (buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 8);
    }
    ieee754$1.write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8
  }

  Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert)
  };

  Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert)
  };

  // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
  Buffer.prototype.copy = function copy (target, targetStart, start, end) {
    if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
    if (!start) start = 0;
    if (!end && end !== 0) end = this.length;
    if (targetStart >= target.length) targetStart = target.length;
    if (!targetStart) targetStart = 0;
    if (end > 0 && end < start) end = start;

    // Copy 0 bytes; we're done
    if (end === start) return 0
    if (target.length === 0 || this.length === 0) return 0

    // Fatal error conditions
    if (targetStart < 0) {
      throw new RangeError('targetStart out of bounds')
    }
    if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
    if (end < 0) throw new RangeError('sourceEnd out of bounds')

    // Are we oob?
    if (end > this.length) end = this.length;
    if (target.length - targetStart < end - start) {
      end = target.length - targetStart + start;
    }

    var len = end - start;

    if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
      // Use built-in when available, missing from IE11
      this.copyWithin(targetStart, start, end);
    } else if (this === target && start < targetStart && targetStart < end) {
      // descending copy from end
      for (var i = len - 1; i >= 0; --i) {
        target[i + targetStart] = this[i + start];
      }
    } else {
      Uint8Array.prototype.set.call(
        target,
        this.subarray(start, end),
        targetStart
      );
    }

    return len
  };

  // Usage:
  //    buffer.fill(number[, offset[, end]])
  //    buffer.fill(buffer[, offset[, end]])
  //    buffer.fill(string[, offset[, end]][, encoding])
  Buffer.prototype.fill = function fill (val, start, end, encoding) {
    // Handle string cases:
    if (typeof val === 'string') {
      if (typeof start === 'string') {
        encoding = start;
        start = 0;
        end = this.length;
      } else if (typeof end === 'string') {
        encoding = end;
        end = this.length;
      }
      if (encoding !== undefined && typeof encoding !== 'string') {
        throw new TypeError('encoding must be a string')
      }
      if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
        throw new TypeError('Unknown encoding: ' + encoding)
      }
      if (val.length === 1) {
        var code = val.charCodeAt(0);
        if ((encoding === 'utf8' && code < 128) ||
            encoding === 'latin1') {
          // Fast path: If `val` fits into a single byte, use that numeric value.
          val = code;
        }
      }
    } else if (typeof val === 'number') {
      val = val & 255;
    }

    // Invalid ranges are not set to a default, so can range check early.
    if (start < 0 || this.length < start || this.length < end) {
      throw new RangeError('Out of range index')
    }

    if (end <= start) {
      return this
    }

    start = start >>> 0;
    end = end === undefined ? this.length : end >>> 0;

    if (!val) val = 0;

    var i;
    if (typeof val === 'number') {
      for (i = start; i < end; ++i) {
        this[i] = val;
      }
    } else {
      var bytes = Buffer.isBuffer(val)
        ? val
        : Buffer.from(val, encoding);
      var len = bytes.length;
      if (len === 0) {
        throw new TypeError('The value "' + val +
          '" is invalid for argument "value"')
      }
      for (i = 0; i < end - start; ++i) {
        this[i + start] = bytes[i % len];
      }
    }

    return this
  };

  // HELPER FUNCTIONS
  // ================

  var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

  function base64clean (str) {
    // Node takes equal signs as end of the Base64 encoding
    str = str.split('=')[0];
    // Node strips out invalid characters like \n and \t from the string, base64-js does not
    str = str.trim().replace(INVALID_BASE64_RE, '');
    // Node converts strings with length < 2 to ''
    if (str.length < 2) return ''
    // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
    while (str.length % 4 !== 0) {
      str = str + '=';
    }
    return str
  }

  function toHex (n) {
    if (n < 16) return '0' + n.toString(16)
    return n.toString(16)
  }

  function utf8ToBytes (string, units) {
    units = units || Infinity;
    var codePoint;
    var length = string.length;
    var leadSurrogate = null;
    var bytes = [];

    for (var i = 0; i < length; ++i) {
      codePoint = string.charCodeAt(i);

      // is surrogate component
      if (codePoint > 0xD7FF && codePoint < 0xE000) {
        // last char was a lead
        if (!leadSurrogate) {
          // no lead yet
          if (codePoint > 0xDBFF) {
            // unexpected trail
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            continue
          } else if (i + 1 === length) {
            // unpaired lead
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            continue
          }

          // valid lead
          leadSurrogate = codePoint;

          continue
        }

        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          leadSurrogate = codePoint;
          continue
        }

        // valid surrogate pair
        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
      } else if (leadSurrogate) {
        // valid bmp char, but last char was a lead
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
      }

      leadSurrogate = null;

      // encode utf8
      if (codePoint < 0x80) {
        if ((units -= 1) < 0) break
        bytes.push(codePoint);
      } else if (codePoint < 0x800) {
        if ((units -= 2) < 0) break
        bytes.push(
          codePoint >> 0x6 | 0xC0,
          codePoint & 0x3F | 0x80
        );
      } else if (codePoint < 0x10000) {
        if ((units -= 3) < 0) break
        bytes.push(
          codePoint >> 0xC | 0xE0,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        );
      } else if (codePoint < 0x110000) {
        if ((units -= 4) < 0) break
        bytes.push(
          codePoint >> 0x12 | 0xF0,
          codePoint >> 0xC & 0x3F | 0x80,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        );
      } else {
        throw new Error('Invalid code point')
      }
    }

    return bytes
  }

  function asciiToBytes (str) {
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
      // Node's code seems to be doing this and not & 0x7F..
      byteArray.push(str.charCodeAt(i) & 0xFF);
    }
    return byteArray
  }

  function utf16leToBytes (str, units) {
    var c, hi, lo;
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
      if ((units -= 2) < 0) break

      c = str.charCodeAt(i);
      hi = c >> 8;
      lo = c % 256;
      byteArray.push(lo);
      byteArray.push(hi);
    }

    return byteArray
  }

  function base64ToBytes (str) {
    return base64.toByteArray(base64clean(str))
  }

  function blitBuffer (src, dst, offset, length) {
    for (var i = 0; i < length; ++i) {
      if ((i + offset >= dst.length) || (i >= src.length)) break
      dst[i + offset] = src[i];
    }
    return i
  }

  // ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
  // the `instanceof` check but they should be treated as of that type.
  // See: https://github.com/feross/buffer/issues/166
  function isInstance (obj, type) {
    return obj instanceof type ||
      (obj != null && obj.constructor != null && obj.constructor.name != null &&
        obj.constructor.name === type.name)
  }
  function numberIsNaN (obj) {
    // For IE11 support
    return obj !== obj // eslint-disable-line no-self-compare
  }
  }(buffer));

  var __awaiter =
      (undefined && undefined.__awaiter) ||
      function (thisArg, _arguments, P, generator) {
          function adopt(value) {
              return value instanceof P
                  ? value
                  : new P(function (resolve) {
                        resolve(value);
                    });
          }
          return new (P || (P = Promise))(function (resolve, reject) {
              function fulfilled(value) {
                  try {
                      step(generator.next(value));
                  } catch (e) {
                      reject(e);
                  }
              }
              function rejected(value) {
                  try {
                      step(generator['throw'](value));
                  } catch (e) {
                      reject(e);
                  }
              }
              function step(result) {
                  result.done
                      ? resolve(result.value)
                      : adopt(result.value).then(fulfilled, rejected);
              }
              step(
                  (generator = generator.apply(thisArg, _arguments || [])).next()
              );
          });
      };
  /**
   * Oauth Storage Keys
   * @enum
   */
  exports.OauthStorageKeys = void 0;
  (function (OauthStorageKeys) {
      /** @type {String} */
      OauthStorageKeys['AccessTokenKey'] = 'access_token';
      /** @type {String} */
      OauthStorageKeys['RefreshTokenKey'] = 'refresh_token';
      /** @type {String} */
      OauthStorageKeys['AccessScopeKey'] = 'scope';
      /** @type {String} */
      OauthStorageKeys['TokenTypeKey'] = 'token_type';
      /** @type {String} */
      OauthStorageKeys['ExpiresInKey'] = 'expires_in';
      /** @type {String} */
      OauthStorageKeys['CurrentStateKey'] = 'current_state';
  })(exports.OauthStorageKeys || (exports.OauthStorageKeys = {}));
  /**
   * OAuth Default Storage
   * - localstorage for persistant storage
   * - sessionstorage for temporary storage
   * @class
   */
  class OauthStorage {
      get(key) {
          return new Promise((resolve) => {
              if (typeof localStorage !== 'undefined') {
                  let data = localStorage.getItem(key);
                  if (OauthUtils.assertAvailable(data)) {
                      return resolve(data);
                  }
              }
              if (typeof sessionStorage !== 'undefined') {
                  let data = sessionStorage.getItem(key);
                  if (OauthUtils.assertAvailable(data)) {
                      return resolve(data);
                  }
              }
              return resolve(null);
          });
      }
      set(key, value, temporary = false) {
          return new Promise((resolve, reject) => {
              if (temporary) {
                  if (typeof sessionStorage !== 'undefined') {
                      sessionStorage.setItem(key, value);
                      resolve();
                  } else {
                      reject();
                  }
              } else {
                  if (typeof localStorage !== 'undefined') {
                      localStorage.setItem(key, value);
                      resolve();
                  } else {
                      reject();
                  }
              }
          });
      }
      remove(key) {
          return new Promise((resolve) => {
              if (typeof localStorage !== 'undefined') {
                  localStorage.removeItem(key);
              }
              if (typeof sessionStorage !== 'undefined') {
                  sessionStorage.removeItem(key);
              }
              resolve();
          });
      }
      clearAll(temporary = false) {
          return new Promise((resolve) => {
              if (typeof localStorage !== 'undefined') {
                  localStorage.clear();
              }
              if (temporary && typeof sessionStorage !== 'undefined') {
                  sessionStorage.clear();
              }
              resolve();
          });
      }
  }
  /**Common Utils Functions
   * @class
   * */
  class OauthUtils {
      /**
       * Check if token is a JWT token and return claims if so
       *
       * @param {String} token
       * @param {String} type  - "header" | "claims" | "signature". Default "claims"
       * @returns {String}
       */
      static parseJWT(token, type = 'claims') {
          if (!token || token == '') return null;
          let split = token.split('.');
          let index = type == 'signature' ? 2 : type == 'claims' ? 1 : 0;
          return split && split.length == 3
              ? buffer.Buffer.from(split[index], 'base64').toString('ascii')
              : null;
      }
      /**
       * Check if JWT Token has expired
       * @param {String} token
       * @return {boolean}
       * */
      static hasJWTExpired(token) {
          let data = this.parseJson(this.parseJWT(token));
          let exp = data ? data['exp'] : null;
          return this.hasExpired(+exp);
      }
      /**
       * Check given timestamp has expired
       * @param {Number} exp
       * @param {Number} buffer Buffer time in seconds to account for any unexpected delays e.g network latency
       * @return {boolean}
       * */
      static hasExpired(exp, buffer = 5) {
          return exp ? exp < Math.floor(Date.now() / 1000) + buffer : true;
      }
      /**
       * Get a safe form of string to store,
       * eliminating null and 'undefined'
       * @param {String} item
       * @return {String}
       * */
      static safeString(item) {
          if (OauthUtils.assertAvailable(item)) {
              return item;
          }
          return '';
      }
      /**
       * Get a safe form of stIntring to store,
       * eliminating null and 'undefined'
       * @param {Number} item
       * @return {Number}
       * */
      static safeInt(item) {
          if (OauthUtils.assertAvailable(item)) {
              return item;
          }
          return 0;
      }
      /**
       * Check if item is nut null, undefined or empty
       * eliminating null and 'undefined'
       * @param {any} item
       * @return {boolean}
       * */
      static assertAvailable(item) {
          return item != null && typeof item !== 'undefined' && item !== '';
      }
      /**
       * Count Object array
       * @param {Object} obj
       * @return {Number}
       * */
      static count(obj) {
          let element_count = 0;
          for (const i in obj) {
              if (obj.hasOwnProperty(i)) {
                  element_count++;
              }
          }
          return element_count;
      }
      /**
       * Merge Object with another
       * @param {Object} obj
       * @param {Object} src
       * @returns {Object}
       */
      static mergeObj(obj, src) {
          Object.keys(src).forEach((key) => {
              if (src.hasOwnProperty(key)) {
                  if (Array.isArray(obj)) {
                      obj.push(src[key]);
                  } else {
                      obj[this.count(obj)] = src[key];
                  }
              }
          });
          return obj;
      }
      /**Encode Object content to url string
       *  @param {Object} myData Object
       *  @return {String}
       * */
      static urlEncodeObject(myData) {
          const encodeObj = (data, key, parent) => {
              const encoded = [];
              for (const subKey in data[key]) {
                  if (data[key].hasOwnProperty(subKey)) {
                      if (
                          data[key][subKey] !== null &&
                          typeof data[key][subKey] !== 'undefined'
                      ) {
                          if (
                              typeof data[key][subKey] === 'object' ||
                              Array.isArray(data[key][subKey])
                          ) {
                              // If object or array
                              const newParent = parent + '[' + subKey + ']';
                              this.mergeObj(
                                  encoded,
                                  encodeObj(data[key], subKey, newParent)
                              );
                          } else {
                              encoded.push(
                                  encodeURIComponent(
                                      parent + '[' + subKey + ']'
                                  ) +
                                      '=' +
                                      encodeURIComponent(data[key][subKey])
                              );
                          }
                      }
                  }
              }
              return encoded;
          };
          const encodeData = (data) => {
              const encoded = [];
              if (data !== null && typeof data === 'object') {
                  for (const key in data) {
                      if (data.hasOwnProperty(key)) {
                          if (
                              data[key] !== null &&
                              typeof data[key] !== 'undefined'
                          ) {
                              if (
                                  typeof data[key] === 'object' ||
                                  Array.isArray(data[key])
                              ) {
                                  // If object or array
                                  this.mergeObj(
                                      encoded,
                                      encodeObj(data, key, key)
                                  );
                              } else {
                                  encoded.push(
                                      key + '=' + encodeURIComponent(data[key])
                                  );
                              }
                          }
                      }
                  }
              }
              return encoded;
          };
          const out = encodeData(myData);
          if (out.length > 0) {
              return out.join('&');
          } else {
              return '';
          }
      }
      /** Parse Json string to object
       *  @param {String} json string
       *  @return {any}
       *  */
      static parseJson(json) {
          try {
              return JSON.parse(json);
          } catch (e) {
              return null;
          }
      }
      /**
       * Get Url param
       * #source http://www.netlobo.com/url_query_string_javascript.html
       *
       * @param {String} name
       * @param {String} url
       * @returns {String}
       */
      static getUrlParam(name, url) {
          if (!url && typeof location !== 'undefined') {
              url = location.href;
          }
          url = decodeURIComponent(url);
          name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
          const regexS = '[\\?&]' + name + '=([^&#]*)';
          const regex = new RegExp(regexS);
          const results = regex.exec(url);
          return results == null ? null : results[1];
      }
      /**
       * Return url without it's url parameters
       * @param {String} url Url to strip
       * @return {String}
       * */
      static stripUrlParams(url) {
          if (OauthUtils.assertAvailable(url)) {
              return url.split('?')[0];
          } else {
              return url;
          }
      }
      /**
       * Generate Random value
       * @param {Number} length
       * @return {String}
       * */
      static generateKey(length) {
          if (!OauthUtils.assertAvailable(length)) {
              length = 16;
          }
          let text = '';
          const possible =
              'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          for (let i = 0; i < length; i++) {
              text += possible.charAt(
                  Math.floor(Math.random() * possible.length)
              );
          }
          return text;
      }
  }
  class Oauth {
      /**
       * @param {Object} data
       * @param {String} data.clientId - Your Application's Client ID
       * @param {String} data.clientSecret - Your Application's Client Secret
       * @param {String} data.authorizeUrl - [GET] Url endpoint to authorize or request access
       * @param {String} data.tokenUrl - Url endpoint to obtain token
       * @param {String} data.verifyTokenUrl - [GET] Url endpoint to verify token
       * @param {OauthStorageInterface<string>} data.storage - Handle custom storage - Default storage = browser localStorage or sessionStorage
       * */
      constructor(data) {
          if (OauthUtils.assertAvailable(data.clientId)) {
              this.clientId = data.clientId;
          } else {
              throw new Error("'clientId' Required");
          }
          if (OauthUtils.assertAvailable(data.clientSecret)) {
              this.clientSecret = data.clientSecret;
          } else {
              throw new Error("'clientSecret' Required");
          }
          if (OauthUtils.assertAvailable(data.authorizeUrl)) {
              this.authorizeUrl = data.authorizeUrl;
          } else {
              throw new Error("'authorizeUrl'  Required");
          }
          if (OauthUtils.assertAvailable(data.tokenUrl)) {
              this.tokenUrl = data.tokenUrl;
          } else {
              throw new Error("'tokenUrl' Required");
          }
          if (OauthUtils.assertAvailable(data.verifyTokenUrl)) {
              this.verifyTokenUrl = data.verifyTokenUrl;
          }
          if (OauthUtils.assertAvailable(data.storage)) {
              Oauth._storage = data.storage;
          }
      }
      static get storage() {
          return this._storage;
      }
      /**
       * Save Access data to Local storage
       * @param {OauthTokenResponse} accessData
       * */
      saveAccess(accessData) {
          return __awaiter(this, void 0, void 0, function* () {
              return Promise.all([
                  Oauth.storage.set(
                      exports.OauthStorageKeys.AccessTokenKey,
                      OauthUtils.safeString(accessData.accessToken)
                  ),
                  Oauth.storage.set(
                      exports.OauthStorageKeys.RefreshTokenKey,
                      OauthUtils.safeString(accessData.refreshToken)
                  ),
                  Oauth.storage.set(
                      exports.OauthStorageKeys.AccessScopeKey,
                      OauthUtils.safeString(accessData.accessScope)
                  ),
                  Oauth.storage.set(
                      exports.OauthStorageKeys.TokenTypeKey,
                      OauthUtils.safeString(accessData.tokenType)
                  ),
                  Oauth.storage.set(
                      exports.OauthStorageKeys.ExpiresInKey,
                      String(
                          OauthUtils.safeInt(
                              Math.floor(Date.now() / 1000) + accessData.expiresIn
                          )
                      )
                  ),
              ]);
          });
      }
      /**Clear all access data from session*/
      clearAccess() {
          return __awaiter(this, void 0, void 0, function* () {
              Promise.all([
                  Oauth.storage.remove(exports.OauthStorageKeys.AccessTokenKey),
                  Oauth.storage.remove(exports.OauthStorageKeys.RefreshTokenKey),
                  Oauth.storage.remove(exports.OauthStorageKeys.AccessScopeKey),
                  Oauth.storage.remove(exports.OauthStorageKeys.TokenTypeKey),
                  Oauth.storage.remove(exports.OauthStorageKeys.ExpiresInKey),
                  Oauth.storage.remove(exports.OauthStorageKeys.CurrentStateKey),
              ]);
          });
      }
      /**
       * Authorize Access to the app.
       * This will check for and validate existing access token.
       * If no access was previously granted, it will then proceed to request one with the details given.
       * If token has expired and a refresh token exists, it will then proceed to refresh the expired token
       * @param {Object} params
       * @param {OauthGrantType} params.grant_type Default - client_credentials grantType
       * @param {OauthGrantType[]} params.allowed_grant_types grant_type(s) to ignore if {OauthGrantType.Auto} selected
       * @param {String} params.redirect_uri For authorization_code grant_type default -> current url
       * @param {String} params.user_id For authorization_code grant_type
       * @param {String} params.username For password grant_type
       * @param {String} params.password For password grant_type
       * @param {(token: string | boolean, msg?: string)=>void} params.callback
       * */
      authorizeAccess(params) {
          return __awaiter(this, void 0, void 0, function* () {
              let grant_type = OauthUtils.assertAvailable(params.grant_type)
                  ? params.grant_type
                  : exports.OauthGrantType.Client_Credentials;
              const allowed_grant_types = OauthUtils.assertAvailable(
                  params.allowed_grant_types
              )
                  ? params.allowed_grant_types
                  : [];
              const redirect_uri = OauthUtils.assertAvailable(params.redirect_uri)
                  ? params.redirect_uri
                  : OauthUtils.stripUrlParams(
                        typeof window !== 'undefined'
                            ? window.location.origin
                            : null
                    );
              const scope = OauthUtils.assertAvailable(params.scope)
                  ? params.scope
                  : [];
              let state = OauthUtils.assertAvailable(params.state)
                  ? params.state
                  : OauthUtils.generateKey(32);
              /**Get New Token
               * */
              const getNewOauthToken = () =>
                  __awaiter(this, void 0, void 0, function* () {
                      switch (grant_type) {
                          case exports.OauthGrantType.Auto:
                              if (
                                  OauthUtils.assertAvailable(params.user_id) ||
                                  OauthUtils.assertAvailable(
                                      OauthUtils.getUrlParam('code')
                                  )
                              ) {
                                  // if authorization code exists in url param
                                  grant_type = exports.OauthGrantType.Authorization_Code;
                                  if (allowed_grant_types.includes(grant_type)) {
                                      getNewOauthToken();
                                  } else {
                                      params.callback(false);
                                  }
                              } else if (
                                  OauthUtils.assertAvailable(params.username) &&
                                  OauthUtils.assertAvailable(params.password)
                              ) {
                                  grant_type = exports.OauthGrantType.User_Credentials;
                                  if (allowed_grant_types.includes(grant_type)) {
                                      getNewOauthToken();
                                  } else {
                                      params.callback(false);
                                  }
                              } else {
                                  grant_type = exports.OauthGrantType.Client_Credentials;
                                  if (allowed_grant_types.includes(grant_type)) {
                                      getNewOauthToken();
                                  } else {
                                      params.callback(false);
                                  }
                              }
                              break;
                          case exports.OauthGrantType.Authorization_Code:
                              const code = OauthUtils.getUrlParam('code');
                              const error = OauthUtils.getUrlParam('error');
                              const error_description =
                                  OauthUtils.getUrlParam('error_description');
                              if (OauthUtils.assertAvailable(code)) {
                                  const save_state = yield Oauth.storage.get(
                                      exports.OauthStorageKeys.CurrentStateKey
                                  );
                                  state = OauthUtils.assertAvailable(save_state)
                                      ? save_state
                                      : state;
                                  if (state === OauthUtils.getUrlParam('state')) {
                                      // Get token
                                      this.oauthTokenWithAuthorizationCode(
                                          code,
                                          redirect_uri,
                                          /**
                                           * Ajax Response callback
                                           * @param {OauthTokenResponse} token
                                           * */
                                          (token) =>
                                              __awaiter(
                                                  this,
                                                  void 0,
                                                  void 0,
                                                  function* () {
                                                      if (
                                                          OauthUtils.assertAvailable(
                                                              token
                                                          )
                                                      ) {
                                                          if (
                                                              OauthUtils.assertAvailable(
                                                                  token.accessToken
                                                              )
                                                          ) {
                                                              // Remove oauth state
                                                              Oauth.storage.remove(
                                                                  exports.OauthStorageKeys.CurrentStateKey
                                                              );
                                                              // Save token
                                                              yield this.saveAccess(
                                                                  token
                                                              );
                                                              if (
                                                                  typeof params.callback ===
                                                                  'function'
                                                              ) {
                                                                  params.callback(
                                                                      yield Oauth.storage.get(
                                                                          exports.OauthStorageKeys.AccessTokenKey
                                                                      )
                                                                  );
                                                              }
                                                              // Remove authorization code from url
                                                              if (
                                                                  typeof window !==
                                                                  'undefined'
                                                              ) {
                                                                  window.location.replace(
                                                                      OauthUtils.stripUrlParams(
                                                                          window
                                                                              .location
                                                                              .href
                                                                      )
                                                                  );
                                                              }
                                                          } else if (
                                                              OauthUtils.assertAvailable(
                                                                  token.error
                                                              )
                                                          ) {
                                                              if (
                                                                  typeof params.callback ===
                                                                  'function'
                                                              ) {
                                                                  params.callback(
                                                                      false,
                                                                      token.errorDescription
                                                                  );
                                                              }
                                                          } else {
                                                              if (
                                                                  typeof params.callback ===
                                                                  'function'
                                                              ) {
                                                                  params.callback(
                                                                      false
                                                                  );
                                                              }
                                                          }
                                                      } else {
                                                          if (
                                                              typeof params.callback ===
                                                              'function'
                                                          ) {
                                                              params.callback(
                                                                  false
                                                              );
                                                          }
                                                      }
                                                  }
                                              )
                                      );
                                  } else {
                                      if (typeof params.callback === 'function') {
                                          params.callback(
                                              false,
                                              'Failed authorize access. CSRF Verification Failed'
                                          );
                                      }
                                  }
                              } else if (OauthUtils.assertAvailable(error)) {
                                  // Remove oauth state
                                  Oauth.storage.remove(
                                      exports.OauthStorageKeys.CurrentStateKey
                                  );
                                  if (
                                      OauthUtils.assertAvailable(
                                          error_description
                                      )
                                  ) {
                                      if (typeof params.callback === 'function') {
                                          params.callback(
                                              false,
                                              error_description
                                          );
                                      }
                                  } else {
                                      if (typeof params.callback === 'function') {
                                          params.callback(
                                              false,
                                              'Failed authorize access'
                                          );
                                      }
                                  }
                              } else {
                                  // Get authorization code
                                  this.oauthAuthorize(
                                      scope,
                                      redirect_uri,
                                      params.user_id,
                                      state
                                  );
                              }
                              break;
                          case exports.OauthGrantType.User_Credentials:
                              // Get token
                              this.oauthTokenWithUserCredentials(
                                  params.username,
                                  params.password,
                                  scope,
                                  /**
                                   * Ajax Response callback
                                   * @param {OauthTokenResponse} token
                                   * */
                                  (token) =>
                                      __awaiter(
                                          this,
                                          void 0,
                                          void 0,
                                          function* () {
                                              if (
                                                  OauthUtils.assertAvailable(
                                                      token
                                                  )
                                              ) {
                                                  if (
                                                      OauthUtils.assertAvailable(
                                                          token.accessToken
                                                      )
                                                  ) {
                                                      // Save token
                                                      yield this.saveAccess(
                                                          token
                                                      );
                                                      if (
                                                          typeof params.callback ===
                                                          'function'
                                                      ) {
                                                          params.callback(
                                                              yield Oauth.storage.get(
                                                                  exports.OauthStorageKeys.AccessTokenKey
                                                              )
                                                          );
                                                      }
                                                  } else if (
                                                      OauthUtils.assertAvailable(
                                                          token.error
                                                      )
                                                  ) {
                                                      if (
                                                          typeof params.callback ===
                                                          'function'
                                                      ) {
                                                          params.callback(
                                                              false,
                                                              token.errorDescription
                                                          );
                                                      }
                                                  } else {
                                                      if (
                                                          typeof params.callback ===
                                                          'function'
                                                      ) {
                                                          params.callback(false);
                                                      }
                                                  }
                                              } else {
                                                  if (
                                                      typeof params.callback ===
                                                      'function'
                                                  ) {
                                                      params.callback(false);
                                                  }
                                              }
                                          }
                                      )
                              );
                              break;
                          case exports.OauthGrantType.Client_Credentials:
                          default:
                              // Get token
                              this.oauthTokenWithClientCredentials(
                                  scope,
                                  /**
                                   * Ajax Response callback
                                   * @param {OauthTokenResponse} token
                                   * */
                                  (token) =>
                                      __awaiter(
                                          this,
                                          void 0,
                                          void 0,
                                          function* () {
                                              if (
                                                  OauthUtils.assertAvailable(
                                                      token
                                                  )
                                              ) {
                                                  if (
                                                      OauthUtils.assertAvailable(
                                                          token.accessToken
                                                      )
                                                  ) {
                                                      // Save token
                                                      yield this.saveAccess(
                                                          token
                                                      );
                                                      if (
                                                          typeof params.callback ===
                                                          'function'
                                                      ) {
                                                          params.callback(
                                                              yield Oauth.storage.get(
                                                                  exports.OauthStorageKeys.AccessTokenKey
                                                              )
                                                          );
                                                      }
                                                  } else if (
                                                      OauthUtils.assertAvailable(
                                                          token.error
                                                      )
                                                  ) {
                                                      if (
                                                          typeof params.callback ===
                                                          'function'
                                                      ) {
                                                          params.callback(
                                                              false,
                                                              token.errorDescription
                                                          );
                                                      }
                                                  } else {
                                                      if (
                                                          typeof params.callback ===
                                                          'function'
                                                      ) {
                                                          params.callback(false);
                                                      }
                                                  }
                                              } else {
                                                  if (
                                                      typeof params.callback ===
                                                      'function'
                                                  ) {
                                                      params.callback(false);
                                                  }
                                              }
                                          }
                                      )
                              );
                              break;
                      }
                  });
              /**Refresh Existing Token
               * @param {String} refreshToken String
               * */
              const refreshOauthToken = (refreshToken) => {
                  this.oauthRefreshToken(
                      refreshToken,
                      /**
                       * Ajax Response callback
                       * @param {OauthTokenResponse} token
                       * */
                      (token) =>
                          __awaiter(this, void 0, void 0, function* () {
                              if (OauthUtils.assertAvailable(token)) {
                                  if (
                                      OauthUtils.assertAvailable(
                                          token.accessToken
                                      )
                                  ) {
                                      // Save token
                                      yield this.saveAccess(token);
                                      if (typeof params.callback === 'function') {
                                          params.callback(
                                              yield Oauth.storage.get(
                                                  exports.OauthStorageKeys.AccessTokenKey
                                              )
                                          );
                                      }
                                  } else if (
                                      OauthUtils.assertAvailable(token.error)
                                  ) {
                                      if (typeof params.callback === 'function') {
                                          params.callback(
                                              false,
                                              token.errorDescription
                                          );
                                          // Clear token
                                          this.clearAccess();
                                          getNewOauthToken();
                                      }
                                  } else {
                                      if (typeof params.callback === 'function') {
                                          // Clear token
                                          this.clearAccess();
                                          params.callback(false);
                                      }
                                  }
                              } else {
                                  if (typeof params.callback === 'function') {
                                      params.callback(false);
                                  }
                              }
                          })
                  );
              };
              if (
                  OauthUtils.assertAvailable(
                      OauthUtils.getUrlParam('access_token')
                  )
              ) {
                  const accessToken = OauthUtils.getUrlParam('access_token');
                  if (!(yield this.hasExpired(accessToken))) {
                      if (typeof params.callback === 'function') {
                          params.callback(
                              OauthUtils.assertAvailable(accessToken)
                                  ? accessToken
                                  : true
                          );
                      }
                  } else {
                      if (typeof params.callback === 'function') {
                          params.callback(false);
                      }
                  }
              } else {
                  const accessToken = yield Oauth.storage.get(
                      exports.OauthStorageKeys.AccessTokenKey
                  );
                  const refreshToken = yield Oauth.storage.get(
                      exports.OauthStorageKeys.RefreshTokenKey
                  );
                  /*Token available, check for refreshing*/
                  if (OauthUtils.assertAvailable(accessToken)) {
                      if (!(yield this.hasExpired(accessToken))) {
                          if (typeof params.callback === 'function') {
                              params.callback(accessToken);
                          }
                      } else {
                          // Expired - get refresh token
                          if (OauthUtils.assertAvailable(refreshToken)) {
                              // Try Refresh token
                              refreshOauthToken(refreshToken);
                          } else {
                              // No refresh token get new token
                              getNewOauthToken();
                          }
                      }
                  } else {
                      // No token - get new token
                      getNewOauthToken();
                  }
              }
          });
      }
      /**
       * Check if authorization or token has expired
       * @param {String} token
       * @return {Promise<boolean>}
       * */
      hasExpired(token) {
          return __awaiter(this, void 0, void 0, function* () {
              token =
                  token ||
                  (yield Oauth.storage.get(exports.OauthStorageKeys.AccessTokenKey));
              if (OauthUtils.assertAvailable(token)) {
                  if (!OauthUtils.hasJWTExpired(token)) {
                      return false;
                  } else {
                      let expiresIn = yield Oauth.storage.get(
                          exports.OauthStorageKeys.ExpiresInKey
                      );
                      if (OauthUtils.assertAvailable(expiresIn)) {
                          return OauthUtils.hasExpired(+expiresIn);
                      }
                  }
              }
              return true;
          });
      }
      /**
       * Oauth Authorization
       * @param {string[]} scope
       * @param {String} redirect_url
       * @param {String} user_id
       * @param {String} state
       * @param {(url: string)=>any} callback
       * */
      oauthAuthorize(scope, redirect_url, user_id, state, callback) {
          if (!OauthUtils.assertAvailable(redirect_url)) {
              throw new Error("'redirect_url' Required");
          }
          Oauth.storage.set(exports.OauthStorageKeys.CurrentStateKey, state, true);
          const params = {
              client_id: this.clientId,
              scope: scope.join(' '),
              state: state,
              response_type: 'code',
              user_id: user_id,
              redirect_uri: redirect_url,
          };
          const url = `${this.authorizeUrl}?${OauthUtils.urlEncodeObject(
            params
        )}`;
          if (callback) {
              callback(url);
          } else if (typeof window !== 'undefined') {
              // Open authorization url
              window.open(url, '_blank');
          }
      }
      /**
       * Oauth Authorization
       * @param {string[]} scope
       * @param {String} redirect_url
       * @param {String} email
       * @param {String} state
       * @param {(url: string)=>any} callback
       * */
      oauthAuthorizeWithEmail(scope, redirect_url, email, state, callback) {
          if (!OauthUtils.assertAvailable(redirect_url)) {
              throw new Error("'redirect_url' Required");
          }
          Oauth.storage.set(exports.OauthStorageKeys.CurrentStateKey, state, true);
          const params = {
              client_id: this.clientId,
              scope: scope.join(' '),
              state: state,
              response_type: 'code',
              email: email,
              redirect_uri: redirect_url,
          };
          const url = `${this.authorizeUrl}?${OauthUtils.urlEncodeObject(
            params
        )}`;
          if (callback) {
              callback(url);
          } else if (typeof window !== 'undefined') {
              // Open authorization url
              window.open(url, '_blank');
          }
      }
      /**
       * Oauth Authorization
       * @param {string[]} scope
       * @param {String} redirect_url
       * @param {String} user_id
       * @param {String} state
       * @param {(url: string)=>any} callback
       * */
      oauthAuthorizeImplicit(scope, redirect_url, user_id, state, callback) {
          if (!OauthUtils.assertAvailable(redirect_url)) {
              throw new Error("'redirect_url' Required");
          }
          if (!OauthUtils.assertAvailable(scope)) {
              throw new Error("'scope' Required");
          }
          Oauth.storage.set(exports.OauthStorageKeys.CurrentStateKey, state, true);
          const params = {
              client_id: this.clientId,
              scope: scope.join(' '),
              state: state,
              response_type: 'token',
              user_id: user_id,
              redirect_uri: redirect_url,
          };
          const url = `${this.authorizeUrl}?${OauthUtils.urlEncodeObject(
            params
        )}`;
          if (callback) {
              callback(url);
          } else if (typeof window !== 'undefined') {
              // Open authorization url
              window.open(url, '_blank');
          }
      }
      /**
       * Get oauth token with Client credentials
       * @param {string[]} scope
       * @param {(verify: OauthTokenResponse)=>any} callback
       * */
      oauthTokenWithClientCredentials(scope, callback) {
          OauthRequest.post({
              url: this.tokenUrl,
              params: {
                  grant_type: exports.OauthGrantType.Client_Credentials,
                  client_id: this.clientId,
                  client_secret: this.clientSecret,
                  scope: scope.join(' '),
              },
              success: (result) => {
                  if (typeof callback === 'function') {
                      callback(new OauthTokenResponse(result));
                  }
              },
              fail: (result, reason) => {
                  if (typeof callback === 'function') {
                      callback(new OauthTokenResponse(result), reason);
                  }
              },
          });
      }
      /**
       * Get oauth token with Client credentials
       * @param {String} username
       * @param {String} password
       * @param {string[]} scope
       * @param {(verify: OauthTokenResponse)=>any} callback
       * */
      oauthTokenWithUserCredentials(username, password, scope, callback) {
          if (!OauthUtils.assertAvailable(username)) {
              throw new Error("'username' Required");
          }
          if (!OauthUtils.assertAvailable(password)) {
              throw new Error("'password' Required");
          }
          OauthRequest.post({
              url: this.tokenUrl,
              params: {
                  grant_type: exports.OauthGrantType.User_Credentials,
                  client_id: this.clientId,
                  client_secret: this.clientSecret,
                  username: username,
                  password: password,
                  scope: scope.join(' '),
              },
              success: (result) => {
                  if (typeof callback === 'function') {
                      callback(new OauthTokenResponse(result));
                  }
              },
              fail: (result, reason) => {
                  if (typeof callback === 'function') {
                      callback(new OauthTokenResponse(result), reason);
                  }
              },
          });
      }
      /**Get oauth token with Client credentials
       * @param {String} code
       * @param {String} redirect_uri
       * @param {(verify: OauthTokenResponse)=>any} callback
       * */
      oauthTokenWithAuthorizationCode(code, redirect_uri, callback) {
          if (!OauthUtils.assertAvailable(code)) {
              throw new Error("'code' Required");
          }
          if (!OauthUtils.assertAvailable(redirect_uri)) {
              throw new Error("'redirect_uri' Required");
          }
          OauthRequest.post({
              url: this.tokenUrl,
              params: {
                  grant_type: exports.OauthGrantType.Authorization_Code,
                  code: code,
                  redirect_uri: redirect_uri,
                  client_id: this.clientId,
                  client_secret: this.clientSecret,
              },
              success: (result) => {
                  if (typeof callback === 'function') {
                      callback(new OauthTokenResponse(result));
                  }
              },
              fail: (result, reason) => {
                  if (typeof callback === 'function') {
                      callback(new OauthTokenResponse(result), reason);
                  }
              },
          });
      }
      /**Get oauth Refresh Token with
       * Client credentials
       * @param {String} refresh_token
       * @param {(verify: OauthTokenResponse)=>any} callback
       * */
      oauthRefreshToken(refresh_token, callback) {
          if (!OauthUtils.assertAvailable(refresh_token)) {
              throw new Error("'refresh_token' Required");
          }
          OauthRequest.post({
              url: this.tokenUrl,
              params: {
                  grant_type: exports.OauthGrantType.Refresh_Token,
                  refresh_token: refresh_token,
                  client_id: this.clientId,
                  client_secret: this.clientSecret,
              },
              success: (result) => {
                  if (typeof callback === 'function') {
                      callback(new OauthTokenResponse(result));
                  }
              },
              fail: (result, reason) => {
                  if (typeof callback === 'function') {
                      callback(new OauthTokenResponse(result), reason);
                  }
              },
          });
      }
      /**
       * Get oauth Refresh Token with
       * Client credentials
       * @param {String} access_token
       * @param {(verify: OauthVerificationResponse, msg?: string) => any} callback
       * */
      oauthVerifyToken(access_token, callback) {
          if (!OauthUtils.assertAvailable(this.verifyTokenUrl)) {
              throw new Error("'verifyTokenUrl' was not specified");
          }
          if (!OauthUtils.assertAvailable(access_token)) {
              throw new Error("'access_token' Required");
          }
          OauthRequest.get({
              url: this.verifyTokenUrl,
              withAccessToken: true,
              accessToken: access_token,
              success: (result) => {
                  if (typeof callback === 'function') {
                      callback(new OauthVerificationResponse(result));
                  }
              },
              fail: (result, reason) => {
                  if (typeof callback === 'function') {
                      callback(new OauthVerificationResponse(result), reason);
                  }
              },
          });
      }
  }
  Oauth._storage = new OauthStorage();
  /**Grant Types
   * @enum
   */
  exports.OauthGrantType = void 0;
  (function (OauthGrantType) {
      /** @type {String} */
      OauthGrantType['Client_Credentials'] = 'client_credentials';
      /** @type {String} */
      OauthGrantType['Authorization_Code'] = 'authorization_code';
      /** @type {String} */
      OauthGrantType['User_Credentials'] = 'password';
      /** @type {String} */
      OauthGrantType['Refresh_Token'] = 'refresh_token';
      /** @type {String} */
      OauthGrantType['Auto'] = 'auto';
  })(exports.OauthGrantType || (exports.OauthGrantType = {}));
  /**Http Request Method
   * @enum
   */
  exports.OauthRequestMethod = void 0;
  (function (OauthRequestMethod) {
      /** @type {String} */
      OauthRequestMethod['GET'] = 'get';
      /** @type {String} */
      OauthRequestMethod['POST'] = 'post';
      /** @type {String} */
      OauthRequestMethod['PUT'] = 'put';
      /** @type {String} */
      OauthRequestMethod['DELETE'] = 'delete';
  })(exports.OauthRequestMethod || (exports.OauthRequestMethod = {}));
  /**Make Oauth Http requests
   * @class
   * */
  class OauthRequest {
      /**
       * @param {OauthRequestParams} data
       * @param {OauthRequestMethod} method
       * */
      constructor(method = exports.OauthRequestMethod.GET) {
          this.method = method;
          this.axhttp = axios.create({
              timeout: 20000,
          });
      }
      /**Make GET Requests
       * @param {OauthRequestParams} data
       * @returns {Promise<T>}
       * */
      static get(data) {
          const http = new OauthRequest(exports.OauthRequestMethod.GET);
          return http.request(data);
      }
      /**Make POST Requests
       * @param {OauthRequestParams} data
       * @returns {Promise<T>}
       * */
      static post(data) {
          const http = new OauthRequest(exports.OauthRequestMethod.POST);
          return http.request(data);
      }
      /**Make PUT Requests
       * @param {OauthRequestParams} data
       * @returns {Promise<T>}
       * */
      static put(data) {
          const http = new OauthRequest(exports.OauthRequestMethod.PUT);
          return http.request(data);
      }
      /**Make DELETE Requests
       * @param {OauthRequestParams} data
       * @returns {Promise<T>}
       * */
      static delete(data) {
          const http = new OauthRequest(exports.OauthRequestMethod.DELETE);
          return http.request(data);
      }
      /**
       * Make Http requests
       * @param {OauthRequestParams<T>} data
       * @returns {Promise<T>}
       */
      request(data) {
          return __awaiter(this, void 0, void 0, function* () {
              // Set options
              let options = {
                  url: data.url,
                  method: this.method,
                  params: data.query || {},
                  data: data.params || {},
                  headers: data.headers || {},
              };
              // Add basic credentials if requested
              if (data.withCredentials) {
                  options.auth = {
                      username: data.username,
                      password: data.password,
                  };
              }
              // Add Access Token if requested
              if (data.withAccessToken) {
                  options.headers['Authorization'] =
                      (data.accessTokenType || 'Bearer') + ' ' + data.accessToken;
              }
              // Perform request
              try {
                  const result = yield this.axhttp.request(options);
                  if (result) {
                      if (result.status === 200 || result.status === 201) {
                          data.success(result.data);
                      } else {
                          data.fail(result.data, result.statusText);
                      }
                      return result.data;
                  }
                  return null;
              } catch (e) {
                  if (axios.isAxiosError(e)) {
                      data.fail(e.response.data, e.message);
                      return e.response.data;
                  } else if (e instanceof Error) {
                      data.fail(null, e.message);
                  } else if (typeof e === 'string') {
                      data.fail(null, e);
                  } else {
                      data.fail();
                  }
                  return null;
              }
          });
      }
  }
  /**Oauth Response
   * @class
   * */
  class OauthResponse {
      /**
       * @param {String} result json result
       * @returns {OauthVerificationResponse}
       * */
      static parseVerificationResponse(result) {
          const data = OauthUtils.parseJson(result);
          const verify = new OauthVerificationResponse(data);
          if (verify && OauthUtils.assertAvailable(verify.success)) {
              return verify;
          } else if (verify && OauthUtils.assertAvailable(verify.error)) {
              return verify;
          }
          return null;
      }
      /**
       * @param {String} result json result
       * @returns {OauthAuthorizationResponse}
       * */
      static parseAuthorizationResponse(result) {
          const data = OauthUtils.parseJson(result);
          const code = new OauthAuthorizationResponse(data);
          if (code && OauthUtils.assertAvailable(code.code)) {
              return code;
          } else if (code && OauthUtils.assertAvailable(code.error)) {
              return code;
          }
          return null;
      }
      /**
       * @param {String} result json result
       * @returns {OauthTokenResponse}
       * */
      static parseTokenResponse(result) {
          const data = OauthUtils.parseJson(result);
          const token = new OauthTokenResponse(data);
          if (token && OauthUtils.assertAvailable(token.accessToken)) {
              return token;
          } else if (token && OauthUtils.assertAvailable(token.error)) {
              return token;
          }
          return null;
      }
  }
  /**Verification Response
   * @class
   * */
  class OauthVerificationResponse {
      /**
       * @param {Object} data
       */
      constructor(data) {
          if (!data) return;
          this.success = data['success'];
          this.error = data['error'];
          this.errorDescription = data['error_description'];
      }
  }
  /**Authorization Respons
   * @class
   * */
  class OauthAuthorizationResponse {
      /**
       * @param {Object} data
       */
      constructor(data) {
          if (!data) return;
          this.state = data['state'];
          this.code = data['code'];
          this.error = data['error'];
          this.errorDescription = data['error_description'];
      }
  }
  /**Token Response
   * @class
   * */
  class OauthTokenResponse {
      /**
       * @param {Object} data
       */
      constructor(data) {
          if (!data) return;
          this.accessToken = data['access_token'];
          this.refreshToken = data['refresh_token'];
          this.tokenType = data['token_type'];
          this.accessScope = data['scope'];
          this.expiresIn = data['expires_in'];
          this.error = data['error'];
          this.errorDescription = data['error_description'];
      }
  }

  exports.Oauth = Oauth;
  exports.OauthAuthorizationResponse = OauthAuthorizationResponse;
  exports.OauthRequest = OauthRequest;
  exports.OauthResponse = OauthResponse;
  exports.OauthStorage = OauthStorage;
  exports.OauthTokenResponse = OauthTokenResponse;
  exports.OauthUtils = OauthUtils;
  exports.OauthVerificationResponse = OauthVerificationResponse;

  Object.defineProperty(exports, '__esModule', { value: true });

}));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9iaW5kLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9JbnRlcmNlcHRvck1hbmFnZXIuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZS5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9lbmhhbmNlRXJyb3IuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2RlZmF1bHRzL3RyYW5zaXRpb25hbC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS90cmFuc2Zvcm1EYXRhLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL21lcmdlQ29uZmlnLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9lbnYvZGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy92YWxpZGF0b3IuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBeGlvc0Vycm9yLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9iYXNlNjQtanMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCJpbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcCgpIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGb3JtRGF0YV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmIChpc0FycmF5QnVmZmVyKHZhbC5idWZmZXIpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJpbmcsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgTnVtYmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBOdW1iZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc051bWJlcih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdudW1iZXInO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKHZhbCkgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWwpO1xuICByZXR1cm4gcHJvdG90eXBlID09PSBudWxsIHx8IHByb3RvdHlwZSA9PT0gT2JqZWN0LnByb3RvdHlwZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIERhdGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIERhdGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0RhdGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZpbGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZpbGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0ZpbGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZpbGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJsb2JcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJsb2IsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Jsb2IodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEJsb2JdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGdW5jdGlvbiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJlYW1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmVhbSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyZWFtKHZhbCkge1xuICByZXR1cm4gaXNPYmplY3QodmFsKSAmJiBpc0Z1bmN0aW9uKHZhbC5waXBlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VSTFNlYXJjaFBhcmFtcyh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgVVJMU2VhcmNoUGFyYW1zXSc7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci50cmltID8gc3RyLnRyaW0oKSA6IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50XG4gKlxuICogVGhpcyBhbGxvd3MgYXhpb3MgdG8gcnVuIGluIGEgd2ViIHdvcmtlciwgYW5kIHJlYWN0LW5hdGl2ZS5cbiAqIEJvdGggZW52aXJvbm1lbnRzIHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QsIGJ1dCBub3QgZnVsbHkgc3RhbmRhcmQgZ2xvYmFscy5cbiAqXG4gKiB3ZWIgd29ya2VyczpcbiAqICB0eXBlb2Ygd2luZG93IC0+IHVuZGVmaW5lZFxuICogIHR5cGVvZiBkb2N1bWVudCAtPiB1bmRlZmluZWRcbiAqXG4gKiByZWFjdC1uYXRpdmU6XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ1JlYWN0TmF0aXZlJ1xuICogbmF0aXZlc2NyaXB0XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ05hdGl2ZVNjcmlwdCcgb3IgJ05TJ1xuICovXG5mdW5jdGlvbiBpc1N0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIChuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTmF0aXZlU2NyaXB0JyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTlMnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICApO1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBBcnJheSBvciBhbiBPYmplY3QgaW52b2tpbmcgYSBmdW5jdGlvbiBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmIGBvYmpgIGlzIGFuIEFycmF5IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwgaW5kZXgsIGFuZCBjb21wbGV0ZSBhcnJheSBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmICdvYmonIGlzIGFuIE9iamVjdCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGtleSwgYW5kIGNvbXBsZXRlIG9iamVjdCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqIFRoZSBvYmplY3QgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrIHRvIGludm9rZSBmb3IgZWFjaCBpdGVtXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2gob2JqLCBmbikge1xuICAvLyBEb24ndCBib3RoZXIgaWYgbm8gdmFsdWUgcHJvdmlkZWRcbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvcmNlIGFuIGFycmF5IGlmIG5vdCBhbHJlYWR5IHNvbWV0aGluZyBpdGVyYWJsZVxuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmIChpc1BsYWluT2JqZWN0KHJlc3VsdFtrZXldKSAmJiBpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2UocmVzdWx0W2tleV0sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoe30sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsLnNsaWNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGZvckVhY2goYXJndW1lbnRzW2ldLCBhc3NpZ25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFeHRlbmRzIG9iamVjdCBhIGJ5IG11dGFibHkgYWRkaW5nIHRvIGl0IHRoZSBwcm9wZXJ0aWVzIG9mIG9iamVjdCBiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBvYmplY3QgdG8gYmUgZXh0ZW5kZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb21cbiAqIEBwYXJhbSB7T2JqZWN0fSB0aGlzQXJnIFRoZSBvYmplY3QgdG8gYmluZCBmdW5jdGlvbiB0b1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgcmVzdWx0aW5nIHZhbHVlIG9mIG9iamVjdCBhXG4gKi9cbmZ1bmN0aW9uIGV4dGVuZChhLCBiLCB0aGlzQXJnKSB7XG4gIGZvckVhY2goYiwgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodGhpc0FyZyAmJiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhW2tleV0gPSBiaW5kKHZhbCwgdGhpc0FyZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFba2V5XSA9IHZhbDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYnl0ZSBvcmRlciBtYXJrZXIuIFRoaXMgY2F0Y2hlcyBFRiBCQiBCRiAodGhlIFVURi04IEJPTSlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCB3aXRoIEJPTVxuICogQHJldHVybiB7c3RyaW5nfSBjb250ZW50IHZhbHVlIHdpdGhvdXQgQk9NXG4gKi9cbmZ1bmN0aW9uIHN0cmlwQk9NKGNvbnRlbnQpIHtcbiAgaWYgKGNvbnRlbnQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNQbGFpbk9iamVjdDogaXNQbGFpbk9iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltLFxuICBzdHJpcEJPTTogc3RyaXBCT01cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gZW5jb2RlKHZhbCkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgIHJlcGxhY2UoLyUyNC9nLCAnJCcpLlxuICAgIHJlcGxhY2UoLyUyQy9naSwgJywnKS5cbiAgICByZXBsYWNlKC8lMjAvZywgJysnKS5cbiAgICByZXBsYWNlKC8lNUIvZ2ksICdbJykuXG4gICAgcmVwbGFjZSgvJTVEL2dpLCAnXScpO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgVVJMIGJ5IGFwcGVuZGluZyBwYXJhbXMgdG8gdGhlIGVuZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIGJhc2Ugb2YgdGhlIHVybCAoZS5nLiwgaHR0cDovL3d3dy5nb29nbGUuY29tKVxuICogQHBhcmFtIHtvYmplY3R9IFtwYXJhbXNdIFRoZSBwYXJhbXMgdG8gYmUgYXBwZW5kZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBmb3JtYXR0ZWQgdXJsXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRVUkwodXJsLCBwYXJhbXMsIHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIGlmICghcGFyYW1zKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHZhciBzZXJpYWxpemVkUGFyYW1zO1xuICBpZiAocGFyYW1zU2VyaWFsaXplcikge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXNTZXJpYWxpemVyKHBhcmFtcyk7XG4gIH0gZWxzZSBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMocGFyYW1zKSkge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFydHMgPSBbXTtcblxuICAgIHV0aWxzLmZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiBzZXJpYWxpemUodmFsLCBrZXkpIHtcbiAgICAgIGlmICh2YWwgPT09IG51bGwgfHwgdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIGtleSA9IGtleSArICdbXSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSBbdmFsXTtcbiAgICAgIH1cblxuICAgICAgdXRpbHMuZm9yRWFjaCh2YWwsIGZ1bmN0aW9uIHBhcnNlVmFsdWUodikge1xuICAgICAgICBpZiAodXRpbHMuaXNEYXRlKHYpKSB7XG4gICAgICAgICAgdiA9IHYudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc09iamVjdCh2KSkge1xuICAgICAgICAgIHYgPSBKU09OLnN0cmluZ2lmeSh2KTtcbiAgICAgICAgfVxuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHYpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcnRzLmpvaW4oJyYnKTtcbiAgfVxuXG4gIGlmIChzZXJpYWxpemVkUGFyYW1zKSB7XG4gICAgdmFyIGhhc2htYXJrSW5kZXggPSB1cmwuaW5kZXhPZignIycpO1xuICAgIGlmIChoYXNobWFya0luZGV4ICE9PSAtMSkge1xuICAgICAgdXJsID0gdXJsLnNsaWNlKDAsIGhhc2htYXJrSW5kZXgpO1xuICAgIH1cblxuICAgIHVybCArPSAodXJsLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAnPycgOiAnJicpICsgc2VyaWFsaXplZFBhcmFtcztcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEludGVyY2VwdG9yTWFuYWdlcigpIHtcbiAgdGhpcy5oYW5kbGVycyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBpbnRlcmNlcHRvciB0byB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgdGhlbmAgZm9yIGEgYFByb21pc2VgXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGByZWplY3RgIGZvciBhIGBQcm9taXNlYFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gQW4gSUQgdXNlZCB0byByZW1vdmUgaW50ZXJjZXB0b3IgbGF0ZXJcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZnVsZmlsbGVkLCByZWplY3RlZCwgb3B0aW9ucykge1xuICB0aGlzLmhhbmRsZXJzLnB1c2goe1xuICAgIGZ1bGZpbGxlZDogZnVsZmlsbGVkLFxuICAgIHJlamVjdGVkOiByZWplY3RlZCxcbiAgICBzeW5jaHJvbm91czogb3B0aW9ucyA/IG9wdGlvbnMuc3luY2hyb25vdXMgOiBmYWxzZSxcbiAgICBydW5XaGVuOiBvcHRpb25zID8gb3B0aW9ucy5ydW5XaGVuIDogbnVsbFxuICB9KTtcbiAgcmV0dXJuIHRoaXMuaGFuZGxlcnMubGVuZ3RoIC0gMTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGludGVyY2VwdG9yIGZyb20gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlkIFRoZSBJRCB0aGF0IHdhcyByZXR1cm5lZCBieSBgdXNlYFxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmVqZWN0ID0gZnVuY3Rpb24gZWplY3QoaWQpIHtcbiAgaWYgKHRoaXMuaGFuZGxlcnNbaWRdKSB7XG4gICAgdGhpcy5oYW5kbGVyc1tpZF0gPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgaW50ZXJjZXB0b3JzXG4gKlxuICogVGhpcyBtZXRob2QgaXMgcGFydGljdWxhcmx5IHVzZWZ1bCBmb3Igc2tpcHBpbmcgb3ZlciBhbnlcbiAqIGludGVyY2VwdG9ycyB0aGF0IG1heSBoYXZlIGJlY29tZSBgbnVsbGAgY2FsbGluZyBgZWplY3RgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGludGVyY2VwdG9yXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgdXRpbHMuZm9yRWFjaCh0aGlzLmhhbmRsZXJzLCBmdW5jdGlvbiBmb3JFYWNoSGFuZGxlcihoKSB7XG4gICAgaWYgKGggIT09IG51bGwpIHtcbiAgICAgIGZuKGgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyY2VwdG9yTWFuYWdlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVcGRhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIGNvbmZpZywgZXJyb3IgY29kZSwgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIFRoZSBlcnJvciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICBlcnJvci5jb25maWcgPSBjb25maWc7XG4gIGlmIChjb2RlKSB7XG4gICAgZXJyb3IuY29kZSA9IGNvZGU7XG4gIH1cblxuICBlcnJvci5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgZXJyb3IucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgZXJyb3IuaXNBeGlvc0Vycm9yID0gdHJ1ZTtcblxuICBlcnJvci50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFN0YW5kYXJkXG4gICAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAvLyBNaWNyb3NvZnRcbiAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmRlc2NyaXB0aW9uLFxuICAgICAgbnVtYmVyOiB0aGlzLm51bWJlcixcbiAgICAgIC8vIE1vemlsbGFcbiAgICAgIGZpbGVOYW1lOiB0aGlzLmZpbGVOYW1lLFxuICAgICAgbGluZU51bWJlcjogdGhpcy5saW5lTnVtYmVyLFxuICAgICAgY29sdW1uTnVtYmVyOiB0aGlzLmNvbHVtbk51bWJlcixcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrLFxuICAgICAgLy8gQXhpb3NcbiAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICBjb2RlOiB0aGlzLmNvZGUsXG4gICAgICBzdGF0dXM6IHRoaXMucmVzcG9uc2UgJiYgdGhpcy5yZXNwb25zZS5zdGF0dXMgPyB0aGlzLnJlc3BvbnNlLnN0YXR1cyA6IG51bGxcbiAgICB9O1xuICB9O1xuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2lsZW50SlNPTlBhcnNpbmc6IHRydWUsXG4gIGZvcmNlZEpTT05QYXJzaW5nOiB0cnVlLFxuICBjbGFyaWZ5VGltZW91dEVycm9yOiBmYWxzZVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgICB2YXIgY29va2llID0gW107XG4gICAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZXhwaXJlcz0nICsgbmV3IERhdGUoZXhwaXJlcykudG9HTVRTdHJpbmcoKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgncGF0aD0nICsgcGF0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdkb21haW49JyArIGRvbWFpbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgICAgcmV0dXJuIChtYXRjaCA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFszXSkgOiBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgICAgdGhpcy53cml0ZShuYW1lLCAnJywgRGF0ZS5ub3coKSAtIDg2NDAwMDAwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnYgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSgpIHt9LFxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGQrXFwtLl0qOik/XFwvXFwvL2kudGVzdCh1cmwpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIHNwZWNpZmllZCBVUkxzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpdmVVUkwgVGhlIHJlbGF0aXZlIFVSTFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIFVSTFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlbGF0aXZlVVJMKSB7XG4gIHJldHVybiByZWxhdGl2ZVVSTFxuICAgID8gYmFzZVVSTC5yZXBsYWNlKC9cXC8rJC8sICcnKSArICcvJyArIHJlbGF0aXZlVVJMLnJlcGxhY2UoL15cXC8rLywgJycpXG4gICAgOiBiYXNlVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQWJzb2x1dGVVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY29tYmluZVVSTHMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIGJhc2VVUkwgd2l0aCB0aGUgcmVxdWVzdGVkVVJMLFxuICogb25seSB3aGVuIHRoZSByZXF1ZXN0ZWRVUkwgaXMgbm90IGFscmVhZHkgYW4gYWJzb2x1dGUgVVJMLlxuICogSWYgdGhlIHJlcXVlc3RVUkwgaXMgYWJzb2x1dGUsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgcmVxdWVzdGVkVVJMIHVudG91Y2hlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXF1ZXN0ZWRVUkwgQWJzb2x1dGUgb3IgcmVsYXRpdmUgVVJMIHRvIGNvbWJpbmVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBmdWxsIHBhdGhcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZEZ1bGxQYXRoKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCkge1xuICBpZiAoYmFzZVVSTCAmJiAhaXNBYnNvbHV0ZVVSTChyZXF1ZXN0ZWRVUkwpKSB7XG4gICAgcmV0dXJuIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3RlZFVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLy8gSGVhZGVycyB3aG9zZSBkdXBsaWNhdGVzIGFyZSBpZ25vcmVkIGJ5IG5vZGVcbi8vIGMuZi4gaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9odHRwLmh0bWwjaHR0cF9tZXNzYWdlX2hlYWRlcnNcbnZhciBpZ25vcmVEdXBsaWNhdGVPZiA9IFtcbiAgJ2FnZScsICdhdXRob3JpemF0aW9uJywgJ2NvbnRlbnQtbGVuZ3RoJywgJ2NvbnRlbnQtdHlwZScsICdldGFnJyxcbiAgJ2V4cGlyZXMnLCAnZnJvbScsICdob3N0JywgJ2lmLW1vZGlmaWVkLXNpbmNlJywgJ2lmLXVubW9kaWZpZWQtc2luY2UnLFxuICAnbGFzdC1tb2RpZmllZCcsICdsb2NhdGlvbicsICdtYXgtZm9yd2FyZHMnLCAncHJveHktYXV0aG9yaXphdGlvbicsXG4gICdyZWZlcmVyJywgJ3JldHJ5LWFmdGVyJywgJ3VzZXItYWdlbnQnXG5dO1xuXG4vKipcbiAqIFBhcnNlIGhlYWRlcnMgaW50byBhbiBvYmplY3RcbiAqXG4gKiBgYGBcbiAqIERhdGU6IFdlZCwgMjcgQXVnIDIwMTQgMDg6NTg6NDkgR01UXG4gKiBDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb25cbiAqIENvbm5lY3Rpb246IGtlZXAtYWxpdmVcbiAqIFRyYW5zZmVyLUVuY29kaW5nOiBjaHVua2VkXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaGVhZGVycyBIZWFkZXJzIG5lZWRpbmcgdG8gYmUgcGFyc2VkXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBIZWFkZXJzIHBhcnNlZCBpbnRvIGFuIG9iamVjdFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlSGVhZGVycyhoZWFkZXJzKSB7XG4gIHZhciBwYXJzZWQgPSB7fTtcbiAgdmFyIGtleTtcbiAgdmFyIHZhbDtcbiAgdmFyIGk7XG5cbiAgaWYgKCFoZWFkZXJzKSB7IHJldHVybiBwYXJzZWQ7IH1cblxuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMuc3BsaXQoJ1xcbicpLCBmdW5jdGlvbiBwYXJzZXIobGluZSkge1xuICAgIGkgPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBrZXkgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKDAsIGkpKS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoaSArIDEpKTtcblxuICAgIGlmIChrZXkpIHtcbiAgICAgIGlmIChwYXJzZWRba2V5XSAmJiBpZ25vcmVEdXBsaWNhdGVPZi5pbmRleE9mKGtleSkgPj0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoa2V5ID09PSAnc2V0LWNvb2tpZScpIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSAocGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSA6IFtdKS5jb25jYXQoW3ZhbF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSBwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldICsgJywgJyArIHZhbCA6IHZhbDtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBwYXJzZWQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgYnVpbGRGdWxsUGF0aCA9IHJlcXVpcmUoJy4uL2NvcmUvYnVpbGRGdWxsUGF0aCcpO1xudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9wYXJzZUhlYWRlcnMnKTtcbnZhciBpc1VSTFNhbWVPcmlnaW4gPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luJyk7XG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuLi9jb3JlL2NyZWF0ZUVycm9yJyk7XG52YXIgdHJhbnNpdGlvbmFsRGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cy90cmFuc2l0aW9uYWwnKTtcbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvQ2FuY2VsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24geGhyQWRhcHRlcihjb25maWcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGRpc3BhdGNoWGhyUmVxdWVzdChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxdWVzdERhdGEgPSBjb25maWcuZGF0YTtcbiAgICB2YXIgcmVxdWVzdEhlYWRlcnMgPSBjb25maWcuaGVhZGVycztcbiAgICB2YXIgcmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICB2YXIgb25DYW5jZWxlZDtcbiAgICBmdW5jdGlvbiBkb25lKCkge1xuICAgICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgICBjb25maWcuY2FuY2VsVG9rZW4udW5zdWJzY3JpYmUob25DYW5jZWxlZCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChjb25maWcuc2lnbmFsKSB7XG4gICAgICAgIGNvbmZpZy5zaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBvbkNhbmNlbGVkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShyZXF1ZXN0RGF0YSkpIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSBjb25maWcuYXV0aC5wYXNzd29yZCA/IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChjb25maWcuYXV0aC5wYXNzd29yZCkpIDogJyc7XG4gICAgICByZXF1ZXN0SGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0Jhc2ljICcgKyBidG9hKHVzZXJuYW1lICsgJzonICsgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHZhciBmdWxsUGF0aCA9IGJ1aWxkRnVsbFBhdGgoY29uZmlnLmJhc2VVUkwsIGNvbmZpZy51cmwpO1xuICAgIHJlcXVlc3Qub3Blbihjb25maWcubWV0aG9kLnRvVXBwZXJDYXNlKCksIGJ1aWxkVVJMKGZ1bGxQYXRoLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplciksIHRydWUpO1xuXG4gICAgLy8gU2V0IHRoZSByZXF1ZXN0IHRpbWVvdXQgaW4gTVNcbiAgICByZXF1ZXN0LnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblxuICAgIGZ1bmN0aW9uIG9ubG9hZGVuZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFyZXNwb25zZVR5cGUgfHwgcmVzcG9uc2VUeXBlID09PSAndGV4dCcgfHwgIHJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nID9cbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVRleHQgOiByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiByZXNwb25zZURhdGEsXG4gICAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQ6IHJlcXVlc3Quc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzLFxuICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdFxuICAgICAgfTtcblxuICAgICAgc2V0dGxlKGZ1bmN0aW9uIF9yZXNvbHZlKHZhbHVlKSB7XG4gICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9LCBmdW5jdGlvbiBfcmVqZWN0KGVycikge1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSwgcmVzcG9uc2UpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoJ29ubG9hZGVuZCcgaW4gcmVxdWVzdCkge1xuICAgICAgLy8gVXNlIG9ubG9hZGVuZCBpZiBhdmFpbGFibGVcbiAgICAgIHJlcXVlc3Qub25sb2FkZW5kID0gb25sb2FkZW5kO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlIHRvIGVtdWxhdGUgb25sb2FkZW5kXG4gICAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCB8fCByZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgICAgLy8gV2l0aCBvbmUgZXhjZXB0aW9uOiByZXF1ZXN0IHRoYXQgdXNpbmcgZmlsZTogcHJvdG9jb2wsIG1vc3QgYnJvd3NlcnNcbiAgICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVhZHlzdGF0ZSBoYW5kbGVyIGlzIGNhbGxpbmcgYmVmb3JlIG9uZXJyb3Igb3Igb250aW1lb3V0IGhhbmRsZXJzLFxuICAgICAgICAvLyBzbyB3ZSBzaG91bGQgY2FsbCBvbmxvYWRlbmQgb24gdGhlIG5leHQgJ3RpY2snXG4gICAgICAgIHNldFRpbWVvdXQob25sb2FkZW5kKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGJyb3dzZXIgcmVxdWVzdCBjYW5jZWxsYXRpb24gKGFzIG9wcG9zZWQgdG8gYSBtYW51YWwgY2FuY2VsbGF0aW9uKVxuICAgIHJlcXVlc3Qub25hYm9ydCA9IGZ1bmN0aW9uIGhhbmRsZUFib3J0KCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdSZXF1ZXN0IGFib3J0ZWQnLCBjb25maWcsICdFQ09OTkFCT1JURUQnLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgbG93IGxldmVsIG5ldHdvcmsgZXJyb3JzXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gaGFuZGxlRXJyb3IoKSB7XG4gICAgICAvLyBSZWFsIGVycm9ycyBhcmUgaGlkZGVuIGZyb20gdXMgYnkgdGhlIGJyb3dzZXJcbiAgICAgIC8vIG9uZXJyb3Igc2hvdWxkIG9ubHkgZmlyZSBpZiBpdCdzIGEgbmV0d29yayBlcnJvclxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdOZXR3b3JrIEVycm9yJywgY29uZmlnLCBudWxsLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgdGltZW91dFxuICAgIHJlcXVlc3Qub250aW1lb3V0ID0gZnVuY3Rpb24gaGFuZGxlVGltZW91dCgpIHtcbiAgICAgIHZhciB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXQgPyAndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnIDogJ3RpbWVvdXQgZXhjZWVkZWQnO1xuICAgICAgdmFyIHRyYW5zaXRpb25hbCA9IGNvbmZpZy50cmFuc2l0aW9uYWwgfHwgdHJhbnNpdGlvbmFsRGVmYXVsdHM7XG4gICAgICBpZiAoY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlLFxuICAgICAgICBjb25maWcsXG4gICAgICAgIHRyYW5zaXRpb25hbC5jbGFyaWZ5VGltZW91dEVycm9yID8gJ0VUSU1FRE9VVCcgOiAnRUNPTk5BQk9SVEVEJyxcbiAgICAgICAgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgLy8gVGhpcyBpcyBvbmx5IGRvbmUgaWYgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgLy8gU3BlY2lmaWNhbGx5IG5vdCBpZiB3ZSdyZSBpbiBhIHdlYiB3b3JrZXIsIG9yIHJlYWN0LW5hdGl2ZS5cbiAgICBpZiAodXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSkge1xuICAgICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgICB2YXIgeHNyZlZhbHVlID0gKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfHwgaXNVUkxTYW1lT3JpZ2luKGZ1bGxQYXRoKSkgJiYgY29uZmlnLnhzcmZDb29raWVOYW1lID9cbiAgICAgICAgY29va2llcy5yZWFkKGNvbmZpZy54c3JmQ29va2llTmFtZSkgOlxuICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh4c3JmVmFsdWUpIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnNbY29uZmlnLnhzcmZIZWFkZXJOYW1lXSA9IHhzcmZWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgaGVhZGVycyB0byB0aGUgcmVxdWVzdFxuICAgIGlmICgnc2V0UmVxdWVzdEhlYWRlcicgaW4gcmVxdWVzdCkge1xuICAgICAgdXRpbHMuZm9yRWFjaChyZXF1ZXN0SGVhZGVycywgZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3REYXRhID09PSAndW5kZWZpbmVkJyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgQ29udGVudC1UeXBlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBoZWFkZXIgdG8gdGhlIHJlcXVlc3RcbiAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgd2l0aENyZWRlbnRpYWxzIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcud2l0aENyZWRlbnRpYWxzKSkge1xuICAgICAgcmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPSAhIWNvbmZpZy53aXRoQ3JlZGVudGlhbHM7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJlc3BvbnNlVHlwZSB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmIChyZXNwb25zZVR5cGUgJiYgcmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgcHJvZ3Jlc3MgaWYgbmVlZGVkXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25Eb3dubG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgLy8gTm90IGFsbCBicm93c2VycyBzdXBwb3J0IHVwbG9hZCBldmVudHNcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nICYmIHJlcXVlc3QudXBsb2FkKSB7XG4gICAgICByZXF1ZXN0LnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuIHx8IGNvbmZpZy5zaWduYWwpIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gICAgICBvbkNhbmNlbGVkID0gZnVuY3Rpb24oY2FuY2VsKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZWplY3QoIWNhbmNlbCB8fCAoY2FuY2VsICYmIGNhbmNlbC50eXBlKSA/IG5ldyBDYW5jZWwoJ2NhbmNlbGVkJykgOiBjYW5jZWwpO1xuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfTtcblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuICYmIGNvbmZpZy5jYW5jZWxUb2tlbi5zdWJzY3JpYmUob25DYW5jZWxlZCk7XG4gICAgICBpZiAoY29uZmlnLnNpZ25hbCkge1xuICAgICAgICBjb25maWcuc2lnbmFsLmFib3J0ZWQgPyBvbkNhbmNlbGVkKCkgOiBjb25maWcuc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0Jywgb25DYW5jZWxlZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvZW5oYW5jZUVycm9yJyk7XG52YXIgdHJhbnNpdGlvbmFsRGVmYXVsdHMgPSByZXF1aXJlKCcuL3RyYW5zaXRpb25hbCcpO1xuXG52YXIgREVGQVVMVF9DT05URU5UX1RZUEUgPSB7XG4gICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuZnVuY3Rpb24gc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsIHZhbHVlKSB7XG4gIGlmICghdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVycykgJiYgdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVyc1snQ29udGVudC1UeXBlJ10pKSB7XG4gICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB2YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QWRhcHRlcigpIHtcbiAgdmFyIGFkYXB0ZXI7XG4gIGlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIGJyb3dzZXJzIHVzZSBYSFIgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuLi9hZGFwdGVycy94aHInKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAvLyBGb3Igbm9kZSB1c2UgSFRUUCBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4uL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5U2FmZWx5KHJhd1ZhbHVlLCBwYXJzZXIsIGVuY29kZXIpIHtcbiAgaWYgKHV0aWxzLmlzU3RyaW5nKHJhd1ZhbHVlKSkge1xuICAgIHRyeSB7XG4gICAgICAocGFyc2VyIHx8IEpTT04ucGFyc2UpKHJhd1ZhbHVlKTtcbiAgICAgIHJldHVybiB1dGlscy50cmltKHJhd1ZhbHVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5uYW1lICE9PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIChlbmNvZGVyIHx8IEpTT04uc3RyaW5naWZ5KShyYXdWYWx1ZSk7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblxuICB0cmFuc2l0aW9uYWw6IHRyYW5zaXRpb25hbERlZmF1bHRzLFxuXG4gIGFkYXB0ZXI6IGdldERlZmF1bHRBZGFwdGVyKCksXG5cbiAgdHJhbnNmb3JtUmVxdWVzdDogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlcXVlc3QoZGF0YSwgaGVhZGVycykge1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0FjY2VwdCcpO1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0NvbnRlbnQtVHlwZScpO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc1N0cmVhbShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNGaWxlKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0Jsb2IoZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNBcnJheUJ1ZmZlclZpZXcoZGF0YSkpIHtcbiAgICAgIHJldHVybiBkYXRhLmJ1ZmZlcjtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNPYmplY3QoZGF0YSkgfHwgKGhlYWRlcnMgJiYgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPT09ICdhcHBsaWNhdGlvbi9qc29uJykpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgcmV0dXJuIHN0cmluZ2lmeVNhZmVseShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIHZhciB0cmFuc2l0aW9uYWwgPSB0aGlzLnRyYW5zaXRpb25hbCB8fCBkZWZhdWx0cy50cmFuc2l0aW9uYWw7XG4gICAgdmFyIHNpbGVudEpTT05QYXJzaW5nID0gdHJhbnNpdGlvbmFsICYmIHRyYW5zaXRpb25hbC5zaWxlbnRKU09OUGFyc2luZztcbiAgICB2YXIgZm9yY2VkSlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLmZvcmNlZEpTT05QYXJzaW5nO1xuICAgIHZhciBzdHJpY3RKU09OUGFyc2luZyA9ICFzaWxlbnRKU09OUGFyc2luZyAmJiB0aGlzLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nO1xuXG4gICAgaWYgKHN0cmljdEpTT05QYXJzaW5nIHx8IChmb3JjZWRKU09OUGFyc2luZyAmJiB1dGlscy5pc1N0cmluZyhkYXRhKSAmJiBkYXRhLmxlbmd0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcpIHtcbiAgICAgICAgICBpZiAoZS5uYW1lID09PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgICAgICB0aHJvdyBlbmhhbmNlRXJyb3IoZSwgdGhpcywgJ0VfSlNPTl9QQVJTRScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIC8qKlxuICAgKiBBIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGFib3J0IGEgcmVxdWVzdC4gSWYgc2V0IHRvIDAgKGRlZmF1bHQpIGFcbiAgICogdGltZW91dCBpcyBub3QgY3JlYXRlZC5cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuICBtYXhCb2R5TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9LFxuXG4gIGhlYWRlcnM6IHtcbiAgICBjb21tb246IHtcbiAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICAgIH1cbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhlIGRhdGEgZm9yIGEgcmVxdWVzdCBvciBhIHJlc3BvbnNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBkYXRhIFRoZSBkYXRhIHRvIGJlIHRyYW5zZm9ybWVkXG4gKiBAcGFyYW0ge0FycmF5fSBoZWFkZXJzIFRoZSBoZWFkZXJzIGZvciB0aGUgcmVxdWVzdCBvciByZXNwb25zZVxuICogQHBhcmFtIHtBcnJheXxGdW5jdGlvbn0gZm5zIEEgc2luZ2xlIGZ1bmN0aW9uIG9yIEFycmF5IG9mIGZ1bmN0aW9uc1xuICogQHJldHVybnMgeyp9IFRoZSByZXN1bHRpbmcgdHJhbnNmb3JtZWQgZGF0YVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRyYW5zZm9ybURhdGEoZGF0YSwgaGVhZGVycywgZm5zKSB7XG4gIHZhciBjb250ZXh0ID0gdGhpcyB8fCBkZWZhdWx0cztcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIHV0aWxzLmZvckVhY2goZm5zLCBmdW5jdGlvbiB0cmFuc2Zvcm0oZm4pIHtcbiAgICBkYXRhID0gZm4uY2FsbChjb250ZXh0LCBkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ2FuY2VsKHZhbHVlKSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5fX0NBTkNFTF9fKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL0NhbmNlbCcpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG5cbiAgaWYgKGNvbmZpZy5zaWduYWwgJiYgY29uZmlnLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgdGhyb3cgbmV3IENhbmNlbCgnY2FuY2VsZWQnKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdCB0byB0aGUgc2VydmVyIHVzaW5nIHRoZSBjb25maWd1cmVkIGFkYXB0ZXIuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHRoYXQgaXMgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3RcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBUaGUgUHJvbWlzZSB0byBiZSBmdWxmaWxsZWRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkaXNwYXRjaFJlcXVlc3QoY29uZmlnKSB7XG4gIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAvLyBFbnN1cmUgaGVhZGVycyBleGlzdFxuICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXG4gIC8vIFRyYW5zZm9ybSByZXF1ZXN0IGRhdGFcbiAgY29uZmlnLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgY29uZmlnLFxuICAgIGNvbmZpZy5kYXRhLFxuICAgIGNvbmZpZy5oZWFkZXJzLFxuICAgIGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0XG4gICk7XG5cbiAgLy8gRmxhdHRlbiBoZWFkZXJzXG4gIGNvbmZpZy5oZWFkZXJzID0gdXRpbHMubWVyZ2UoXG4gICAgY29uZmlnLmhlYWRlcnMuY29tbW9uIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzW2NvbmZpZy5tZXRob2RdIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzXG4gICk7XG5cbiAgdXRpbHMuZm9yRWFjaChcbiAgICBbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdwb3N0JywgJ3B1dCcsICdwYXRjaCcsICdjb21tb24nXSxcbiAgICBmdW5jdGlvbiBjbGVhbkhlYWRlckNvbmZpZyhtZXRob2QpIHtcbiAgICAgIGRlbGV0ZSBjb25maWcuaGVhZGVyc1ttZXRob2RdO1xuICAgIH1cbiAgKTtcblxuICB2YXIgYWRhcHRlciA9IGNvbmZpZy5hZGFwdGVyIHx8IGRlZmF1bHRzLmFkYXB0ZXI7XG5cbiAgcmV0dXJuIGFkYXB0ZXIoY29uZmlnKS50aGVuKGZ1bmN0aW9uIG9uQWRhcHRlclJlc29sdXRpb24ocmVzcG9uc2UpIHtcbiAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgIHJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICBjb25maWcsXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgICAgICAgIGNvbmZpZyxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vKipcbiAqIENvbmZpZy1zcGVjaWZpYyBtZXJnZS1mdW5jdGlvbiB3aGljaCBjcmVhdGVzIGEgbmV3IGNvbmZpZy1vYmplY3RcbiAqIGJ5IG1lcmdpbmcgdHdvIGNvbmZpZ3VyYXRpb24gb2JqZWN0cyB0b2dldGhlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMVxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzJcbiAqIEByZXR1cm5zIHtPYmplY3R9IE5ldyBvYmplY3QgcmVzdWx0aW5nIGZyb20gbWVyZ2luZyBjb25maWcyIHRvIGNvbmZpZzFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtZXJnZUNvbmZpZyhjb25maWcxLCBjb25maWcyKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBjb25maWcyID0gY29uZmlnMiB8fCB7fTtcbiAgdmFyIGNvbmZpZyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGdldE1lcmdlZFZhbHVlKHRhcmdldCwgc291cmNlKSB7XG4gICAgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3QodGFyZ2V0KSAmJiB1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh0YXJnZXQsIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh7fSwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHNvdXJjZS5zbGljZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc291cmNlO1xuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXG4gIGZ1bmN0aW9uIG1lcmdlRGVlcFByb3BlcnRpZXMocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXG4gIGZ1bmN0aW9uIHZhbHVlRnJvbUNvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiBkZWZhdWx0VG9Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXG4gIGZ1bmN0aW9uIG1lcmdlRGlyZWN0S2V5cyhwcm9wKSB7XG4gICAgaWYgKHByb3AgaW4gY29uZmlnMikge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAocHJvcCBpbiBjb25maWcxKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICB2YXIgbWVyZ2VNYXAgPSB7XG4gICAgJ3VybCc6IHZhbHVlRnJvbUNvbmZpZzIsXG4gICAgJ21ldGhvZCc6IHZhbHVlRnJvbUNvbmZpZzIsXG4gICAgJ2RhdGEnOiB2YWx1ZUZyb21Db25maWcyLFxuICAgICdiYXNlVVJMJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndHJhbnNmb3JtUmVxdWVzdCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RyYW5zZm9ybVJlc3BvbnNlJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAncGFyYW1zU2VyaWFsaXplcic6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RpbWVvdXQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0aW1lb3V0TWVzc2FnZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3dpdGhDcmVkZW50aWFscyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ2FkYXB0ZXInOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdyZXNwb25zZVR5cGUnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd4c3JmQ29va2llTmFtZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3hzcmZIZWFkZXJOYW1lJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnb25VcGxvYWRQcm9ncmVzcyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ29uRG93bmxvYWRQcm9ncmVzcyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ2RlY29tcHJlc3MnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdtYXhDb250ZW50TGVuZ3RoJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnbWF4Qm9keUxlbmd0aCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RyYW5zcG9ydCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ2h0dHBBZ2VudCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ2h0dHBzQWdlbnQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdjYW5jZWxUb2tlbic6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3NvY2tldFBhdGgnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdyZXNwb25zZUVuY29kaW5nJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndmFsaWRhdGVTdGF0dXMnOiBtZXJnZURpcmVjdEtleXNcbiAgfTtcblxuICB1dGlscy5mb3JFYWNoKE9iamVjdC5rZXlzKGNvbmZpZzEpLmNvbmNhdChPYmplY3Qua2V5cyhjb25maWcyKSksIGZ1bmN0aW9uIGNvbXB1dGVDb25maWdWYWx1ZShwcm9wKSB7XG4gICAgdmFyIG1lcmdlID0gbWVyZ2VNYXBbcHJvcF0gfHwgbWVyZ2VEZWVwUHJvcGVydGllcztcbiAgICB2YXIgY29uZmlnVmFsdWUgPSBtZXJnZShwcm9wKTtcbiAgICAodXRpbHMuaXNVbmRlZmluZWQoY29uZmlnVmFsdWUpICYmIG1lcmdlICE9PSBtZXJnZURpcmVjdEtleXMpIHx8IChjb25maWdbcHJvcF0gPSBjb25maWdWYWx1ZSk7XG4gIH0pO1xuXG4gIHJldHVybiBjb25maWc7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwidmVyc2lvblwiOiBcIjAuMjYuMVwiXG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFZFUlNJT04gPSByZXF1aXJlKCcuLi9lbnYvZGF0YScpLnZlcnNpb247XG5cbnZhciB2YWxpZGF0b3JzID0ge307XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG5bJ29iamVjdCcsICdib29sZWFuJywgJ251bWJlcicsICdmdW5jdGlvbicsICdzdHJpbmcnLCAnc3ltYm9sJ10uZm9yRWFjaChmdW5jdGlvbih0eXBlLCBpKSB7XG4gIHZhbGlkYXRvcnNbdHlwZV0gPSBmdW5jdGlvbiB2YWxpZGF0b3IodGhpbmcpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaW5nID09PSB0eXBlIHx8ICdhJyArIChpIDwgMSA/ICduICcgOiAnICcpICsgdHlwZTtcbiAgfTtcbn0pO1xuXG52YXIgZGVwcmVjYXRlZFdhcm5pbmdzID0ge307XG5cbi8qKlxuICogVHJhbnNpdGlvbmFsIG9wdGlvbiB2YWxpZGF0b3JcbiAqIEBwYXJhbSB7ZnVuY3Rpb258Ym9vbGVhbj99IHZhbGlkYXRvciAtIHNldCB0byBmYWxzZSBpZiB0aGUgdHJhbnNpdGlvbmFsIG9wdGlvbiBoYXMgYmVlbiByZW1vdmVkXG4gKiBAcGFyYW0ge3N0cmluZz99IHZlcnNpb24gLSBkZXByZWNhdGVkIHZlcnNpb24gLyByZW1vdmVkIHNpbmNlIHZlcnNpb25cbiAqIEBwYXJhbSB7c3RyaW5nP30gbWVzc2FnZSAtIHNvbWUgbWVzc2FnZSB3aXRoIGFkZGl0aW9uYWwgaW5mb1xuICogQHJldHVybnMge2Z1bmN0aW9ufVxuICovXG52YWxpZGF0b3JzLnRyYW5zaXRpb25hbCA9IGZ1bmN0aW9uIHRyYW5zaXRpb25hbCh2YWxpZGF0b3IsIHZlcnNpb24sIG1lc3NhZ2UpIHtcbiAgZnVuY3Rpb24gZm9ybWF0TWVzc2FnZShvcHQsIGRlc2MpIHtcbiAgICByZXR1cm4gJ1tBeGlvcyB2JyArIFZFUlNJT04gKyAnXSBUcmFuc2l0aW9uYWwgb3B0aW9uIFxcJycgKyBvcHQgKyAnXFwnJyArIGRlc2MgKyAobWVzc2FnZSA/ICcuICcgKyBtZXNzYWdlIDogJycpO1xuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvcHQsIG9wdHMpIHtcbiAgICBpZiAodmFsaWRhdG9yID09PSBmYWxzZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGZvcm1hdE1lc3NhZ2Uob3B0LCAnIGhhcyBiZWVuIHJlbW92ZWQnICsgKHZlcnNpb24gPyAnIGluICcgKyB2ZXJzaW9uIDogJycpKSk7XG4gICAgfVxuXG4gICAgaWYgKHZlcnNpb24gJiYgIWRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdKSB7XG4gICAgICBkZXByZWNhdGVkV2FybmluZ3Nbb3B0XSA9IHRydWU7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRNZXNzYWdlKFxuICAgICAgICAgIG9wdCxcbiAgICAgICAgICAnIGhhcyBiZWVuIGRlcHJlY2F0ZWQgc2luY2UgdicgKyB2ZXJzaW9uICsgJyBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZWFyIGZ1dHVyZSdcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsaWRhdG9yID8gdmFsaWRhdG9yKHZhbHVlLCBvcHQsIG9wdHMpIDogdHJ1ZTtcbiAgfTtcbn07XG5cbi8qKlxuICogQXNzZXJ0IG9iamVjdCdzIHByb3BlcnRpZXMgdHlwZVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7b2JqZWN0fSBzY2hlbWFcbiAqIEBwYXJhbSB7Ym9vbGVhbj99IGFsbG93VW5rbm93blxuICovXG5cbmZ1bmN0aW9uIGFzc2VydE9wdGlvbnMob3B0aW9ucywgc2NoZW1hLCBhbGxvd1Vua25vd24pIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0Jykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbnMgbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgfVxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9wdGlvbnMpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tID4gMCkge1xuICAgIHZhciBvcHQgPSBrZXlzW2ldO1xuICAgIHZhciB2YWxpZGF0b3IgPSBzY2hlbWFbb3B0XTtcbiAgICBpZiAodmFsaWRhdG9yKSB7XG4gICAgICB2YXIgdmFsdWUgPSBvcHRpb25zW29wdF07XG4gICAgICB2YXIgcmVzdWx0ID0gdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0aW9ucyk7XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiAnICsgb3B0ICsgJyBtdXN0IGJlICcgKyByZXN1bHQpO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChhbGxvd1Vua25vd24gIT09IHRydWUpIHtcbiAgICAgIHRocm93IEVycm9yKCdVbmtub3duIG9wdGlvbiAnICsgb3B0KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzc2VydE9wdGlvbnM6IGFzc2VydE9wdGlvbnMsXG4gIHZhbGlkYXRvcnM6IHZhbGlkYXRvcnNcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBJbnRlcmNlcHRvck1hbmFnZXIgPSByZXF1aXJlKCcuL0ludGVyY2VwdG9yTWFuYWdlcicpO1xudmFyIGRpc3BhdGNoUmVxdWVzdCA9IHJlcXVpcmUoJy4vZGlzcGF0Y2hSZXF1ZXN0Jyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL21lcmdlQ29uZmlnJyk7XG52YXIgdmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy92YWxpZGF0b3InKTtcblxudmFyIHZhbGlkYXRvcnMgPSB2YWxpZGF0b3IudmFsaWRhdG9ycztcbi8qKlxuICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlQ29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIEF4aW9zKGluc3RhbmNlQ29uZmlnKSB7XG4gIHRoaXMuZGVmYXVsdHMgPSBpbnN0YW5jZUNvbmZpZztcbiAgdGhpcy5pbnRlcmNlcHRvcnMgPSB7XG4gICAgcmVxdWVzdDogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpLFxuICAgIHJlc3BvbnNlOiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKClcbiAgfTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcgc3BlY2lmaWMgZm9yIHRoaXMgcmVxdWVzdCAobWVyZ2VkIHdpdGggdGhpcy5kZWZhdWx0cylcbiAqL1xuQXhpb3MucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZ09yVXJsLCBjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWdPclVybCA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gICAgY29uZmlnLnVybCA9IGNvbmZpZ09yVXJsO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZyA9IGNvbmZpZ09yVXJsIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICB2YXIgdHJhbnNpdGlvbmFsID0gY29uZmlnLnRyYW5zaXRpb25hbDtcblxuICBpZiAodHJhbnNpdGlvbmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YWxpZGF0b3IuYXNzZXJ0T3B0aW9ucyh0cmFuc2l0aW9uYWwsIHtcbiAgICAgIHNpbGVudEpTT05QYXJzaW5nOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4pLFxuICAgICAgZm9yY2VkSlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiksXG4gICAgICBjbGFyaWZ5VGltZW91dEVycm9yOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4pXG4gICAgfSwgZmFsc2UpO1xuICB9XG5cbiAgLy8gZmlsdGVyIG91dCBza2lwcGVkIGludGVyY2VwdG9yc1xuICB2YXIgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4gPSBbXTtcbiAgdmFyIHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyA9IHRydWU7XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlcXVlc3QuZm9yRWFjaChmdW5jdGlvbiB1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGlmICh0eXBlb2YgaW50ZXJjZXB0b3IucnVuV2hlbiA9PT0gJ2Z1bmN0aW9uJyAmJiBpbnRlcmNlcHRvci5ydW5XaGVuKGNvbmZpZykgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzICYmIGludGVyY2VwdG9yLnN5bmNocm9ub3VzO1xuXG4gICAgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdmFyIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB0aGlzLmludGVyY2VwdG9ycy5yZXNwb25zZS5mb3JFYWNoKGZ1bmN0aW9uIHB1c2hSZXNwb25zZUludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcHJvbWlzZTtcblxuICBpZiAoIXN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycykge1xuICAgIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG5cbiAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5hcHBseShjaGFpbiwgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4pO1xuICAgIGNoYWluID0gY2hhaW4uY29uY2F0KHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbik7XG5cbiAgICBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG4gICAgd2hpbGUgKGNoYWluLmxlbmd0aCkge1xuICAgICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG5cbiAgdmFyIG5ld0NvbmZpZyA9IGNvbmZpZztcbiAgd2hpbGUgKHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLmxlbmd0aCkge1xuICAgIHZhciBvbkZ1bGZpbGxlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdmFyIG9uUmVqZWN0ZWQgPSByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpO1xuICAgIHRyeSB7XG4gICAgICBuZXdDb25maWcgPSBvbkZ1bGZpbGxlZChuZXdDb25maWcpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBvblJlamVjdGVkKGVycm9yKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHRyeSB7XG4gICAgcHJvbWlzZSA9IGRpc3BhdGNoUmVxdWVzdChuZXdDb25maWcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gIH1cblxuICB3aGlsZSAocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLmxlbmd0aCkge1xuICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4ocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCksIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogKGNvbmZpZyB8fCB7fSkuZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuL0NhbmNlbCcpO1xuXG4vKipcbiAqIEEgYENhbmNlbFRva2VuYCBpcyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiBhbiBvcGVyYXRpb24uXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBleGVjdXRvciBUaGUgZXhlY3V0b3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIENhbmNlbFRva2VuKGV4ZWN1dG9yKSB7XG4gIGlmICh0eXBlb2YgZXhlY3V0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleGVjdXRvciBtdXN0IGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgcmVzb2x2ZVByb21pc2U7XG5cbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgdGhpcy5wcm9taXNlLnRoZW4oZnVuY3Rpb24oY2FuY2VsKSB7XG4gICAgaWYgKCF0b2tlbi5fbGlzdGVuZXJzKSByZXR1cm47XG5cbiAgICB2YXIgaTtcbiAgICB2YXIgbCA9IHRva2VuLl9saXN0ZW5lcnMubGVuZ3RoO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgdG9rZW4uX2xpc3RlbmVyc1tpXShjYW5jZWwpO1xuICAgIH1cbiAgICB0b2tlbi5fbGlzdGVuZXJzID0gbnVsbDtcbiAgfSk7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgdGhpcy5wcm9taXNlLnRoZW4gPSBmdW5jdGlvbihvbmZ1bGZpbGxlZCkge1xuICAgIHZhciBfcmVzb2x2ZTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgdG9rZW4uc3Vic2NyaWJlKHJlc29sdmUpO1xuICAgICAgX3Jlc29sdmUgPSByZXNvbHZlO1xuICAgIH0pLnRoZW4ob25mdWxmaWxsZWQpO1xuXG4gICAgcHJvbWlzZS5jYW5jZWwgPSBmdW5jdGlvbiByZWplY3QoKSB7XG4gICAgICB0b2tlbi51bnN1YnNjcmliZShfcmVzb2x2ZSk7XG4gICAgfTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9O1xuXG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFN1YnNjcmliZSB0byB0aGUgY2FuY2VsIHNpZ25hbFxuICovXG5cbkNhbmNlbFRva2VuLnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbiBzdWJzY3JpYmUobGlzdGVuZXIpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgbGlzdGVuZXIodGhpcy5yZWFzb24pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICh0aGlzLl9saXN0ZW5lcnMpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzID0gW2xpc3RlbmVyXTtcbiAgfVxufTtcblxuLyoqXG4gKiBVbnN1YnNjcmliZSBmcm9tIHRoZSBjYW5jZWwgc2lnbmFsXG4gKi9cblxuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24gdW5zdWJzY3JpYmUobGlzdGVuZXIpIHtcbiAgaWYgKCF0aGlzLl9saXN0ZW5lcnMpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGluZGV4ID0gdGhpcy5fbGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpO1xuICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3NcbiAqXG4gKiBAcGFyYW0geyp9IHBheWxvYWQgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvcywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBeGlvc0Vycm9yKHBheWxvYWQpIHtcbiAgcmV0dXJuIHV0aWxzLmlzT2JqZWN0KHBheWxvYWQpICYmIChwYXlsb2FkLmlzQXhpb3NFcnJvciA9PT0gdHJ1ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vY29yZS9tZXJnZUNvbmZpZycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0Q29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKiBAcmV0dXJuIHtBeGlvc30gQSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdENvbmZpZykge1xuICB2YXIgY29udGV4dCA9IG5ldyBBeGlvcyhkZWZhdWx0Q29uZmlnKTtcbiAgdmFyIGluc3RhbmNlID0gYmluZChBeGlvcy5wcm90b3R5cGUucmVxdWVzdCwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBheGlvcy5wcm90b3R5cGUgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBBeGlvcy5wcm90b3R5cGUsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgY29udGV4dCB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIGNvbnRleHQpO1xuXG4gIC8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbiAgaW5zdGFuY2UuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGluc3RhbmNlQ29uZmlnKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKG1lcmdlQ29uZmlnKGRlZmF1bHRDb25maWcsIGluc3RhbmNlQ29uZmlnKSk7XG4gIH07XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuYXhpb3MuVkVSU0lPTiA9IHJlcXVpcmUoJy4vZW52L2RhdGEnKS52ZXJzaW9uO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG4vLyBFeHBvc2UgaXNBeGlvc0Vycm9yXG5heGlvcy5pc0F4aW9zRXJyb3IgPSByZXF1aXJlKCcuL2hlbHBlcnMvaXNBeGlvc0Vycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXhpb3M7XG5cbi8vIEFsbG93IHVzZSBvZiBkZWZhdWx0IGltcG9ydCBzeW50YXggaW4gVHlwZVNjcmlwdFxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGF4aW9zO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9heGlvcycpOyIsIid1c2Ugc3RyaWN0J1xuXG5leHBvcnRzLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5leHBvcnRzLnRvQnl0ZUFycmF5ID0gdG9CeXRlQXJyYXlcbmV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IGZyb21CeXRlQXJyYXlcblxudmFyIGxvb2t1cCA9IFtdXG52YXIgcmV2TG9va3VwID0gW11cbnZhciBBcnIgPSB0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcgPyBVaW50OEFycmF5IDogQXJyYXlcblxudmFyIGNvZGUgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLydcbmZvciAodmFyIGkgPSAwLCBsZW4gPSBjb2RlLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gIGxvb2t1cFtpXSA9IGNvZGVbaV1cbiAgcmV2TG9va3VwW2NvZGUuY2hhckNvZGVBdChpKV0gPSBpXG59XG5cbi8vIFN1cHBvcnQgZGVjb2RpbmcgVVJMLXNhZmUgYmFzZTY0IHN0cmluZ3MsIGFzIE5vZGUuanMgZG9lcy5cbi8vIFNlZTogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQmFzZTY0I1VSTF9hcHBsaWNhdGlvbnNcbnJldkxvb2t1cFsnLScuY2hhckNvZGVBdCgwKV0gPSA2MlxucmV2TG9va3VwWydfJy5jaGFyQ29kZUF0KDApXSA9IDYzXG5cbmZ1bmN0aW9uIGdldExlbnMgKGI2NCkge1xuICB2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXG4gIGlmIChsZW4gJSA0ID4gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG4gIH1cblxuICAvLyBUcmltIG9mZiBleHRyYSBieXRlcyBhZnRlciBwbGFjZWhvbGRlciBieXRlcyBhcmUgZm91bmRcbiAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vYmVhdGdhbW1pdC9iYXNlNjQtanMvaXNzdWVzLzQyXG4gIHZhciB2YWxpZExlbiA9IGI2NC5pbmRleE9mKCc9JylcbiAgaWYgKHZhbGlkTGVuID09PSAtMSkgdmFsaWRMZW4gPSBsZW5cblxuICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gdmFsaWRMZW4gPT09IGxlblxuICAgID8gMFxuICAgIDogNCAtICh2YWxpZExlbiAlIDQpXG5cbiAgcmV0dXJuIFt2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuXVxufVxuXG4vLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKGI2NCkge1xuICB2YXIgbGVucyA9IGdldExlbnMoYjY0KVxuICB2YXIgdmFsaWRMZW4gPSBsZW5zWzBdXG4gIHZhciBwbGFjZUhvbGRlcnNMZW4gPSBsZW5zWzFdXG4gIHJldHVybiAoKHZhbGlkTGVuICsgcGxhY2VIb2xkZXJzTGVuKSAqIDMgLyA0KSAtIHBsYWNlSG9sZGVyc0xlblxufVxuXG5mdW5jdGlvbiBfYnl0ZUxlbmd0aCAoYjY0LCB2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuKSB7XG4gIHJldHVybiAoKHZhbGlkTGVuICsgcGxhY2VIb2xkZXJzTGVuKSAqIDMgLyA0KSAtIHBsYWNlSG9sZGVyc0xlblxufVxuXG5mdW5jdGlvbiB0b0J5dGVBcnJheSAoYjY0KSB7XG4gIHZhciB0bXBcbiAgdmFyIGxlbnMgPSBnZXRMZW5zKGI2NClcbiAgdmFyIHZhbGlkTGVuID0gbGVuc1swXVxuICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gbGVuc1sxXVxuXG4gIHZhciBhcnIgPSBuZXcgQXJyKF9ieXRlTGVuZ3RoKGI2NCwgdmFsaWRMZW4sIHBsYWNlSG9sZGVyc0xlbikpXG5cbiAgdmFyIGN1ckJ5dGUgPSAwXG5cbiAgLy8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuICB2YXIgbGVuID0gcGxhY2VIb2xkZXJzTGVuID4gMFxuICAgID8gdmFsaWRMZW4gLSA0XG4gICAgOiB2YWxpZExlblxuXG4gIHZhciBpXG4gIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgIHRtcCA9XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxOCkgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDEyKSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPDwgNikgfFxuICAgICAgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAzKV1cbiAgICBhcnJbY3VyQnl0ZSsrXSA9ICh0bXAgPj4gMTYpICYgMHhGRlxuICAgIGFycltjdXJCeXRlKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIGlmIChwbGFjZUhvbGRlcnNMZW4gPT09IDIpIHtcbiAgICB0bXAgPVxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMikgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldID4+IDQpXG4gICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICBpZiAocGxhY2VIb2xkZXJzTGVuID09PSAxKSB7XG4gICAgdG1wID1cbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDEwKSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgNCkgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMildID4+IDIpXG4gICAgYXJyW2N1ckJ5dGUrK10gPSAodG1wID4+IDgpICYgMHhGRlxuICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIGFyclxufVxuXG5mdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuICByZXR1cm4gbG9va3VwW251bSA+PiAxOCAmIDB4M0ZdICtcbiAgICBsb29rdXBbbnVtID4+IDEyICYgMHgzRl0gK1xuICAgIGxvb2t1cFtudW0gPj4gNiAmIDB4M0ZdICtcbiAgICBsb29rdXBbbnVtICYgMHgzRl1cbn1cblxuZnVuY3Rpb24gZW5jb2RlQ2h1bmsgKHVpbnQ4LCBzdGFydCwgZW5kKSB7XG4gIHZhciB0bXBcbiAgdmFyIG91dHB1dCA9IFtdXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSArPSAzKSB7XG4gICAgdG1wID1cbiAgICAgICgodWludDhbaV0gPDwgMTYpICYgMHhGRjAwMDApICtcbiAgICAgICgodWludDhbaSArIDFdIDw8IDgpICYgMHhGRjAwKSArXG4gICAgICAodWludDhbaSArIDJdICYgMHhGRilcbiAgICBvdXRwdXQucHVzaCh0cmlwbGV0VG9CYXNlNjQodG1wKSlcbiAgfVxuICByZXR1cm4gb3V0cHV0LmpvaW4oJycpXG59XG5cbmZ1bmN0aW9uIGZyb21CeXRlQXJyYXkgKHVpbnQ4KSB7XG4gIHZhciB0bXBcbiAgdmFyIGxlbiA9IHVpbnQ4Lmxlbmd0aFxuICB2YXIgZXh0cmFCeXRlcyA9IGxlbiAlIDMgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcbiAgdmFyIHBhcnRzID0gW11cbiAgdmFyIG1heENodW5rTGVuZ3RoID0gMTYzODMgLy8gbXVzdCBiZSBtdWx0aXBsZSBvZiAzXG5cbiAgLy8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuICBmb3IgKHZhciBpID0gMCwgbGVuMiA9IGxlbiAtIGV4dHJhQnl0ZXM7IGkgPCBsZW4yOyBpICs9IG1heENodW5rTGVuZ3RoKSB7XG4gICAgcGFydHMucHVzaChlbmNvZGVDaHVuayh1aW50OCwgaSwgKGkgKyBtYXhDaHVua0xlbmd0aCkgPiBsZW4yID8gbGVuMiA6IChpICsgbWF4Q2h1bmtMZW5ndGgpKSlcbiAgfVxuXG4gIC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcbiAgaWYgKGV4dHJhQnl0ZXMgPT09IDEpIHtcbiAgICB0bXAgPSB1aW50OFtsZW4gLSAxXVxuICAgIHBhcnRzLnB1c2goXG4gICAgICBsb29rdXBbdG1wID4+IDJdICtcbiAgICAgIGxvb2t1cFsodG1wIDw8IDQpICYgMHgzRl0gK1xuICAgICAgJz09J1xuICAgIClcbiAgfSBlbHNlIGlmIChleHRyYUJ5dGVzID09PSAyKSB7XG4gICAgdG1wID0gKHVpbnQ4W2xlbiAtIDJdIDw8IDgpICsgdWludDhbbGVuIC0gMV1cbiAgICBwYXJ0cy5wdXNoKFxuICAgICAgbG9va3VwW3RtcCA+PiAxMF0gK1xuICAgICAgbG9va3VwWyh0bXAgPj4gNCkgJiAweDNGXSArXG4gICAgICBsb29rdXBbKHRtcCA8PCAyKSAmIDB4M0ZdICtcbiAgICAgICc9J1xuICAgIClcbiAgfVxuXG4gIHJldHVybiBwYXJ0cy5qb2luKCcnKVxufVxuIiwiLyohIGllZWU3NTQuIEJTRC0zLUNsYXVzZSBMaWNlbnNlLiBGZXJvc3MgQWJvdWtoYWRpamVoIDxodHRwczovL2Zlcm9zcy5vcmcvb3BlbnNvdXJjZT4gKi9cbmV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtXG4gIHZhciBlTGVuID0gKG5CeXRlcyAqIDgpIC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gKGUgKiAyNTYpICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gKG0gKiAyNTYpICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgY1xuICB2YXIgZUxlbiA9IChuQnl0ZXMgKiA4KSAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAoKHZhbHVlICogYykgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cbiIsIi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGh0dHBzOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IFNsb3dCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuXG52YXIgS19NQVhfTEVOR1RIID0gMHg3ZmZmZmZmZlxuZXhwb3J0cy5rTWF4TGVuZ3RoID0gS19NQVhfTEVOR1RIXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFByaW50IHdhcm5pbmcgYW5kIHJlY29tbWVuZCB1c2luZyBgYnVmZmVyYCB2NC54IHdoaWNoIGhhcyBhbiBPYmplY3RcbiAqICAgICAgICAgICAgICAgaW1wbGVtZW50YXRpb24gKG1vc3QgY29tcGF0aWJsZSwgZXZlbiBJRTYpXG4gKlxuICogQnJvd3NlcnMgdGhhdCBzdXBwb3J0IHR5cGVkIGFycmF5cyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLCBDaHJvbWUgNyssIFNhZmFyaSA1LjErLFxuICogT3BlcmEgMTEuNissIGlPUyA0LjIrLlxuICpcbiAqIFdlIHJlcG9ydCB0aGF0IHRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGlmIHRoZSBhcmUgbm90IHN1YmNsYXNzYWJsZVxuICogdXNpbmcgX19wcm90b19fLiBGaXJlZm94IDQtMjkgbGFja3Mgc3VwcG9ydCBmb3IgYWRkaW5nIG5ldyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YFxuICogKFNlZTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4KS4gSUUgMTAgbGFja3Mgc3VwcG9ydFxuICogZm9yIF9fcHJvdG9fXyBhbmQgaGFzIGEgYnVnZ3kgdHlwZWQgYXJyYXkgaW1wbGVtZW50YXRpb24uXG4gKi9cbkJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUID0gdHlwZWRBcnJheVN1cHBvcnQoKVxuXG5pZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmIHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBjb25zb2xlLmVycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gIGNvbnNvbGUuZXJyb3IoXG4gICAgJ1RoaXMgYnJvd3NlciBsYWNrcyB0eXBlZCBhcnJheSAoVWludDhBcnJheSkgc3VwcG9ydCB3aGljaCBpcyByZXF1aXJlZCBieSAnICtcbiAgICAnYGJ1ZmZlcmAgdjUueC4gVXNlIGBidWZmZXJgIHY0LnggaWYgeW91IHJlcXVpcmUgb2xkIGJyb3dzZXIgc3VwcG9ydC4nXG4gIClcbn1cblxuZnVuY3Rpb24gdHlwZWRBcnJheVN1cHBvcnQgKCkge1xuICAvLyBDYW4gdHlwZWQgYXJyYXkgaW5zdGFuY2VzIGNhbiBiZSBhdWdtZW50ZWQ/XG4gIHRyeSB7XG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KDEpXG4gICAgYXJyLl9fcHJvdG9fXyA9IHsgX19wcm90b19fOiBVaW50OEFycmF5LnByb3RvdHlwZSwgZm9vOiBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9IH1cbiAgICByZXR1cm4gYXJyLmZvbygpID09PSA0MlxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEJ1ZmZlci5wcm90b3R5cGUsICdwYXJlbnQnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKHRoaXMpKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyXG4gIH1cbn0pXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIucHJvdG90eXBlLCAnb2Zmc2V0Jywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0aGlzKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHJldHVybiB0aGlzLmJ5dGVPZmZzZXRcbiAgfVxufSlcblxuZnVuY3Rpb24gY3JlYXRlQnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKGxlbmd0aCA+IEtfTUFYX0xFTkdUSCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgXCInICsgbGVuZ3RoICsgJ1wiIGlzIGludmFsaWQgZm9yIG9wdGlvbiBcInNpemVcIicpXG4gIH1cbiAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGxlbmd0aClcbiAgYnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgcmV0dXJuIGJ1ZlxufVxuXG4vKipcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgaGF2ZSB0aGVpclxuICogcHJvdG90eXBlIGNoYW5nZWQgdG8gYEJ1ZmZlci5wcm90b3R5cGVgLiBGdXJ0aGVybW9yZSwgYEJ1ZmZlcmAgaXMgYSBzdWJjbGFzcyBvZlxuICogYFVpbnQ4QXJyYXlgLCBzbyB0aGUgcmV0dXJuZWQgaW5zdGFuY2VzIHdpbGwgaGF2ZSBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgbWV0aG9kc1xuICogYW5kIHRoZSBgVWludDhBcnJheWAgbWV0aG9kcy4gU3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXRcbiAqIHJldHVybnMgYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogVGhlIGBVaW50OEFycmF5YCBwcm90b3R5cGUgcmVtYWlucyB1bm1vZGlmaWVkLlxuICovXG5cbmZ1bmN0aW9uIEJ1ZmZlciAoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgLy8gQ29tbW9uIGNhc2UuXG4gIGlmICh0eXBlb2YgYXJnID09PSAnbnVtYmVyJykge1xuICAgIGlmICh0eXBlb2YgZW5jb2RpbmdPck9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICdUaGUgXCJzdHJpbmdcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgc3RyaW5nLiBSZWNlaXZlZCB0eXBlIG51bWJlcidcbiAgICAgIClcbiAgICB9XG4gICAgcmV0dXJuIGFsbG9jVW5zYWZlKGFyZylcbiAgfVxuICByZXR1cm4gZnJvbShhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuLy8gRml4IHN1YmFycmF5KCkgaW4gRVMyMDE2LiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL3B1bGwvOTdcbmlmICh0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wuc3BlY2llcyAhPSBudWxsICYmXG4gICAgQnVmZmVyW1N5bWJvbC5zcGVjaWVzXSA9PT0gQnVmZmVyKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIsIFN5bWJvbC5zcGVjaWVzLCB7XG4gICAgdmFsdWU6IG51bGwsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIHdyaXRhYmxlOiBmYWxzZVxuICB9KVxufVxuXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyIC8vIG5vdCB1c2VkIGJ5IHRoaXMgaW1wbGVtZW50YXRpb25cblxuZnVuY3Rpb24gZnJvbSAodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmcm9tU3RyaW5nKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0KVxuICB9XG5cbiAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZnJvbUFycmF5TGlrZSh2YWx1ZSlcbiAgfVxuXG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksICcgK1xuICAgICAgJ29yIEFycmF5LWxpa2UgT2JqZWN0LiBSZWNlaXZlZCB0eXBlICcgKyAodHlwZW9mIHZhbHVlKVxuICAgIClcbiAgfVxuXG4gIGlmIChpc0luc3RhbmNlKHZhbHVlLCBBcnJheUJ1ZmZlcikgfHxcbiAgICAgICh2YWx1ZSAmJiBpc0luc3RhbmNlKHZhbHVlLmJ1ZmZlciwgQXJyYXlCdWZmZXIpKSkge1xuICAgIHJldHVybiBmcm9tQXJyYXlCdWZmZXIodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJ2YWx1ZVwiIGFyZ3VtZW50IG11c3Qgbm90IGJlIG9mIHR5cGUgbnVtYmVyLiBSZWNlaXZlZCB0eXBlIG51bWJlcidcbiAgICApXG4gIH1cblxuICB2YXIgdmFsdWVPZiA9IHZhbHVlLnZhbHVlT2YgJiYgdmFsdWUudmFsdWVPZigpXG4gIGlmICh2YWx1ZU9mICE9IG51bGwgJiYgdmFsdWVPZiAhPT0gdmFsdWUpIHtcbiAgICByZXR1cm4gQnVmZmVyLmZyb20odmFsdWVPZiwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgdmFyIGIgPSBmcm9tT2JqZWN0KHZhbHVlKVxuICBpZiAoYikgcmV0dXJuIGJcblxuICBpZiAodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvUHJpbWl0aXZlICE9IG51bGwgJiZcbiAgICAgIHR5cGVvZiB2YWx1ZVtTeW1ib2wudG9QcmltaXRpdmVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5mcm9tKFxuICAgICAgdmFsdWVbU3ltYm9sLnRvUHJpbWl0aXZlXSgnc3RyaW5nJyksIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aFxuICAgIClcbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgJ1RoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksICcgK1xuICAgICdvciBBcnJheS1saWtlIE9iamVjdC4gUmVjZWl2ZWQgdHlwZSAnICsgKHR5cGVvZiB2YWx1ZSlcbiAgKVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uYWxseSBlcXVpdmFsZW50IHRvIEJ1ZmZlcihhcmcsIGVuY29kaW5nKSBidXQgdGhyb3dzIGEgVHlwZUVycm9yXG4gKiBpZiB2YWx1ZSBpcyBhIG51bWJlci5cbiAqIEJ1ZmZlci5mcm9tKHN0clssIGVuY29kaW5nXSlcbiAqIEJ1ZmZlci5mcm9tKGFycmF5KVxuICogQnVmZmVyLmZyb20oYnVmZmVyKVxuICogQnVmZmVyLmZyb20oYXJyYXlCdWZmZXJbLCBieXRlT2Zmc2V0WywgbGVuZ3RoXV0pXG4gKiovXG5CdWZmZXIuZnJvbSA9IGZ1bmN0aW9uICh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBmcm9tKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cbi8vIE5vdGU6IENoYW5nZSBwcm90b3R5cGUgKmFmdGVyKiBCdWZmZXIuZnJvbSBpcyBkZWZpbmVkIHRvIHdvcmthcm91bmQgQ2hyb21lIGJ1Zzpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL3B1bGwvMTQ4XG5CdWZmZXIucHJvdG90eXBlLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXkucHJvdG90eXBlXG5CdWZmZXIuX19wcm90b19fID0gVWludDhBcnJheVxuXG5mdW5jdGlvbiBhc3NlcnRTaXplIChzaXplKSB7XG4gIGlmICh0eXBlb2Ygc2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInNpemVcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgbnVtYmVyJylcbiAgfSBlbHNlIGlmIChzaXplIDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgXCInICsgc2l6ZSArICdcIiBpcyBpbnZhbGlkIGZvciBvcHRpb24gXCJzaXplXCInKVxuICB9XG59XG5cbmZ1bmN0aW9uIGFsbG9jIChzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIGlmIChzaXplIDw9IDApIHtcbiAgICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG4gIH1cbiAgaWYgKGZpbGwgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9ubHkgcGF5IGF0dGVudGlvbiB0byBlbmNvZGluZyBpZiBpdCdzIGEgc3RyaW5nLiBUaGlzXG4gICAgLy8gcHJldmVudHMgYWNjaWRlbnRhbGx5IHNlbmRpbmcgaW4gYSBudW1iZXIgdGhhdCB3b3VsZFxuICAgIC8vIGJlIGludGVycHJldHRlZCBhcyBhIHN0YXJ0IG9mZnNldC5cbiAgICByZXR1cm4gdHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJ1xuICAgICAgPyBjcmVhdGVCdWZmZXIoc2l6ZSkuZmlsbChmaWxsLCBlbmNvZGluZylcbiAgICAgIDogY3JlYXRlQnVmZmVyKHNpemUpLmZpbGwoZmlsbClcbiAgfVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBmaWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICogYWxsb2Moc2l6ZVssIGZpbGxbLCBlbmNvZGluZ11dKVxuICoqL1xuQnVmZmVyLmFsbG9jID0gZnVuY3Rpb24gKHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIHJldHVybiBhbGxvYyhzaXplLCBmaWxsLCBlbmNvZGluZylcbn1cblxuZnVuY3Rpb24gYWxsb2NVbnNhZmUgKHNpemUpIHtcbiAgYXNzZXJ0U2l6ZShzaXplKVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUgPCAwID8gMCA6IGNoZWNrZWQoc2l6ZSkgfCAwKVxufVxuXG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gQnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiAqL1xuQnVmZmVyLmFsbG9jVW5zYWZlID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKHNpemUpXG59XG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gU2xvd0J1ZmZlcihudW0pLCBieSBkZWZhdWx0IGNyZWF0ZXMgYSBub24temVyby1maWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICovXG5CdWZmZXIuYWxsb2NVbnNhZmVTbG93ID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKHNpemUpXG59XG5cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycgfHwgZW5jb2RpbmcgPT09ICcnKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgfVxuXG4gIGlmICghQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICB9XG5cbiAgdmFyIGxlbmd0aCA9IGJ5dGVMZW5ndGgoc3RyaW5nLCBlbmNvZGluZykgfCAwXG4gIHZhciBidWYgPSBjcmVhdGVCdWZmZXIobGVuZ3RoKVxuXG4gIHZhciBhY3R1YWwgPSBidWYud3JpdGUoc3RyaW5nLCBlbmNvZGluZylcblxuICBpZiAoYWN0dWFsICE9PSBsZW5ndGgpIHtcbiAgICAvLyBXcml0aW5nIGEgaGV4IHN0cmluZywgZm9yIGV4YW1wbGUsIHRoYXQgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzIHdpbGxcbiAgICAvLyBjYXVzZSBldmVyeXRoaW5nIGFmdGVyIHRoZSBmaXJzdCBpbnZhbGlkIGNoYXJhY3RlciB0byBiZSBpZ25vcmVkLiAoZS5nLlxuICAgIC8vICdhYnh4Y2QnIHdpbGwgYmUgdHJlYXRlZCBhcyAnYWInKVxuICAgIGJ1ZiA9IGJ1Zi5zbGljZSgwLCBhY3R1YWwpXG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUxpa2UgKGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGggPCAwID8gMCA6IGNoZWNrZWQoYXJyYXkubGVuZ3RoKSB8IDBcbiAgdmFyIGJ1ZiA9IGNyZWF0ZUJ1ZmZlcihsZW5ndGgpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICBidWZbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5QnVmZmVyIChhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmIChieXRlT2Zmc2V0IDwgMCB8fCBhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcIm9mZnNldFwiIGlzIG91dHNpZGUgb2YgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBpZiAoYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQgKyAobGVuZ3RoIHx8IDApKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1wibGVuZ3RoXCIgaXMgb3V0c2lkZSBvZiBidWZmZXIgYm91bmRzJylcbiAgfVxuXG4gIHZhciBidWZcbiAgaWYgKGJ5dGVPZmZzZXQgPT09IHVuZGVmaW5lZCAmJiBsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5KVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQpXG4gIH0gZWxzZSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIGJ1Zi5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbU9iamVjdCAob2JqKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIob2JqKSkge1xuICAgIHZhciBsZW4gPSBjaGVja2VkKG9iai5sZW5ndGgpIHwgMFxuICAgIHZhciBidWYgPSBjcmVhdGVCdWZmZXIobGVuKVxuXG4gICAgaWYgKGJ1Zi5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBidWZcbiAgICB9XG5cbiAgICBvYmouY29weShidWYsIDAsIDAsIGxlbilcbiAgICByZXR1cm4gYnVmXG4gIH1cblxuICBpZiAob2JqLmxlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHR5cGVvZiBvYmoubGVuZ3RoICE9PSAnbnVtYmVyJyB8fCBudW1iZXJJc05hTihvYmoubGVuZ3RoKSkge1xuICAgICAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcigwKVxuICAgIH1cbiAgICByZXR1cm4gZnJvbUFycmF5TGlrZShvYmopXG4gIH1cblxuICBpZiAob2JqLnR5cGUgPT09ICdCdWZmZXInICYmIEFycmF5LmlzQXJyYXkob2JqLmRhdGEpKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheUxpa2Uob2JqLmRhdGEpXG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tlZCAobGVuZ3RoKSB7XG4gIC8vIE5vdGU6IGNhbm5vdCB1c2UgYGxlbmd0aCA8IEtfTUFYX0xFTkdUSGAgaGVyZSBiZWNhdXNlIHRoYXQgZmFpbHMgd2hlblxuICAvLyBsZW5ndGggaXMgTmFOICh3aGljaCBpcyBvdGhlcndpc2UgY29lcmNlZCB0byB6ZXJvLilcbiAgaWYgKGxlbmd0aCA+PSBLX01BWF9MRU5HVEgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byBhbGxvY2F0ZSBCdWZmZXIgbGFyZ2VyIHRoYW4gbWF4aW11bSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnc2l6ZTogMHgnICsgS19NQVhfTEVOR1RILnRvU3RyaW5nKDE2KSArICcgYnl0ZXMnKVxuICB9XG4gIHJldHVybiBsZW5ndGggfCAwXG59XG5cbmZ1bmN0aW9uIFNsb3dCdWZmZXIgKGxlbmd0aCkge1xuICBpZiAoK2xlbmd0aCAhPSBsZW5ndGgpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBlcWVxZXFcbiAgICBsZW5ndGggPSAwXG4gIH1cbiAgcmV0dXJuIEJ1ZmZlci5hbGxvYygrbGVuZ3RoKVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiBpc0J1ZmZlciAoYikge1xuICByZXR1cm4gYiAhPSBudWxsICYmIGIuX2lzQnVmZmVyID09PSB0cnVlICYmXG4gICAgYiAhPT0gQnVmZmVyLnByb3RvdHlwZSAvLyBzbyBCdWZmZXIuaXNCdWZmZXIoQnVmZmVyLnByb3RvdHlwZSkgd2lsbCBiZSBmYWxzZVxufVxuXG5CdWZmZXIuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKGEsIGIpIHtcbiAgaWYgKGlzSW5zdGFuY2UoYSwgVWludDhBcnJheSkpIGEgPSBCdWZmZXIuZnJvbShhLCBhLm9mZnNldCwgYS5ieXRlTGVuZ3RoKVxuICBpZiAoaXNJbnN0YW5jZShiLCBVaW50OEFycmF5KSkgYiA9IEJ1ZmZlci5mcm9tKGIsIGIub2Zmc2V0LCBiLmJ5dGVMZW5ndGgpXG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGEpIHx8ICFCdWZmZXIuaXNCdWZmZXIoYikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBcImJ1ZjFcIiwgXCJidWYyXCIgYXJndW1lbnRzIG11c3QgYmUgb25lIG9mIHR5cGUgQnVmZmVyIG9yIFVpbnQ4QXJyYXknXG4gICAgKVxuICB9XG5cbiAgaWYgKGEgPT09IGIpIHJldHVybiAwXG5cbiAgdmFyIHggPSBhLmxlbmd0aFxuICB2YXIgeSA9IGIubGVuZ3RoXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IE1hdGgubWluKHgsIHkpOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAoYVtpXSAhPT0gYltpXSkge1xuICAgICAgeCA9IGFbaV1cbiAgICAgIHkgPSBiW2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiBpc0VuY29kaW5nIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdsYXRpbjEnOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIGNvbmNhdCAobGlzdCwgbGVuZ3RoKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShsaXN0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gIH1cblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gQnVmZmVyLmFsbG9jKDApXG4gIH1cblxuICB2YXIgaVxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBsZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgIGxlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWZmZXIgPSBCdWZmZXIuYWxsb2NVbnNhZmUobGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBidWYgPSBsaXN0W2ldXG4gICAgaWYgKGlzSW5zdGFuY2UoYnVmLCBVaW50OEFycmF5KSkge1xuICAgICAgYnVmID0gQnVmZmVyLmZyb20oYnVmKVxuICAgIH1cbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICAgIH1cbiAgICBidWYuY29weShidWZmZXIsIHBvcylcbiAgICBwb3MgKz0gYnVmLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZmZXJcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN0cmluZykpIHtcbiAgICByZXR1cm4gc3RyaW5nLmxlbmd0aFxuICB9XG4gIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoc3RyaW5nKSB8fCBpc0luc3RhbmNlKHN0cmluZywgQXJyYXlCdWZmZXIpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5ieXRlTGVuZ3RoXG4gIH1cbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJzdHJpbmdcIiBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBvciBBcnJheUJ1ZmZlci4gJyArXG4gICAgICAnUmVjZWl2ZWQgdHlwZSAnICsgdHlwZW9mIHN0cmluZ1xuICAgIClcbiAgfVxuXG4gIHZhciBsZW4gPSBzdHJpbmcubGVuZ3RoXG4gIHZhciBtdXN0TWF0Y2ggPSAoYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdID09PSB0cnVlKVxuICBpZiAoIW11c3RNYXRjaCAmJiBsZW4gPT09IDApIHJldHVybiAwXG5cbiAgLy8gVXNlIGEgZm9yIGxvb3AgdG8gYXZvaWQgcmVjdXJzaW9uXG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxlblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIGxlbiAqIDJcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBsZW4gPj4+IDFcbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRUb0J5dGVzKHN0cmluZykubGVuZ3RoXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHtcbiAgICAgICAgICByZXR1cm4gbXVzdE1hdGNoID8gLTEgOiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aCAvLyBhc3N1bWUgdXRmOFxuICAgICAgICB9XG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcblxuZnVuY3Rpb24gc2xvd1RvU3RyaW5nIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuXG4gIC8vIE5vIG5lZWQgdG8gdmVyaWZ5IHRoYXQgXCJ0aGlzLmxlbmd0aCA8PSBNQVhfVUlOVDMyXCIgc2luY2UgaXQncyBhIHJlYWQtb25seVxuICAvLyBwcm9wZXJ0eSBvZiBhIHR5cGVkIGFycmF5LlxuXG4gIC8vIFRoaXMgYmVoYXZlcyBuZWl0aGVyIGxpa2UgU3RyaW5nIG5vciBVaW50OEFycmF5IGluIHRoYXQgd2Ugc2V0IHN0YXJ0L2VuZFxuICAvLyB0byB0aGVpciB1cHBlci9sb3dlciBib3VuZHMgaWYgdGhlIHZhbHVlIHBhc3NlZCBpcyBvdXQgb2YgcmFuZ2UuXG4gIC8vIHVuZGVmaW5lZCBpcyBoYW5kbGVkIHNwZWNpYWxseSBhcyBwZXIgRUNNQS0yNjIgNnRoIEVkaXRpb24sXG4gIC8vIFNlY3Rpb24gMTMuMy4zLjcgUnVudGltZSBTZW1hbnRpY3M6IEtleWVkQmluZGluZ0luaXRpYWxpemF0aW9uLlxuICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCB8fCBzdGFydCA8IDApIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICAvLyBSZXR1cm4gZWFybHkgaWYgc3RhcnQgPiB0aGlzLmxlbmd0aC4gRG9uZSBoZXJlIHRvIHByZXZlbnQgcG90ZW50aWFsIHVpbnQzMlxuICAvLyBjb2VyY2lvbiBmYWlsIGJlbG93LlxuICBpZiAoc3RhcnQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkIHx8IGVuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgfVxuXG4gIGlmIChlbmQgPD0gMCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgLy8gRm9yY2UgY29lcnNpb24gdG8gdWludDMyLiBUaGlzIHdpbGwgYWxzbyBjb2VyY2UgZmFsc2V5L05hTiB2YWx1ZXMgdG8gMC5cbiAgZW5kID4+Pj0gMFxuICBzdGFydCA+Pj49IDBcblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsYXRpbjFTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHV0ZjE2bGVTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoZW5jb2RpbmcgKyAnJykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuLy8gVGhpcyBwcm9wZXJ0eSBpcyB1c2VkIGJ5IGBCdWZmZXIuaXNCdWZmZXJgIChhbmQgdGhlIGBpcy1idWZmZXJgIG5wbSBwYWNrYWdlKVxuLy8gdG8gZGV0ZWN0IGEgQnVmZmVyIGluc3RhbmNlLiBJdCdzIG5vdCBwb3NzaWJsZSB0byB1c2UgYGluc3RhbmNlb2YgQnVmZmVyYFxuLy8gcmVsaWFibHkgaW4gYSBicm93c2VyaWZ5IGNvbnRleHQgYmVjYXVzZSB0aGVyZSBjb3VsZCBiZSBtdWx0aXBsZSBkaWZmZXJlbnRcbi8vIGNvcGllcyBvZiB0aGUgJ2J1ZmZlcicgcGFja2FnZSBpbiB1c2UuIFRoaXMgbWV0aG9kIHdvcmtzIGV2ZW4gZm9yIEJ1ZmZlclxuLy8gaW5zdGFuY2VzIHRoYXQgd2VyZSBjcmVhdGVkIGZyb20gYW5vdGhlciBjb3B5IG9mIHRoZSBgYnVmZmVyYCBwYWNrYWdlLlxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9pc3N1ZXMvMTU0XG5CdWZmZXIucHJvdG90eXBlLl9pc0J1ZmZlciA9IHRydWVcblxuZnVuY3Rpb24gc3dhcCAoYiwgbiwgbSkge1xuICB2YXIgaSA9IGJbbl1cbiAgYltuXSA9IGJbbV1cbiAgYlttXSA9IGlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMTYgPSBmdW5jdGlvbiBzd2FwMTYgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDIgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDE2LWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDIpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAxKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDMyID0gZnVuY3Rpb24gc3dhcDMyICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA0ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAzMi1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSA0KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgMylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgMilcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXA2NCA9IGZ1bmN0aW9uIHN3YXA2NCAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgOCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNjQtYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gOCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDcpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDYpXG4gICAgc3dhcCh0aGlzLCBpICsgMiwgaSArIDUpXG4gICAgc3dhcCh0aGlzLCBpICsgMywgaSArIDQpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nICgpIHtcbiAgdmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW5ndGggPT09IDApIHJldHVybiAnJ1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCAwLCBsZW5ndGgpXG4gIHJldHVybiBzbG93VG9TdHJpbmcuYXBwbHkodGhpcywgYXJndW1lbnRzKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvTG9jYWxlU3RyaW5nID0gQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZ1xuXG5CdWZmZXIucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyAoYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIGlmICh0aGlzID09PSBiKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gQnVmZmVyLmNvbXBhcmUodGhpcywgYikgPT09IDBcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gaW5zcGVjdCAoKSB7XG4gIHZhciBzdHIgPSAnJ1xuICB2YXIgbWF4ID0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFU1xuICBzdHIgPSB0aGlzLnRvU3RyaW5nKCdoZXgnLCAwLCBtYXgpLnJlcGxhY2UoLyguezJ9KS9nLCAnJDEgJykudHJpbSgpXG4gIGlmICh0aGlzLmxlbmd0aCA+IG1heCkgc3RyICs9ICcgLi4uICdcbiAgcmV0dXJuICc8QnVmZmVyICcgKyBzdHIgKyAnPidcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAodGFyZ2V0LCBzdGFydCwgZW5kLCB0aGlzU3RhcnQsIHRoaXNFbmQpIHtcbiAgaWYgKGlzSW5zdGFuY2UodGFyZ2V0LCBVaW50OEFycmF5KSkge1xuICAgIHRhcmdldCA9IEJ1ZmZlci5mcm9tKHRhcmdldCwgdGFyZ2V0Lm9mZnNldCwgdGFyZ2V0LmJ5dGVMZW5ndGgpXG4gIH1cbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGFyZ2V0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIFwidGFyZ2V0XCIgYXJndW1lbnQgbXVzdCBiZSBvbmUgb2YgdHlwZSBCdWZmZXIgb3IgVWludDhBcnJheS4gJyArXG4gICAgICAnUmVjZWl2ZWQgdHlwZSAnICsgKHR5cGVvZiB0YXJnZXQpXG4gICAgKVxuICB9XG5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICBpZiAoZW5kID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmQgPSB0YXJnZXQgPyB0YXJnZXQubGVuZ3RoIDogMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNTdGFydCA9IDBcbiAgfVxuICBpZiAodGhpc0VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc0VuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoc3RhcnQgPCAwIHx8IGVuZCA+IHRhcmdldC5sZW5ndGggfHwgdGhpc1N0YXJ0IDwgMCB8fCB0aGlzRW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCAmJiBzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCkge1xuICAgIHJldHVybiAtMVxuICB9XG4gIGlmIChzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMVxuICB9XG5cbiAgc3RhcnQgPj4+PSAwXG4gIGVuZCA+Pj49IDBcbiAgdGhpc1N0YXJ0ID4+Pj0gMFxuICB0aGlzRW5kID4+Pj0gMFxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQpIHJldHVybiAwXG5cbiAgdmFyIHggPSB0aGlzRW5kIC0gdGhpc1N0YXJ0XG4gIHZhciB5ID0gZW5kIC0gc3RhcnRcbiAgdmFyIGxlbiA9IE1hdGgubWluKHgsIHkpXG5cbiAgdmFyIHRoaXNDb3B5ID0gdGhpcy5zbGljZSh0aGlzU3RhcnQsIHRoaXNFbmQpXG4gIHZhciB0YXJnZXRDb3B5ID0gdGFyZ2V0LnNsaWNlKHN0YXJ0LCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIGlmICh0aGlzQ29weVtpXSAhPT0gdGFyZ2V0Q29weVtpXSkge1xuICAgICAgeCA9IHRoaXNDb3B5W2ldXG4gICAgICB5ID0gdGFyZ2V0Q29weVtpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbi8vIEZpbmRzIGVpdGhlciB0aGUgZmlyc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0ID49IGBieXRlT2Zmc2V0YCxcbi8vIE9SIHRoZSBsYXN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA8PSBgYnl0ZU9mZnNldGAuXG4vL1xuLy8gQXJndW1lbnRzOlxuLy8gLSBidWZmZXIgLSBhIEJ1ZmZlciB0byBzZWFyY2hcbi8vIC0gdmFsIC0gYSBzdHJpbmcsIEJ1ZmZlciwgb3IgbnVtYmVyXG4vLyAtIGJ5dGVPZmZzZXQgLSBhbiBpbmRleCBpbnRvIGBidWZmZXJgOyB3aWxsIGJlIGNsYW1wZWQgdG8gYW4gaW50MzJcbi8vIC0gZW5jb2RpbmcgLSBhbiBvcHRpb25hbCBlbmNvZGluZywgcmVsZXZhbnQgaXMgdmFsIGlzIGEgc3RyaW5nXG4vLyAtIGRpciAtIHRydWUgZm9yIGluZGV4T2YsIGZhbHNlIGZvciBsYXN0SW5kZXhPZlxuZnVuY3Rpb24gYmlkaXJlY3Rpb25hbEluZGV4T2YgKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIC8vIEVtcHR5IGJ1ZmZlciBtZWFucyBubyBtYXRjaFxuICBpZiAoYnVmZmVyLmxlbmd0aCA9PT0gMCkgcmV0dXJuIC0xXG5cbiAgLy8gTm9ybWFsaXplIGJ5dGVPZmZzZXRcbiAgaWYgKHR5cGVvZiBieXRlT2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gYnl0ZU9mZnNldFxuICAgIGJ5dGVPZmZzZXQgPSAwXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA+IDB4N2ZmZmZmZmYpIHtcbiAgICBieXRlT2Zmc2V0ID0gMHg3ZmZmZmZmZlxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAtMHg4MDAwMDAwMCkge1xuICAgIGJ5dGVPZmZzZXQgPSAtMHg4MDAwMDAwMFxuICB9XG4gIGJ5dGVPZmZzZXQgPSArYnl0ZU9mZnNldCAvLyBDb2VyY2UgdG8gTnVtYmVyLlxuICBpZiAobnVtYmVySXNOYU4oYnl0ZU9mZnNldCkpIHtcbiAgICAvLyBieXRlT2Zmc2V0OiBpdCBpdCdzIHVuZGVmaW5lZCwgbnVsbCwgTmFOLCBcImZvb1wiLCBldGMsIHNlYXJjaCB3aG9sZSBidWZmZXJcbiAgICBieXRlT2Zmc2V0ID0gZGlyID8gMCA6IChidWZmZXIubGVuZ3RoIC0gMSlcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0OiBuZWdhdGl2ZSBvZmZzZXRzIHN0YXJ0IGZyb20gdGhlIGVuZCBvZiB0aGUgYnVmZmVyXG4gIGlmIChieXRlT2Zmc2V0IDwgMCkgYnl0ZU9mZnNldCA9IGJ1ZmZlci5sZW5ndGggKyBieXRlT2Zmc2V0XG4gIGlmIChieXRlT2Zmc2V0ID49IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICBpZiAoZGlyKSByZXR1cm4gLTFcbiAgICBlbHNlIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoIC0gMVxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAwKSB7XG4gICAgaWYgKGRpcikgYnl0ZU9mZnNldCA9IDBcbiAgICBlbHNlIHJldHVybiAtMVxuICB9XG5cbiAgLy8gTm9ybWFsaXplIHZhbFxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWwgPSBCdWZmZXIuZnJvbSh2YWwsIGVuY29kaW5nKVxuICB9XG5cbiAgLy8gRmluYWxseSwgc2VhcmNoIGVpdGhlciBpbmRleE9mIChpZiBkaXIgaXMgdHJ1ZSkgb3IgbGFzdEluZGV4T2ZcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcih2YWwpKSB7XG4gICAgLy8gU3BlY2lhbCBjYXNlOiBsb29raW5nIGZvciBlbXB0eSBzdHJpbmcvYnVmZmVyIGFsd2F5cyBmYWlsc1xuICAgIGlmICh2YWwubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gLTFcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZihidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcilcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHZhbCA9IHZhbCAmIDB4RkYgLy8gU2VhcmNoIGZvciBhIGJ5dGUgdmFsdWUgWzAtMjU1XVxuICAgIGlmICh0eXBlb2YgVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKGRpcikge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmxhc3RJbmRleE9mLmNhbGwoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCBbIHZhbCBdLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmFsIG11c3QgYmUgc3RyaW5nLCBudW1iZXIgb3IgQnVmZmVyJylcbn1cblxuZnVuY3Rpb24gYXJyYXlJbmRleE9mIChhcnIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICB2YXIgaW5kZXhTaXplID0gMVxuICB2YXIgYXJyTGVuZ3RoID0gYXJyLmxlbmd0aFxuICB2YXIgdmFsTGVuZ3RoID0gdmFsLmxlbmd0aFxuXG4gIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICBpZiAoZW5jb2RpbmcgPT09ICd1Y3MyJyB8fCBlbmNvZGluZyA9PT0gJ3Vjcy0yJyB8fFxuICAgICAgICBlbmNvZGluZyA9PT0gJ3V0ZjE2bGUnIHx8IGVuY29kaW5nID09PSAndXRmLTE2bGUnKSB7XG4gICAgICBpZiAoYXJyLmxlbmd0aCA8IDIgfHwgdmFsLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICB9XG4gICAgICBpbmRleFNpemUgPSAyXG4gICAgICBhcnJMZW5ndGggLz0gMlxuICAgICAgdmFsTGVuZ3RoIC89IDJcbiAgICAgIGJ5dGVPZmZzZXQgLz0gMlxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWQgKGJ1ZiwgaSkge1xuICAgIGlmIChpbmRleFNpemUgPT09IDEpIHtcbiAgICAgIHJldHVybiBidWZbaV1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGJ1Zi5yZWFkVUludDE2QkUoaSAqIGluZGV4U2l6ZSlcbiAgICB9XG4gIH1cblxuICB2YXIgaVxuICBpZiAoZGlyKSB7XG4gICAgdmFyIGZvdW5kSW5kZXggPSAtMVxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPCBhcnJMZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHJlYWQoYXJyLCBpKSA9PT0gcmVhZCh2YWwsIGZvdW5kSW5kZXggPT09IC0xID8gMCA6IGkgLSBmb3VuZEluZGV4KSkge1xuICAgICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIGZvdW5kSW5kZXggPSBpXG4gICAgICAgIGlmIChpIC0gZm91bmRJbmRleCArIDEgPT09IHZhbExlbmd0aCkgcmV0dXJuIGZvdW5kSW5kZXggKiBpbmRleFNpemVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ICE9PSAtMSkgaSAtPSBpIC0gZm91bmRJbmRleFxuICAgICAgICBmb3VuZEluZGV4ID0gLTFcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGJ5dGVPZmZzZXQgKyB2YWxMZW5ndGggPiBhcnJMZW5ndGgpIGJ5dGVPZmZzZXQgPSBhcnJMZW5ndGggLSB2YWxMZW5ndGhcbiAgICBmb3IgKGkgPSBieXRlT2Zmc2V0OyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIGZvdW5kID0gdHJ1ZVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWxMZW5ndGg7IGorKykge1xuICAgICAgICBpZiAocmVhZChhcnIsIGkgKyBqKSAhPT0gcmVhZCh2YWwsIGopKSB7XG4gICAgICAgICAgZm91bmQgPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmNsdWRlcyA9IGZ1bmN0aW9uIGluY2x1ZGVzICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiB0aGlzLmluZGV4T2YodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykgIT09IC0xXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIGluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGJpZGlyZWN0aW9uYWxJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIHRydWUpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUubGFzdEluZGV4T2YgPSBmdW5jdGlvbiBsYXN0SW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIGhleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgdmFyIHBhcnNlZCA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBpZiAobnVtYmVySXNOYU4ocGFyc2VkKSkgcmV0dXJuIGlcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBwYXJzZWRcbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiB1dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBhc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGxhdGluMVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGFzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBiYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gdWNzMldyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nKVxuICBpZiAob2Zmc2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygb2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIG9mZnNldFssIGxlbmd0aF1bLCBlbmNvZGluZ10pXG4gIH0gZWxzZSBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICAgIGlmIChpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBsZW5ndGggPSBsZW5ndGggPj4+IDBcbiAgICAgIGlmIChlbmNvZGluZyA9PT0gdW5kZWZpbmVkKSBlbmNvZGluZyA9ICd1dGY4J1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdCdWZmZXIud3JpdGUoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0WywgbGVuZ3RoXSkgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCdcbiAgICApXG4gIH1cblxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IGxlbmd0aCA+IHJlbWFpbmluZykgbGVuZ3RoID0gcmVtYWluaW5nXG5cbiAgaWYgKChzdHJpbmcubGVuZ3RoID4gMCAmJiAobGVuZ3RoIDwgMCB8fCBvZmZzZXQgPCAwKSkgfHwgb2Zmc2V0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byB3cml0ZSBvdXRzaWRlIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsYXRpbjFXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICAvLyBXYXJuaW5nOiBtYXhMZW5ndGggbm90IHRha2VuIGludG8gYWNjb3VudCBpbiBiYXNlNjRXcml0ZVxuICAgICAgICByZXR1cm4gYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHVjczJXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiB1dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG4gIHZhciByZXMgPSBbXVxuXG4gIHZhciBpID0gc3RhcnRcbiAgd2hpbGUgKGkgPCBlbmQpIHtcbiAgICB2YXIgZmlyc3RCeXRlID0gYnVmW2ldXG4gICAgdmFyIGNvZGVQb2ludCA9IG51bGxcbiAgICB2YXIgYnl0ZXNQZXJTZXF1ZW5jZSA9IChmaXJzdEJ5dGUgPiAweEVGKSA/IDRcbiAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4REYpID8gM1xuICAgICAgICA6IChmaXJzdEJ5dGUgPiAweEJGKSA/IDJcbiAgICAgICAgICA6IDFcblxuICAgIGlmIChpICsgYnl0ZXNQZXJTZXF1ZW5jZSA8PSBlbmQpIHtcbiAgICAgIHZhciBzZWNvbmRCeXRlLCB0aGlyZEJ5dGUsIGZvdXJ0aEJ5dGUsIHRlbXBDb2RlUG9pbnRcblxuICAgICAgc3dpdGNoIChieXRlc1BlclNlcXVlbmNlKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBpZiAoZmlyc3RCeXRlIDwgMHg4MCkge1xuICAgICAgICAgICAgY29kZVBvaW50ID0gZmlyc3RCeXRlXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4MUYpIDw8IDB4NiB8IChzZWNvbmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3Rikge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweEMgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4NiB8ICh0aGlyZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGRiAmJiAodGVtcENvZGVQb2ludCA8IDB4RDgwMCB8fCB0ZW1wQ29kZVBvaW50ID4gMHhERkZGKSkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBmb3VydGhCeXRlID0gYnVmW2kgKyAzXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAoZm91cnRoQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHgxMiB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHhDIHwgKHRoaXJkQnl0ZSAmIDB4M0YpIDw8IDB4NiB8IChmb3VydGhCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHhGRkZGICYmIHRlbXBDb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb2RlUG9pbnQgPT09IG51bGwpIHtcbiAgICAgIC8vIHdlIGRpZCBub3QgZ2VuZXJhdGUgYSB2YWxpZCBjb2RlUG9pbnQgc28gaW5zZXJ0IGFcbiAgICAgIC8vIHJlcGxhY2VtZW50IGNoYXIgKFUrRkZGRCkgYW5kIGFkdmFuY2Ugb25seSAxIGJ5dGVcbiAgICAgIGNvZGVQb2ludCA9IDB4RkZGRFxuICAgICAgYnl0ZXNQZXJTZXF1ZW5jZSA9IDFcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA+IDB4RkZGRikge1xuICAgICAgLy8gZW5jb2RlIHRvIHV0ZjE2IChzdXJyb2dhdGUgcGFpciBkYW5jZSlcbiAgICAgIGNvZGVQb2ludCAtPSAweDEwMDAwXG4gICAgICByZXMucHVzaChjb2RlUG9pbnQgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApXG4gICAgICBjb2RlUG9pbnQgPSAweERDMDAgfCBjb2RlUG9pbnQgJiAweDNGRlxuICAgIH1cblxuICAgIHJlcy5wdXNoKGNvZGVQb2ludClcbiAgICBpICs9IGJ5dGVzUGVyU2VxdWVuY2VcbiAgfVxuXG4gIHJldHVybiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkocmVzKVxufVxuXG4vLyBCYXNlZCBvbiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMjc0NzI3Mi82ODA3NDIsIHRoZSBicm93c2VyIHdpdGhcbi8vIHRoZSBsb3dlc3QgbGltaXQgaXMgQ2hyb21lLCB3aXRoIDB4MTAwMDAgYXJncy5cbi8vIFdlIGdvIDEgbWFnbml0dWRlIGxlc3MsIGZvciBzYWZldHlcbnZhciBNQVhfQVJHVU1FTlRTX0xFTkdUSCA9IDB4MTAwMFxuXG5mdW5jdGlvbiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkgKGNvZGVQb2ludHMpIHtcbiAgdmFyIGxlbiA9IGNvZGVQb2ludHMubGVuZ3RoXG4gIGlmIChsZW4gPD0gTUFYX0FSR1VNRU5UU19MRU5HVEgpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShTdHJpbmcsIGNvZGVQb2ludHMpIC8vIGF2b2lkIGV4dHJhIHNsaWNlKClcbiAgfVxuXG4gIC8vIERlY29kZSBpbiBjaHVua3MgdG8gYXZvaWQgXCJjYWxsIHN0YWNrIHNpemUgZXhjZWVkZWRcIi5cbiAgdmFyIHJlcyA9ICcnXG4gIHZhciBpID0gMFxuICB3aGlsZSAoaSA8IGxlbikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFxuICAgICAgU3RyaW5nLFxuICAgICAgY29kZVBvaW50cy5zbGljZShpLCBpICs9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKVxuICAgIClcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldICYgMHg3RilcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGxhdGluMVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGhleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyAoYnl0ZXNbaSArIDFdICogMjU2KSlcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiBzbGljZSAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuXG4gICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIH0gZWxzZSBpZiAoc3RhcnQgPiBsZW4pIHtcbiAgICBzdGFydCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IDApIHtcbiAgICBlbmQgKz0gbGVuXG4gICAgaWYgKGVuZCA8IDApIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICB2YXIgbmV3QnVmID0gdGhpcy5zdWJhcnJheShzdGFydCwgZW5kKVxuICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZVxuICBuZXdCdWYuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICByZXR1cm4gbmV3QnVmXG59XG5cbi8qXG4gKiBOZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGJ1ZmZlciBpc24ndCB0cnlpbmcgdG8gd3JpdGUgb3V0IG9mIGJvdW5kcy5cbiAqL1xuZnVuY3Rpb24gY2hlY2tPZmZzZXQgKG9mZnNldCwgZXh0LCBsZW5ndGgpIHtcbiAgaWYgKChvZmZzZXQgJSAxKSAhPT0gMCB8fCBvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb2Zmc2V0IGlzIG5vdCB1aW50JylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RyeWluZyB0byBhY2Nlc3MgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50TEUgPSBmdW5jdGlvbiByZWFkVUludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF1cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludEJFID0gZnVuY3Rpb24gcmVhZFVJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG4gIH1cblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdXG4gIHZhciBtdWwgPSAxXG4gIHdoaWxlIChieXRlTGVuZ3RoID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiByZWFkVUludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiByZWFkVUludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgOCkgfCB0aGlzW29mZnNldCArIDFdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAoKHRoaXNbb2Zmc2V0XSkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpKSArXG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSAqIDB4MTAwMDAwMClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiByZWFkVUludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAoKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50TEUgPSBmdW5jdGlvbiByZWFkSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XVxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludEJFID0gZnVuY3Rpb24gcmVhZEludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aFxuICB2YXIgbXVsID0gMVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWldXG4gIHdoaWxlIChpID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0taV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gcmVhZEludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIGlmICghKHRoaXNbb2Zmc2V0XSAmIDB4ODApKSByZXR1cm4gKHRoaXNbb2Zmc2V0XSlcbiAgcmV0dXJuICgoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTEpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiByZWFkSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAxXSB8ICh0aGlzW29mZnNldF0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gcmVhZEludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0pIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSA8PCAyNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDI0KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiByZWFkRmxvYXRMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gcmVhZEZsb2F0QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gcmVhZERvdWJsZUxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gcmVhZERvdWJsZUJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDUyLCA4KVxufVxuXG5mdW5jdGlvbiBjaGVja0ludCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiYnVmZmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlciBpbnN0YW5jZScpXG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1widmFsdWVcIiBhcmd1bWVudCBpcyBvdXQgb2YgYm91bmRzJylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludExFID0gZnVuY3Rpb24gd3JpdGVVSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIG1heEJ5dGVzID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpIC0gMVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG1heEJ5dGVzLCAwKVxuICB9XG5cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlVUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uIHdyaXRlVUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweGZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50TEUgPSBmdW5jdGlvbiB3cml0ZUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBsaW1pdCA9IE1hdGgucG93KDIsICg4ICogYnl0ZUxlbmd0aCkgLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICB2YXIgaSA9IDBcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHN1YiA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgaWYgKHZhbHVlIDwgMCAmJiBzdWIgPT09IDAgJiYgdGhpc1tvZmZzZXQgKyBpIC0gMV0gIT09IDApIHtcbiAgICAgIHN1YiA9IDFcbiAgICB9XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludEJFID0gZnVuY3Rpb24gd3JpdGVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCAoOCAqIGJ5dGVMZW5ndGgpIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoIC0gMVxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gMFxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSArIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHg3ZiwgLTB4ODApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuZnVuY3Rpb24gY2hlY2tJRUVFNzU0IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxuICBpZiAob2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDQsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gd3JpdGVGbG9hdEJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA4LCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxuICByZXR1cm4gb2Zmc2V0ICsgOFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uIGNvcHkgKHRhcmdldCwgdGFyZ2V0U3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGFyZ2V0KSkgdGhyb3cgbmV3IFR5cGVFcnJvcignYXJndW1lbnQgc2hvdWxkIGJlIGEgQnVmZmVyJylcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldFN0YXJ0ID49IHRhcmdldC5sZW5ndGgpIHRhcmdldFN0YXJ0ID0gdGFyZ2V0Lmxlbmd0aFxuICBpZiAoIXRhcmdldFN0YXJ0KSB0YXJnZXRTdGFydCA9IDBcbiAgaWYgKGVuZCA+IDAgJiYgZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm4gMFxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCB0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGlmICh0YXJnZXRTdGFydCA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcigndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIH1cbiAgaWYgKHN0YXJ0IDwgMCB8fCBzdGFydCA+PSB0aGlzLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG4gIGlmIChlbmQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCA8IGVuZCAtIHN0YXJ0KSB7XG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0ICsgc3RhcnRcbiAgfVxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQgJiYgdHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLmNvcHlXaXRoaW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBVc2UgYnVpbHQtaW4gd2hlbiBhdmFpbGFibGUsIG1pc3NpbmcgZnJvbSBJRTExXG4gICAgdGhpcy5jb3B5V2l0aGluKHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKVxuICB9IGVsc2UgaWYgKHRoaXMgPT09IHRhcmdldCAmJiBzdGFydCA8IHRhcmdldFN0YXJ0ICYmIHRhcmdldFN0YXJ0IDwgZW5kKSB7XG4gICAgLy8gZGVzY2VuZGluZyBjb3B5IGZyb20gZW5kXG4gICAgZm9yICh2YXIgaSA9IGxlbiAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICB0YXJnZXRbaSArIHRhcmdldFN0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBVaW50OEFycmF5LnByb3RvdHlwZS5zZXQuY2FsbChcbiAgICAgIHRhcmdldCxcbiAgICAgIHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCksXG4gICAgICB0YXJnZXRTdGFydFxuICAgIClcbiAgfVxuXG4gIHJldHVybiBsZW5cbn1cblxuLy8gVXNhZ2U6XG4vLyAgICBidWZmZXIuZmlsbChudW1iZXJbLCBvZmZzZXRbLCBlbmRdXSlcbi8vICAgIGJ1ZmZlci5maWxsKGJ1ZmZlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoc3RyaW5nWywgb2Zmc2V0WywgZW5kXV1bLCBlbmNvZGluZ10pXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiBmaWxsICh2YWwsIHN0YXJ0LCBlbmQsIGVuY29kaW5nKSB7XG4gIC8vIEhhbmRsZSBzdHJpbmcgY2FzZXM6XG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIGlmICh0eXBlb2Ygc3RhcnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IHN0YXJ0XG4gICAgICBzdGFydCA9IDBcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZW5kID09PSAnc3RyaW5nJykge1xuICAgICAgZW5jb2RpbmcgPSBlbmRcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfVxuICAgIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2VuY29kaW5nIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJyAmJiAhQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgfVxuICAgIGlmICh2YWwubGVuZ3RoID09PSAxKSB7XG4gICAgICB2YXIgY29kZSA9IHZhbC5jaGFyQ29kZUF0KDApXG4gICAgICBpZiAoKGVuY29kaW5nID09PSAndXRmOCcgJiYgY29kZSA8IDEyOCkgfHxcbiAgICAgICAgICBlbmNvZGluZyA9PT0gJ2xhdGluMScpIHtcbiAgICAgICAgLy8gRmFzdCBwYXRoOiBJZiBgdmFsYCBmaXRzIGludG8gYSBzaW5nbGUgYnl0ZSwgdXNlIHRoYXQgbnVtZXJpYyB2YWx1ZS5cbiAgICAgICAgdmFsID0gY29kZVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHZhbCA9IHZhbCAmIDI1NVxuICB9XG5cbiAgLy8gSW52YWxpZCByYW5nZXMgYXJlIG5vdCBzZXQgdG8gYSBkZWZhdWx0LCBzbyBjYW4gcmFuZ2UgY2hlY2sgZWFybHkuXG4gIGlmIChzdGFydCA8IDAgfHwgdGhpcy5sZW5ndGggPCBzdGFydCB8fCB0aGlzLmxlbmd0aCA8IGVuZCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdPdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzdGFydCA9IHN0YXJ0ID4+PiAwXG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gdGhpcy5sZW5ndGggOiBlbmQgPj4+IDBcblxuICBpZiAoIXZhbCkgdmFsID0gMFxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICAgIHRoaXNbaV0gPSB2YWxcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIGJ5dGVzID0gQnVmZmVyLmlzQnVmZmVyKHZhbClcbiAgICAgID8gdmFsXG4gICAgICA6IEJ1ZmZlci5mcm9tKHZhbCwgZW5jb2RpbmcpXG4gICAgdmFyIGxlbiA9IGJ5dGVzLmxlbmd0aFxuICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSB2YWx1ZSBcIicgKyB2YWwgK1xuICAgICAgICAnXCIgaXMgaW52YWxpZCBmb3IgYXJndW1lbnQgXCJ2YWx1ZVwiJylcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IGVuZCAtIHN0YXJ0OyArK2kpIHtcbiAgICAgIHRoaXNbaSArIHN0YXJ0XSA9IGJ5dGVzW2kgJSBsZW5dXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG52YXIgSU5WQUxJRF9CQVNFNjRfUkUgPSAvW14rLzAtOUEtWmEtei1fXS9nXG5cbmZ1bmN0aW9uIGJhc2U2NGNsZWFuIChzdHIpIHtcbiAgLy8gTm9kZSB0YWtlcyBlcXVhbCBzaWducyBhcyBlbmQgb2YgdGhlIEJhc2U2NCBlbmNvZGluZ1xuICBzdHIgPSBzdHIuc3BsaXQoJz0nKVswXVxuICAvLyBOb2RlIHN0cmlwcyBvdXQgaW52YWxpZCBjaGFyYWN0ZXJzIGxpa2UgXFxuIGFuZCBcXHQgZnJvbSB0aGUgc3RyaW5nLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgc3RyID0gc3RyLnRyaW0oKS5yZXBsYWNlKElOVkFMSURfQkFTRTY0X1JFLCAnJylcbiAgLy8gTm9kZSBjb252ZXJ0cyBzdHJpbmdzIHdpdGggbGVuZ3RoIDwgMiB0byAnJ1xuICBpZiAoc3RyLmxlbmd0aCA8IDIpIHJldHVybiAnJ1xuICAvLyBOb2RlIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBiYXNlNjQgc3RyaW5ncyAobWlzc2luZyB0cmFpbGluZyA9PT0pLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgd2hpbGUgKHN0ci5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgc3RyID0gc3RyICsgJz0nXG4gIH1cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHJpbmcsIHVuaXRzKSB7XG4gIHVuaXRzID0gdW5pdHMgfHwgSW5maW5pdHlcbiAgdmFyIGNvZGVQb2ludFxuICB2YXIgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aFxuICB2YXIgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcbiAgdmFyIGJ5dGVzID0gW11cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgY29kZVBvaW50ID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcblxuICAgIC8vIGlzIHN1cnJvZ2F0ZSBjb21wb25lbnRcbiAgICBpZiAoY29kZVBvaW50ID4gMHhEN0ZGICYmIGNvZGVQb2ludCA8IDB4RTAwMCkge1xuICAgICAgLy8gbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICghbGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgICAvLyBubyBsZWFkIHlldFxuICAgICAgICBpZiAoY29kZVBvaW50ID4gMHhEQkZGKSB7XG4gICAgICAgICAgLy8gdW5leHBlY3RlZCB0cmFpbFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSBpZiAoaSArIDEgPT09IGxlbmd0aCkge1xuICAgICAgICAgIC8vIHVucGFpcmVkIGxlYWRcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdmFsaWQgbGVhZFxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gMiBsZWFkcyBpbiBhIHJvd1xuICAgICAgaWYgKGNvZGVQb2ludCA8IDB4REMwMCkge1xuICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyB2YWxpZCBzdXJyb2dhdGUgcGFpclxuICAgICAgY29kZVBvaW50ID0gKGxlYWRTdXJyb2dhdGUgLSAweEQ4MDAgPDwgMTAgfCBjb2RlUG9pbnQgLSAweERDMDApICsgMHgxMDAwMFxuICAgIH0gZWxzZSBpZiAobGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgLy8gdmFsaWQgYm1wIGNoYXIsIGJ1dCBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgfVxuXG4gICAgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcblxuICAgIC8vIGVuY29kZSB1dGY4XG4gICAgaWYgKGNvZGVQb2ludCA8IDB4ODApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMSkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChjb2RlUG9pbnQpXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDgwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2IHwgMHhDMCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyB8IDB4RTAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDQpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDEyIHwgMHhGMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb2RlIHBvaW50JylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnl0ZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0ciwgdW5pdHMpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcblxuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KGJhc2U2NGNsZWFuKHN0cikpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKSBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbi8vIEFycmF5QnVmZmVyIG9yIFVpbnQ4QXJyYXkgb2JqZWN0cyBmcm9tIG90aGVyIGNvbnRleHRzIChpLmUuIGlmcmFtZXMpIGRvIG5vdCBwYXNzXG4vLyB0aGUgYGluc3RhbmNlb2ZgIGNoZWNrIGJ1dCB0aGV5IHNob3VsZCBiZSB0cmVhdGVkIGFzIG9mIHRoYXQgdHlwZS5cbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvaXNzdWVzLzE2NlxuZnVuY3Rpb24gaXNJbnN0YW5jZSAob2JqLCB0eXBlKSB7XG4gIHJldHVybiBvYmogaW5zdGFuY2VvZiB0eXBlIHx8XG4gICAgKG9iaiAhPSBudWxsICYmIG9iai5jb25zdHJ1Y3RvciAhPSBudWxsICYmIG9iai5jb25zdHJ1Y3Rvci5uYW1lICE9IG51bGwgJiZcbiAgICAgIG9iai5jb25zdHJ1Y3Rvci5uYW1lID09PSB0eXBlLm5hbWUpXG59XG5mdW5jdGlvbiBudW1iZXJJc05hTiAob2JqKSB7XG4gIC8vIEZvciBJRTExIHN1cHBvcnRcbiAgcmV0dXJuIG9iaiAhPT0gb2JqIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2VsZi1jb21wYXJlXG59XG4iLCJ2YXIgX19hd2FpdGVyID1cbiAgICAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHxcbiAgICBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQXG4gICAgICAgICAgICAgICAgPyB2YWx1ZVxuICAgICAgICAgICAgICAgIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgc3RlcChnZW5lcmF0b3JbJ3Rocm93J10odmFsdWUpKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5kb25lXG4gICAgICAgICAgICAgICAgICAgID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RlcChcbiAgICAgICAgICAgICAgICAoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH07XG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyJztcbi8qKlxuICogT2F1dGggU3RvcmFnZSBLZXlzXG4gKiBAZW51bVxuICovXG52YXIgT2F1dGhTdG9yYWdlS2V5cztcbihmdW5jdGlvbiAoT2F1dGhTdG9yYWdlS2V5cykge1xuICAgIC8qKiBAdHlwZSB7U3RyaW5nfSAqL1xuICAgIE9hdXRoU3RvcmFnZUtleXNbJ0FjY2Vzc1Rva2VuS2V5J10gPSAnYWNjZXNzX3Rva2VuJztcbiAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICBPYXV0aFN0b3JhZ2VLZXlzWydSZWZyZXNoVG9rZW5LZXknXSA9ICdyZWZyZXNoX3Rva2VuJztcbiAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICBPYXV0aFN0b3JhZ2VLZXlzWydBY2Nlc3NTY29wZUtleSddID0gJ3Njb3BlJztcbiAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICBPYXV0aFN0b3JhZ2VLZXlzWydUb2tlblR5cGVLZXknXSA9ICd0b2tlbl90eXBlJztcbiAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICBPYXV0aFN0b3JhZ2VLZXlzWydFeHBpcmVzSW5LZXknXSA9ICdleHBpcmVzX2luJztcbiAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICBPYXV0aFN0b3JhZ2VLZXlzWydDdXJyZW50U3RhdGVLZXknXSA9ICdjdXJyZW50X3N0YXRlJztcbn0pKE9hdXRoU3RvcmFnZUtleXMgfHwgKE9hdXRoU3RvcmFnZUtleXMgPSB7fSkpO1xuLyoqXG4gKiBPQXV0aCBEZWZhdWx0IFN0b3JhZ2VcbiAqIC0gbG9jYWxzdG9yYWdlIGZvciBwZXJzaXN0YW50IHN0b3JhZ2VcbiAqIC0gc2Vzc2lvbnN0b3JhZ2UgZm9yIHRlbXBvcmFyeSBzdG9yYWdlXG4gKiBAY2xhc3NcbiAqL1xuY2xhc3MgT2F1dGhTdG9yYWdlIHtcbiAgICBnZXQoa2V5KSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBsb2NhbFN0b3JhZ2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgbGV0IGRhdGEgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuICAgICAgICAgICAgICAgIGlmIChPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNlc3Npb25TdG9yYWdlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGxldCBkYXRhID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuICAgICAgICAgICAgICAgIGlmIChPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShudWxsKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHNldChrZXksIHZhbHVlLCB0ZW1wb3JhcnkgPSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRlbXBvcmFyeSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc2Vzc2lvblN0b3JhZ2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbG9jYWxTdG9yYWdlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlbW92ZShrZXkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGxvY2FsU3RvcmFnZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZXNzaW9uU3RvcmFnZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjbGVhckFsbCh0ZW1wb3JhcnkgPSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbG9jYWxTdG9yYWdlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5jbGVhcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRlbXBvcmFyeSAmJiB0eXBlb2Ygc2Vzc2lvblN0b3JhZ2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2UuY2xlYXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuLyoqQ29tbW9uIFV0aWxzIEZ1bmN0aW9uc1xuICogQGNsYXNzXG4gKiAqL1xuY2xhc3MgT2F1dGhVdGlscyB7XG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdG9rZW4gaXMgYSBKV1QgdG9rZW4gYW5kIHJldHVybiBjbGFpbXMgaWYgc29cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0b2tlblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlICAtIFwiaGVhZGVyXCIgfCBcImNsYWltc1wiIHwgXCJzaWduYXR1cmVcIi4gRGVmYXVsdCBcImNsYWltc1wiXG4gICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2VKV1QodG9rZW4sIHR5cGUgPSAnY2xhaW1zJykge1xuICAgICAgICBpZiAoIXRva2VuIHx8IHRva2VuID09ICcnKSByZXR1cm4gbnVsbDtcbiAgICAgICAgbGV0IHNwbGl0ID0gdG9rZW4uc3BsaXQoJy4nKTtcbiAgICAgICAgbGV0IGluZGV4ID0gdHlwZSA9PSAnc2lnbmF0dXJlJyA/IDIgOiB0eXBlID09ICdjbGFpbXMnID8gMSA6IDA7XG4gICAgICAgIHJldHVybiBzcGxpdCAmJiBzcGxpdC5sZW5ndGggPT0gM1xuICAgICAgICAgICAgPyBCdWZmZXIuZnJvbShzcGxpdFtpbmRleF0sICdiYXNlNjQnKS50b1N0cmluZygnYXNjaWknKVxuICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBKV1QgVG9rZW4gaGFzIGV4cGlyZWRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdG9rZW5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgICAqICovXG4gICAgc3RhdGljIGhhc0pXVEV4cGlyZWQodG9rZW4pIHtcbiAgICAgICAgbGV0IGRhdGEgPSB0aGlzLnBhcnNlSnNvbih0aGlzLnBhcnNlSldUKHRva2VuKSk7XG4gICAgICAgIGxldCBleHAgPSBkYXRhID8gZGF0YVsnZXhwJ10gOiBudWxsO1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNFeHBpcmVkKCtleHApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBnaXZlbiB0aW1lc3RhbXAgaGFzIGV4cGlyZWRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZXhwXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGJ1ZmZlciBCdWZmZXIgdGltZSBpbiBzZWNvbmRzIHRvIGFjY291bnQgZm9yIGFueSB1bmV4cGVjdGVkIGRlbGF5cyBlLmcgbmV0d29yayBsYXRlbmN5XG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICAgKiAqL1xuICAgIHN0YXRpYyBoYXNFeHBpcmVkKGV4cCwgYnVmZmVyID0gNSkge1xuICAgICAgICByZXR1cm4gZXhwID8gZXhwIDwgTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCkgKyBidWZmZXIgOiB0cnVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgYSBzYWZlIGZvcm0gb2Ygc3RyaW5nIHRvIHN0b3JlLFxuICAgICAqIGVsaW1pbmF0aW5nIG51bGwgYW5kICd1bmRlZmluZWQnXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGl0ZW1cbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICogKi9cbiAgICBzdGF0aWMgc2FmZVN0cmluZyhpdGVtKSB7XG4gICAgICAgIGlmIChPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShpdGVtKSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgYSBzYWZlIGZvcm0gb2Ygc3RJbnRyaW5nIHRvIHN0b3JlLFxuICAgICAqIGVsaW1pbmF0aW5nIG51bGwgYW5kICd1bmRlZmluZWQnXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGl0ZW1cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICogKi9cbiAgICBzdGF0aWMgc2FmZUludChpdGVtKSB7XG4gICAgICAgIGlmIChPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShpdGVtKSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGl0ZW0gaXMgbnV0IG51bGwsIHVuZGVmaW5lZCBvciBlbXB0eVxuICAgICAqIGVsaW1pbmF0aW5nIG51bGwgYW5kICd1bmRlZmluZWQnXG4gICAgICogQHBhcmFtIHthbnl9IGl0ZW1cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgICAqICovXG4gICAgc3RhdGljIGFzc2VydEF2YWlsYWJsZShpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtICE9IG51bGwgJiYgdHlwZW9mIGl0ZW0gIT09ICd1bmRlZmluZWQnICYmIGl0ZW0gIT09ICcnO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb3VudCBPYmplY3QgYXJyYXlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqICovXG4gICAgc3RhdGljIGNvdW50KG9iaikge1xuICAgICAgICBsZXQgZWxlbWVudF9jb3VudCA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgaSBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50X2NvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsZW1lbnRfY291bnQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1lcmdlIE9iamVjdCB3aXRoIGFub3RoZXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNyY1xuICAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgICovXG4gICAgc3RhdGljIG1lcmdlT2JqKG9iaiwgc3JjKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHNyYykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAoc3JjLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5wdXNoKHNyY1trZXldKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvYmpbdGhpcy5jb3VudChvYmopXSA9IHNyY1trZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIC8qKkVuY29kZSBPYmplY3QgY29udGVudCB0byB1cmwgc3RyaW5nXG4gICAgICogIEBwYXJhbSB7T2JqZWN0fSBteURhdGEgT2JqZWN0XG4gICAgICogIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKiAqL1xuICAgIHN0YXRpYyB1cmxFbmNvZGVPYmplY3QobXlEYXRhKSB7XG4gICAgICAgIGNvbnN0IGVuY29kZU9iaiA9IChkYXRhLCBrZXksIHBhcmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZW5jb2RlZCA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBzdWJLZXkgaW4gZGF0YVtrZXldKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGFba2V5XS5oYXNPd25Qcm9wZXJ0eShzdWJLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XVtzdWJLZXldICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgZGF0YVtrZXldW3N1YktleV0gIT09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBkYXRhW2tleV1bc3ViS2V5XSA9PT0gJ29iamVjdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5pc0FycmF5KGRhdGFba2V5XVtzdWJLZXldKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgb2JqZWN0IG9yIGFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UGFyZW50ID0gcGFyZW50ICsgJ1snICsgc3ViS2V5ICsgJ10nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVyZ2VPYmooXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kZU9iaihkYXRhW2tleV0sIHN1YktleSwgbmV3UGFyZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kZWQucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50ICsgJ1snICsgc3ViS2V5ICsgJ10nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJz0nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChkYXRhW2tleV1bc3ViS2V5XSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVuY29kZWQ7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGVuY29kZURhdGEgPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZW5jb2RlZCA9IFtdO1xuICAgICAgICAgICAgaWYgKGRhdGEgIT09IG51bGwgJiYgdHlwZW9mIGRhdGEgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGRhdGFba2V5XSAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGRhdGFba2V5XSA9PT0gJ29iamVjdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkuaXNBcnJheShkYXRhW2tleV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIG9iamVjdCBvciBhcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lcmdlT2JqKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2RlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kZU9iaihkYXRhLCBrZXksIGtleSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGVkLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQoZGF0YVtrZXldKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlbmNvZGVkO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBvdXQgPSBlbmNvZGVEYXRhKG15RGF0YSk7XG4gICAgICAgIGlmIChvdXQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG91dC5qb2luKCcmJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqIFBhcnNlIEpzb24gc3RyaW5nIHRvIG9iamVjdFxuICAgICAqICBAcGFyYW0ge1N0cmluZ30ganNvbiBzdHJpbmdcbiAgICAgKiAgQHJldHVybiB7YW55fVxuICAgICAqICAqL1xuICAgIHN0YXRpYyBwYXJzZUpzb24oanNvbikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoanNvbik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBVcmwgcGFyYW1cbiAgICAgKiAjc291cmNlIGh0dHA6Ly93d3cubmV0bG9iby5jb20vdXJsX3F1ZXJ5X3N0cmluZ19qYXZhc2NyaXB0Lmh0bWxcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9XG4gICAgICovXG4gICAgc3RhdGljIGdldFVybFBhcmFtKG5hbWUsIHVybCkge1xuICAgICAgICBpZiAoIXVybCAmJiB0eXBlb2YgbG9jYXRpb24gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB1cmwgPSBsb2NhdGlvbi5ocmVmO1xuICAgICAgICB9XG4gICAgICAgIHVybCA9IGRlY29kZVVSSUNvbXBvbmVudCh1cmwpO1xuICAgICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sICdcXFxcWycpLnJlcGxhY2UoL1tcXF1dLywgJ1xcXFxdJyk7XG4gICAgICAgIGNvbnN0IHJlZ2V4UyA9ICdbXFxcXD8mXScgKyBuYW1lICsgJz0oW14mI10qKSc7XG4gICAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChyZWdleFMpO1xuICAgICAgICBjb25zdCByZXN1bHRzID0gcmVnZXguZXhlYyh1cmwpO1xuICAgICAgICByZXR1cm4gcmVzdWx0cyA9PSBudWxsID8gbnVsbCA6IHJlc3VsdHNbMV07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybiB1cmwgd2l0aG91dCBpdCdzIHVybCBwYXJhbWV0ZXJzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBVcmwgdG8gc3RyaXBcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICogKi9cbiAgICBzdGF0aWMgc3RyaXBVcmxQYXJhbXModXJsKSB7XG4gICAgICAgIGlmIChPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZSh1cmwpKSB7XG4gICAgICAgICAgICByZXR1cm4gdXJsLnNwbGl0KCc/JylbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIFJhbmRvbSB2YWx1ZVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGhcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICogKi9cbiAgICBzdGF0aWMgZ2VuZXJhdGVLZXkobGVuZ3RoKSB7XG4gICAgICAgIGlmICghT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUobGVuZ3RoKSkge1xuICAgICAgICAgICAgbGVuZ3RoID0gMTY7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHRleHQgPSAnJztcbiAgICAgICAgY29uc3QgcG9zc2libGUgPVxuICAgICAgICAgICAgJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5JztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGV4dCArPSBwb3NzaWJsZS5jaGFyQXQoXG4gICAgICAgICAgICAgICAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcG9zc2libGUubGVuZ3RoKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG59XG5jbGFzcyBPYXV0aCB7XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGF0YS5jbGllbnRJZCAtIFlvdXIgQXBwbGljYXRpb24ncyBDbGllbnQgSURcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGF0YS5jbGllbnRTZWNyZXQgLSBZb3VyIEFwcGxpY2F0aW9uJ3MgQ2xpZW50IFNlY3JldFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhLmF1dGhvcml6ZVVybCAtIFtHRVRdIFVybCBlbmRwb2ludCB0byBhdXRob3JpemUgb3IgcmVxdWVzdCBhY2Nlc3NcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGF0YS50b2tlblVybCAtIFVybCBlbmRwb2ludCB0byBvYnRhaW4gdG9rZW5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGF0YS52ZXJpZnlUb2tlblVybCAtIFtHRVRdIFVybCBlbmRwb2ludCB0byB2ZXJpZnkgdG9rZW5cbiAgICAgKiBAcGFyYW0ge09hdXRoU3RvcmFnZUludGVyZmFjZTxzdHJpbmc+fSBkYXRhLnN0b3JhZ2UgLSBIYW5kbGUgY3VzdG9tIHN0b3JhZ2UgLSBEZWZhdWx0IHN0b3JhZ2UgPSBicm93c2VyIGxvY2FsU3RvcmFnZSBvciBzZXNzaW9uU3RvcmFnZVxuICAgICAqICovXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xuICAgICAgICBpZiAoT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoZGF0YS5jbGllbnRJZCkpIHtcbiAgICAgICAgICAgIHRoaXMuY2xpZW50SWQgPSBkYXRhLmNsaWVudElkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiJ2NsaWVudElkJyBSZXF1aXJlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoZGF0YS5jbGllbnRTZWNyZXQpKSB7XG4gICAgICAgICAgICB0aGlzLmNsaWVudFNlY3JldCA9IGRhdGEuY2xpZW50U2VjcmV0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiJ2NsaWVudFNlY3JldCcgUmVxdWlyZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKGRhdGEuYXV0aG9yaXplVXJsKSkge1xuICAgICAgICAgICAgdGhpcy5hdXRob3JpemVVcmwgPSBkYXRhLmF1dGhvcml6ZVVybDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIidhdXRob3JpemVVcmwnICBSZXF1aXJlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoZGF0YS50b2tlblVybCkpIHtcbiAgICAgICAgICAgIHRoaXMudG9rZW5VcmwgPSBkYXRhLnRva2VuVXJsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiJ3Rva2VuVXJsJyBSZXF1aXJlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoZGF0YS52ZXJpZnlUb2tlblVybCkpIHtcbiAgICAgICAgICAgIHRoaXMudmVyaWZ5VG9rZW5VcmwgPSBkYXRhLnZlcmlmeVRva2VuVXJsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShkYXRhLnN0b3JhZ2UpKSB7XG4gICAgICAgICAgICBPYXV0aC5fc3RvcmFnZSA9IGRhdGEuc3RvcmFnZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgZ2V0IHN0b3JhZ2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdG9yYWdlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTYXZlIEFjY2VzcyBkYXRhIHRvIExvY2FsIHN0b3JhZ2VcbiAgICAgKiBAcGFyYW0ge09hdXRoVG9rZW5SZXNwb25zZX0gYWNjZXNzRGF0YVxuICAgICAqICovXG4gICAgc2F2ZUFjY2VzcyhhY2Nlc3NEYXRhKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgICAgIE9hdXRoLnN0b3JhZ2Uuc2V0KFxuICAgICAgICAgICAgICAgICAgICBPYXV0aFN0b3JhZ2VLZXlzLkFjY2Vzc1Rva2VuS2V5LFxuICAgICAgICAgICAgICAgICAgICBPYXV0aFV0aWxzLnNhZmVTdHJpbmcoYWNjZXNzRGF0YS5hY2Nlc3NUb2tlbilcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIE9hdXRoLnN0b3JhZ2Uuc2V0KFxuICAgICAgICAgICAgICAgICAgICBPYXV0aFN0b3JhZ2VLZXlzLlJlZnJlc2hUb2tlbktleSxcbiAgICAgICAgICAgICAgICAgICAgT2F1dGhVdGlscy5zYWZlU3RyaW5nKGFjY2Vzc0RhdGEucmVmcmVzaFRva2VuKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgT2F1dGguc3RvcmFnZS5zZXQoXG4gICAgICAgICAgICAgICAgICAgIE9hdXRoU3RvcmFnZUtleXMuQWNjZXNzU2NvcGVLZXksXG4gICAgICAgICAgICAgICAgICAgIE9hdXRoVXRpbHMuc2FmZVN0cmluZyhhY2Nlc3NEYXRhLmFjY2Vzc1Njb3BlKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgT2F1dGguc3RvcmFnZS5zZXQoXG4gICAgICAgICAgICAgICAgICAgIE9hdXRoU3RvcmFnZUtleXMuVG9rZW5UeXBlS2V5LFxuICAgICAgICAgICAgICAgICAgICBPYXV0aFV0aWxzLnNhZmVTdHJpbmcoYWNjZXNzRGF0YS50b2tlblR5cGUpXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBPYXV0aC5zdG9yYWdlLnNldChcbiAgICAgICAgICAgICAgICAgICAgT2F1dGhTdG9yYWdlS2V5cy5FeHBpcmVzSW5LZXksXG4gICAgICAgICAgICAgICAgICAgIFN0cmluZyhcbiAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoVXRpbHMuc2FmZUludChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSArIGFjY2Vzc0RhdGEuZXhwaXJlc0luXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipDbGVhciBhbGwgYWNjZXNzIGRhdGEgZnJvbSBzZXNzaW9uKi9cbiAgICBjbGVhckFjY2VzcygpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICBPYXV0aC5zdG9yYWdlLnJlbW92ZShPYXV0aFN0b3JhZ2VLZXlzLkFjY2Vzc1Rva2VuS2V5KSxcbiAgICAgICAgICAgICAgICBPYXV0aC5zdG9yYWdlLnJlbW92ZShPYXV0aFN0b3JhZ2VLZXlzLlJlZnJlc2hUb2tlbktleSksXG4gICAgICAgICAgICAgICAgT2F1dGguc3RvcmFnZS5yZW1vdmUoT2F1dGhTdG9yYWdlS2V5cy5BY2Nlc3NTY29wZUtleSksXG4gICAgICAgICAgICAgICAgT2F1dGguc3RvcmFnZS5yZW1vdmUoT2F1dGhTdG9yYWdlS2V5cy5Ub2tlblR5cGVLZXkpLFxuICAgICAgICAgICAgICAgIE9hdXRoLnN0b3JhZ2UucmVtb3ZlKE9hdXRoU3RvcmFnZUtleXMuRXhwaXJlc0luS2V5KSxcbiAgICAgICAgICAgICAgICBPYXV0aC5zdG9yYWdlLnJlbW92ZShPYXV0aFN0b3JhZ2VLZXlzLkN1cnJlbnRTdGF0ZUtleSksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEF1dGhvcml6ZSBBY2Nlc3MgdG8gdGhlIGFwcC5cbiAgICAgKiBUaGlzIHdpbGwgY2hlY2sgZm9yIGFuZCB2YWxpZGF0ZSBleGlzdGluZyBhY2Nlc3MgdG9rZW4uXG4gICAgICogSWYgbm8gYWNjZXNzIHdhcyBwcmV2aW91c2x5IGdyYW50ZWQsIGl0IHdpbGwgdGhlbiBwcm9jZWVkIHRvIHJlcXVlc3Qgb25lIHdpdGggdGhlIGRldGFpbHMgZ2l2ZW4uXG4gICAgICogSWYgdG9rZW4gaGFzIGV4cGlyZWQgYW5kIGEgcmVmcmVzaCB0b2tlbiBleGlzdHMsIGl0IHdpbGwgdGhlbiBwcm9jZWVkIHRvIHJlZnJlc2ggdGhlIGV4cGlyZWQgdG9rZW5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXG4gICAgICogQHBhcmFtIHtPYXV0aEdyYW50VHlwZX0gcGFyYW1zLmdyYW50X3R5cGUgRGVmYXVsdCAtIGNsaWVudF9jcmVkZW50aWFscyBncmFudFR5cGVcbiAgICAgKiBAcGFyYW0ge09hdXRoR3JhbnRUeXBlW119IHBhcmFtcy5hbGxvd2VkX2dyYW50X3R5cGVzIGdyYW50X3R5cGUocykgdG8gaWdub3JlIGlmIHtPYXV0aEdyYW50VHlwZS5BdXRvfSBzZWxlY3RlZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwYXJhbXMucmVkaXJlY3RfdXJpIEZvciBhdXRob3JpemF0aW9uX2NvZGUgZ3JhbnRfdHlwZSBkZWZhdWx0IC0+IGN1cnJlbnQgdXJsXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmFtcy51c2VyX2lkIEZvciBhdXRob3JpemF0aW9uX2NvZGUgZ3JhbnRfdHlwZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwYXJhbXMudXNlcm5hbWUgRm9yIHBhc3N3b3JkIGdyYW50X3R5cGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGFyYW1zLnBhc3N3b3JkIEZvciBwYXNzd29yZCBncmFudF90eXBlXG4gICAgICogQHBhcmFtIHsodG9rZW46IHN0cmluZyB8IGJvb2xlYW4sIG1zZz86IHN0cmluZyk9PnZvaWR9IHBhcmFtcy5jYWxsYmFja1xuICAgICAqICovXG4gICAgYXV0aG9yaXplQWNjZXNzKHBhcmFtcykge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgbGV0IGdyYW50X3R5cGUgPSBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShwYXJhbXMuZ3JhbnRfdHlwZSlcbiAgICAgICAgICAgICAgICA/IHBhcmFtcy5ncmFudF90eXBlXG4gICAgICAgICAgICAgICAgOiBPYXV0aEdyYW50VHlwZS5DbGllbnRfQ3JlZGVudGlhbHM7XG4gICAgICAgICAgICBjb25zdCBhbGxvd2VkX2dyYW50X3R5cGVzID0gT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoXG4gICAgICAgICAgICAgICAgcGFyYW1zLmFsbG93ZWRfZ3JhbnRfdHlwZXNcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICA/IHBhcmFtcy5hbGxvd2VkX2dyYW50X3R5cGVzXG4gICAgICAgICAgICAgICAgOiBbXTtcbiAgICAgICAgICAgIGNvbnN0IHJlZGlyZWN0X3VyaSA9IE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHBhcmFtcy5yZWRpcmVjdF91cmkpXG4gICAgICAgICAgICAgICAgPyBwYXJhbXMucmVkaXJlY3RfdXJpXG4gICAgICAgICAgICAgICAgOiBPYXV0aFV0aWxzLnN0cmlwVXJsUGFyYW1zKFxuICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgID8gd2luZG93LmxvY2F0aW9uLm9yaWdpblxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IG51bGxcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBzY29wZSA9IE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHBhcmFtcy5zY29wZSlcbiAgICAgICAgICAgICAgICA/IHBhcmFtcy5zY29wZVxuICAgICAgICAgICAgICAgIDogW107XG4gICAgICAgICAgICBsZXQgc3RhdGUgPSBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShwYXJhbXMuc3RhdGUpXG4gICAgICAgICAgICAgICAgPyBwYXJhbXMuc3RhdGVcbiAgICAgICAgICAgICAgICA6IE9hdXRoVXRpbHMuZ2VuZXJhdGVLZXkoMzIpO1xuICAgICAgICAgICAgLyoqR2V0IE5ldyBUb2tlblxuICAgICAgICAgICAgICogKi9cbiAgICAgICAgICAgIGNvbnN0IGdldE5ld09hdXRoVG9rZW4gPSAoKSA9PlxuICAgICAgICAgICAgICAgIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChncmFudF90eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIE9hdXRoR3JhbnRUeXBlLkF1dG86XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShwYXJhbXMudXNlcl9pZCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFV0aWxzLmdldFVybFBhcmFtKCdjb2RlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBhdXRob3JpemF0aW9uIGNvZGUgZXhpc3RzIGluIHVybCBwYXJhbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmFudF90eXBlID0gT2F1dGhHcmFudFR5cGUuQXV0aG9yaXphdGlvbl9Db2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWxsb3dlZF9ncmFudF90eXBlcy5pbmNsdWRlcyhncmFudF90eXBlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0TmV3T2F1dGhUb2tlbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHBhcmFtcy51c2VybmFtZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUocGFyYW1zLnBhc3N3b3JkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmFudF90eXBlID0gT2F1dGhHcmFudFR5cGUuVXNlcl9DcmVkZW50aWFscztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFsbG93ZWRfZ3JhbnRfdHlwZXMuaW5jbHVkZXMoZ3JhbnRfdHlwZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldE5ld09hdXRoVG9rZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jYWxsYmFjayhmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmFudF90eXBlID0gT2F1dGhHcmFudFR5cGUuQ2xpZW50X0NyZWRlbnRpYWxzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWxsb3dlZF9ncmFudF90eXBlcy5pbmNsdWRlcyhncmFudF90eXBlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0TmV3T2F1dGhUb2tlbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgT2F1dGhHcmFudFR5cGUuQXV0aG9yaXphdGlvbl9Db2RlOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBPYXV0aFV0aWxzLmdldFVybFBhcmFtKCdjb2RlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBPYXV0aFV0aWxzLmdldFVybFBhcmFtKCdlcnJvcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yX2Rlc2NyaXB0aW9uID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2F1dGhVdGlscy5nZXRVcmxQYXJhbSgnZXJyb3JfZGVzY3JpcHRpb24nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoY29kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2F2ZV9zdGF0ZSA9IHlpZWxkIE9hdXRoLnN0b3JhZ2UuZ2V0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2F1dGhTdG9yYWdlS2V5cy5DdXJyZW50U3RhdGVLZXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgPSBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShzYXZlX3N0YXRlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBzYXZlX3N0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHN0YXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdGUgPT09IE9hdXRoVXRpbHMuZ2V0VXJsUGFyYW0oJ3N0YXRlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdldCB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vYXV0aFRva2VuV2l0aEF1dGhvcml6YXRpb25Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVkaXJlY3RfdXJpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIEFqYXggUmVzcG9uc2UgY2FsbGJhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge09hdXRoVG9rZW5SZXNwb25zZX0gdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0b2tlbikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX19hd2FpdGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW4uYWNjZXNzVG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgb2F1dGggc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoLnN0b3JhZ2UucmVtb3ZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoU3RvcmFnZUtleXMuQ3VycmVudFN0YXRlS2V5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2F2ZSB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgdGhpcy5zYXZlQWNjZXNzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBwYXJhbXMuY2FsbGJhY2sgPT09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNhbGxiYWNrKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBPYXV0aC5zdG9yYWdlLmdldChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoU3RvcmFnZUtleXMuQWNjZXNzVG9rZW5LZXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgYXV0aG9yaXphdGlvbiBjb2RlIGZyb20gdXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHdpbmRvdyAhPT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoVXRpbHMuc3RyaXBVcmxQYXJhbXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3dcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubG9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaHJlZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuLmVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBwYXJhbXMuY2FsbGJhY2sgPT09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNhbGxiYWNrKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW4uZXJyb3JEZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHBhcmFtcy5jYWxsYmFjayA9PT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY2FsbGJhY2soXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBwYXJhbXMuY2FsbGJhY2sgPT09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNhbGxiYWNrKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJhbXMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY2FsbGJhY2soXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnRmFpbGVkIGF1dGhvcml6ZSBhY2Nlc3MuIENTUkYgVmVyaWZpY2F0aW9uIEZhaWxlZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShlcnJvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIG9hdXRoIHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoLnN0b3JhZ2UucmVtb3ZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2F1dGhTdG9yYWdlS2V5cy5DdXJyZW50U3RhdGVLZXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JfZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhcmFtcy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jYWxsYmFjayhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yX2Rlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW1zLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNhbGxiYWNrKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhaWxlZCBhdXRob3JpemUgYWNjZXNzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgYXV0aG9yaXphdGlvbiBjb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2F1dGhBdXRob3JpemUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZGlyZWN0X3VyaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy51c2VyX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIE9hdXRoR3JhbnRUeXBlLlVzZXJfQ3JlZGVudGlhbHM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vYXV0aFRva2VuV2l0aFVzZXJDcmVkZW50aWFscyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLnVzZXJuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMucGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogQWpheCBSZXNwb25zZSBjYWxsYmFja1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge09hdXRoVG9rZW5SZXNwb25zZX0gdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHRva2VuKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX19hd2FpdGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW4uYWNjZXNzVG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTYXZlIHRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgdGhpcy5zYXZlQWNjZXNzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgcGFyYW1zLmNhbGxiYWNrID09PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jYWxsYmFjayhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIE9hdXRoLnN0b3JhZ2UuZ2V0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoU3RvcmFnZUtleXMuQWNjZXNzVG9rZW5LZXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbi5lcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHBhcmFtcy5jYWxsYmFjayA9PT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY2FsbGJhY2soXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuLmVycm9yRGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHBhcmFtcy5jYWxsYmFjayA9PT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY2FsbGJhY2soZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgcGFyYW1zLmNhbGxiYWNrID09PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jYWxsYmFjayhmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgT2F1dGhHcmFudFR5cGUuQ2xpZW50X0NyZWRlbnRpYWxzOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9hdXRoVG9rZW5XaXRoQ2xpZW50Q3JlZGVudGlhbHMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogQWpheCBSZXNwb25zZSBjYWxsYmFja1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge09hdXRoVG9rZW5SZXNwb25zZX0gdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHRva2VuKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX19hd2FpdGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW4uYWNjZXNzVG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTYXZlIHRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgdGhpcy5zYXZlQWNjZXNzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgcGFyYW1zLmNhbGxiYWNrID09PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jYWxsYmFjayhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIE9hdXRoLnN0b3JhZ2UuZ2V0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoU3RvcmFnZUtleXMuQWNjZXNzVG9rZW5LZXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbi5lcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHBhcmFtcy5jYWxsYmFjayA9PT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY2FsbGJhY2soXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuLmVycm9yRGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHBhcmFtcy5jYWxsYmFjayA9PT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY2FsbGJhY2soZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgcGFyYW1zLmNhbGxiYWNrID09PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jYWxsYmFjayhmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLyoqUmVmcmVzaCBFeGlzdGluZyBUb2tlblxuICAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHJlZnJlc2hUb2tlbiBTdHJpbmdcbiAgICAgICAgICAgICAqICovXG4gICAgICAgICAgICBjb25zdCByZWZyZXNoT2F1dGhUb2tlbiA9IChyZWZyZXNoVG9rZW4pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9hdXRoUmVmcmVzaFRva2VuKFxuICAgICAgICAgICAgICAgICAgICByZWZyZXNoVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBBamF4IFJlc3BvbnNlIGNhbGxiYWNrXG4gICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7T2F1dGhUb2tlblJlc3BvbnNlfSB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgKiAqL1xuICAgICAgICAgICAgICAgICAgICAodG9rZW4pID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHRva2VuKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbi5hY2Nlc3NUb2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNhdmUgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMuc2F2ZUFjY2Vzcyh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhcmFtcy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jYWxsYmFjayhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgT2F1dGguc3RvcmFnZS5nZXQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFN0b3JhZ2VLZXlzLkFjY2Vzc1Rva2VuS2V5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUodG9rZW4uZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJhbXMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY2FsbGJhY2soXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbi5lcnJvckRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDbGVhciB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJBY2Nlc3MoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXROZXdPYXV0aFRva2VuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhcmFtcy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENsZWFyIHRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhckFjY2VzcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jYWxsYmFjayhmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhcmFtcy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoXG4gICAgICAgICAgICAgICAgICAgIE9hdXRoVXRpbHMuZ2V0VXJsUGFyYW0oJ2FjY2Vzc190b2tlbicpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWNjZXNzVG9rZW4gPSBPYXV0aFV0aWxzLmdldFVybFBhcmFtKCdhY2Nlc3NfdG9rZW4nKTtcbiAgICAgICAgICAgICAgICBpZiAoISh5aWVsZCB0aGlzLmhhc0V4cGlyZWQoYWNjZXNzVG9rZW4pKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhcmFtcy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNhbGxiYWNrKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKGFjY2Vzc1Rva2VuKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGFjY2Vzc1Rva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW1zLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY2FsbGJhY2soZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhY2Nlc3NUb2tlbiA9IHlpZWxkIE9hdXRoLnN0b3JhZ2UuZ2V0KFxuICAgICAgICAgICAgICAgICAgICBPYXV0aFN0b3JhZ2VLZXlzLkFjY2Vzc1Rva2VuS2V5XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZWZyZXNoVG9rZW4gPSB5aWVsZCBPYXV0aC5zdG9yYWdlLmdldChcbiAgICAgICAgICAgICAgICAgICAgT2F1dGhTdG9yYWdlS2V5cy5SZWZyZXNoVG9rZW5LZXlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIC8qVG9rZW4gYXZhaWxhYmxlLCBjaGVjayBmb3IgcmVmcmVzaGluZyovXG4gICAgICAgICAgICAgICAgaWYgKE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKGFjY2Vzc1Rva2VuKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoISh5aWVsZCB0aGlzLmhhc0V4cGlyZWQoYWNjZXNzVG9rZW4pKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJhbXMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY2FsbGJhY2soYWNjZXNzVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRXhwaXJlZCAtIGdldCByZWZyZXNoIHRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUocmVmcmVzaFRva2VuKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRyeSBSZWZyZXNoIHRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmcmVzaE9hdXRoVG9rZW4ocmVmcmVzaFRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm8gcmVmcmVzaCB0b2tlbiBnZXQgbmV3IHRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0TmV3T2F1dGhUb2tlbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm8gdG9rZW4gLSBnZXQgbmV3IHRva2VuXG4gICAgICAgICAgICAgICAgICAgIGdldE5ld09hdXRoVG9rZW4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhdXRob3JpemF0aW9uIG9yIHRva2VuIGhhcyBleHBpcmVkXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRva2VuXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxib29sZWFuPn1cbiAgICAgKiAqL1xuICAgIGhhc0V4cGlyZWQodG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHRva2VuID1cbiAgICAgICAgICAgICAgICB0b2tlbiB8fFxuICAgICAgICAgICAgICAgICh5aWVsZCBPYXV0aC5zdG9yYWdlLmdldChPYXV0aFN0b3JhZ2VLZXlzLkFjY2Vzc1Rva2VuS2V5KSk7XG4gICAgICAgICAgICBpZiAoT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUodG9rZW4pKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFPYXV0aFV0aWxzLmhhc0pXVEV4cGlyZWQodG9rZW4pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZXhwaXJlc0luID0geWllbGQgT2F1dGguc3RvcmFnZS5nZXQoXG4gICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFN0b3JhZ2VLZXlzLkV4cGlyZXNJbktleVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoZXhwaXJlc0luKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE9hdXRoVXRpbHMuaGFzRXhwaXJlZCgrZXhwaXJlc0luKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT2F1dGggQXV0aG9yaXphdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHNjb3BlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJlZGlyZWN0X3VybFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1c2VyX2lkXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0YXRlXG4gICAgICogQHBhcmFtIHsodXJsOiBzdHJpbmcpPT5hbnl9IGNhbGxiYWNrXG4gICAgICogKi9cbiAgICBvYXV0aEF1dGhvcml6ZShzY29wZSwgcmVkaXJlY3RfdXJsLCB1c2VyX2lkLCBzdGF0ZSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKCFPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShyZWRpcmVjdF91cmwpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIncmVkaXJlY3RfdXJsJyBSZXF1aXJlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBPYXV0aC5zdG9yYWdlLnNldChPYXV0aFN0b3JhZ2VLZXlzLkN1cnJlbnRTdGF0ZUtleSwgc3RhdGUsIHRydWUpO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgICAgICBjbGllbnRfaWQ6IHRoaXMuY2xpZW50SWQsXG4gICAgICAgICAgICBzY29wZTogc2NvcGUuam9pbignICcpLFxuICAgICAgICAgICAgc3RhdGU6IHN0YXRlLFxuICAgICAgICAgICAgcmVzcG9uc2VfdHlwZTogJ2NvZGUnLFxuICAgICAgICAgICAgdXNlcl9pZDogdXNlcl9pZCxcbiAgICAgICAgICAgIHJlZGlyZWN0X3VyaTogcmVkaXJlY3RfdXJsLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB1cmwgPSBgJHt0aGlzLmF1dGhvcml6ZVVybH0/JHtPYXV0aFV0aWxzLnVybEVuY29kZU9iamVjdChcbiAgICAgICAgICAgIHBhcmFtc1xuICAgICAgICApfWA7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2sodXJsKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgLy8gT3BlbiBhdXRob3JpemF0aW9uIHVybFxuICAgICAgICAgICAgd2luZG93Lm9wZW4odXJsLCAnX2JsYW5rJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogT2F1dGggQXV0aG9yaXphdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHNjb3BlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJlZGlyZWN0X3VybFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBlbWFpbFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdGF0ZVxuICAgICAqIEBwYXJhbSB7KHVybDogc3RyaW5nKT0+YW55fSBjYWxsYmFja1xuICAgICAqICovXG4gICAgb2F1dGhBdXRob3JpemVXaXRoRW1haWwoc2NvcGUsIHJlZGlyZWN0X3VybCwgZW1haWwsIHN0YXRlLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoIU9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHJlZGlyZWN0X3VybCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIidyZWRpcmVjdF91cmwnIFJlcXVpcmVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIE9hdXRoLnN0b3JhZ2Uuc2V0KE9hdXRoU3RvcmFnZUtleXMuQ3VycmVudFN0YXRlS2V5LCBzdGF0ZSwgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgICAgICAgIGNsaWVudF9pZDogdGhpcy5jbGllbnRJZCxcbiAgICAgICAgICAgIHNjb3BlOiBzY29wZS5qb2luKCcgJyksXG4gICAgICAgICAgICBzdGF0ZTogc3RhdGUsXG4gICAgICAgICAgICByZXNwb25zZV90eXBlOiAnY29kZScsXG4gICAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgICByZWRpcmVjdF91cmk6IHJlZGlyZWN0X3VybCxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdXJsID0gYCR7dGhpcy5hdXRob3JpemVVcmx9PyR7T2F1dGhVdGlscy51cmxFbmNvZGVPYmplY3QoXG4gICAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKX1gO1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHVybCk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIC8vIE9wZW4gYXV0aG9yaXphdGlvbiB1cmxcbiAgICAgICAgICAgIHdpbmRvdy5vcGVuKHVybCwgJ19ibGFuaycpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9hdXRoIEF1dGhvcml6YXRpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBzY29wZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSByZWRpcmVjdF91cmxcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXNlcl9pZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdGF0ZVxuICAgICAqIEBwYXJhbSB7KHVybDogc3RyaW5nKT0+YW55fSBjYWxsYmFja1xuICAgICAqICovXG4gICAgb2F1dGhBdXRob3JpemVJbXBsaWNpdChzY29wZSwgcmVkaXJlY3RfdXJsLCB1c2VyX2lkLCBzdGF0ZSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKCFPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShyZWRpcmVjdF91cmwpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIncmVkaXJlY3RfdXJsJyBSZXF1aXJlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIU9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHNjb3BlKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiJ3Njb3BlJyBSZXF1aXJlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBPYXV0aC5zdG9yYWdlLnNldChPYXV0aFN0b3JhZ2VLZXlzLkN1cnJlbnRTdGF0ZUtleSwgc3RhdGUsIHRydWUpO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgICAgICBjbGllbnRfaWQ6IHRoaXMuY2xpZW50SWQsXG4gICAgICAgICAgICBzY29wZTogc2NvcGUuam9pbignICcpLFxuICAgICAgICAgICAgc3RhdGU6IHN0YXRlLFxuICAgICAgICAgICAgcmVzcG9uc2VfdHlwZTogJ3Rva2VuJyxcbiAgICAgICAgICAgIHVzZXJfaWQ6IHVzZXJfaWQsXG4gICAgICAgICAgICByZWRpcmVjdF91cmk6IHJlZGlyZWN0X3VybCxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdXJsID0gYCR7dGhpcy5hdXRob3JpemVVcmx9PyR7T2F1dGhVdGlscy51cmxFbmNvZGVPYmplY3QoXG4gICAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKX1gO1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHVybCk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIC8vIE9wZW4gYXV0aG9yaXphdGlvbiB1cmxcbiAgICAgICAgICAgIHdpbmRvdy5vcGVuKHVybCwgJ19ibGFuaycpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBvYXV0aCB0b2tlbiB3aXRoIENsaWVudCBjcmVkZW50aWFsc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHNjb3BlXG4gICAgICogQHBhcmFtIHsodmVyaWZ5OiBPYXV0aFRva2VuUmVzcG9uc2UpPT5hbnl9IGNhbGxiYWNrXG4gICAgICogKi9cbiAgICBvYXV0aFRva2VuV2l0aENsaWVudENyZWRlbnRpYWxzKHNjb3BlLCBjYWxsYmFjaykge1xuICAgICAgICBPYXV0aFJlcXVlc3QucG9zdCh7XG4gICAgICAgICAgICB1cmw6IHRoaXMudG9rZW5VcmwsXG4gICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICBncmFudF90eXBlOiBPYXV0aEdyYW50VHlwZS5DbGllbnRfQ3JlZGVudGlhbHMsXG4gICAgICAgICAgICAgICAgY2xpZW50X2lkOiB0aGlzLmNsaWVudElkLFxuICAgICAgICAgICAgICAgIGNsaWVudF9zZWNyZXQ6IHRoaXMuY2xpZW50U2VjcmV0LFxuICAgICAgICAgICAgICAgIHNjb3BlOiBzY29wZS5qb2luKCcgJyksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VjY2VzczogKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobmV3IE9hdXRoVG9rZW5SZXNwb25zZShyZXN1bHQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFpbDogKHJlc3VsdCwgcmVhc29uKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhuZXcgT2F1dGhUb2tlblJlc3BvbnNlKHJlc3VsdCksIHJlYXNvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBvYXV0aCB0b2tlbiB3aXRoIENsaWVudCBjcmVkZW50aWFsc1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1c2VybmFtZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwYXNzd29yZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHNjb3BlXG4gICAgICogQHBhcmFtIHsodmVyaWZ5OiBPYXV0aFRva2VuUmVzcG9uc2UpPT5hbnl9IGNhbGxiYWNrXG4gICAgICogKi9cbiAgICBvYXV0aFRva2VuV2l0aFVzZXJDcmVkZW50aWFscyh1c2VybmFtZSwgcGFzc3dvcmQsIHNjb3BlLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoIU9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHVzZXJuYW1lKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiJ3VzZXJuYW1lJyBSZXF1aXJlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIU9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHBhc3N3b3JkKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiJ3Bhc3N3b3JkJyBSZXF1aXJlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBPYXV0aFJlcXVlc3QucG9zdCh7XG4gICAgICAgICAgICB1cmw6IHRoaXMudG9rZW5VcmwsXG4gICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICBncmFudF90eXBlOiBPYXV0aEdyYW50VHlwZS5Vc2VyX0NyZWRlbnRpYWxzLFxuICAgICAgICAgICAgICAgIGNsaWVudF9pZDogdGhpcy5jbGllbnRJZCxcbiAgICAgICAgICAgICAgICBjbGllbnRfc2VjcmV0OiB0aGlzLmNsaWVudFNlY3JldCxcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogdXNlcm5hbWUsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkLFxuICAgICAgICAgICAgICAgIHNjb3BlOiBzY29wZS5qb2luKCcgJyksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VjY2VzczogKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobmV3IE9hdXRoVG9rZW5SZXNwb25zZShyZXN1bHQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFpbDogKHJlc3VsdCwgcmVhc29uKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhuZXcgT2F1dGhUb2tlblJlc3BvbnNlKHJlc3VsdCksIHJlYXNvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKkdldCBvYXV0aCB0b2tlbiB3aXRoIENsaWVudCBjcmVkZW50aWFsc1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb2RlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJlZGlyZWN0X3VyaVxuICAgICAqIEBwYXJhbSB7KHZlcmlmeTogT2F1dGhUb2tlblJlc3BvbnNlKT0+YW55fSBjYWxsYmFja1xuICAgICAqICovXG4gICAgb2F1dGhUb2tlbldpdGhBdXRob3JpemF0aW9uQ29kZShjb2RlLCByZWRpcmVjdF91cmksIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICghT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoY29kZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIidjb2RlJyBSZXF1aXJlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIU9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHJlZGlyZWN0X3VyaSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIidyZWRpcmVjdF91cmknIFJlcXVpcmVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIE9hdXRoUmVxdWVzdC5wb3N0KHtcbiAgICAgICAgICAgIHVybDogdGhpcy50b2tlblVybCxcbiAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgIGdyYW50X3R5cGU6IE9hdXRoR3JhbnRUeXBlLkF1dGhvcml6YXRpb25fQ29kZSxcbiAgICAgICAgICAgICAgICBjb2RlOiBjb2RlLFxuICAgICAgICAgICAgICAgIHJlZGlyZWN0X3VyaTogcmVkaXJlY3RfdXJpLFxuICAgICAgICAgICAgICAgIGNsaWVudF9pZDogdGhpcy5jbGllbnRJZCxcbiAgICAgICAgICAgICAgICBjbGllbnRfc2VjcmV0OiB0aGlzLmNsaWVudFNlY3JldCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdWNjZXNzOiAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhuZXcgT2F1dGhUb2tlblJlc3BvbnNlKHJlc3VsdCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYWlsOiAocmVzdWx0LCByZWFzb24pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBPYXV0aFRva2VuUmVzcG9uc2UocmVzdWx0KSwgcmVhc29uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqR2V0IG9hdXRoIFJlZnJlc2ggVG9rZW4gd2l0aFxuICAgICAqIENsaWVudCBjcmVkZW50aWFsc1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSByZWZyZXNoX3Rva2VuXG4gICAgICogQHBhcmFtIHsodmVyaWZ5OiBPYXV0aFRva2VuUmVzcG9uc2UpPT5hbnl9IGNhbGxiYWNrXG4gICAgICogKi9cbiAgICBvYXV0aFJlZnJlc2hUb2tlbihyZWZyZXNoX3Rva2VuLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoIU9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHJlZnJlc2hfdG9rZW4pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIncmVmcmVzaF90b2tlbicgUmVxdWlyZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgT2F1dGhSZXF1ZXN0LnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiB0aGlzLnRva2VuVXJsLFxuICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgZ3JhbnRfdHlwZTogT2F1dGhHcmFudFR5cGUuUmVmcmVzaF9Ub2tlbixcbiAgICAgICAgICAgICAgICByZWZyZXNoX3Rva2VuOiByZWZyZXNoX3Rva2VuLFxuICAgICAgICAgICAgICAgIGNsaWVudF9pZDogdGhpcy5jbGllbnRJZCxcbiAgICAgICAgICAgICAgICBjbGllbnRfc2VjcmV0OiB0aGlzLmNsaWVudFNlY3JldCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdWNjZXNzOiAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhuZXcgT2F1dGhUb2tlblJlc3BvbnNlKHJlc3VsdCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYWlsOiAocmVzdWx0LCByZWFzb24pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBPYXV0aFRva2VuUmVzcG9uc2UocmVzdWx0KSwgcmVhc29uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IG9hdXRoIFJlZnJlc2ggVG9rZW4gd2l0aFxuICAgICAqIENsaWVudCBjcmVkZW50aWFsc1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBhY2Nlc3NfdG9rZW5cbiAgICAgKiBAcGFyYW0geyh2ZXJpZnk6IE9hdXRoVmVyaWZpY2F0aW9uUmVzcG9uc2UsIG1zZz86IHN0cmluZykgPT4gYW55fSBjYWxsYmFja1xuICAgICAqICovXG4gICAgb2F1dGhWZXJpZnlUb2tlbihhY2Nlc3NfdG9rZW4sIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICghT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUodGhpcy52ZXJpZnlUb2tlblVybCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIid2ZXJpZnlUb2tlblVybCcgd2FzIG5vdCBzcGVjaWZpZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShhY2Nlc3NfdG9rZW4pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCInYWNjZXNzX3Rva2VuJyBSZXF1aXJlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBPYXV0aFJlcXVlc3QuZ2V0KHtcbiAgICAgICAgICAgIHVybDogdGhpcy52ZXJpZnlUb2tlblVybCxcbiAgICAgICAgICAgIHdpdGhBY2Nlc3NUb2tlbjogdHJ1ZSxcbiAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiBhY2Nlc3NfdG9rZW4sXG4gICAgICAgICAgICBzdWNjZXNzOiAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhuZXcgT2F1dGhWZXJpZmljYXRpb25SZXNwb25zZShyZXN1bHQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFpbDogKHJlc3VsdCwgcmVhc29uKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhuZXcgT2F1dGhWZXJpZmljYXRpb25SZXNwb25zZShyZXN1bHQpLCByZWFzb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbk9hdXRoLl9zdG9yYWdlID0gbmV3IE9hdXRoU3RvcmFnZSgpO1xuLyoqR3JhbnQgVHlwZXNcbiAqIEBlbnVtXG4gKi9cbnZhciBPYXV0aEdyYW50VHlwZTtcbihmdW5jdGlvbiAoT2F1dGhHcmFudFR5cGUpIHtcbiAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICBPYXV0aEdyYW50VHlwZVsnQ2xpZW50X0NyZWRlbnRpYWxzJ10gPSAnY2xpZW50X2NyZWRlbnRpYWxzJztcbiAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICBPYXV0aEdyYW50VHlwZVsnQXV0aG9yaXphdGlvbl9Db2RlJ10gPSAnYXV0aG9yaXphdGlvbl9jb2RlJztcbiAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICBPYXV0aEdyYW50VHlwZVsnVXNlcl9DcmVkZW50aWFscyddID0gJ3Bhc3N3b3JkJztcbiAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICBPYXV0aEdyYW50VHlwZVsnUmVmcmVzaF9Ub2tlbiddID0gJ3JlZnJlc2hfdG9rZW4nO1xuICAgIC8qKiBAdHlwZSB7U3RyaW5nfSAqL1xuICAgIE9hdXRoR3JhbnRUeXBlWydBdXRvJ10gPSAnYXV0byc7XG59KShPYXV0aEdyYW50VHlwZSB8fCAoT2F1dGhHcmFudFR5cGUgPSB7fSkpO1xuLyoqSHR0cCBSZXF1ZXN0IE1ldGhvZFxuICogQGVudW1cbiAqL1xudmFyIE9hdXRoUmVxdWVzdE1ldGhvZDtcbihmdW5jdGlvbiAoT2F1dGhSZXF1ZXN0TWV0aG9kKSB7XG4gICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgT2F1dGhSZXF1ZXN0TWV0aG9kWydHRVQnXSA9ICdnZXQnO1xuICAgIC8qKiBAdHlwZSB7U3RyaW5nfSAqL1xuICAgIE9hdXRoUmVxdWVzdE1ldGhvZFsnUE9TVCddID0gJ3Bvc3QnO1xuICAgIC8qKiBAdHlwZSB7U3RyaW5nfSAqL1xuICAgIE9hdXRoUmVxdWVzdE1ldGhvZFsnUFVUJ10gPSAncHV0JztcbiAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICBPYXV0aFJlcXVlc3RNZXRob2RbJ0RFTEVURSddID0gJ2RlbGV0ZSc7XG59KShPYXV0aFJlcXVlc3RNZXRob2QgfHwgKE9hdXRoUmVxdWVzdE1ldGhvZCA9IHt9KSk7XG4vKipNYWtlIE9hdXRoIEh0dHAgcmVxdWVzdHNcbiAqIEBjbGFzc1xuICogKi9cbmNsYXNzIE9hdXRoUmVxdWVzdCB7XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtPYXV0aFJlcXVlc3RQYXJhbXN9IGRhdGFcbiAgICAgKiBAcGFyYW0ge09hdXRoUmVxdWVzdE1ldGhvZH0gbWV0aG9kXG4gICAgICogKi9cbiAgICBjb25zdHJ1Y3RvcihtZXRob2QgPSBPYXV0aFJlcXVlc3RNZXRob2QuR0VUKSB7XG4gICAgICAgIHRoaXMubWV0aG9kID0gbWV0aG9kO1xuICAgICAgICB0aGlzLmF4aHR0cCA9IGF4aW9zLmNyZWF0ZSh7XG4gICAgICAgICAgICB0aW1lb3V0OiAyMDAwMCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKk1ha2UgR0VUIFJlcXVlc3RzXG4gICAgICogQHBhcmFtIHtPYXV0aFJlcXVlc3RQYXJhbXN9IGRhdGFcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxUPn1cbiAgICAgKiAqL1xuICAgIHN0YXRpYyBnZXQoZGF0YSkge1xuICAgICAgICBjb25zdCBodHRwID0gbmV3IE9hdXRoUmVxdWVzdChPYXV0aFJlcXVlc3RNZXRob2QuR0VUKTtcbiAgICAgICAgcmV0dXJuIGh0dHAucmVxdWVzdChkYXRhKTtcbiAgICB9XG4gICAgLyoqTWFrZSBQT1NUIFJlcXVlc3RzXG4gICAgICogQHBhcmFtIHtPYXV0aFJlcXVlc3RQYXJhbXN9IGRhdGFcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxUPn1cbiAgICAgKiAqL1xuICAgIHN0YXRpYyBwb3N0KGRhdGEpIHtcbiAgICAgICAgY29uc3QgaHR0cCA9IG5ldyBPYXV0aFJlcXVlc3QoT2F1dGhSZXF1ZXN0TWV0aG9kLlBPU1QpO1xuICAgICAgICByZXR1cm4gaHR0cC5yZXF1ZXN0KGRhdGEpO1xuICAgIH1cbiAgICAvKipNYWtlIFBVVCBSZXF1ZXN0c1xuICAgICAqIEBwYXJhbSB7T2F1dGhSZXF1ZXN0UGFyYW1zfSBkYXRhXG4gICAgICogQHJldHVybnMge1Byb21pc2U8VD59XG4gICAgICogKi9cbiAgICBzdGF0aWMgcHV0KGRhdGEpIHtcbiAgICAgICAgY29uc3QgaHR0cCA9IG5ldyBPYXV0aFJlcXVlc3QoT2F1dGhSZXF1ZXN0TWV0aG9kLlBVVCk7XG4gICAgICAgIHJldHVybiBodHRwLnJlcXVlc3QoZGF0YSk7XG4gICAgfVxuICAgIC8qKk1ha2UgREVMRVRFIFJlcXVlc3RzXG4gICAgICogQHBhcmFtIHtPYXV0aFJlcXVlc3RQYXJhbXN9IGRhdGFcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxUPn1cbiAgICAgKiAqL1xuICAgIHN0YXRpYyBkZWxldGUoZGF0YSkge1xuICAgICAgICBjb25zdCBodHRwID0gbmV3IE9hdXRoUmVxdWVzdChPYXV0aFJlcXVlc3RNZXRob2QuREVMRVRFKTtcbiAgICAgICAgcmV0dXJuIGh0dHAucmVxdWVzdChkYXRhKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTWFrZSBIdHRwIHJlcXVlc3RzXG4gICAgICogQHBhcmFtIHtPYXV0aFJlcXVlc3RQYXJhbXM8VD59IGRhdGFcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxUPn1cbiAgICAgKi9cbiAgICByZXF1ZXN0KGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIFNldCBvcHRpb25zXG4gICAgICAgICAgICBsZXQgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICB1cmw6IGRhdGEudXJsLFxuICAgICAgICAgICAgICAgIG1ldGhvZDogdGhpcy5tZXRob2QsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiBkYXRhLnF1ZXJ5IHx8IHt9LFxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEucGFyYW1zIHx8IHt9LFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IGRhdGEuaGVhZGVycyB8fCB7fSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvLyBBZGQgYmFzaWMgY3JlZGVudGlhbHMgaWYgcmVxdWVzdGVkXG4gICAgICAgICAgICBpZiAoZGF0YS53aXRoQ3JlZGVudGlhbHMpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmF1dGggPSB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJuYW1lOiBkYXRhLnVzZXJuYW1lLFxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogZGF0YS5wYXNzd29yZCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQWRkIEFjY2VzcyBUb2tlbiBpZiByZXF1ZXN0ZWRcbiAgICAgICAgICAgIGlmIChkYXRhLndpdGhBY2Nlc3NUb2tlbikge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuaGVhZGVyc1snQXV0aG9yaXphdGlvbiddID1cbiAgICAgICAgICAgICAgICAgICAgKGRhdGEuYWNjZXNzVG9rZW5UeXBlIHx8ICdCZWFyZXInKSArICcgJyArIGRhdGEuYWNjZXNzVG9rZW47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQZXJmb3JtIHJlcXVlc3RcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0geWllbGQgdGhpcy5heGh0dHAucmVxdWVzdChvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSAyMDAgfHwgcmVzdWx0LnN0YXR1cyA9PT0gMjAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnN1Y2Nlc3MocmVzdWx0LmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5mYWlsKHJlc3VsdC5kYXRhLCByZXN1bHQuc3RhdHVzVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5kYXRhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXhpb3MuaXNBeGlvc0Vycm9yKGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZmFpbChlLnJlc3BvbnNlLmRhdGEsIGUubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlLnJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5mYWlsKG51bGwsIGUubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5mYWlsKG51bGwsIGUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZmFpbCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuLyoqT2F1dGggUmVzcG9uc2VcbiAqIEBjbGFzc1xuICogKi9cbmNsYXNzIE9hdXRoUmVzcG9uc2Uge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXN1bHQganNvbiByZXN1bHRcbiAgICAgKiBAcmV0dXJucyB7T2F1dGhWZXJpZmljYXRpb25SZXNwb25zZX1cbiAgICAgKiAqL1xuICAgIHN0YXRpYyBwYXJzZVZlcmlmaWNhdGlvblJlc3BvbnNlKHJlc3VsdCkge1xuICAgICAgICBjb25zdCBkYXRhID0gT2F1dGhVdGlscy5wYXJzZUpzb24ocmVzdWx0KTtcbiAgICAgICAgY29uc3QgdmVyaWZ5ID0gbmV3IE9hdXRoVmVyaWZpY2F0aW9uUmVzcG9uc2UoZGF0YSk7XG4gICAgICAgIGlmICh2ZXJpZnkgJiYgT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUodmVyaWZ5LnN1Y2Nlc3MpKSB7XG4gICAgICAgICAgICByZXR1cm4gdmVyaWZ5O1xuICAgICAgICB9IGVsc2UgaWYgKHZlcmlmeSAmJiBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZSh2ZXJpZnkuZXJyb3IpKSB7XG4gICAgICAgICAgICByZXR1cm4gdmVyaWZ5O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcmVzdWx0IGpzb24gcmVzdWx0XG4gICAgICogQHJldHVybnMge09hdXRoQXV0aG9yaXphdGlvblJlc3BvbnNlfVxuICAgICAqICovXG4gICAgc3RhdGljIHBhcnNlQXV0aG9yaXphdGlvblJlc3BvbnNlKHJlc3VsdCkge1xuICAgICAgICBjb25zdCBkYXRhID0gT2F1dGhVdGlscy5wYXJzZUpzb24ocmVzdWx0KTtcbiAgICAgICAgY29uc3QgY29kZSA9IG5ldyBPYXV0aEF1dGhvcml6YXRpb25SZXNwb25zZShkYXRhKTtcbiAgICAgICAgaWYgKGNvZGUgJiYgT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoY29kZS5jb2RlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGNvZGU7XG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSAmJiBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShjb2RlLmVycm9yKSkge1xuICAgICAgICAgICAgcmV0dXJuIGNvZGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXN1bHQganNvbiByZXN1bHRcbiAgICAgKiBAcmV0dXJucyB7T2F1dGhUb2tlblJlc3BvbnNlfVxuICAgICAqICovXG4gICAgc3RhdGljIHBhcnNlVG9rZW5SZXNwb25zZShyZXN1bHQpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IE9hdXRoVXRpbHMucGFyc2VKc29uKHJlc3VsdCk7XG4gICAgICAgIGNvbnN0IHRva2VuID0gbmV3IE9hdXRoVG9rZW5SZXNwb25zZShkYXRhKTtcbiAgICAgICAgaWYgKHRva2VuICYmIE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHRva2VuLmFjY2Vzc1Rva2VuKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICB9IGVsc2UgaWYgKHRva2VuICYmIE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHRva2VuLmVycm9yKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbi8qKlZlcmlmaWNhdGlvbiBSZXNwb25zZVxuICogQGNsYXNzXG4gKiAqL1xuY2xhc3MgT2F1dGhWZXJpZmljYXRpb25SZXNwb25zZSB7XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgICAgIGlmICghZGF0YSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnN1Y2Nlc3MgPSBkYXRhWydzdWNjZXNzJ107XG4gICAgICAgIHRoaXMuZXJyb3IgPSBkYXRhWydlcnJvciddO1xuICAgICAgICB0aGlzLmVycm9yRGVzY3JpcHRpb24gPSBkYXRhWydlcnJvcl9kZXNjcmlwdGlvbiddO1xuICAgIH1cbn1cbi8qKkF1dGhvcml6YXRpb24gUmVzcG9uc1xuICogQGNsYXNzXG4gKiAqL1xuY2xhc3MgT2F1dGhBdXRob3JpemF0aW9uUmVzcG9uc2Uge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xuICAgICAgICBpZiAoIWRhdGEpIHJldHVybjtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IGRhdGFbJ3N0YXRlJ107XG4gICAgICAgIHRoaXMuY29kZSA9IGRhdGFbJ2NvZGUnXTtcbiAgICAgICAgdGhpcy5lcnJvciA9IGRhdGFbJ2Vycm9yJ107XG4gICAgICAgIHRoaXMuZXJyb3JEZXNjcmlwdGlvbiA9IGRhdGFbJ2Vycm9yX2Rlc2NyaXB0aW9uJ107XG4gICAgfVxufVxuLyoqVG9rZW4gUmVzcG9uc2VcbiAqIEBjbGFzc1xuICogKi9cbmNsYXNzIE9hdXRoVG9rZW5SZXNwb25zZSB7XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgICAgIGlmICghZGF0YSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmFjY2Vzc1Rva2VuID0gZGF0YVsnYWNjZXNzX3Rva2VuJ107XG4gICAgICAgIHRoaXMucmVmcmVzaFRva2VuID0gZGF0YVsncmVmcmVzaF90b2tlbiddO1xuICAgICAgICB0aGlzLnRva2VuVHlwZSA9IGRhdGFbJ3Rva2VuX3R5cGUnXTtcbiAgICAgICAgdGhpcy5hY2Nlc3NTY29wZSA9IGRhdGFbJ3Njb3BlJ107XG4gICAgICAgIHRoaXMuZXhwaXJlc0luID0gZGF0YVsnZXhwaXJlc19pbiddO1xuICAgICAgICB0aGlzLmVycm9yID0gZGF0YVsnZXJyb3InXTtcbiAgICAgICAgdGhpcy5lcnJvckRlc2NyaXB0aW9uID0gZGF0YVsnZXJyb3JfZGVzY3JpcHRpb24nXTtcbiAgICB9XG59XG5leHBvcnQge1xuICAgIE9hdXRoU3RvcmFnZUtleXMsXG4gICAgT2F1dGhTdG9yYWdlLFxuICAgIE9hdXRoVXRpbHMsXG4gICAgT2F1dGgsXG4gICAgT2F1dGhHcmFudFR5cGUsXG4gICAgT2F1dGhSZXF1ZXN0TWV0aG9kLFxuICAgIE9hdXRoUmVxdWVzdCxcbiAgICBPYXV0aFJlc3BvbnNlLFxuICAgIE9hdXRoVmVyaWZpY2F0aW9uUmVzcG9uc2UsXG4gICAgT2F1dGhBdXRob3JpemF0aW9uUmVzcG9uc2UsXG4gICAgT2F1dGhUb2tlblJlc3BvbnNlLFxufTtcbiJdLCJuYW1lcyI6WyJiaW5kIiwicmVxdWlyZSQkMCIsInV0aWxzIiwiYnVpbGRVUkwiLCJJbnRlcmNlcHRvck1hbmFnZXIiLCJub3JtYWxpemVIZWFkZXJOYW1lIiwiZW5oYW5jZUVycm9yIiwiY3JlYXRlRXJyb3IiLCJzZXR0bGUiLCJjb29raWVzIiwiaXNBYnNvbHV0ZVVSTCIsImNvbWJpbmVVUkxzIiwicmVxdWlyZSQkMSIsImJ1aWxkRnVsbFBhdGgiLCJwYXJzZUhlYWRlcnMiLCJpc1VSTFNhbWVPcmlnaW4iLCJDYW5jZWwiLCJyZXF1aXJlJCQyIiwicmVxdWlyZSQkMyIsInJlcXVpcmUkJDQiLCJyZXF1aXJlJCQ1IiwicmVxdWlyZSQkNiIsInJlcXVpcmUkJDciLCJ0cmFuc2l0aW9uYWxEZWZhdWx0cyIsInJlcXVpcmUkJDgiLCJyZXF1aXJlJCQ5IiwiZGVmYXVsdHMiLCJ0cmFuc2Zvcm1EYXRhIiwiaXNDYW5jZWwiLCJkaXNwYXRjaFJlcXVlc3QiLCJtZXJnZUNvbmZpZyIsInZhbGlkYXRvcnMiLCJ2YWxpZGF0b3IiLCJBeGlvcyIsImF4aW9zIiwicmVxdWlyZSQkMTAiLCJheGlvc01vZHVsZSIsImF4aW9zXzEiLCJpZWVlNzU0IiwidGhpcyIsIk9hdXRoU3RvcmFnZUtleXMiLCJCdWZmZXIiLCJPYXV0aEdyYW50VHlwZSIsIk9hdXRoUmVxdWVzdE1ldGhvZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7RUFFQSxJQUFBQSxNQUFjLEdBQUcsU0FBUyxJQUFJLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRTtFQUM1QyxFQUFFLE9BQU8sU0FBUyxJQUFJLEdBQUc7RUFDekIsSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7RUFDM0MsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtFQUMxQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDN0IsS0FBSztFQUNMLElBQUksT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztFQUNuQyxHQUFHLENBQUM7RUFDSixDQUFDOztFQ1JELElBQUlBLE1BQUksR0FBR0MsTUFBeUIsQ0FBQztBQUNyQztFQUNBO0FBQ0E7RUFDQSxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztBQUN6QztFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRTtFQUN0QixFQUFFLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUM1QixDQUFDO0FBQ0Q7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUU7RUFDMUIsRUFBRSxPQUFPLE9BQU8sR0FBRyxLQUFLLFdBQVcsQ0FBQztFQUNwQyxDQUFDO0FBQ0Q7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUU7RUFDdkIsRUFBRSxPQUFPLEdBQUcsS0FBSyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLFdBQVcsS0FBSyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztFQUN2RyxPQUFPLE9BQU8sR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEtBQUssVUFBVSxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ3ZGLENBQUM7QUFDRDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLFNBQVMsYUFBYSxDQUFDLEdBQUcsRUFBRTtFQUM1QixFQUFFLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxzQkFBc0IsQ0FBQztFQUN2RCxDQUFDO0FBQ0Q7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUU7RUFDekIsRUFBRSxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssbUJBQW1CLENBQUM7RUFDcEQsQ0FBQztBQUNEO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsU0FBUyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7RUFDaEMsRUFBRSxJQUFJLE1BQU0sQ0FBQztFQUNiLEVBQUUsSUFBSSxDQUFDLE9BQU8sV0FBVyxLQUFLLFdBQVcsTUFBTSxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUU7RUFDcEUsSUFBSSxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNyQyxHQUFHLE1BQU07RUFDVCxJQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0VBQ2xFLEdBQUc7RUFDSCxFQUFFLE9BQU8sTUFBTSxDQUFDO0VBQ2hCLENBQUM7QUFDRDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRTtFQUN2QixFQUFFLE9BQU8sT0FBTyxHQUFHLEtBQUssUUFBUSxDQUFDO0VBQ2pDLENBQUM7QUFDRDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRTtFQUN2QixFQUFFLE9BQU8sT0FBTyxHQUFHLEtBQUssUUFBUSxDQUFDO0VBQ2pDLENBQUM7QUFDRDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRTtFQUN2QixFQUFFLE9BQU8sR0FBRyxLQUFLLElBQUksSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUM7RUFDakQsQ0FBQztBQUNEO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsU0FBUyxhQUFhLENBQUMsR0FBRyxFQUFFO0VBQzVCLEVBQUUsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLGlCQUFpQixFQUFFO0VBQ2hELElBQUksT0FBTyxLQUFLLENBQUM7RUFDakIsR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQzdDLEVBQUUsT0FBTyxTQUFTLEtBQUssSUFBSSxJQUFJLFNBQVMsS0FBSyxNQUFNLENBQUMsU0FBUyxDQUFDO0VBQzlELENBQUM7QUFDRDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRTtFQUNyQixFQUFFLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxlQUFlLENBQUM7RUFDaEQsQ0FBQztBQUNEO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFO0VB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Q0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFDO0VBQ3RDLElBQUksR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksRUFBRSxJQUFJLEtBQUk7RUFDdkMsSUFBSSxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksS0FBSTtFQUN0QyxJQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxLQUFJO0VBQy9CLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxlQUFlLEtBQUssQ0FBQyxFQUFFO0VBQzdCLElBQUksR0FBRztFQUNQLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7RUFDeEMsT0FBTyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUM7RUFDN0MsSUFBSSxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsS0FBSTtFQUMvQixHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksZUFBZSxLQUFLLENBQUMsRUFBRTtFQUM3QixJQUFJLEdBQUc7RUFDUCxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFO0VBQ3pDLE9BQU8sU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzdDLE9BQU8sU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFDO0VBQzdDLElBQUksR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEtBQUk7RUFDdEMsSUFBSSxHQUFHLENB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Q0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFLEVBQUU7QUFDOUU7RUFDQSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUM7RUFDL0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUM7RUFDaEIsRUFBRSxLQUFLLElBQUksS0FBSTtFQUNmLEVBQUUsT0FBTyxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLEVBQUUsRUFBRTtBQUM5RTtFQUNBLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO0VBQ2YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQUs7RUFDakIsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRTtFQUN6QixJQUFJLE9BQU8sQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksUUFBUSxDQUFDO0VBQzlDLEdBQUcsTUFBTTtFQUNULElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUM7RUFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQUs7RUFDakIsR0FBRztFQUNILEVBQUUsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7RUFDakQsRUFBQztBQUNEO0VBQ0EsT0FBQSxDQUFBLEtBQWEsR0FBRyxVQUFVLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO0VBQ3JFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUM7RUFDYixFQUFFLElBQUksSUFBSSxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsRUFBQztFQUNwQyxFQUFFLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFDO0VBQzVCLEVBQUUsSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUM7RUFDdkIsRUFBRSxJQUFJLEVBQUUsSUFBSSxJQUFJLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUM7RUFDbEUsRUFBRSxJQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUM7RUFDakMsRUFBRSxJQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBQztFQUN2QixFQUFFLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFDO0FBQzdEO0VBQ0EsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUM7QUFDekI7RUFDQSxFQUFFLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxRQUFRLEVBQUU7RUFDMUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFDO0VBQzVCLElBQUksQ0FBQyxHQUFHLEtBQUk7RUFDWixHQUFHLE1BQU07RUFDVCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFH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QUFDSDtFQUNBLEVBQUUsT0FBTyxHQUFHO0VBQ1osQ0FBQztBQUNEO0VBQ0EsU0FBUyxhQUFhLEVBQUUsS0FBSyxFQUFFO0VBQy9CLEVBQUUsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBQztFQUMvRCxFQUFFLElBQUksR0FBRyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUM7RUFDaEMsRUFBRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7RUFDdEMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUc7RUFDM0IsR0FBRztFQUNILEVBQUUsT0FBTyxHQUFHO0VBQ1osQ0FBQztBQUNEO0VBQ0EsU0FBUyxlQUFlLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUU7RUFDckQsRUFBRSxJQUFJLFVBQVUsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLFVBQVUsR0FBRyxVQUFVLEVBQUU7RUFDdkQsSUFBSSxNQUFNLElBQUksVUFBVSxDQUFDLHNDQUFzQyxDQUFDO0VBQ2hFLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxLQUFLLENBQUMsVUFBVSxHQUFHLFVBQVUsSUFBSSxNQUFNLElBQUksQ0FBQyxDQUFDLEVBQUU7RUFDckQsSUFBSSxNQUFNLElBQUksVUFBVSxDQUFDLHNDQUFzQyxDQUFDO0VBQ2hFLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxJQUFHO0VBQ1QsRUFBRSxJQUFJLFVBQVUsS0FBSyxTQUFTLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtFQUN4RCxJQUFJLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxLQUFLLEVBQUM7RUFDL0IsR0FBRyxNQUFNLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtFQUNuQyxJQUFJLEdBQUcsR0FB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QUFDLENBQUMsR0FBRyxTQUFTLENBQUM7RUFDNUMsS0FBSztFQUNMLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxFQUFDO0VBQ1AsRUFBRSxJQUFJLEdBQUcsRUFBRTtFQUNYLElBQUksSUFBSSxVQUFVLEdBQUcsQ0FBQyxFQUFDO0VBQ3ZCLElBQUksS0FBSyxDQUFDLEdBQUcsVUFBVSxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7RUFDN0MsTUFBTSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxVQUFVLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsRUFBRTtFQUM5RSxRQUFRLElBQUksVUFBVSxLQUFLLENBQUMsQ0FBQyxFQUFFLFVBQVUsR0FBRyxFQUFDO0VBQzdDLFFBQVEsSUFBSSxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsS0FBSyxTQUFTLEVBQUUsT0FBTyxVQUFVLEdBQUcsU0FBUztFQUMzRSxPQUFPLE1BQU07RUFDYixRQUFRLElBQUksVUFBVSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVTtFQUNsRCxRQUFRLFVBQVUsR0FBRyxDQUFDLEVBQUM7RUFDdkIsT0FBTztFQUNQLEtBQUs7RUFDTCxHQUFHLE1BQU07RUFDVCxJQUFJLElBQUksVUFBVSxHQUFHLFNBQVMsR0FBRyxTQUFTLEVBQUUsVUFBVSxHQUFHLFNBQVMsR0FBRyxVQUFTO0VBQzlFLElBQUksS0FBSyxDQUFDLEdBQUcsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7RUFDdEMsTUFBTSxJQUFJLEtBQUssR0FBRyxLQUFJO0VBQ3RCLE1BQU0sS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRTtFQUMxQyxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFD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RUFDQSxFQUFFLEtBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7RUFDcEMsSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFDO0VBQzdDLEdBQUc7RUFDSCxFQUFFLE9BQU8sR0FBRztFQUNaLENBQUM7QUFDRDtFQUNBLFNBQVMsV0FBVyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO0VBQ3ZDLEVBQUUsSUFBSSxHQUFHLEdBQUcsR0FBRTtFQUNkLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUM7QUFDakM7RUFDQSxFQUFFLEtBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7RUFDcEMsSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUM7RUFDdEMsR0FBRztFQUNILEVBQUUsT0FBTyxHQUFHO0VBQ1osQ0FBQztBQUNEO0VBQ0EsU0FBUyxRQUFRLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUU7RUFDcEMsRUFBRSxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTTtBQUN0QjtFQUNBLEVBQUUsSUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxFQUFDO0VBQ3BDLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLElBQUc7QUFDN0M7RUFDQSxFQUFFLElBQUksR0FBRyxHQUFHLEdBQUU7RUFDZCxFQUFFLEtBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7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QUFNLEVBQUM7QUFDN0Q7RUFDQSxFQUFFLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUM7RUFDeEIsRUFBRSxJQUFJLEdBQUcsR0FBRyxFQUFDO0VBQ2IsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFDO0VBQ1gsRUFBRSxPQUFPLEVBQUUsQ0FBQyxHQUFHLFVBQVUsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUU7RUFDN0MsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFHO0VBQ2pDLEdBQUc7QUFDSDtFQUNBLEVBQUUsT0FBTyxHQUFHO0VBQ1osRUFBQztBQUNEO0VBQ0EsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsU0FBUyxVQUFVLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUU7RUFDakYsRUFBRSxNQUFNLEdBQUcsTUFBTSxLQUFLLEVBQUM7RUFDdkIsRUFBRSxVQUFVLEdBQUcsVUFBVSxLQUFLLEVBQUM7RUFDL0IsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFO0VBQ2pCLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBQztFQUNoRCxHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxVQUFVLEVBQUM7RUFDdkMsRUFBRSxJQUFJLEdBQUcsR0FBRyxFQUFDO0VBQ2IsRUFBRSxPQUFPLFVBQVUsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFO0VBQzNDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxVQUFVLENBQUMsR0FBRyxJQUFHO0VBQzVDLEdBQUc7QUFDSDtFQUNBLEVBQUUsT0FBTyxHQUFHO0VBQ1osRUFBQztBQUNEO0VBQ0EsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxTQUFTLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRTtFQUNuRSxFQUFFLE1BQU0sR0FBRyxNQUFNLEtBQUssRUFBQztFQUN2QixFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBQztFQUNwRCxFQUFFLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztFQUNyQixFQUFDO0FBQ0Q7RUFDQSxNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxTQUFTLFlBQVksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFO0VBQ3pFLEVBQUUsTUFBTSxHQUFHLE1BQU0sS0FBSyxFQUFDO0VBQ3ZCLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFDO0VBQ3BELEVBQUUsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDL0MsRUFBQztBQUNEO0VBQ0EsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsU0FBUyxZQUFZLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRTtFQUN6RSxFQUFFLE1BQU0sR0FBRyxNQUFNLEtBQUssRUFBQztFQUN2QixFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBQztFQUNwRCxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0VBQy9DLEVBQUM7QUFDRDtFQUNBLE1BQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFNBQVMsWUFBWSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUU7RUFDekUsRUFBRSxNQUFNLEdBQUcsTUFBTSxLQUFLLEVBQUM7RUFDdkIsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUM7QUFDcEQ7RUFDQSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7RUFDdkIsT0FBTyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUM3QixPQUFPLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0VBQzlCLE9BQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7RUFDcEMsRUFBQztBQUNEO0VBQ0EsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsU0FBUyxZQUFZLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRTtFQUN6RSxFQUFFLE1BQU0sR0FBRyxNQUFNLEtBQUssRUFBQztFQUN2QixFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBQztBQUNwRDtFQUNBLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxTQUFTO0VBQ2xDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUU7RUFDNUIsS0FBSyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUMzQixJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDckIsRUFBQztBQUNEO0VBQ0EsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxTQUFTLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUU7RUFDL0UsRUFBRSxNQUFNLEdBQUcsTUFBTSxLQUFLLEVBQUM7RUFDdkIsRUFBRSxVQUFVLEdBQUcsVUFBVSxLQUFLLEVBQUM7RUFDL0IsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUM7QUFDN0Q7RUFDQSxFQUFFLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUM7RUFDeEIsRUFBRSxJQUFJLEdBQUcsR0FBRyxFQUFDO0VBQ2IsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFDO0VBQ1gsRUFBRSxPQUFPLEVBQUUsQ0FBQyxHQUFHLFVBQVUsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUU7RUFDN0MsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFHO0VBQ2pDLEdBQUc7RUFDSCxFQUFFLEdBQUcsSUFBSSxLQUFJO0FBQ2I7RUFDQSxFQUFFLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsRUFBQztBQUNwRDtFQUNBLEVBQUUsT0FBTyxHQUFHO0VBQ1osRUFBQztBQUNEO0VBQ0EsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxTQUFTLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUU7RUFDL0UsRUFBRSxNQUFNLEdBQUcsTUFBTSxLQUFLLEVBQUM7RUFDdkIsRUFBRSxVQUFVLEdBQUcsVUFBVSxLQUFLLEVBQUM7RUFDL0IsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUM7QUFDN0Q7RUFDQSxFQUFFLElBQUksQ0FBQyxHQUFHLFdBQVU7RUFDcEIsRUFBRSxJQUFJLEdBQUcsR0FBRyxFQUFDO0VBQ2IsRUFBRSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxFQUFDO0VBQzlCLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRTtFQUNsQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FB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TSxHQUFHLE1BQU0sS0FBSyxFQUFDO0VBQ3ZCLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFDO0FBQ3BEO0VBQ0EsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7RUFDNUIsS0FBSyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztFQUM1QixLQUFLLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzNCLEtBQUssSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztFQUN0QixFQUFDO0FBQ0Q7RUFDQSxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxTQUFTLFdBQVcsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFO0VBQ3ZFLEVBQUUsTUFBTSxHQUFHLE1BQU0sS0FBSyxFQUFDO0VBQ3ZCLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFDO0VBQ3BELEVBQUUsT0FBTzBCLFNBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztFQUNoRCxFQUFDO0FBQ0Q7RUFDQSxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxTQUFTLFdBQVcsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFO0VBQ3ZFLEVBQUUsTUFBTSxHQUFHLE1BQU0sS0FBSyxFQUFDO0VBQ3ZCLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFDO0VBQ3BELEVBQUUsT0FBT0EsU0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0VB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LEtBQUssR0FBRyxJQUFJLEVBQUM7RUFDL0IsRUFBRSxPQUFPLE1BQU0sR0FBRyxDQUFDO0VBQ25CLEVBQUM7QUFDRDtFQUNBLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFNBQVMsYUFBYSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFO0VBQ2xGLEVBQUUsS0FBSyxHQUFHLENBQUMsTUFBSztFQUNoQixFQUFFLE1BQU0sR0FBRyxNQUFNLEtBQUssRUFBQztFQUN2QixFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFDO0VBQzVELEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssR0FBRyxJQUFJLEVBQUM7RUFDL0IsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUM7RUFDbEMsRUFBRSxPQUFPLE1BQU0sR0FBRyxDQUFDO0VBQ25CLEVBQUM7QUFDRDtFQUNBLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFNBQVMsYUFBYSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFO0VBQ2xGLEVBQUUsS0FBSyxHQUFHLENBQUMsTUFBSztFQUNoQixFQUFFLE1BQU0sR0FBRyxNQUFNLEtBQUssRUFBQztFQUN2QixFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFDO0VBQzVELEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUM7RUFDOUIsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssR0FBRyxJQUFJLEVBQUM7RUFDbkMsRUFBRSxPQUFPLE1BQU0sR0FBRyxDQUFDO0VBQ25CLEVBQUM7QUFDRDtFQUNBLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFNBQVMsYUFBYSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFO0VBQ2xGLEVBQUUsS0FBSyxHQUFHLENBQUMsTUFBSztFQUNoQixFQUFFLE1BQU0sR0FBRyxNQUFNLEtBQUssRUFBQztFQUN2QixFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFDO0VBQ2hFLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRSxFQUFDO0VBQ25DLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRSxFQUFDO0VBQ25DLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFDO0VBQ2xDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssR0FBRyxJQUFJLEVBQUM7RUFDL0IsRUFBRSxPQUFPLE1BQU0sR0FBRyxDQUFDO0VBQ25CLEVBQUM7QUFDRDtFQUNBLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFNBQVMsYUFBYSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFO0VBQ2xGLEVBQUUsS0FBSyxHQUFHLENBQUMsTUFBSztFQUNoQixFQUFFLE1BQU0sR0FBRyxNQUFNLEtBQUssRUFBQztFQUN2QixFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFDO0VBQ2hFLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssS0FBSyxFQUFFLEVBQUM7RUFDL0IsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJ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