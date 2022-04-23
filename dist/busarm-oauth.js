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
  /**Common Functions*/
  class OauthUtils {
      /**
       * Check if token is a JWT token and return claims if so
       * @return {String}
       * */
      static parseJWT(token) {
          let split = token.split('.');
          return split && split.length == 3
              ? Buffer.from(split[1]).toString('base64')
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
          return exp ? parseInt(exp) < Math.floor(Date.now() / 1000) + 10 : true; // + 10 to account for any network latency
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
       * Authorize Access to the app
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
                  if (
                      OauthUtils.parseJWT(token) &&
                      !OauthUtils.hasJWTExpired(token)
                  ) {
                      return false;
                  } else {
                      let expiresIn = yield Oauth.storage.get(
                          exports.OauthStorageKeys.ExpiresInKey
                      );
                      if (OauthUtils.assertAvailable(expiresIn)) {
                          return (
                              parseInt(expiresIn) <
                              Math.floor(Date.now() / 1000) + 10
                          ); // + 10 to account for any network latency
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
  /**Make Oauth Http requests*/
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
  /**Oauth Response*/
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
  /**Verification Response*/
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
  /**Authorization Response*/
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
  /**Token Response*/
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9iaW5kLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9JbnRlcmNlcHRvck1hbmFnZXIuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZS5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9lbmhhbmNlRXJyb3IuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2RlZmF1bHRzL3RyYW5zaXRpb25hbC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS90cmFuc2Zvcm1EYXRhLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL21lcmdlQ29uZmlnLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9lbnYvZGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy92YWxpZGF0b3IuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBeGlvc0Vycm9yLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsImluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xuXG4vLyB1dGlscyBpcyBhIGxpYnJhcnkgb2YgZ2VuZXJpYyBoZWxwZXIgZnVuY3Rpb25zIG5vbi1zcGVjaWZpYyB0byBheGlvc1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXksIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5KHZhbCkge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWwpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIHVuZGVmaW5lZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSB2YWx1ZSBpcyB1bmRlZmluZWQsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0J1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsKSAmJiB2YWwuY29uc3RydWN0b3IgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbC5jb25zdHJ1Y3RvcilcbiAgICAmJiB0eXBlb2YgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlcih2YWwpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRm9ybURhdGFcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBGb3JtRGF0YSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRm9ybURhdGEodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZvcm1EYXRhXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKGlzQXJyYXlCdWZmZXIodmFsLmJ1ZmZlcikpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBVUkxTZWFyY2hQYXJhbXNdJztcbn1cblxuLyoqXG4gKiBUcmltIGV4Y2VzcyB3aGl0ZXNwYWNlIG9mZiB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBTdHJpbmcgdG8gdHJpbVxuICogQHJldHVybnMge1N0cmluZ30gVGhlIFN0cmluZyBmcmVlZCBvZiBleGNlc3Mgd2hpdGVzcGFjZVxuICovXG5mdW5jdGlvbiB0cmltKHN0cikge1xuICByZXR1cm4gc3RyLnRyaW0gPyBzdHIudHJpbSgpIDogc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKiBuYXRpdmVzY3JpcHRcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnTmF0aXZlU2NyaXB0JyBvciAnTlMnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgKG5hdmlnYXRvci5wcm9kdWN0ID09PSAnUmVhY3ROYXRpdmUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOYXRpdmVTY3JpcHQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOUycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QocmVzdWx0W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZSh7fSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWwuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG4vKipcbiAqIFJlbW92ZSBieXRlIG9yZGVyIG1hcmtlci4gVGhpcyBjYXRjaGVzIEVGIEJCIEJGICh0aGUgVVRGLTggQk9NKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IHdpdGggQk9NXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGNvbnRlbnQgdmFsdWUgd2l0aG91dCBCT01cbiAqL1xuZnVuY3Rpb24gc3RyaXBCT00oY29udGVudCkge1xuICBpZiAoY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcbiAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW0sXG4gIHN0cmlwQk9NOiBzdHJpcEJPTVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkLCBvcHRpb25zKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkLFxuICAgIHN5bmNocm9ub3VzOiBvcHRpb25zID8gb3B0aW9ucy5zeW5jaHJvbm91cyA6IGZhbHNlLFxuICAgIHJ1bldoZW46IG9wdGlvbnMgPyBvcHRpb25zLnJ1bldoZW4gOiBudWxsXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIGVycm9yLmNvbmZpZyA9IGNvbmZpZztcbiAgaWYgKGNvZGUpIHtcbiAgICBlcnJvci5jb2RlID0gY29kZTtcbiAgfVxuXG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBlcnJvci5pc0F4aW9zRXJyb3IgPSB0cnVlO1xuXG4gIGVycm9yLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gU3RhbmRhcmRcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIC8vIE1pY3Jvc29mdFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBudW1iZXI6IHRoaXMubnVtYmVyLFxuICAgICAgLy8gTW96aWxsYVxuICAgICAgZmlsZU5hbWU6IHRoaXMuZmlsZU5hbWUsXG4gICAgICBsaW5lTnVtYmVyOiB0aGlzLmxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW5OdW1iZXI6IHRoaXMuY29sdW1uTnVtYmVyLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2ssXG4gICAgICAvLyBBeGlvc1xuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGNvZGU6IHRoaXMuY29kZSxcbiAgICAgIHN0YXR1czogdGhpcy5yZXNwb25zZSAmJiB0aGlzLnJlc3BvbnNlLnN0YXR1cyA/IHRoaXMucmVzcG9uc2Uuc3RhdHVzIDogbnVsbFxuICAgIH07XG4gIH07XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzaWxlbnRKU09OUGFyc2luZzogdHJ1ZSxcbiAgZm9yY2VkSlNPTlBhcnNpbmc6IHRydWUsXG4gIGNsYXJpZnlUaW1lb3V0RXJyb3I6IGZhbHNlXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9lbmhhbmNlRXJyb3InKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UsIGNvbmZpZywgZXJyb3IgY29kZSwgcmVxdWVzdCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNyZWF0ZWQgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRXJyb3IobWVzc2FnZSwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgc3VwcG9ydCBkb2N1bWVudC5jb29raWVcbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKG5hbWUsIHZhbHVlLCBleHBpcmVzLCBwYXRoLCBkb21haW4sIHNlY3VyZSkge1xuICAgICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgICBjb29raWUucHVzaChuYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNOdW1iZXIoZXhwaXJlcykpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcoZG9tYWluKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VjdXJlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llLmpvaW4oJzsgJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZChuYW1lKSB7XG4gICAgICAgICAgdmFyIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKG5ldyBSZWdFeHAoJyhefDtcXFxccyopKCcgKyBuYW1lICsgJyk9KFteO10qKScpKTtcbiAgICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKG5hbWUpIHtcbiAgICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQoKSB7IHJldHVybiBudWxsOyB9LFxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0Fic29sdXRlVVJMKHVybCkge1xuICAvLyBBIFVSTCBpcyBjb25zaWRlcmVkIGFic29sdXRlIGlmIGl0IGJlZ2lucyB3aXRoIFwiPHNjaGVtZT46Ly9cIiBvciBcIi8vXCIgKHByb3RvY29sLXJlbGF0aXZlIFVSTCkuXG4gIC8vIFJGQyAzOTg2IGRlZmluZXMgc2NoZW1lIG5hbWUgYXMgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIGJlZ2lubmluZyB3aXRoIGEgbGV0dGVyIGFuZCBmb2xsb3dlZFxuICAvLyBieSBhbnkgY29tYmluYXRpb24gb2YgbGV0dGVycywgZGlnaXRzLCBwbHVzLCBwZXJpb2QsIG9yIGh5cGhlbi5cbiAgcmV0dXJuIC9eKFthLXpdW2EtelxcZCtcXC0uXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgc3BlY2lmaWVkIFVSTHNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGl2ZVVSTCBUaGUgcmVsYXRpdmUgVVJMXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgVVJMXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVsYXRpdmVVUkwpIHtcbiAgcmV0dXJuIHJlbGF0aXZlVVJMXG4gICAgPyBiYXNlVVJMLnJlcGxhY2UoL1xcLyskLywgJycpICsgJy8nICsgcmVsYXRpdmVVUkwucmVwbGFjZSgvXlxcLysvLCAnJylcbiAgICA6IGJhc2VVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBYnNvbHV0ZVVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgYmFzZVVSTCB3aXRoIHRoZSByZXF1ZXN0ZWRVUkwsXG4gKiBvbmx5IHdoZW4gdGhlIHJlcXVlc3RlZFVSTCBpcyBub3QgYWxyZWFkeSBhbiBhYnNvbHV0ZSBVUkwuXG4gKiBJZiB0aGUgcmVxdWVzdFVSTCBpcyBhYnNvbHV0ZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSByZXF1ZXN0ZWRVUkwgdW50b3VjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RlZFVSTCBBYnNvbHV0ZSBvciByZWxhdGl2ZSBVUkwgdG8gY29tYmluZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIGZ1bGwgcGF0aFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkRnVsbFBhdGgoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKSB7XG4gIGlmIChiYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKHJlcXVlc3RlZFVSTCkpIHtcbiAgICByZXR1cm4gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKTtcbiAgfVxuICByZXR1cm4gcmVxdWVzdGVkVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgdmFyIG1zaWUgPSAvKG1zaWV8dHJpZGVudCkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgdmFyIG9yaWdpblVSTDtcblxuICAgICAgLyoqXG4gICAgKiBQYXJzZSBhIFVSTCB0byBkaXNjb3ZlciBpdCdzIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcGFyc2VkXG4gICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICovXG4gICAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgICB2YXIgaHJlZiA9IHVybDtcblxuICAgICAgICBpZiAobXNpZSkge1xuICAgICAgICAvLyBJRSBuZWVkcyBhdHRyaWJ1dGUgc2V0IHR3aWNlIHRvIG5vcm1hbGl6ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgICAgaHJlZiA9IHVybFBhcnNpbmdOb2RlLmhyZWY7XG4gICAgICAgIH1cblxuICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgICAvLyB1cmxQYXJzaW5nTm9kZSBwcm92aWRlcyB0aGUgVXJsVXRpbHMgaW50ZXJmYWNlIC0gaHR0cDovL3VybC5zcGVjLndoYXR3Zy5vcmcvI3VybHV0aWxzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgICBwcm90b2NvbDogdXJsUGFyc2luZ05vZGUucHJvdG9jb2wgPyB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3Q6IHVybFBhcnNpbmdOb2RlLmhvc3QsXG4gICAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhhc2g6IHVybFBhcnNpbmdOb2RlLmhhc2ggPyB1cmxQYXJzaW5nTm9kZS5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdG5hbWU6IHVybFBhcnNpbmdOb2RlLmhvc3RuYW1lLFxuICAgICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgICAgcGF0aG5hbWU6ICh1cmxQYXJzaW5nTm9kZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgP1xuICAgICAgICAgICAgdXJsUGFyc2luZ05vZGUucGF0aG5hbWUgOlxuICAgICAgICAgICAgJy8nICsgdXJsUGFyc2luZ05vZGUucGF0aG5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgb3JpZ2luVVJMID0gcmVzb2x2ZVVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAgIC8qKlxuICAgICogRGV0ZXJtaW5lIGlmIGEgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgbG9jYXRpb25cbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gcmVxdWVzdFVSTCBUaGUgVVJMIHRvIHRlc3RcbiAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luLCBvdGhlcndpc2UgZmFsc2VcbiAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICAgIHZhciBwYXJzZWQgPSAodXRpbHMuaXNTdHJpbmcocmVxdWVzdFVSTCkpID8gcmVzb2x2ZVVSTChyZXF1ZXN0VVJMKSA6IHJlcXVlc3RVUkw7XG4gICAgICAgIHJldHVybiAocGFyc2VkLnByb3RvY29sID09PSBvcmlnaW5VUkwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgIHBhcnNlZC5ob3N0ID09PSBvcmlnaW5VUkwuaG9zdCk7XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudnMgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgYENhbmNlbGAgaXMgYW4gb2JqZWN0IHRoYXQgaXMgdGhyb3duIHdoZW4gYW4gb3BlcmF0aW9uIGlzIGNhbmNlbGVkLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmc9fSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBDYW5jZWwobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxuXG5DYW5jZWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiAnQ2FuY2VsJyArICh0aGlzLm1lc3NhZ2UgPyAnOiAnICsgdGhpcy5tZXNzYWdlIDogJycpO1xufTtcblxuQ2FuY2VsLnByb3RvdHlwZS5fX0NBTkNFTF9fID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcbnZhciB0cmFuc2l0aW9uYWxEZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzL3RyYW5zaXRpb25hbCcpO1xudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9DYW5jZWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuICAgIHZhciByZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgIHZhciBvbkNhbmNlbGVkO1xuICAgIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi51bnN1YnNjcmliZShvbkNhbmNlbGVkKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbmZpZy5zaWduYWwpIHtcbiAgICAgICAgY29uZmlnLnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIG9uQ2FuY2VsZWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkID8gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpZy5hdXRoLnBhc3N3b3JkKSkgOiAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgZnVuY3Rpb24gb25sb2FkZW5kKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIXJlc3BvbnNlVHlwZSB8fCByZXNwb25zZVR5cGUgPT09ICd0ZXh0JyB8fCAgcmVzcG9uc2VUeXBlID09PSAnanNvbicgP1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUoZnVuY3Rpb24gX3Jlc29sdmUodmFsdWUpIHtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0sIGZ1bmN0aW9uIF9yZWplY3QoZXJyKSB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICgnb25sb2FkZW5kJyBpbiByZXF1ZXN0KSB7XG4gICAgICAvLyBVc2Ugb25sb2FkZW5kIGlmIGF2YWlsYWJsZVxuICAgICAgcmVxdWVzdC5vbmxvYWRlbmQgPSBvbmxvYWRlbmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGUgdG8gZW11bGF0ZSBvbmxvYWRlbmRcbiAgICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyByZWFkeXN0YXRlIGhhbmRsZXIgaXMgY2FsbGluZyBiZWZvcmUgb25lcnJvciBvciBvbnRpbWVvdXQgaGFuZGxlcnMsXG4gICAgICAgIC8vIHNvIHdlIHNob3VsZCBjYWxsIG9ubG9hZGVuZCBvbiB0aGUgbmV4dCAndGljaydcbiAgICAgICAgc2V0VGltZW91dChvbmxvYWRlbmQpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dCA/ICd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCcgOiAndGltZW91dCBleGNlZWRlZCc7XG4gICAgICB2YXIgdHJhbnNpdGlvbmFsID0gY29uZmlnLnRyYW5zaXRpb25hbCB8fCB0cmFuc2l0aW9uYWxEZWZhdWx0cztcbiAgICAgIGlmIChjb25maWcudGltZW91dEVycm9yTWVzc2FnZSkge1xuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2U7XG4gICAgICB9XG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UsXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgdHJhbnNpdGlvbmFsLmNsYXJpZnlUaW1lb3V0RXJyb3IgPyAnRVRJTUVET1VUJyA6ICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKHJlc3BvbnNlVHlwZSAmJiByZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4gfHwgY29uZmlnLnNpZ25hbCkge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgICAgIG9uQ2FuY2VsZWQgPSBmdW5jdGlvbihjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJlamVjdCghY2FuY2VsIHx8IChjYW5jZWwgJiYgY2FuY2VsLnR5cGUpID8gbmV3IENhbmNlbCgnY2FuY2VsZWQnKSA6IGNhbmNlbCk7XG4gICAgICAgIHJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9O1xuXG4gICAgICBjb25maWcuY2FuY2VsVG9rZW4gJiYgY29uZmlnLmNhbmNlbFRva2VuLnN1YnNjcmliZShvbkNhbmNlbGVkKTtcbiAgICAgIGlmIChjb25maWcuc2lnbmFsKSB7XG4gICAgICAgIGNvbmZpZy5zaWduYWwuYWJvcnRlZCA/IG9uQ2FuY2VsZWQoKSA6IGNvbmZpZy5zaWduYWwuYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBvbkNhbmNlbGVkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXJlcXVlc3REYXRhKSB7XG4gICAgICByZXF1ZXN0RGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdFxuICAgIHJlcXVlc3Quc2VuZChyZXF1ZXN0RGF0YSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBub3JtYWxpemVIZWFkZXJOYW1lID0gcmVxdWlyZSgnLi4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9lbmhhbmNlRXJyb3InKTtcbnZhciB0cmFuc2l0aW9uYWxEZWZhdWx0cyA9IHJlcXVpcmUoJy4vdHJhbnNpdGlvbmFsJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4uL2FkYXB0ZXJzL3hocicpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgIC8vIEZvciBub2RlIHVzZSBIVFRQIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi4vYWRhcHRlcnMvaHR0cCcpO1xuICB9XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnlTYWZlbHkocmF3VmFsdWUsIHBhcnNlciwgZW5jb2Rlcikge1xuICBpZiAodXRpbHMuaXNTdHJpbmcocmF3VmFsdWUpKSB7XG4gICAgdHJ5IHtcbiAgICAgIChwYXJzZXIgfHwgSlNPTi5wYXJzZSkocmF3VmFsdWUpO1xuICAgICAgcmV0dXJuIHV0aWxzLnRyaW0ocmF3VmFsdWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLm5hbWUgIT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gKGVuY29kZXIgfHwgSlNPTi5zdHJpbmdpZnkpKHJhd1ZhbHVlKTtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXG4gIHRyYW5zaXRpb25hbDogdHJhbnNpdGlvbmFsRGVmYXVsdHMsXG5cbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSB8fCAoaGVhZGVycyAmJiBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICByZXR1cm4gc3RyaW5naWZ5U2FmZWx5KGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdHJhbnNmb3JtUmVzcG9uc2U6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXNwb25zZShkYXRhKSB7XG4gICAgdmFyIHRyYW5zaXRpb25hbCA9IHRoaXMudHJhbnNpdGlvbmFsIHx8IGRlZmF1bHRzLnRyYW5zaXRpb25hbDtcbiAgICB2YXIgc2lsZW50SlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLnNpbGVudEpTT05QYXJzaW5nO1xuICAgIHZhciBmb3JjZWRKU09OUGFyc2luZyA9IHRyYW5zaXRpb25hbCAmJiB0cmFuc2l0aW9uYWwuZm9yY2VkSlNPTlBhcnNpbmc7XG4gICAgdmFyIHN0cmljdEpTT05QYXJzaW5nID0gIXNpbGVudEpTT05QYXJzaW5nICYmIHRoaXMucmVzcG9uc2VUeXBlID09PSAnanNvbic7XG5cbiAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcgfHwgKGZvcmNlZEpTT05QYXJzaW5nICYmIHV0aWxzLmlzU3RyaW5nKGRhdGEpICYmIGRhdGEubGVuZ3RoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChzdHJpY3RKU09OUGFyc2luZykge1xuICAgICAgICAgIGlmIChlLm5hbWUgPT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgICAgIHRocm93IGVuaGFuY2VFcnJvcihlLCB0aGlzLCAnRV9KU09OX1BBUlNFJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH0sXG5cbiAgaGVhZGVyczoge1xuICAgIGNvbW1vbjoge1xuICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gICAgfVxuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgdmFyIGNvbnRleHQgPSB0aGlzIHx8IGRlZmF1bHRzO1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbi5jYWxsKGNvbnRleHQsIGRhdGEsIGhlYWRlcnMpO1xuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHRyYW5zZm9ybURhdGEgPSByZXF1aXJlKCcuL3RyYW5zZm9ybURhdGEnKTtcbnZhciBpc0NhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9pc0NhbmNlbCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvQ2FuY2VsJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cblxuICBpZiAoY29uZmlnLnNpZ25hbCAmJiBjb25maWcuc2lnbmFsLmFib3J0ZWQpIHtcbiAgICB0aHJvdyBuZXcgQ2FuY2VsKCdjYW5jZWxlZCcpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICBjb25maWcsXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgIGNvbmZpZyxcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICAgICAgY29uZmlnLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8qKlxuICogQ29uZmlnLXNwZWNpZmljIG1lcmdlLWZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29uZmlnLW9iamVjdFxuICogYnkgbWVyZ2luZyB0d28gY29uZmlndXJhdGlvbiBvYmplY3RzIHRvZ2V0aGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcxXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMlxuICogQHJldHVybnMge09iamVjdH0gTmV3IG9iamVjdCByZXN1bHRpbmcgZnJvbSBtZXJnaW5nIGNvbmZpZzIgdG8gY29uZmlnMVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKGNvbmZpZzEsIGNvbmZpZzIpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGNvbmZpZzIgPSBjb25maWcyIHx8IHt9O1xuICB2YXIgY29uZmlnID0ge307XG5cbiAgZnVuY3Rpb24gZ2V0TWVyZ2VkVmFsdWUodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBpZiAodXRpbHMuaXNQbGFpbk9iamVjdCh0YXJnZXQpICYmIHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHt9LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gc291cmNlLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gbWVyZ2VEZWVwUHJvcGVydGllcyhwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gdmFsdWVGcm9tQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXG4gIGZ1bmN0aW9uIGRlZmF1bHRUb0NvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gbWVyZ2VEaXJlY3RLZXlzKHByb3ApIHtcbiAgICBpZiAocHJvcCBpbiBjb25maWcyKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmIChwcm9wIGluIGNvbmZpZzEpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIHZhciBtZXJnZU1hcCA9IHtcbiAgICAndXJsJzogdmFsdWVGcm9tQ29uZmlnMixcbiAgICAnbWV0aG9kJzogdmFsdWVGcm9tQ29uZmlnMixcbiAgICAnZGF0YSc6IHZhbHVlRnJvbUNvbmZpZzIsXG4gICAgJ2Jhc2VVUkwnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc2Zvcm1SZXF1ZXN0JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndHJhbnNmb3JtUmVzcG9uc2UnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdwYXJhbXNTZXJpYWxpemVyJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndGltZW91dCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RpbWVvdXRNZXNzYWdlJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnd2l0aENyZWRlbnRpYWxzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnYWRhcHRlcic6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3Jlc3BvbnNlVHlwZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3hzcmZDb29raWVOYW1lJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAneHNyZkhlYWRlck5hbWUnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdvblVwbG9hZFByb2dyZXNzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnb25Eb3dubG9hZFByb2dyZXNzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnZGVjb21wcmVzcyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ21heENvbnRlbnRMZW5ndGgnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdtYXhCb2R5TGVuZ3RoJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndHJhbnNwb3J0JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnaHR0cEFnZW50JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnaHR0cHNBZ2VudCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ2NhbmNlbFRva2VuJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnc29ja2V0UGF0aCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3Jlc3BvbnNlRW5jb2RpbmcnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd2YWxpZGF0ZVN0YXR1cyc6IG1lcmdlRGlyZWN0S2V5c1xuICB9O1xuXG4gIHV0aWxzLmZvckVhY2goT2JqZWN0LmtleXMoY29uZmlnMSkuY29uY2F0KE9iamVjdC5rZXlzKGNvbmZpZzIpKSwgZnVuY3Rpb24gY29tcHV0ZUNvbmZpZ1ZhbHVlKHByb3ApIHtcbiAgICB2YXIgbWVyZ2UgPSBtZXJnZU1hcFtwcm9wXSB8fCBtZXJnZURlZXBQcm9wZXJ0aWVzO1xuICAgIHZhciBjb25maWdWYWx1ZSA9IG1lcmdlKHByb3ApO1xuICAgICh1dGlscy5pc1VuZGVmaW5lZChjb25maWdWYWx1ZSkgJiYgbWVyZ2UgIT09IG1lcmdlRGlyZWN0S2V5cykgfHwgKGNvbmZpZ1twcm9wXSA9IGNvbmZpZ1ZhbHVlKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4yNi4xXCJcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVkVSU0lPTiA9IHJlcXVpcmUoJy4uL2Vudi9kYXRhJykudmVyc2lvbjtcblxudmFyIHZhbGlkYXRvcnMgPSB7fTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcblsnb2JqZWN0JywgJ2Jvb2xlYW4nLCAnbnVtYmVyJywgJ2Z1bmN0aW9uJywgJ3N0cmluZycsICdzeW1ib2wnXS5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUsIGkpIHtcbiAgdmFsaWRhdG9yc1t0eXBlXSA9IGZ1bmN0aW9uIHZhbGlkYXRvcih0aGluZykge1xuICAgIHJldHVybiB0eXBlb2YgdGhpbmcgPT09IHR5cGUgfHwgJ2EnICsgKGkgPCAxID8gJ24gJyA6ICcgJykgKyB0eXBlO1xuICB9O1xufSk7XG5cbnZhciBkZXByZWNhdGVkV2FybmluZ3MgPSB7fTtcblxuLyoqXG4gKiBUcmFuc2l0aW9uYWwgb3B0aW9uIHZhbGlkYXRvclxuICogQHBhcmFtIHtmdW5jdGlvbnxib29sZWFuP30gdmFsaWRhdG9yIC0gc2V0IHRvIGZhbHNlIGlmIHRoZSB0cmFuc2l0aW9uYWwgb3B0aW9uIGhhcyBiZWVuIHJlbW92ZWRcbiAqIEBwYXJhbSB7c3RyaW5nP30gdmVyc2lvbiAtIGRlcHJlY2F0ZWQgdmVyc2lvbiAvIHJlbW92ZWQgc2luY2UgdmVyc2lvblxuICogQHBhcmFtIHtzdHJpbmc/fSBtZXNzYWdlIC0gc29tZSBtZXNzYWdlIHdpdGggYWRkaXRpb25hbCBpbmZvXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259XG4gKi9cbnZhbGlkYXRvcnMudHJhbnNpdGlvbmFsID0gZnVuY3Rpb24gdHJhbnNpdGlvbmFsKHZhbGlkYXRvciwgdmVyc2lvbiwgbWVzc2FnZSkge1xuICBmdW5jdGlvbiBmb3JtYXRNZXNzYWdlKG9wdCwgZGVzYykge1xuICAgIHJldHVybiAnW0F4aW9zIHYnICsgVkVSU0lPTiArICddIFRyYW5zaXRpb25hbCBvcHRpb24gXFwnJyArIG9wdCArICdcXCcnICsgZGVzYyArIChtZXNzYWdlID8gJy4gJyArIG1lc3NhZ2UgOiAnJyk7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUsIG9wdCwgb3B0cykge1xuICAgIGlmICh2YWxpZGF0b3IgPT09IGZhbHNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZm9ybWF0TWVzc2FnZShvcHQsICcgaGFzIGJlZW4gcmVtb3ZlZCcgKyAodmVyc2lvbiA/ICcgaW4gJyArIHZlcnNpb24gOiAnJykpKTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiAmJiAhZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0pIHtcbiAgICAgIGRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdID0gdHJ1ZTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdE1lc3NhZ2UoXG4gICAgICAgICAgb3B0LFxuICAgICAgICAgICcgaGFzIGJlZW4gZGVwcmVjYXRlZCBzaW5jZSB2JyArIHZlcnNpb24gKyAnIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIG5lYXIgZnV0dXJlJ1xuICAgICAgICApXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB2YWxpZGF0b3IgPyB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0cykgOiB0cnVlO1xuICB9O1xufTtcblxuLyoqXG4gKiBBc3NlcnQgb2JqZWN0J3MgcHJvcGVydGllcyB0eXBlXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtvYmplY3R9IHNjaGVtYVxuICogQHBhcmFtIHtib29sZWFuP30gYWxsb3dVbmtub3duXG4gKi9cblxuZnVuY3Rpb24gYXNzZXJ0T3B0aW9ucyhvcHRpb25zLCBzY2hlbWEsIGFsbG93VW5rbm93bikge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9ucyBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICB9XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob3B0aW9ucyk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0gPiAwKSB7XG4gICAgdmFyIG9wdCA9IGtleXNbaV07XG4gICAgdmFyIHZhbGlkYXRvciA9IHNjaGVtYVtvcHRdO1xuICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgIHZhciB2YWx1ZSA9IG9wdGlvbnNbb3B0XTtcbiAgICAgIHZhciByZXN1bHQgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRpb25zKTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uICcgKyBvcHQgKyAnIG11c3QgYmUgJyArIHJlc3VsdCk7XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGFsbG93VW5rbm93biAhPT0gdHJ1ZSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1Vua25vd24gb3B0aW9uICcgKyBvcHQpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXNzZXJ0T3B0aW9uczogYXNzZXJ0T3B0aW9ucyxcbiAgdmFsaWRhdG9yczogdmFsaWRhdG9yc1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vbWVyZ2VDb25maWcnKTtcbnZhciB2YWxpZGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3ZhbGlkYXRvcicpO1xuXG52YXIgdmFsaWRhdG9ycyA9IHZhbGlkYXRvci52YWxpZGF0b3JzO1xuLyoqXG4gKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQXhpb3MoaW5zdGFuY2VDb25maWcpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IGluc3RhbmNlQ29uZmlnO1xuICB0aGlzLmludGVyY2VwdG9ycyA9IHtcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKVxuICB9O1xufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyBzcGVjaWZpYyBmb3IgdGhpcyByZXF1ZXN0IChtZXJnZWQgd2l0aCB0aGlzLmRlZmF1bHRzKVxuICovXG5BeGlvcy5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnT3JVcmwsIGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZ09yVXJsID09PSAnc3RyaW5nJykge1xuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgICBjb25maWcudXJsID0gY29uZmlnT3JVcmw7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnT3JVcmwgfHwge307XG4gIH1cblxuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gIC8vIFNldCBjb25maWcubWV0aG9kXG4gIGlmIChjb25maWcubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRzLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSB0aGlzLmRlZmF1bHRzLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZy5tZXRob2QgPSAnZ2V0JztcbiAgfVxuXG4gIHZhciB0cmFuc2l0aW9uYWwgPSBjb25maWcudHJhbnNpdGlvbmFsO1xuXG4gIGlmICh0cmFuc2l0aW9uYWwgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhbGlkYXRvci5hc3NlcnRPcHRpb25zKHRyYW5zaXRpb25hbCwge1xuICAgICAgc2lsZW50SlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiksXG4gICAgICBmb3JjZWRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuKSxcbiAgICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbilcbiAgICB9LCBmYWxzZSk7XG4gIH1cblxuICAvLyBmaWx0ZXIgb3V0IHNraXBwZWQgaW50ZXJjZXB0b3JzXG4gIHZhciByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB2YXIgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gdHJ1ZTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgaWYgKHR5cGVvZiBpbnRlcmNlcHRvci5ydW5XaGVuID09PSAnZnVuY3Rpb24nICYmIGludGVyY2VwdG9yLnJ1bldoZW4oY29uZmlnKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgJiYgaW50ZXJjZXB0b3Iuc3luY2hyb25vdXM7XG5cbiAgICByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciBwcm9taXNlO1xuXG4gIGlmICghc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzKSB7XG4gICAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcblxuICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmFwcGx5KGNoYWluLCByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbik7XG4gICAgY2hhaW4gPSBjaGFpbi5jb25jYXQocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluKTtcblxuICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcbiAgICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cblxuICB2YXIgbmV3Q29uZmlnID0gY29uZmlnO1xuICB3aGlsZSAocmVxdWVzdEludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgdmFyIG9uRnVsZmlsbGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB2YXIgb25SZWplY3RlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdHJ5IHtcbiAgICAgIG5ld0NvbmZpZyA9IG9uRnVsZmlsbGVkKG5ld0NvbmZpZyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG9uUmVqZWN0ZWQoZXJyb3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICBwcm9taXNlID0gZGlzcGF0Y2hSZXF1ZXN0KG5ld0NvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxuXG4gIHdoaWxlIChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSwgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5BeGlvcy5wcm90b3R5cGUuZ2V0VXJpID0gZnVuY3Rpb24gZ2V0VXJpKGNvbmZpZykge1xuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuICByZXR1cm4gYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLnJlcGxhY2UoL15cXD8vLCAnJyk7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiAoY29uZmlnIHx8IHt9KS5kYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcblxuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICB0aGlzLnByb21pc2UudGhlbihmdW5jdGlvbihjYW5jZWwpIHtcbiAgICBpZiAoIXRva2VuLl9saXN0ZW5lcnMpIHJldHVybjtcblxuICAgIHZhciBpO1xuICAgIHZhciBsID0gdG9rZW4uX2xpc3RlbmVycy5sZW5ndGg7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0b2tlbi5fbGlzdGVuZXJzW2ldKGNhbmNlbCk7XG4gICAgfVxuICAgIHRva2VuLl9saXN0ZW5lcnMgPSBudWxsO1xuICB9KTtcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICB0aGlzLnByb21pc2UudGhlbiA9IGZ1bmN0aW9uKG9uZnVsZmlsbGVkKSB7XG4gICAgdmFyIF9yZXNvbHZlO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICB0b2tlbi5zdWJzY3JpYmUocmVzb2x2ZSk7XG4gICAgICBfcmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgfSkudGhlbihvbmZ1bGZpbGxlZCk7XG5cbiAgICBwcm9taXNlLmNhbmNlbCA9IGZ1bmN0aW9uIHJlamVjdCgpIHtcbiAgICAgIHRva2VuLnVuc3Vic2NyaWJlKF9yZXNvbHZlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH07XG5cbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogU3Vic2NyaWJlIHRvIHRoZSBjYW5jZWwgc2lnbmFsXG4gKi9cblxuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uIHN1YnNjcmliZShsaXN0ZW5lcikge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICBsaXN0ZW5lcih0aGlzLnJlYXNvbik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHRoaXMuX2xpc3RlbmVycykge1xuICAgIHRoaXMuX2xpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMgPSBbbGlzdGVuZXJdO1xuICB9XG59O1xuXG4vKipcbiAqIFVuc3Vic2NyaWJlIGZyb20gdGhlIGNhbmNlbCBzaWduYWxcbiAqL1xuXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiB1bnN1YnNjcmliZShsaXN0ZW5lcikge1xuICBpZiAoIXRoaXMuX2xpc3RlbmVycykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgaW5kZXggPSB0aGlzLl9saXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcik7XG4gIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGEgbmV3IGBDYW5jZWxUb2tlbmAgYW5kIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsXG4gKiBjYW5jZWxzIHRoZSBgQ2FuY2VsVG9rZW5gLlxuICovXG5DYW5jZWxUb2tlbi5zb3VyY2UgPSBmdW5jdGlvbiBzb3VyY2UoKSB7XG4gIHZhciBjYW5jZWw7XG4gIHZhciB0b2tlbiA9IG5ldyBDYW5jZWxUb2tlbihmdW5jdGlvbiBleGVjdXRvcihjKSB7XG4gICAgY2FuY2VsID0gYztcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgdG9rZW46IHRva2VuLFxuICAgIGNhbmNlbDogY2FuY2VsXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbFRva2VuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFN5bnRhY3RpYyBzdWdhciBmb3IgaW52b2tpbmcgYSBmdW5jdGlvbiBhbmQgZXhwYW5kaW5nIGFuIGFycmF5IGZvciBhcmd1bWVudHMuXG4gKlxuICogQ29tbW9uIHVzZSBjYXNlIHdvdWxkIGJlIHRvIHVzZSBgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5YC5cbiAqXG4gKiAgYGBganNcbiAqICBmdW5jdGlvbiBmKHgsIHksIHopIHt9XG4gKiAgdmFyIGFyZ3MgPSBbMSwgMiwgM107XG4gKiAgZi5hcHBseShudWxsLCBhcmdzKTtcbiAqICBgYGBcbiAqXG4gKiBXaXRoIGBzcHJlYWRgIHRoaXMgZXhhbXBsZSBjYW4gYmUgcmUtd3JpdHRlbi5cbiAqXG4gKiAgYGBganNcbiAqICBzcHJlYWQoZnVuY3Rpb24oeCwgeSwgeikge30pKFsxLCAyLCAzXSk7XG4gKiAgYGBgXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzcHJlYWQoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoYXJyKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFycik7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvc1xuICpcbiAqIEBwYXJhbSB7Kn0gcGF5bG9hZCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0F4aW9zRXJyb3IocGF5bG9hZCkge1xuICByZXR1cm4gdXRpbHMuaXNPYmplY3QocGF5bG9hZCkgJiYgKHBheWxvYWQuaXNBeGlvc0Vycm9yID09PSB0cnVlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9jb3JlL21lcmdlQ29uZmlnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgLy8gRmFjdG9yeSBmb3IgY3JlYXRpbmcgbmV3IGluc3RhbmNlc1xuICBpbnN0YW5jZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgICByZXR1cm4gY3JlYXRlSW5zdGFuY2UobWVyZ2VDb25maWcoZGVmYXVsdENvbmZpZywgaW5zdGFuY2VDb25maWcpKTtcbiAgfTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEV4cG9zZSBDYW5jZWwgJiBDYW5jZWxUb2tlblxuYXhpb3MuQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsJyk7XG5heGlvcy5DYW5jZWxUb2tlbiA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbFRva2VuJyk7XG5heGlvcy5pc0NhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL2lzQ2FuY2VsJyk7XG5heGlvcy5WRVJTSU9OID0gcmVxdWlyZSgnLi9lbnYvZGF0YScpLnZlcnNpb247XG5cbi8vIEV4cG9zZSBhbGwvc3ByZWFkXG5heGlvcy5hbGwgPSBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbn07XG5heGlvcy5zcHJlYWQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3ByZWFkJyk7XG5cbi8vIEV4cG9zZSBpc0F4aW9zRXJyb3JcbmF4aW9zLmlzQXhpb3NFcnJvciA9IHJlcXVpcmUoJy4vaGVscGVycy9pc0F4aW9zRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2F4aW9zJyk7IiwidmFyIF9fYXdhaXRlciA9XG4gICAgKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8XG4gICAgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgICAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUFxuICAgICAgICAgICAgICAgID8gdmFsdWVcbiAgICAgICAgICAgICAgICA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ZXAoZ2VuZXJhdG9yWyd0aHJvdyddKHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuZG9uZVxuICAgICAgICAgICAgICAgICAgICA/IHJlc29sdmUocmVzdWx0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0ZXAoXG4gICAgICAgICAgICAgICAgKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9O1xuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcbi8qKlxuICogT2F1dGggU3RvcmFnZSBLZXlzXG4gKiBAZW51bVxuICovXG5leHBvcnQgdmFyIE9hdXRoU3RvcmFnZUtleXM7XG4oZnVuY3Rpb24gKE9hdXRoU3RvcmFnZUtleXMpIHtcbiAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICBPYXV0aFN0b3JhZ2VLZXlzWydBY2Nlc3NUb2tlbktleSddID0gJ2FjY2Vzc190b2tlbic7XG4gICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgT2F1dGhTdG9yYWdlS2V5c1snUmVmcmVzaFRva2VuS2V5J10gPSAncmVmcmVzaF90b2tlbic7XG4gICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgT2F1dGhTdG9yYWdlS2V5c1snQWNjZXNzU2NvcGVLZXknXSA9ICdzY29wZSc7XG4gICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgT2F1dGhTdG9yYWdlS2V5c1snVG9rZW5UeXBlS2V5J10gPSAndG9rZW5fdHlwZSc7XG4gICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgT2F1dGhTdG9yYWdlS2V5c1snRXhwaXJlc0luS2V5J10gPSAnZXhwaXJlc19pbic7XG4gICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgT2F1dGhTdG9yYWdlS2V5c1snQ3VycmVudFN0YXRlS2V5J10gPSAnY3VycmVudF9zdGF0ZSc7XG59KShPYXV0aFN0b3JhZ2VLZXlzIHx8IChPYXV0aFN0b3JhZ2VLZXlzID0ge30pKTtcbmV4cG9ydCBjbGFzcyBPYXV0aFN0b3JhZ2Uge1xuICAgIGdldChrZXkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGxvY2FsU3RvcmFnZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2Vzc2lvblN0b3JhZ2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgbGV0IGRhdGEgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKG51bGwpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgc2V0KGtleSwgdmFsdWUsIHRlbXBvcmFyeSA9IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAodGVtcG9yYXJ5KSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzZXNzaW9uU3RvcmFnZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBsb2NhbFN0b3JhZ2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVtb3ZlKGtleSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbG9jYWxTdG9yYWdlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNlc3Npb25TdG9yYWdlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNsZWFyQWxsKHRlbXBvcmFyeSA9IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBsb2NhbFN0b3JhZ2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLmNsZWFyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGVtcG9yYXJ5ICYmIHR5cGVvZiBzZXNzaW9uU3RvcmFnZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5jbGVhcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4vKipDb21tb24gRnVuY3Rpb25zKi9cbmV4cG9ydCBjbGFzcyBPYXV0aFV0aWxzIHtcbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0b2tlbiBpcyBhIEpXVCB0b2tlbiBhbmQgcmV0dXJuIGNsYWltcyBpZiBzb1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKiAqL1xuICAgIHN0YXRpYyBwYXJzZUpXVCh0b2tlbikge1xuICAgICAgICBsZXQgc3BsaXQgPSB0b2tlbi5zcGxpdCgnLicpO1xuICAgICAgICByZXR1cm4gc3BsaXQgJiYgc3BsaXQubGVuZ3RoID09IDNcbiAgICAgICAgICAgID8gQnVmZmVyLmZyb20oc3BsaXRbMV0pLnRvU3RyaW5nKCdiYXNlNjQnKVxuICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBKV1QgVG9rZW4gaGFzIGV4cGlyZWRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdG9rZW5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgICAqICovXG4gICAgc3RhdGljIGhhc0pXVEV4cGlyZWQodG9rZW4pIHtcbiAgICAgICAgbGV0IGRhdGEgPSB0aGlzLnBhcnNlSnNvbih0aGlzLnBhcnNlSldUKHRva2VuKSk7XG4gICAgICAgIGxldCBleHAgPSBkYXRhID8gZGF0YVsnZXhwJ10gOiBudWxsO1xuICAgICAgICByZXR1cm4gZXhwID8gcGFyc2VJbnQoZXhwKSA8IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApICsgMTAgOiB0cnVlOyAvLyArIDEwIHRvIGFjY291bnQgZm9yIGFueSBuZXR3b3JrIGxhdGVuY3lcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGEgc2FmZSBmb3JtIG9mIHN0cmluZyB0byBzdG9yZSxcbiAgICAgKiBlbGltaW5hdGluZyBudWxsIGFuZCAndW5kZWZpbmVkJ1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBpdGVtXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqICovXG4gICAgc3RhdGljIHNhZmVTdHJpbmcoaXRlbSkge1xuICAgICAgICBpZiAoT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoaXRlbSkpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGEgc2FmZSBmb3JtIG9mIHN0SW50cmluZyB0byBzdG9yZSxcbiAgICAgKiBlbGltaW5hdGluZyBudWxsIGFuZCAndW5kZWZpbmVkJ1xuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpdGVtXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqICovXG4gICAgc3RhdGljIHNhZmVJbnQoaXRlbSkge1xuICAgICAgICBpZiAoT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoaXRlbSkpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBpdGVtIGlzIG51dCBudWxsLCB1bmRlZmluZWQgb3IgZW1wdHlcbiAgICAgKiBlbGltaW5hdGluZyBudWxsIGFuZCAndW5kZWZpbmVkJ1xuICAgICAqIEBwYXJhbSB7YW55fSBpdGVtXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICAgKiAqL1xuICAgIHN0YXRpYyBhc3NlcnRBdmFpbGFibGUoaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbSAhPSBudWxsICYmIHR5cGVvZiBpdGVtICE9PSAndW5kZWZpbmVkJyAmJiBpdGVtICE9PSAnJztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ291bnQgT2JqZWN0IGFycmF5XG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9ialxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKiAqL1xuICAgIHN0YXRpYyBjb3VudChvYmopIHtcbiAgICAgICAgbGV0IGVsZW1lbnRfY291bnQgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IGkgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudF9jb3VudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbGVtZW50X2NvdW50O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNZXJnZSBPYmplY3Qgd2l0aCBhbm90aGVyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9ialxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzcmNcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAqL1xuICAgIHN0YXRpYyBtZXJnZU9iaihvYmosIHNyYykge1xuICAgICAgICBPYmplY3Qua2V5cyhzcmMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKHNyYy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgICAgICAgICBvYmoucHVzaChzcmNba2V5XSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqW3RoaXMuY291bnQob2JqKV0gPSBzcmNba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICAvKipFbmNvZGUgT2JqZWN0IGNvbnRlbnQgdG8gdXJsIHN0cmluZ1xuICAgICAqICBAcGFyYW0ge09iamVjdH0gbXlEYXRhIE9iamVjdFxuICAgICAqICBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICogKi9cbiAgICBzdGF0aWMgdXJsRW5jb2RlT2JqZWN0KG15RGF0YSkge1xuICAgICAgICBjb25zdCBlbmNvZGVPYmogPSAoZGF0YSwga2V5LCBwYXJlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVuY29kZWQgPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc3ViS2V5IGluIGRhdGFba2V5XSkge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhW2tleV0uaGFzT3duUHJvcGVydHkoc3ViS2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2tleV1bc3ViS2V5XSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGRhdGFba2V5XVtzdWJLZXldICE9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgZGF0YVtrZXldW3N1YktleV0gPT09ICdvYmplY3QnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkuaXNBcnJheShkYXRhW2tleV1bc3ViS2V5XSlcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIG9iamVjdCBvciBhcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BhcmVudCA9IHBhcmVudCArICdbJyArIHN1YktleSArICddJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lcmdlT2JqKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGVPYmooZGF0YVtrZXldLCBzdWJLZXksIG5ld1BhcmVudClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGVkLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudCArICdbJyArIHN1YktleSArICddJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc9JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGVVUklDb21wb25lbnQoZGF0YVtrZXldW3N1YktleV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlbmNvZGVkO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBlbmNvZGVEYXRhID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVuY29kZWQgPSBbXTtcbiAgICAgICAgICAgIGlmIChkYXRhICE9PSBudWxsICYmIHR5cGVvZiBkYXRhID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBkYXRhW2tleV0gIT09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBkYXRhW2tleV0gPT09ICdvYmplY3QnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LmlzQXJyYXkoZGF0YVtrZXldKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBvYmplY3Qgb3IgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXJnZU9iaihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGVPYmooZGF0YSwga2V5LCBrZXkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2RlZC5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5ICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGRhdGFba2V5XSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZW5jb2RlZDtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgb3V0ID0gZW5jb2RlRGF0YShteURhdGEpO1xuICAgICAgICBpZiAob3V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBvdXQuam9pbignJicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKiBQYXJzZSBKc29uIHN0cmluZyB0byBvYmplY3RcbiAgICAgKiAgQHBhcmFtIHtTdHJpbmd9IGpzb24gc3RyaW5nXG4gICAgICogIEByZXR1cm4ge2FueX1cbiAgICAgKiAgKi9cbiAgICBzdGF0aWMgcGFyc2VKc29uKGpzb24pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGpzb24pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgVXJsIHBhcmFtXG4gICAgICogI3NvdXJjZSBodHRwOi8vd3d3Lm5ldGxvYm8uY29tL3VybF9xdWVyeV9zdHJpbmdfamF2YXNjcmlwdC5odG1sXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRVcmxQYXJhbShuYW1lLCB1cmwpIHtcbiAgICAgICAgaWYgKCF1cmwgJiYgdHlwZW9mIGxvY2F0aW9uICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdXJsID0gbG9jYXRpb24uaHJlZjtcbiAgICAgICAgfVxuICAgICAgICB1cmwgPSBkZWNvZGVVUklDb21wb25lbnQodXJsKTtcbiAgICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW10vLCAnXFxcXFsnKS5yZXBsYWNlKC9bXFxdXS8sICdcXFxcXScpO1xuICAgICAgICBjb25zdCByZWdleFMgPSAnW1xcXFw/Jl0nICsgbmFtZSArICc9KFteJiNdKiknO1xuICAgICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAocmVnZXhTKTtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHMgPT0gbnVsbCA/IG51bGwgOiByZXN1bHRzWzFdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdXJsIHdpdGhvdXQgaXQncyB1cmwgcGFyYW1ldGVyc1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVXJsIHRvIHN0cmlwXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqICovXG4gICAgc3RhdGljIHN0cmlwVXJsUGFyYW1zKHVybCkge1xuICAgICAgICBpZiAoT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUodXJsKSkge1xuICAgICAgICAgICAgcmV0dXJuIHVybC5zcGxpdCgnPycpWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBSYW5kb20gdmFsdWVcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqICovXG4gICAgc3RhdGljIGdlbmVyYXRlS2V5KGxlbmd0aCkge1xuICAgICAgICBpZiAoIU9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKGxlbmd0aCkpIHtcbiAgICAgICAgICAgIGxlbmd0aCA9IDE2O1xuICAgICAgICB9XG4gICAgICAgIGxldCB0ZXh0ID0gJyc7XG4gICAgICAgIGNvbnN0IHBvc3NpYmxlID1cbiAgICAgICAgICAgICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRleHQgKz0gcG9zc2libGUuY2hhckF0KFxuICAgICAgICAgICAgICAgIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlLmxlbmd0aClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIE9hdXRoIHtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhLmNsaWVudElkIC0gWW91ciBBcHBsaWNhdGlvbidzIENsaWVudCBJRFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhLmNsaWVudFNlY3JldCAtIFlvdXIgQXBwbGljYXRpb24ncyBDbGllbnQgU2VjcmV0XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGRhdGEuYXV0aG9yaXplVXJsIC0gW0dFVF0gVXJsIGVuZHBvaW50IHRvIGF1dGhvcml6ZSBvciByZXF1ZXN0IGFjY2Vzc1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhLnRva2VuVXJsIC0gVXJsIGVuZHBvaW50IHRvIG9idGFpbiB0b2tlblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhLnZlcmlmeVRva2VuVXJsIC0gW0dFVF0gVXJsIGVuZHBvaW50IHRvIHZlcmlmeSB0b2tlblxuICAgICAqIEBwYXJhbSB7T2F1dGhTdG9yYWdlSW50ZXJmYWNlPHN0cmluZz59IGRhdGEuc3RvcmFnZSAtIEhhbmRsZSBjdXN0b20gc3RvcmFnZSAtIERlZmF1bHQgc3RvcmFnZSA9IGJyb3dzZXIgbG9jYWxTdG9yYWdlIG9yIHNlc3Npb25TdG9yYWdlXG4gICAgICogKi9cbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgICAgIGlmIChPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShkYXRhLmNsaWVudElkKSkge1xuICAgICAgICAgICAgdGhpcy5jbGllbnRJZCA9IGRhdGEuY2xpZW50SWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCInY2xpZW50SWQnIFJlcXVpcmVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShkYXRhLmNsaWVudFNlY3JldCkpIHtcbiAgICAgICAgICAgIHRoaXMuY2xpZW50U2VjcmV0ID0gZGF0YS5jbGllbnRTZWNyZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCInY2xpZW50U2VjcmV0JyBSZXF1aXJlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoZGF0YS5hdXRob3JpemVVcmwpKSB7XG4gICAgICAgICAgICB0aGlzLmF1dGhvcml6ZVVybCA9IGRhdGEuYXV0aG9yaXplVXJsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiJ2F1dGhvcml6ZVVybCcgIFJlcXVpcmVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShkYXRhLnRva2VuVXJsKSkge1xuICAgICAgICAgICAgdGhpcy50b2tlblVybCA9IGRhdGEudG9rZW5Vcmw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIndG9rZW5VcmwnIFJlcXVpcmVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShkYXRhLnZlcmlmeVRva2VuVXJsKSkge1xuICAgICAgICAgICAgdGhpcy52ZXJpZnlUb2tlblVybCA9IGRhdGEudmVyaWZ5VG9rZW5Vcmw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKGRhdGEuc3RvcmFnZSkpIHtcbiAgICAgICAgICAgIE9hdXRoLl9zdG9yYWdlID0gZGF0YS5zdG9yYWdlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgc3RvcmFnZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0b3JhZ2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNhdmUgQWNjZXNzIGRhdGEgdG8gTG9jYWwgc3RvcmFnZVxuICAgICAqIEBwYXJhbSB7T2F1dGhUb2tlblJlc3BvbnNlfSBhY2Nlc3NEYXRhXG4gICAgICogKi9cbiAgICBzYXZlQWNjZXNzKGFjY2Vzc0RhdGEpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAgICAgT2F1dGguc3RvcmFnZS5zZXQoXG4gICAgICAgICAgICAgICAgICAgIE9hdXRoU3RvcmFnZUtleXMuQWNjZXNzVG9rZW5LZXksXG4gICAgICAgICAgICAgICAgICAgIE9hdXRoVXRpbHMuc2FmZVN0cmluZyhhY2Nlc3NEYXRhLmFjY2Vzc1Rva2VuKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgT2F1dGguc3RvcmFnZS5zZXQoXG4gICAgICAgICAgICAgICAgICAgIE9hdXRoU3RvcmFnZUtleXMuUmVmcmVzaFRva2VuS2V5LFxuICAgICAgICAgICAgICAgICAgICBPYXV0aFV0aWxzLnNhZmVTdHJpbmcoYWNjZXNzRGF0YS5yZWZyZXNoVG9rZW4pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBPYXV0aC5zdG9yYWdlLnNldChcbiAgICAgICAgICAgICAgICAgICAgT2F1dGhTdG9yYWdlS2V5cy5BY2Nlc3NTY29wZUtleSxcbiAgICAgICAgICAgICAgICAgICAgT2F1dGhVdGlscy5zYWZlU3RyaW5nKGFjY2Vzc0RhdGEuYWNjZXNzU2NvcGUpXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBPYXV0aC5zdG9yYWdlLnNldChcbiAgICAgICAgICAgICAgICAgICAgT2F1dGhTdG9yYWdlS2V5cy5Ub2tlblR5cGVLZXksXG4gICAgICAgICAgICAgICAgICAgIE9hdXRoVXRpbHMuc2FmZVN0cmluZyhhY2Nlc3NEYXRhLnRva2VuVHlwZSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIE9hdXRoLnN0b3JhZ2Uuc2V0KFxuICAgICAgICAgICAgICAgICAgICBPYXV0aFN0b3JhZ2VLZXlzLkV4cGlyZXNJbktleSxcbiAgICAgICAgICAgICAgICAgICAgU3RyaW5nKFxuICAgICAgICAgICAgICAgICAgICAgICAgT2F1dGhVdGlscy5zYWZlSW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApICsgYWNjZXNzRGF0YS5leHBpcmVzSW5cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKkNsZWFyIGFsbCBhY2Nlc3MgZGF0YSBmcm9tIHNlc3Npb24qL1xuICAgIGNsZWFyQWNjZXNzKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgICAgIE9hdXRoLnN0b3JhZ2UucmVtb3ZlKE9hdXRoU3RvcmFnZUtleXMuQWNjZXNzVG9rZW5LZXkpLFxuICAgICAgICAgICAgICAgIE9hdXRoLnN0b3JhZ2UucmVtb3ZlKE9hdXRoU3RvcmFnZUtleXMuUmVmcmVzaFRva2VuS2V5KSxcbiAgICAgICAgICAgICAgICBPYXV0aC5zdG9yYWdlLnJlbW92ZShPYXV0aFN0b3JhZ2VLZXlzLkFjY2Vzc1Njb3BlS2V5KSxcbiAgICAgICAgICAgICAgICBPYXV0aC5zdG9yYWdlLnJlbW92ZShPYXV0aFN0b3JhZ2VLZXlzLlRva2VuVHlwZUtleSksXG4gICAgICAgICAgICAgICAgT2F1dGguc3RvcmFnZS5yZW1vdmUoT2F1dGhTdG9yYWdlS2V5cy5FeHBpcmVzSW5LZXkpLFxuICAgICAgICAgICAgICAgIE9hdXRoLnN0b3JhZ2UucmVtb3ZlKE9hdXRoU3RvcmFnZUtleXMuQ3VycmVudFN0YXRlS2V5KSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQXV0aG9yaXplIEFjY2VzcyB0byB0aGUgYXBwXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xuICAgICAqIEBwYXJhbSB7T2F1dGhHcmFudFR5cGV9IHBhcmFtcy5ncmFudF90eXBlIERlZmF1bHQgLSBjbGllbnRfY3JlZGVudGlhbHMgZ3JhbnRUeXBlXG4gICAgICogQHBhcmFtIHtPYXV0aEdyYW50VHlwZVtdfSBwYXJhbXMuYWxsb3dlZF9ncmFudF90eXBlcyBncmFudF90eXBlKHMpIHRvIGlnbm9yZSBpZiB7T2F1dGhHcmFudFR5cGUuQXV0b30gc2VsZWN0ZWRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGFyYW1zLnJlZGlyZWN0X3VyaSBGb3IgYXV0aG9yaXphdGlvbl9jb2RlIGdyYW50X3R5cGUgZGVmYXVsdCAtPiBjdXJyZW50IHVybFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwYXJhbXMudXNlcl9pZCBGb3IgYXV0aG9yaXphdGlvbl9jb2RlIGdyYW50X3R5cGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGFyYW1zLnVzZXJuYW1lIEZvciBwYXNzd29yZCBncmFudF90eXBlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmFtcy5wYXNzd29yZCBGb3IgcGFzc3dvcmQgZ3JhbnRfdHlwZVxuICAgICAqIEBwYXJhbSB7KHRva2VuOiBzdHJpbmcgfCBib29sZWFuLCBtc2c/OiBzdHJpbmcpPT52b2lkfSBwYXJhbXMuY2FsbGJhY2tcbiAgICAgKiAqL1xuICAgIGF1dGhvcml6ZUFjY2VzcyhwYXJhbXMpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGxldCBncmFudF90eXBlID0gT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUocGFyYW1zLmdyYW50X3R5cGUpXG4gICAgICAgICAgICAgICAgPyBwYXJhbXMuZ3JhbnRfdHlwZVxuICAgICAgICAgICAgICAgIDogT2F1dGhHcmFudFR5cGUuQ2xpZW50X0NyZWRlbnRpYWxzO1xuICAgICAgICAgICAgY29uc3QgYWxsb3dlZF9ncmFudF90eXBlcyA9IE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKFxuICAgICAgICAgICAgICAgIHBhcmFtcy5hbGxvd2VkX2dyYW50X3R5cGVzXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgPyBwYXJhbXMuYWxsb3dlZF9ncmFudF90eXBlc1xuICAgICAgICAgICAgICAgIDogW107XG4gICAgICAgICAgICBjb25zdCByZWRpcmVjdF91cmkgPSBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShwYXJhbXMucmVkaXJlY3RfdXJpKVxuICAgICAgICAgICAgICAgID8gcGFyYW1zLnJlZGlyZWN0X3VyaVxuICAgICAgICAgICAgICAgIDogT2F1dGhVdGlscy5zdHJpcFVybFBhcmFtcyhcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICA/IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBudWxsXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3Qgc2NvcGUgPSBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShwYXJhbXMuc2NvcGUpXG4gICAgICAgICAgICAgICAgPyBwYXJhbXMuc2NvcGVcbiAgICAgICAgICAgICAgICA6IFtdO1xuICAgICAgICAgICAgbGV0IHN0YXRlID0gT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUocGFyYW1zLnN0YXRlKVxuICAgICAgICAgICAgICAgID8gcGFyYW1zLnN0YXRlXG4gICAgICAgICAgICAgICAgOiBPYXV0aFV0aWxzLmdlbmVyYXRlS2V5KDMyKTtcbiAgICAgICAgICAgIC8qKkdldCBOZXcgVG9rZW5cbiAgICAgICAgICAgICAqICovXG4gICAgICAgICAgICBjb25zdCBnZXROZXdPYXV0aFRva2VuID0gKCkgPT5cbiAgICAgICAgICAgICAgICBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoZ3JhbnRfdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBPYXV0aEdyYW50VHlwZS5BdXRvOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUocGFyYW1zLnVzZXJfaWQpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2F1dGhVdGlscy5nZXRVcmxQYXJhbSgnY29kZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgYXV0aG9yaXphdGlvbiBjb2RlIGV4aXN0cyBpbiB1cmwgcGFyYW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JhbnRfdHlwZSA9IE9hdXRoR3JhbnRUeXBlLkF1dGhvcml6YXRpb25fQ29kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFsbG93ZWRfZ3JhbnRfdHlwZXMuaW5jbHVkZXMoZ3JhbnRfdHlwZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldE5ld09hdXRoVG9rZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jYWxsYmFjayhmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShwYXJhbXMudXNlcm5hbWUpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHBhcmFtcy5wYXNzd29yZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JhbnRfdHlwZSA9IE9hdXRoR3JhbnRUeXBlLlVzZXJfQ3JlZGVudGlhbHM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbGxvd2VkX2dyYW50X3R5cGVzLmluY2x1ZGVzKGdyYW50X3R5cGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXROZXdPYXV0aFRva2VuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY2FsbGJhY2soZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JhbnRfdHlwZSA9IE9hdXRoR3JhbnRUeXBlLkNsaWVudF9DcmVkZW50aWFscztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFsbG93ZWRfZ3JhbnRfdHlwZXMuaW5jbHVkZXMoZ3JhbnRfdHlwZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldE5ld09hdXRoVG9rZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jYWxsYmFjayhmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIE9hdXRoR3JhbnRUeXBlLkF1dGhvcml6YXRpb25fQ29kZTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2RlID0gT2F1dGhVdGlscy5nZXRVcmxQYXJhbSgnY29kZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gT2F1dGhVdGlscy5nZXRVcmxQYXJhbSgnZXJyb3InKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvcl9kZXNjcmlwdGlvbiA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoVXRpbHMuZ2V0VXJsUGFyYW0oJ2Vycm9yX2Rlc2NyaXB0aW9uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKGNvZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNhdmVfc3RhdGUgPSB5aWVsZCBPYXV0aC5zdG9yYWdlLmdldChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoU3RvcmFnZUtleXMuQ3VycmVudFN0YXRlS2V5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlID0gT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoc2F2ZV9zdGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gc2F2ZV9zdGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBzdGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXRlID09PSBPYXV0aFV0aWxzLmdldFVybFBhcmFtKCdzdGF0ZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2F1dGhUb2tlbldpdGhBdXRob3JpemF0aW9uQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZGlyZWN0X3VyaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBBamF4IFJlc3BvbnNlIGNhbGxiYWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHtPYXV0aFRva2VuUmVzcG9uc2V9IHRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodG9rZW4pID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9fYXdhaXRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuLmFjY2Vzc1Rva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIG9hdXRoIHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aC5zdG9yYWdlLnJlbW92ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFN0b3JhZ2VLZXlzLkN1cnJlbnRTdGF0ZUtleVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNhdmUgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMuc2F2ZUFjY2VzcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgcGFyYW1zLmNhbGxiYWNrID09PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jYWxsYmFjayhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgT2F1dGguc3RvcmFnZS5nZXQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFN0b3JhZ2VLZXlzLkFjY2Vzc1Rva2VuS2V5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGF1dGhvcml6YXRpb24gY29kZSBmcm9tIHVybFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiB3aW5kb3cgIT09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFV0aWxzLnN0cmlwVXJsUGFyYW1zKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmxvY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmhyZWZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbi5lcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgcGFyYW1zLmNhbGxiYWNrID09PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jYWxsYmFjayhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuLmVycm9yRGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBwYXJhbXMuY2FsbGJhY2sgPT09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNhbGxiYWNrKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgcGFyYW1zLmNhbGxiYWNrID09PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jYWxsYmFjayhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW1zLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNhbGxiYWNrKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhaWxlZCBhdXRob3JpemUgYWNjZXNzLiBDU1JGIFZlcmlmaWNhdGlvbiBGYWlsZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoZXJyb3IpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBvYXV0aCBzdGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aC5zdG9yYWdlLnJlbW92ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoU3RvcmFnZUtleXMuQ3VycmVudFN0YXRlS2V5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yX2Rlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJhbXMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY2FsbGJhY2soXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcl9kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhcmFtcy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jYWxsYmFjayhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdGYWlsZWQgYXV0aG9yaXplIGFjY2VzcydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2V0IGF1dGhvcml6YXRpb24gY29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9hdXRoQXV0aG9yaXplKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWRpcmVjdF91cmksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMudXNlcl9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBPYXV0aEdyYW50VHlwZS5Vc2VyX0NyZWRlbnRpYWxzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdldCB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2F1dGhUb2tlbldpdGhVc2VyQ3JlZGVudGlhbHMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy51c2VybmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLnBhc3N3b3JkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIEFqYXggUmVzcG9uc2UgY2FsbGJhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHtPYXV0aFRva2VuUmVzcG9uc2V9IHRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0b2tlbikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9fYXdhaXRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuLmFjY2Vzc1Rva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2F2ZSB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMuc2F2ZUFjY2VzcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHBhcmFtcy5jYWxsYmFjayA9PT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY2FsbGJhY2soXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBPYXV0aC5zdG9yYWdlLmdldChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFN0b3JhZ2VLZXlzLkFjY2Vzc1Rva2VuS2V5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW4uZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBwYXJhbXMuY2FsbGJhY2sgPT09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNhbGxiYWNrKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbi5lcnJvckRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBwYXJhbXMuY2FsbGJhY2sgPT09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHBhcmFtcy5jYWxsYmFjayA9PT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY2FsbGJhY2soZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIE9hdXRoR3JhbnRUeXBlLkNsaWVudF9DcmVkZW50aWFsczpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vYXV0aFRva2VuV2l0aENsaWVudENyZWRlbnRpYWxzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIEFqYXggUmVzcG9uc2UgY2FsbGJhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHtPYXV0aFRva2VuUmVzcG9uc2V9IHRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0b2tlbikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9fYXdhaXRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuLmFjY2Vzc1Rva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2F2ZSB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMuc2F2ZUFjY2VzcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHBhcmFtcy5jYWxsYmFjayA9PT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY2FsbGJhY2soXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBPYXV0aC5zdG9yYWdlLmdldChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFN0b3JhZ2VLZXlzLkFjY2Vzc1Rva2VuS2V5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW4uZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBwYXJhbXMuY2FsbGJhY2sgPT09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNhbGxiYWNrKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbi5lcnJvckRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBwYXJhbXMuY2FsbGJhY2sgPT09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHBhcmFtcy5jYWxsYmFjayA9PT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY2FsbGJhY2soZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8qKlJlZnJlc2ggRXhpc3RpbmcgVG9rZW5cbiAgICAgICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSByZWZyZXNoVG9rZW4gU3RyaW5nXG4gICAgICAgICAgICAgKiAqL1xuICAgICAgICAgICAgY29uc3QgcmVmcmVzaE9hdXRoVG9rZW4gPSAocmVmcmVzaFRva2VuKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5vYXV0aFJlZnJlc2hUb2tlbihcbiAgICAgICAgICAgICAgICAgICAgcmVmcmVzaFRva2VuLFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogQWpheCBSZXNwb25zZSBjYWxsYmFja1xuICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge09hdXRoVG9rZW5SZXNwb25zZX0gdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICogKi9cbiAgICAgICAgICAgICAgICAgICAgKHRva2VuKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZSh0b2tlbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW4uYWNjZXNzVG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTYXZlIHRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLnNhdmVBY2Nlc3ModG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJhbXMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY2FsbGJhY2soXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIE9hdXRoLnN0b3JhZ2UuZ2V0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2F1dGhTdG9yYWdlS2V5cy5BY2Nlc3NUb2tlbktleVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHRva2VuLmVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW1zLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNhbGxiYWNrKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW4uZXJyb3JEZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2xlYXIgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFyQWNjZXNzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0TmV3T2F1dGhUb2tlbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJhbXMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDbGVhciB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJBY2Nlc3MoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY2FsbGJhY2soZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJhbXMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jYWxsYmFjayhmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKFxuICAgICAgICAgICAgICAgICAgICBPYXV0aFV0aWxzLmdldFVybFBhcmFtKCdhY2Nlc3NfdG9rZW4nKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFjY2Vzc1Rva2VuID0gT2F1dGhVdGlscy5nZXRVcmxQYXJhbSgnYWNjZXNzX3Rva2VuJyk7XG4gICAgICAgICAgICAgICAgaWYgKCEoeWllbGQgdGhpcy5oYXNFeHBpcmVkKGFjY2Vzc1Rva2VuKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJhbXMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jYWxsYmFjayhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShhY2Nlc3NUb2tlbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBhY2Nlc3NUb2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhcmFtcy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWNjZXNzVG9rZW4gPSB5aWVsZCBPYXV0aC5zdG9yYWdlLmdldChcbiAgICAgICAgICAgICAgICAgICAgT2F1dGhTdG9yYWdlS2V5cy5BY2Nlc3NUb2tlbktleVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmcmVzaFRva2VuID0geWllbGQgT2F1dGguc3RvcmFnZS5nZXQoXG4gICAgICAgICAgICAgICAgICAgIE9hdXRoU3RvcmFnZUtleXMuUmVmcmVzaFRva2VuS2V5XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAvKlRva2VuIGF2YWlsYWJsZSwgY2hlY2sgZm9yIHJlZnJlc2hpbmcqL1xuICAgICAgICAgICAgICAgIGlmIChPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShhY2Nlc3NUb2tlbikpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoeWllbGQgdGhpcy5oYXNFeHBpcmVkKGFjY2Vzc1Rva2VuKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW1zLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNhbGxiYWNrKGFjY2Vzc1Rva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEV4cGlyZWQgLSBnZXQgcmVmcmVzaCB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHJlZnJlc2hUb2tlbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUcnkgUmVmcmVzaCB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZnJlc2hPYXV0aFRva2VuKHJlZnJlc2hUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vIHJlZnJlc2ggdG9rZW4gZ2V0IG5ldyB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldE5ld09hdXRoVG9rZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIHRva2VuIC0gZ2V0IG5ldyB0b2tlblxuICAgICAgICAgICAgICAgICAgICBnZXROZXdPYXV0aFRva2VuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgYXV0aG9yaXphdGlvbiBvciB0b2tlbiBoYXMgZXhwaXJlZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0b2tlblxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8Ym9vbGVhbj59XG4gICAgICogKi9cbiAgICBoYXNFeHBpcmVkKHRva2VuKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICB0b2tlbiA9XG4gICAgICAgICAgICAgICAgdG9rZW4gfHxcbiAgICAgICAgICAgICAgICAoeWllbGQgT2F1dGguc3RvcmFnZS5nZXQoT2F1dGhTdG9yYWdlS2V5cy5BY2Nlc3NUb2tlbktleSkpO1xuICAgICAgICAgICAgaWYgKE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHRva2VuKSkge1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgT2F1dGhVdGlscy5wYXJzZUpXVCh0b2tlbikgJiZcbiAgICAgICAgICAgICAgICAgICAgIU9hdXRoVXRpbHMuaGFzSldURXhwaXJlZCh0b2tlbilcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBleHBpcmVzSW4gPSB5aWVsZCBPYXV0aC5zdG9yYWdlLmdldChcbiAgICAgICAgICAgICAgICAgICAgICAgIE9hdXRoU3RvcmFnZUtleXMuRXhwaXJlc0luS2V5XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShleHBpcmVzSW4pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGV4cGlyZXNJbikgPFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApICsgMTBcbiAgICAgICAgICAgICAgICAgICAgICAgICk7IC8vICsgMTAgdG8gYWNjb3VudCBmb3IgYW55IG5ldHdvcmsgbGF0ZW5jeVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPYXV0aCBBdXRob3JpemF0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gc2NvcGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcmVkaXJlY3RfdXJsXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVzZXJfaWRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RhdGVcbiAgICAgKiBAcGFyYW0geyh1cmw6IHN0cmluZyk9PmFueX0gY2FsbGJhY2tcbiAgICAgKiAqL1xuICAgIG9hdXRoQXV0aG9yaXplKHNjb3BlLCByZWRpcmVjdF91cmwsIHVzZXJfaWQsIHN0YXRlLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoIU9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHJlZGlyZWN0X3VybCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIidyZWRpcmVjdF91cmwnIFJlcXVpcmVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIE9hdXRoLnN0b3JhZ2Uuc2V0KE9hdXRoU3RvcmFnZUtleXMuQ3VycmVudFN0YXRlS2V5LCBzdGF0ZSwgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgICAgICAgIGNsaWVudF9pZDogdGhpcy5jbGllbnRJZCxcbiAgICAgICAgICAgIHNjb3BlOiBzY29wZS5qb2luKCcgJyksXG4gICAgICAgICAgICBzdGF0ZTogc3RhdGUsXG4gICAgICAgICAgICByZXNwb25zZV90eXBlOiAnY29kZScsXG4gICAgICAgICAgICB1c2VyX2lkOiB1c2VyX2lkLFxuICAgICAgICAgICAgcmVkaXJlY3RfdXJpOiByZWRpcmVjdF91cmwsXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHVybCA9IGAke3RoaXMuYXV0aG9yaXplVXJsfT8ke09hdXRoVXRpbHMudXJsRW5jb2RlT2JqZWN0KFxuICAgICAgICAgICAgcGFyYW1zXG4gICAgICAgICl9YDtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayh1cmwpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAvLyBPcGVuIGF1dGhvcml6YXRpb24gdXJsXG4gICAgICAgICAgICB3aW5kb3cub3Blbih1cmwsICdfYmxhbmsnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBPYXV0aCBBdXRob3JpemF0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gc2NvcGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcmVkaXJlY3RfdXJsXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGVtYWlsXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0YXRlXG4gICAgICogQHBhcmFtIHsodXJsOiBzdHJpbmcpPT5hbnl9IGNhbGxiYWNrXG4gICAgICogKi9cbiAgICBvYXV0aEF1dGhvcml6ZVdpdGhFbWFpbChzY29wZSwgcmVkaXJlY3RfdXJsLCBlbWFpbCwgc3RhdGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICghT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUocmVkaXJlY3RfdXJsKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiJ3JlZGlyZWN0X3VybCcgUmVxdWlyZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgT2F1dGguc3RvcmFnZS5zZXQoT2F1dGhTdG9yYWdlS2V5cy5DdXJyZW50U3RhdGVLZXksIHN0YXRlLCB0cnVlKTtcbiAgICAgICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICAgICAgY2xpZW50X2lkOiB0aGlzLmNsaWVudElkLFxuICAgICAgICAgICAgc2NvcGU6IHNjb3BlLmpvaW4oJyAnKSxcbiAgICAgICAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgICAgICAgIHJlc3BvbnNlX3R5cGU6ICdjb2RlJyxcbiAgICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICAgIHJlZGlyZWN0X3VyaTogcmVkaXJlY3RfdXJsLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB1cmwgPSBgJHt0aGlzLmF1dGhvcml6ZVVybH0/JHtPYXV0aFV0aWxzLnVybEVuY29kZU9iamVjdChcbiAgICAgICAgICAgIHBhcmFtc1xuICAgICAgICApfWA7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2sodXJsKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgLy8gT3BlbiBhdXRob3JpemF0aW9uIHVybFxuICAgICAgICAgICAgd2luZG93Lm9wZW4odXJsLCAnX2JsYW5rJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogT2F1dGggQXV0aG9yaXphdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHNjb3BlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJlZGlyZWN0X3VybFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1c2VyX2lkXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0YXRlXG4gICAgICogQHBhcmFtIHsodXJsOiBzdHJpbmcpPT5hbnl9IGNhbGxiYWNrXG4gICAgICogKi9cbiAgICBvYXV0aEF1dGhvcml6ZUltcGxpY2l0KHNjb3BlLCByZWRpcmVjdF91cmwsIHVzZXJfaWQsIHN0YXRlLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoIU9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHJlZGlyZWN0X3VybCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIidyZWRpcmVjdF91cmwnIFJlcXVpcmVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoc2NvcGUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCInc2NvcGUnIFJlcXVpcmVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIE9hdXRoLnN0b3JhZ2Uuc2V0KE9hdXRoU3RvcmFnZUtleXMuQ3VycmVudFN0YXRlS2V5LCBzdGF0ZSwgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgICAgICAgIGNsaWVudF9pZDogdGhpcy5jbGllbnRJZCxcbiAgICAgICAgICAgIHNjb3BlOiBzY29wZS5qb2luKCcgJyksXG4gICAgICAgICAgICBzdGF0ZTogc3RhdGUsXG4gICAgICAgICAgICByZXNwb25zZV90eXBlOiAndG9rZW4nLFxuICAgICAgICAgICAgdXNlcl9pZDogdXNlcl9pZCxcbiAgICAgICAgICAgIHJlZGlyZWN0X3VyaTogcmVkaXJlY3RfdXJsLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB1cmwgPSBgJHt0aGlzLmF1dGhvcml6ZVVybH0/JHtPYXV0aFV0aWxzLnVybEVuY29kZU9iamVjdChcbiAgICAgICAgICAgIHBhcmFtc1xuICAgICAgICApfWA7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2sodXJsKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgLy8gT3BlbiBhdXRob3JpemF0aW9uIHVybFxuICAgICAgICAgICAgd2luZG93Lm9wZW4odXJsLCAnX2JsYW5rJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IG9hdXRoIHRva2VuIHdpdGggQ2xpZW50IGNyZWRlbnRpYWxzXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gc2NvcGVcbiAgICAgKiBAcGFyYW0geyh2ZXJpZnk6IE9hdXRoVG9rZW5SZXNwb25zZSk9PmFueX0gY2FsbGJhY2tcbiAgICAgKiAqL1xuICAgIG9hdXRoVG9rZW5XaXRoQ2xpZW50Q3JlZGVudGlhbHMoc2NvcGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIE9hdXRoUmVxdWVzdC5wb3N0KHtcbiAgICAgICAgICAgIHVybDogdGhpcy50b2tlblVybCxcbiAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgIGdyYW50X3R5cGU6IE9hdXRoR3JhbnRUeXBlLkNsaWVudF9DcmVkZW50aWFscyxcbiAgICAgICAgICAgICAgICBjbGllbnRfaWQ6IHRoaXMuY2xpZW50SWQsXG4gICAgICAgICAgICAgICAgY2xpZW50X3NlY3JldDogdGhpcy5jbGllbnRTZWNyZXQsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHNjb3BlLmpvaW4oJyAnKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdWNjZXNzOiAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhuZXcgT2F1dGhUb2tlblJlc3BvbnNlKHJlc3VsdCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYWlsOiAocmVzdWx0LCByZWFzb24pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBPYXV0aFRva2VuUmVzcG9uc2UocmVzdWx0KSwgcmVhc29uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IG9hdXRoIHRva2VuIHdpdGggQ2xpZW50IGNyZWRlbnRpYWxzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVzZXJuYW1lXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhc3N3b3JkXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gc2NvcGVcbiAgICAgKiBAcGFyYW0geyh2ZXJpZnk6IE9hdXRoVG9rZW5SZXNwb25zZSk9PmFueX0gY2FsbGJhY2tcbiAgICAgKiAqL1xuICAgIG9hdXRoVG9rZW5XaXRoVXNlckNyZWRlbnRpYWxzKHVzZXJuYW1lLCBwYXNzd29yZCwgc2NvcGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICghT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUodXNlcm5hbWUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIndXNlcm5hbWUnIFJlcXVpcmVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUocGFzc3dvcmQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIncGFzc3dvcmQnIFJlcXVpcmVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIE9hdXRoUmVxdWVzdC5wb3N0KHtcbiAgICAgICAgICAgIHVybDogdGhpcy50b2tlblVybCxcbiAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgIGdyYW50X3R5cGU6IE9hdXRoR3JhbnRUeXBlLlVzZXJfQ3JlZGVudGlhbHMsXG4gICAgICAgICAgICAgICAgY2xpZW50X2lkOiB0aGlzLmNsaWVudElkLFxuICAgICAgICAgICAgICAgIGNsaWVudF9zZWNyZXQ6IHRoaXMuY2xpZW50U2VjcmV0LFxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHNjb3BlLmpvaW4oJyAnKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdWNjZXNzOiAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhuZXcgT2F1dGhUb2tlblJlc3BvbnNlKHJlc3VsdCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYWlsOiAocmVzdWx0LCByZWFzb24pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBPYXV0aFRva2VuUmVzcG9uc2UocmVzdWx0KSwgcmVhc29uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqR2V0IG9hdXRoIHRva2VuIHdpdGggQ2xpZW50IGNyZWRlbnRpYWxzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNvZGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcmVkaXJlY3RfdXJpXG4gICAgICogQHBhcmFtIHsodmVyaWZ5OiBPYXV0aFRva2VuUmVzcG9uc2UpPT5hbnl9IGNhbGxiYWNrXG4gICAgICogKi9cbiAgICBvYXV0aFRva2VuV2l0aEF1dGhvcml6YXRpb25Db2RlKGNvZGUsIHJlZGlyZWN0X3VyaSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKCFPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZShjb2RlKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiJ2NvZGUnIFJlcXVpcmVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUocmVkaXJlY3RfdXJpKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiJ3JlZGlyZWN0X3VyaScgUmVxdWlyZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgT2F1dGhSZXF1ZXN0LnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiB0aGlzLnRva2VuVXJsLFxuICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgZ3JhbnRfdHlwZTogT2F1dGhHcmFudFR5cGUuQXV0aG9yaXphdGlvbl9Db2RlLFxuICAgICAgICAgICAgICAgIGNvZGU6IGNvZGUsXG4gICAgICAgICAgICAgICAgcmVkaXJlY3RfdXJpOiByZWRpcmVjdF91cmksXG4gICAgICAgICAgICAgICAgY2xpZW50X2lkOiB0aGlzLmNsaWVudElkLFxuICAgICAgICAgICAgICAgIGNsaWVudF9zZWNyZXQ6IHRoaXMuY2xpZW50U2VjcmV0LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBPYXV0aFRva2VuUmVzcG9uc2UocmVzdWx0KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhaWw6IChyZXN1bHQsIHJlYXNvbikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobmV3IE9hdXRoVG9rZW5SZXNwb25zZShyZXN1bHQpLCByZWFzb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipHZXQgb2F1dGggUmVmcmVzaCBUb2tlbiB3aXRoXG4gICAgICogQ2xpZW50IGNyZWRlbnRpYWxzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJlZnJlc2hfdG9rZW5cbiAgICAgKiBAcGFyYW0geyh2ZXJpZnk6IE9hdXRoVG9rZW5SZXNwb25zZSk9PmFueX0gY2FsbGJhY2tcbiAgICAgKiAqL1xuICAgIG9hdXRoUmVmcmVzaFRva2VuKHJlZnJlc2hfdG9rZW4sIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICghT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUocmVmcmVzaF90b2tlbikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIidyZWZyZXNoX3Rva2VuJyBSZXF1aXJlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBPYXV0aFJlcXVlc3QucG9zdCh7XG4gICAgICAgICAgICB1cmw6IHRoaXMudG9rZW5VcmwsXG4gICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICBncmFudF90eXBlOiBPYXV0aEdyYW50VHlwZS5SZWZyZXNoX1Rva2VuLFxuICAgICAgICAgICAgICAgIHJlZnJlc2hfdG9rZW46IHJlZnJlc2hfdG9rZW4sXG4gICAgICAgICAgICAgICAgY2xpZW50X2lkOiB0aGlzLmNsaWVudElkLFxuICAgICAgICAgICAgICAgIGNsaWVudF9zZWNyZXQ6IHRoaXMuY2xpZW50U2VjcmV0LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBPYXV0aFRva2VuUmVzcG9uc2UocmVzdWx0KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhaWw6IChyZXN1bHQsIHJlYXNvbikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobmV3IE9hdXRoVG9rZW5SZXNwb25zZShyZXN1bHQpLCByZWFzb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgb2F1dGggUmVmcmVzaCBUb2tlbiB3aXRoXG4gICAgICogQ2xpZW50IGNyZWRlbnRpYWxzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGFjY2Vzc190b2tlblxuICAgICAqIEBwYXJhbSB7KHZlcmlmeTogT2F1dGhWZXJpZmljYXRpb25SZXNwb25zZSwgbXNnPzogc3RyaW5nKSA9PiBhbnl9IGNhbGxiYWNrXG4gICAgICogKi9cbiAgICBvYXV0aFZlcmlmeVRva2VuKGFjY2Vzc190b2tlbiwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKCFPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZSh0aGlzLnZlcmlmeVRva2VuVXJsKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiJ3ZlcmlmeVRva2VuVXJsJyB3YXMgbm90IHNwZWNpZmllZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIU9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKGFjY2Vzc190b2tlbikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIidhY2Nlc3NfdG9rZW4nIFJlcXVpcmVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIE9hdXRoUmVxdWVzdC5nZXQoe1xuICAgICAgICAgICAgdXJsOiB0aGlzLnZlcmlmeVRva2VuVXJsLFxuICAgICAgICAgICAgd2l0aEFjY2Vzc1Rva2VuOiB0cnVlLFxuICAgICAgICAgICAgYWNjZXNzVG9rZW46IGFjY2Vzc190b2tlbixcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBPYXV0aFZlcmlmaWNhdGlvblJlc3BvbnNlKHJlc3VsdCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYWlsOiAocmVzdWx0LCByZWFzb24pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBPYXV0aFZlcmlmaWNhdGlvblJlc3BvbnNlKHJlc3VsdCksIHJlYXNvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuT2F1dGguX3N0b3JhZ2UgPSBuZXcgT2F1dGhTdG9yYWdlKCk7XG4vKipHcmFudCBUeXBlc1xuICogQGVudW1cbiAqL1xuZXhwb3J0IHZhciBPYXV0aEdyYW50VHlwZTtcbihmdW5jdGlvbiAoT2F1dGhHcmFudFR5cGUpIHtcbiAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICBPYXV0aEdyYW50VHlwZVsnQ2xpZW50X0NyZWRlbnRpYWxzJ10gPSAnY2xpZW50X2NyZWRlbnRpYWxzJztcbiAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICBPYXV0aEdyYW50VHlwZVsnQXV0aG9yaXphdGlvbl9Db2RlJ10gPSAnYXV0aG9yaXphdGlvbl9jb2RlJztcbiAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICBPYXV0aEdyYW50VHlwZVsnVXNlcl9DcmVkZW50aWFscyddID0gJ3Bhc3N3b3JkJztcbiAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICBPYXV0aEdyYW50VHlwZVsnUmVmcmVzaF9Ub2tlbiddID0gJ3JlZnJlc2hfdG9rZW4nO1xuICAgIC8qKiBAdHlwZSB7U3RyaW5nfSAqL1xuICAgIE9hdXRoR3JhbnRUeXBlWydBdXRvJ10gPSAnYXV0byc7XG59KShPYXV0aEdyYW50VHlwZSB8fCAoT2F1dGhHcmFudFR5cGUgPSB7fSkpO1xuLyoqSHR0cCBSZXF1ZXN0IE1ldGhvZFxuICogQGVudW1cbiAqL1xuZXhwb3J0IHZhciBPYXV0aFJlcXVlc3RNZXRob2Q7XG4oZnVuY3Rpb24gKE9hdXRoUmVxdWVzdE1ldGhvZCkge1xuICAgIC8qKiBAdHlwZSB7U3RyaW5nfSAqL1xuICAgIE9hdXRoUmVxdWVzdE1ldGhvZFsnR0VUJ10gPSAnZ2V0JztcbiAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICBPYXV0aFJlcXVlc3RNZXRob2RbJ1BPU1QnXSA9ICdwb3N0JztcbiAgICAvKiogQHR5cGUge1N0cmluZ30gKi9cbiAgICBPYXV0aFJlcXVlc3RNZXRob2RbJ1BVVCddID0gJ3B1dCc7XG4gICAgLyoqIEB0eXBlIHtTdHJpbmd9ICovXG4gICAgT2F1dGhSZXF1ZXN0TWV0aG9kWydERUxFVEUnXSA9ICdkZWxldGUnO1xufSkoT2F1dGhSZXF1ZXN0TWV0aG9kIHx8IChPYXV0aFJlcXVlc3RNZXRob2QgPSB7fSkpO1xuLyoqTWFrZSBPYXV0aCBIdHRwIHJlcXVlc3RzKi9cbmV4cG9ydCBjbGFzcyBPYXV0aFJlcXVlc3Qge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7T2F1dGhSZXF1ZXN0UGFyYW1zfSBkYXRhXG4gICAgICogQHBhcmFtIHtPYXV0aFJlcXVlc3RNZXRob2R9IG1ldGhvZFxuICAgICAqICovXG4gICAgY29uc3RydWN0b3IobWV0aG9kID0gT2F1dGhSZXF1ZXN0TWV0aG9kLkdFVCkge1xuICAgICAgICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgICAgdGhpcy5heGh0dHAgPSBheGlvcy5jcmVhdGUoe1xuICAgICAgICAgICAgdGltZW91dDogMjAwMDAsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipNYWtlIEdFVCBSZXF1ZXN0c1xuICAgICAqIEBwYXJhbSB7T2F1dGhSZXF1ZXN0UGFyYW1zfSBkYXRhXG4gICAgICogQHJldHVybnMge1Byb21pc2U8VD59XG4gICAgICogKi9cbiAgICBzdGF0aWMgZ2V0KGRhdGEpIHtcbiAgICAgICAgY29uc3QgaHR0cCA9IG5ldyBPYXV0aFJlcXVlc3QoT2F1dGhSZXF1ZXN0TWV0aG9kLkdFVCk7XG4gICAgICAgIHJldHVybiBodHRwLnJlcXVlc3QoZGF0YSk7XG4gICAgfVxuICAgIC8qKk1ha2UgUE9TVCBSZXF1ZXN0c1xuICAgICAqIEBwYXJhbSB7T2F1dGhSZXF1ZXN0UGFyYW1zfSBkYXRhXG4gICAgICogQHJldHVybnMge1Byb21pc2U8VD59XG4gICAgICogKi9cbiAgICBzdGF0aWMgcG9zdChkYXRhKSB7XG4gICAgICAgIGNvbnN0IGh0dHAgPSBuZXcgT2F1dGhSZXF1ZXN0KE9hdXRoUmVxdWVzdE1ldGhvZC5QT1NUKTtcbiAgICAgICAgcmV0dXJuIGh0dHAucmVxdWVzdChkYXRhKTtcbiAgICB9XG4gICAgLyoqTWFrZSBQVVQgUmVxdWVzdHNcbiAgICAgKiBAcGFyYW0ge09hdXRoUmVxdWVzdFBhcmFtc30gZGF0YVxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFQ+fVxuICAgICAqICovXG4gICAgc3RhdGljIHB1dChkYXRhKSB7XG4gICAgICAgIGNvbnN0IGh0dHAgPSBuZXcgT2F1dGhSZXF1ZXN0KE9hdXRoUmVxdWVzdE1ldGhvZC5QVVQpO1xuICAgICAgICByZXR1cm4gaHR0cC5yZXF1ZXN0KGRhdGEpO1xuICAgIH1cbiAgICAvKipNYWtlIERFTEVURSBSZXF1ZXN0c1xuICAgICAqIEBwYXJhbSB7T2F1dGhSZXF1ZXN0UGFyYW1zfSBkYXRhXG4gICAgICogQHJldHVybnMge1Byb21pc2U8VD59XG4gICAgICogKi9cbiAgICBzdGF0aWMgZGVsZXRlKGRhdGEpIHtcbiAgICAgICAgY29uc3QgaHR0cCA9IG5ldyBPYXV0aFJlcXVlc3QoT2F1dGhSZXF1ZXN0TWV0aG9kLkRFTEVURSk7XG4gICAgICAgIHJldHVybiBodHRwLnJlcXVlc3QoZGF0YSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1ha2UgSHR0cCByZXF1ZXN0c1xuICAgICAqIEBwYXJhbSB7T2F1dGhSZXF1ZXN0UGFyYW1zPFQ+fSBkYXRhXG4gICAgICogQHJldHVybnMge1Byb21pc2U8VD59XG4gICAgICovXG4gICAgcmVxdWVzdChkYXRhKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyBTZXQgb3B0aW9uc1xuICAgICAgICAgICAgbGV0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgdXJsOiBkYXRhLnVybCxcbiAgICAgICAgICAgICAgICBtZXRob2Q6IHRoaXMubWV0aG9kLFxuICAgICAgICAgICAgICAgIHBhcmFtczogZGF0YS5xdWVyeSB8fCB7fSxcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLnBhcmFtcyB8fCB7fSxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiBkYXRhLmhlYWRlcnMgfHwge30sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gQWRkIGJhc2ljIGNyZWRlbnRpYWxzIGlmIHJlcXVlc3RlZFxuICAgICAgICAgICAgaWYgKGRhdGEud2l0aENyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5hdXRoID0ge1xuICAgICAgICAgICAgICAgICAgICB1c2VybmFtZTogZGF0YS51c2VybmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6IGRhdGEucGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEFkZCBBY2Nlc3MgVG9rZW4gaWYgcmVxdWVzdGVkXG4gICAgICAgICAgICBpZiAoZGF0YS53aXRoQWNjZXNzVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmhlYWRlcnNbJ0F1dGhvcml6YXRpb24nXSA9XG4gICAgICAgICAgICAgICAgICAgIChkYXRhLmFjY2Vzc1Rva2VuVHlwZSB8fCAnQmVhcmVyJykgKyAnICcgKyBkYXRhLmFjY2Vzc1Rva2VuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUGVyZm9ybSByZXF1ZXN0XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHlpZWxkIHRoaXMuYXhodHRwLnJlcXVlc3Qob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gMjAwIHx8IHJlc3VsdC5zdGF0dXMgPT09IDIwMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5zdWNjZXNzKHJlc3VsdC5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZmFpbChyZXN1bHQuZGF0YSwgcmVzdWx0LnN0YXR1c1RleHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQuZGF0YTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGF4aW9zLmlzQXhpb3NFcnJvcihlKSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmZhaWwoZS5yZXNwb25zZS5kYXRhLCBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS5yZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZmFpbChudWxsLCBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZmFpbChudWxsLCBlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmZhaWwoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbi8qKk9hdXRoIFJlc3BvbnNlKi9cbmV4cG9ydCBjbGFzcyBPYXV0aFJlc3BvbnNlIHtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcmVzdWx0IGpzb24gcmVzdWx0XG4gICAgICogQHJldHVybnMge09hdXRoVmVyaWZpY2F0aW9uUmVzcG9uc2V9XG4gICAgICogKi9cbiAgICBzdGF0aWMgcGFyc2VWZXJpZmljYXRpb25SZXNwb25zZShyZXN1bHQpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IE9hdXRoVXRpbHMucGFyc2VKc29uKHJlc3VsdCk7XG4gICAgICAgIGNvbnN0IHZlcmlmeSA9IG5ldyBPYXV0aFZlcmlmaWNhdGlvblJlc3BvbnNlKGRhdGEpO1xuICAgICAgICBpZiAodmVyaWZ5ICYmIE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKHZlcmlmeS5zdWNjZXNzKSkge1xuICAgICAgICAgICAgcmV0dXJuIHZlcmlmeTtcbiAgICAgICAgfSBlbHNlIGlmICh2ZXJpZnkgJiYgT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUodmVyaWZ5LmVycm9yKSkge1xuICAgICAgICAgICAgcmV0dXJuIHZlcmlmeTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJlc3VsdCBqc29uIHJlc3VsdFxuICAgICAqIEByZXR1cm5zIHtPYXV0aEF1dGhvcml6YXRpb25SZXNwb25zZX1cbiAgICAgKiAqL1xuICAgIHN0YXRpYyBwYXJzZUF1dGhvcml6YXRpb25SZXNwb25zZShyZXN1bHQpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IE9hdXRoVXRpbHMucGFyc2VKc29uKHJlc3VsdCk7XG4gICAgICAgIGNvbnN0IGNvZGUgPSBuZXcgT2F1dGhBdXRob3JpemF0aW9uUmVzcG9uc2UoZGF0YSk7XG4gICAgICAgIGlmIChjb2RlICYmIE9hdXRoVXRpbHMuYXNzZXJ0QXZhaWxhYmxlKGNvZGUuY29kZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBjb2RlO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgJiYgT2F1dGhVdGlscy5hc3NlcnRBdmFpbGFibGUoY29kZS5lcnJvcikpIHtcbiAgICAgICAgICAgIHJldHVybiBjb2RlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcmVzdWx0IGpzb24gcmVzdWx0XG4gICAgICogQHJldHVybnMge09hdXRoVG9rZW5SZXNwb25zZX1cbiAgICAgKiAqL1xuICAgIHN0YXRpYyBwYXJzZVRva2VuUmVzcG9uc2UocmVzdWx0KSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBPYXV0aFV0aWxzLnBhcnNlSnNvbihyZXN1bHQpO1xuICAgICAgICBjb25zdCB0b2tlbiA9IG5ldyBPYXV0aFRva2VuUmVzcG9uc2UoZGF0YSk7XG4gICAgICAgIGlmICh0b2tlbiAmJiBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZSh0b2tlbi5hY2Nlc3NUb2tlbikpIHtcbiAgICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfSBlbHNlIGlmICh0b2tlbiAmJiBPYXV0aFV0aWxzLmFzc2VydEF2YWlsYWJsZSh0b2tlbi5lcnJvcikpIHtcbiAgICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG4vKipWZXJpZmljYXRpb24gUmVzcG9uc2UqL1xuZXhwb3J0IGNsYXNzIE9hdXRoVmVyaWZpY2F0aW9uUmVzcG9uc2Uge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xuICAgICAgICBpZiAoIWRhdGEpIHJldHVybjtcbiAgICAgICAgdGhpcy5zdWNjZXNzID0gZGF0YVsnc3VjY2VzcyddO1xuICAgICAgICB0aGlzLmVycm9yID0gZGF0YVsnZXJyb3InXTtcbiAgICAgICAgdGhpcy5lcnJvckRlc2NyaXB0aW9uID0gZGF0YVsnZXJyb3JfZGVzY3JpcHRpb24nXTtcbiAgICB9XG59XG4vKipBdXRob3JpemF0aW9uIFJlc3BvbnNlKi9cbmV4cG9ydCBjbGFzcyBPYXV0aEF1dGhvcml6YXRpb25SZXNwb25zZSB7XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgICAgIGlmICghZGF0YSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlID0gZGF0YVsnc3RhdGUnXTtcbiAgICAgICAgdGhpcy5jb2RlID0gZGF0YVsnY29kZSddO1xuICAgICAgICB0aGlzLmVycm9yID0gZGF0YVsnZXJyb3InXTtcbiAgICAgICAgdGhpcy5lcnJvckRlc2NyaXB0aW9uID0gZGF0YVsnZXJyb3JfZGVzY3JpcHRpb24nXTtcbiAgICB9XG59XG4vKipUb2tlbiBSZXNwb25zZSovXG5leHBvcnQgY2xhc3MgT2F1dGhUb2tlblJlc3BvbnNlIHtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICAgICAgaWYgKCFkYXRhKSByZXR1cm47XG4gICAgICAgIHRoaXMuYWNjZXNzVG9rZW4gPSBkYXRhWydhY2Nlc3NfdG9rZW4nXTtcbiAgICAgICAgdGhpcy5yZWZyZXNoVG9rZW4gPSBkYXRhWydyZWZyZXNoX3Rva2VuJ107XG4gICAgICAgIHRoaXMudG9rZW5UeXBlID0gZGF0YVsndG9rZW5fdHlwZSddO1xuICAgICAgICB0aGlzLmFjY2Vzc1Njb3BlID0gZGF0YVsnc2NvcGUnXTtcbiAgICAgICAgdGhpcy5leHBpcmVzSW4gPSBkYXRhWydleHBpcmVzX2luJ107XG4gICAgICAgIHRoaXMuZXJyb3IgPSBkYXRhWydlcnJvciddO1xuICAgICAgICB0aGlzLmVycm9yRGVzY3JpcHRpb24gPSBkYXRhWydlcnJvcl9kZXNjcmlwdGlvbiddO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6WyJiaW5kIiwicmVxdWlyZSQkMCIsInV0aWxzIiwiYnVpbGRVUkwiLCJJbnRlcmNlcHRvck1hbmFnZXIiLCJub3JtYWxpemVIZWFkZXJOYW1lIiwiZW5oYW5jZUVycm9yIiwiY3JlYXRlRXJyb3IiLCJzZXR0bGUiLCJjb29raWVzIiwiaXNBYnNvbHV0ZVVSTCIsImNvbWJpbmVVUkxzIiwicmVxdWlyZSQkMSIsImJ1aWxkRnVsbFBhdGgiLCJwYXJzZUhlYWRlcnMiLCJpc1VSTFNhbWVPcmlnaW4iLCJDYW5jZWwiLCJyZXF1aXJlJCQyIiwicmVxdWlyZSQkMyIsInJlcXVpcmUkJDQiLCJyZXF1aXJlJCQ1IiwicmVxdWlyZSQkNiIsInJlcXVpcmUkJDciLCJ0cmFuc2l0aW9uYWxEZWZhdWx0cyIsInJlcXVpcmUkJDgiLCJyZXF1aXJlJCQ5IiwiZGVmYXVsdHMiLCJ0cmFuc2Zvcm1EYXRhIiwiaXNDYW5jZWwiLCJkaXNwYXRjaFJlcXVlc3QiLCJtZXJnZUNvbmZpZyIsInZhbGlkYXRvcnMiLCJ2YWxpZGF0b3IiLCJBeGlvcyIsImF4aW9zIiwicmVxdWlyZSQkMTAiLCJheGlvc01vZHVsZSIsImF4aW9zXzEiLCJ0aGlzIiwiT2F1dGhTdG9yYWdlS2V5cyIsIk9hdXRoR3JhbnRUeXBlIiwiT2F1dGhSZXF1ZXN0TWV0aG9kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztFQUVBLElBQUFBLE1BQWMsR0FBRyxTQUFTLElBQUksQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFO0VBQzVDLEVBQUUsT0FBTyxTQUFTLElBQUksR0FBRztFQUN6QixJQUFJLElBQUksSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUMzQyxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0VBQzFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUM3QixLQUFLO0VBQ0wsSUFBSSxPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxF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LFNBQVMsQ0FBQyxDQUFDO0VBQ1gsS0FBSztFQUNMO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLEVBQUU7RUFDckIsUUFBUSxNQUFNLElBQUksR0FBRyxJQUFJLFlBQVksQ0FBQ0EsMEJBQWtCLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDOUQsUUFBUSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDbEMsS0FBSztFQUNMO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUU7RUFDdEIsUUFBUSxNQUFNLElBQUksR0FBRyxJQUFJLFlBQVksQ0FBQ0EsMEJBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDL0QsUUFBUSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDbEMsS0FBSztFQUNMO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLEVBQUU7RUFDckIsUUFBUSxNQUFNLElBQUksR0FBRyxJQUFJLFlBQVksQ0FBQ0EsMEJBQWtCLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDOUQsUUFBUSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDbEMsS0FBSztFQUNMO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsSUFBSSxPQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQUU7RUFDeEIsUUFBUSxNQUFNLElBQUksR0FBRyxJQUFJLFlBQVksQ0FBQ0EsMEJBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7RUFDakUsUUFBUSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDbEMsS0FBSztFQUNMO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7RUFDbEIsUUFBUSxPQUFPLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsYUFBYTtFQUM1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