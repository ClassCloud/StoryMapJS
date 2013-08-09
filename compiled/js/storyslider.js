/*!
	VCO
*/

(function (root) {
	root.VCO = {
		VERSION: '0.1',
		_originalL: root.VCO
	};
}(this));

/*	VCO.Debug
	Debug mode
================================================== */
VCO.debug = true;



/*	VCO.Bind
================================================== */
VCO.Bind = function (/*Function*/ fn, /*Object*/ obj) /*-> Object*/ {
	return function () {
		return fn.apply(obj, arguments);
	};
};



/* Trace (console.log)
================================================== */
trace = function( msg ) {
	if (VCO.debug) {
		if (window.console) {
			console.log(msg);
		} else if ( typeof( jsTrace ) != 'undefined' ) {
			jsTrace.send( msg );
		} else {
			//alert(msg);
		}
	}
}

/* **********************************************
     Begin VCO.Util.js
********************************************** */

/*	VCO.Util
	Class of utilities
================================================== */
VCO.Util = {
	
	extend: function (/*Object*/ dest) /*-> Object*/ {	// merge src properties into dest
		var sources = Array.prototype.slice.call(arguments, 1);
		for (var j = 0, len = sources.length, src; j < len; j++) {
			src = sources[j] || {};
			for (var i in src) {
				if (src.hasOwnProperty(i)) {
					dest[i] = src[i];
				}
			}
		}
		return dest;
	},
	
	setOptions: function (obj, options) {
		obj.options = VCO.Util.extend({}, obj.options, options);
		if (obj.options.uniqueid === "") {
			obj.options.uniqueid = VCO.Util.unique_ID(6);
		}
	},
	
	stamp: (function () {
		var lastId = 0, key = '_vco_id';
		return function (/*Object*/ obj) {
			obj[key] = obj[key] || ++lastId;
			return obj[key];
		};
	}()),
	
	isArray: (function () {
	    // Use compiler's own isArray when available
	    if (Array.isArray) {
	        return Array.isArray;
	    }
 
	    // Retain references to variables for performance
	    // optimization
	    var objectToStringFn = Object.prototype.toString,
	        arrayToStringResult = objectToStringFn.call([]);
 
	    return function (subject) {
	        return objectToStringFn.call(subject) === arrayToStringResult;
	    };
	}()),
	
	unique_ID: function(size, prefix) {
		
		var getRandomNumber = function(range) {
			return Math.floor(Math.random() * range);
		};

		var getRandomChar = function() {
			var chars = "abcdefghijklmnopqurstuvwxyz";
			return chars.substr( getRandomNumber(32), 1 );
		};

		var randomID = function(size) {
			var str = "";
			for(var i = 0; i < size; i++) {
				str += getRandomChar();
			}
			return str;
		};
		
		if (prefix) {
			return prefix + "-" + randomID(size);
		} else {
			return "vco-" + randomID(size);
		}
	},
	
	htmlify: function(str) {
		if (str.match(/<\s*p[^>]*>([^<]*)<\s*\/\s*p\s*>/)) {
			return str;
		} else {
			return "<p>" + str + "</p>";
		}
	},
	
	getParamString: function (obj) {
		var params = [];
		for (var i in obj) {
			if (obj.hasOwnProperty(i)) {
				params.push(i + '=' + obj[i]);
			}
		}
		return '?' + params.join('&');
	},
	
	template: function (str, data) {
		return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
			var value = data[key];
			if (!data.hasOwnProperty(key)) {
				throw new Error('No value provided for variable ' + str);
			}
			return value;
		});
	}
};

/* **********************************************
     Begin VCO.Data.js
********************************************** */

// Expects VCO to be visible in scope
;(function(VCO){
    /* Zepto v1.0-7-g579f376 - zepto event ajax - zeptojs.com/license */


    var Zepto = (function() {
      var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
        document = window.document,
        elementDisplay = {}, classCache = {},
        getComputedStyle = document.defaultView.getComputedStyle,
        cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,
        tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        rootNodeRE = /^(?:body|html)$/i,

        // special attributes that should be get/set via method calls
        methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

        adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
        table = document.createElement('table'),
        tableRow = document.createElement('tr'),
        containers = {
          'tr': document.createElement('tbody'),
          'tbody': table, 'thead': table, 'tfoot': table,
          'td': tableRow, 'th': tableRow,
          '*': document.createElement('div')
        },
        readyRE = /complete|loaded|interactive/,
        classSelectorRE = /^\.([\w-]+)$/,
        idSelectorRE = /^#([\w-]*)$/,
        tagSelectorRE = /^[\w-]+$/,
        class2type = {},
        toString = class2type.toString,
        zepto = {},
        camelize, uniq,
        tempParent = document.createElement('div')

      zepto.matches = function(element, selector) {
        if (!element || element.nodeType !== 1) return false
        var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                              element.oMatchesSelector || element.matchesSelector
        if (matchesSelector) return matchesSelector.call(element, selector)
        // fall back to performing a selector:
        var match, parent = element.parentNode, temp = !parent
        if (temp) (parent = tempParent).appendChild(element)
        match = ~zepto.qsa(parent, selector).indexOf(element)
        temp && tempParent.removeChild(element)
        return match
      }

      function type(obj) {
        return obj == null ? String(obj) :
          class2type[toString.call(obj)] || "object"
      }

      function isFunction(value) { return type(value) == "function" }
      function isWindow(obj)     { return obj != null && obj == obj.window }
      function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
      function isObject(obj)     { return type(obj) == "object" }
      function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && obj.__proto__ == Object.prototype
      }
      function isArray(value) { return value instanceof Array }
      function likeArray(obj) { return typeof obj.length == 'number' }

      function compact(array) { return filter.call(array, function(item){ return item != null }) }
      function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
      camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
      function dasherize(str) {
        return str.replace(/::/g, '/')
               .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
               .replace(/([a-z\d])([A-Z])/g, '$1_$2')
               .replace(/_/g, '-')
               .toLowerCase()
      }
      uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

      function classRE(name) {
        return name in classCache ?
          classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
      }

      function maybeAddPx(name, value) {
        return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
      }

      function defaultDisplay(nodeName) {
        var element, display
        if (!elementDisplay[nodeName]) {
          element = document.createElement(nodeName)
          document.body.appendChild(element)
          display = getComputedStyle(element, '').getPropertyValue("display")
          element.parentNode.removeChild(element)
          display == "none" && (display = "block")
          elementDisplay[nodeName] = display
        }
        return elementDisplay[nodeName]
      }

      function children(element) {
        return 'children' in element ?
          slice.call(element.children) :
          $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
      }

      // `$.zepto.fragment` takes a html string and an optional tag name
      // to generate DOM nodes nodes from the given html string.
      // The generated DOM nodes are returned as an array.
      // This function can be overriden in plugins for example to make
      // it compatible with browsers that don't support the DOM fully.
      zepto.fragment = function(html, name, properties) {
        if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
        if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
        if (!(name in containers)) name = '*'

        var nodes, dom, container = containers[name]
        container.innerHTML = '' + html
        dom = $.each(slice.call(container.childNodes), function(){
          container.removeChild(this)
        })
        if (isPlainObject(properties)) {
          nodes = $(dom)
          $.each(properties, function(key, value) {
            if (methodAttributes.indexOf(key) > -1) nodes[key](value)
            else nodes.attr(key, value)
          })
        }
        return dom
      }

      // `$.zepto.Z` swaps out the prototype of the given `dom` array
      // of nodes with `$.fn` and thus supplying all the Zepto functions
      // to the array. Note that `__proto__` is not supported on Internet
      // Explorer. This method can be overriden in plugins.
      zepto.Z = function(dom, selector) {
        dom = dom || []
        dom.__proto__ = $.fn
        dom.selector = selector || ''
        return dom
      }

      // `$.zepto.isZ` should return `true` if the given object is a Zepto
      // collection. This method can be overriden in plugins.
      zepto.isZ = function(object) {
        return object instanceof zepto.Z
      }

      // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
      // takes a CSS selector and an optional context (and handles various
      // special cases).
      // This method can be overriden in plugins.
      zepto.init = function(selector, context) {
        // If nothing given, return an empty Zepto collection
        if (!selector) return zepto.Z()
        // If a function is given, call it when the DOM is ready
        else if (isFunction(selector)) return $(document).ready(selector)
        // If a Zepto collection is given, juts return it
        else if (zepto.isZ(selector)) return selector
        else {
          var dom
          // normalize array if an array of nodes is given
          if (isArray(selector)) dom = compact(selector)
          // Wrap DOM nodes. If a plain object is given, duplicate it.
          else if (isObject(selector))
            dom = [isPlainObject(selector) ? $.extend({}, selector) : selector], selector = null
          // If it's a html fragment, create nodes from it
          else if (fragmentRE.test(selector))
            dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
          // If there's a context, create a collection on that context first, and select
          // nodes from there
          else if (context !== undefined) return $(context).find(selector)
          // And last but no least, if it's a CSS selector, use it to select nodes.
          else dom = zepto.qsa(document, selector)
          // create a new Zepto collection from the nodes found
          return zepto.Z(dom, selector)
        }
      }

      // `$` will be the base `Zepto` object. When calling this
      // function just call `$.zepto.init, which makes the implementation
      // details of selecting nodes and creating Zepto collections
      // patchable in plugins.
      $ = function(selector, context){
        return zepto.init(selector, context)
      }

      function extend(target, source, deep) {
        for (key in source)
          if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
            if (isPlainObject(source[key]) && !isPlainObject(target[key]))
              target[key] = {}
            if (isArray(source[key]) && !isArray(target[key]))
              target[key] = []
            extend(target[key], source[key], deep)
          }
          else if (source[key] !== undefined) target[key] = source[key]
      }

      // Copy all but undefined properties from one or more
      // objects to the `target` object.
      $.extend = function(target){
        var deep, args = slice.call(arguments, 1)
        if (typeof target == 'boolean') {
          deep = target
          target = args.shift()
        }
        args.forEach(function(arg){ extend(target, arg, deep) })
        return target
      }

      // `$.zepto.qsa` is Zepto's CSS selector implementation which
      // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
      // This method can be overriden in plugins.
      zepto.qsa = function(element, selector){
        var found
        return (isDocument(element) && idSelectorRE.test(selector)) ?
          ( (found = element.getElementById(RegExp.$1)) ? [found] : [] ) :
          (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
          slice.call(
            classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
            tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
            element.querySelectorAll(selector)
          )
      }

      function filtered(nodes, selector) {
        return selector == null ? $(nodes) : $(nodes).filter(selector)
      }

      $.contains = function(parent, node) {
        return parent !== node && parent.contains(node)
      }

      function funcArg(context, arg, idx, payload) {
        return isFunction(arg) ? arg.call(context, idx, payload) : arg
      }

      function setAttribute(node, name, value) {
        value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
      }

      // access className property while respecting SVGAnimatedString
      function className(node, value){
        var klass = node.className,
            svg   = klass && klass.baseVal !== undefined

        if (value === undefined) return svg ? klass.baseVal : klass
        svg ? (klass.baseVal = value) : (node.className = value)
      }

      // "true"  => true
      // "false" => false
      // "null"  => null
      // "42"    => 42
      // "42.5"  => 42.5
      // JSON    => parse if valid
      // String  => self
      function deserializeValue(value) {
        var num
        try {
          return value ?
            value == "true" ||
            ( value == "false" ? false :
              value == "null" ? null :
              !isNaN(num = Number(value)) ? num :
              /^[\[\{]/.test(value) ? $.parseJSON(value) :
              value )
            : value
        } catch(e) {
          return value
        }
      }

      $.type = type
      $.isFunction = isFunction
      $.isWindow = isWindow
      $.isArray = isArray
      $.isPlainObject = isPlainObject

      $.isEmptyObject = function(obj) {
        var name
        for (name in obj) return false
        return true
      }

      $.inArray = function(elem, array, i){
        return emptyArray.indexOf.call(array, elem, i)
      }

      $.camelCase = camelize
      $.trim = function(str) {
        return str == null ? "" : String.prototype.trim.call(str)
      }

      // plugin compatibility
      $.uuid = 0
      $.support = { }
      $.expr = { }

      $.map = function(elements, callback){
        var value, values = [], i, key
        if (likeArray(elements))
          for (i = 0; i < elements.length; i++) {
            value = callback(elements[i], i)
            if (value != null) values.push(value)
          }
        else
          for (key in elements) {
            value = callback(elements[key], key)
            if (value != null) values.push(value)
          }
        return flatten(values)
      }

      $.each = function(elements, callback){
        var i, key
        if (likeArray(elements)) {
          for (i = 0; i < elements.length; i++)
            if (callback.call(elements[i], i, elements[i]) === false) return elements
        } else {
          for (key in elements)
            if (callback.call(elements[key], key, elements[key]) === false) return elements
        }

        return elements
      }

      $.grep = function(elements, callback){
        return filter.call(elements, callback)
      }

      if (window.JSON) $.parseJSON = JSON.parse

      // Populate the class2type map
      $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
        class2type[ "[object " + name + "]" ] = name.toLowerCase()
      })

      // Define methods that will be available on all
      // Zepto collections
      $.fn = {
        // Because a collection acts like an array
        // copy over these useful array functions.
        forEach: emptyArray.forEach,
        reduce: emptyArray.reduce,
        push: emptyArray.push,
        sort: emptyArray.sort,
        indexOf: emptyArray.indexOf,
        concat: emptyArray.concat,

        // `map` and `slice` in the jQuery API work differently
        // from their array counterparts
        map: function(fn){
          return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
        },
        slice: function(){
          return $(slice.apply(this, arguments))
        },

        ready: function(callback){
          if (readyRE.test(document.readyState)) callback($)
          else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
          return this
        },
        get: function(idx){
          return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
        },
        toArray: function(){ return this.get() },
        size: function(){
          return this.length
        },
        remove: function(){
          return this.each(function(){
            if (this.parentNode != null)
              this.parentNode.removeChild(this)
          })
        },
        each: function(callback){
          emptyArray.every.call(this, function(el, idx){
            return callback.call(el, idx, el) !== false
          })
          return this
        },
        filter: function(selector){
          if (isFunction(selector)) return this.not(this.not(selector))
          return $(filter.call(this, function(element){
            return zepto.matches(element, selector)
          }))
        },
        add: function(selector,context){
          return $(uniq(this.concat($(selector,context))))
        },
        is: function(selector){
          return this.length > 0 && zepto.matches(this[0], selector)
        },
        not: function(selector){
          var nodes=[]
          if (isFunction(selector) && selector.call !== undefined)
            this.each(function(idx){
              if (!selector.call(this,idx)) nodes.push(this)
            })
          else {
            var excludes = typeof selector == 'string' ? this.filter(selector) :
              (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
            this.forEach(function(el){
              if (excludes.indexOf(el) < 0) nodes.push(el)
            })
          }
          return $(nodes)
        },
        has: function(selector){
          return this.filter(function(){
            return isObject(selector) ?
              $.contains(this, selector) :
              $(this).find(selector).size()
          })
        },
        eq: function(idx){
          return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
        },
        first: function(){
          var el = this[0]
          return el && !isObject(el) ? el : $(el)
        },
        last: function(){
          var el = this[this.length - 1]
          return el && !isObject(el) ? el : $(el)
        },
        find: function(selector){
          var result, $this = this
          if (typeof selector == 'object')
            result = $(selector).filter(function(){
              var node = this
              return emptyArray.some.call($this, function(parent){
                return $.contains(parent, node)
              })
            })
          else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
          else result = this.map(function(){ return zepto.qsa(this, selector) })
          return result
        },
        closest: function(selector, context){
          var node = this[0], collection = false
          if (typeof selector == 'object') collection = $(selector)
          while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
            node = node !== context && !isDocument(node) && node.parentNode
          return $(node)
        },
        parents: function(selector){
          var ancestors = [], nodes = this
          while (nodes.length > 0)
            nodes = $.map(nodes, function(node){
              if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
                ancestors.push(node)
                return node
              }
            })
          return filtered(ancestors, selector)
        },
        parent: function(selector){
          return filtered(uniq(this.pluck('parentNode')), selector)
        },
        children: function(selector){
          return filtered(this.map(function(){ return children(this) }), selector)
        },
        contents: function() {
          return this.map(function() { return slice.call(this.childNodes) })
        },
        siblings: function(selector){
          return filtered(this.map(function(i, el){
            return filter.call(children(el.parentNode), function(child){ return child!==el })
          }), selector)
        },
        empty: function(){
          return this.each(function(){ this.innerHTML = '' })
        },
        // `pluck` is borrowed from Prototype.js
        pluck: function(property){
          return $.map(this, function(el){ return el[property] })
        },
        show: function(){
          return this.each(function(){
            this.style.display == "none" && (this.style.display = null)
            if (getComputedStyle(this, '').getPropertyValue("display") == "none")
              this.style.display = defaultDisplay(this.nodeName)
          })
        },
        replaceWith: function(newContent){
          return this.before(newContent).remove()
        },
        wrap: function(structure){
          var func = isFunction(structure)
          if (this[0] && !func)
            var dom   = $(structure).get(0),
                clone = dom.parentNode || this.length > 1

          return this.each(function(index){
            $(this).wrapAll(
              func ? structure.call(this, index) :
                clone ? dom.cloneNode(true) : dom
            )
          })
        },
        wrapAll: function(structure){
          if (this[0]) {
            $(this[0]).before(structure = $(structure))
            var children
            // drill down to the inmost element
            while ((children = structure.children()).length) structure = children.first()
            $(structure).append(this)
          }
          return this
        },
        wrapInner: function(structure){
          var func = isFunction(structure)
          return this.each(function(index){
            var self = $(this), contents = self.contents(),
                dom  = func ? structure.call(this, index) : structure
            contents.length ? contents.wrapAll(dom) : self.append(dom)
          })
        },
        unwrap: function(){
          this.parent().each(function(){
            $(this).replaceWith($(this).children())
          })
          return this
        },
        clone: function(){
          return this.map(function(){ return this.cloneNode(true) })
        },
        hide: function(){
          return this.css("display", "none")
        },
        toggle: function(setting){
          return this.each(function(){
            var el = $(this)
            ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
          })
        },
        prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
        next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
        html: function(html){
          return html === undefined ?
            (this.length > 0 ? this[0].innerHTML : null) :
            this.each(function(idx){
              var originHtml = this.innerHTML
              $(this).empty().append( funcArg(this, html, idx, originHtml) )
            })
        },
        text: function(text){
          return text === undefined ?
            (this.length > 0 ? this[0].textContent : null) :
            this.each(function(){ this.textContent = text })
        },
        attr: function(name, value){
          var result
          return (typeof name == 'string' && value === undefined) ?
            (this.length == 0 || this[0].nodeType !== 1 ? undefined :
              (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
              (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
            ) :
            this.each(function(idx){
              if (this.nodeType !== 1) return
              if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
              else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
            })
        },
        removeAttr: function(name){
          return this.each(function(){ this.nodeType === 1 && setAttribute(this, name) })
        },
        prop: function(name, value){
          return (value === undefined) ?
            (this[0] && this[0][name]) :
            this.each(function(idx){
              this[name] = funcArg(this, value, idx, this[name])
            })
        },
        data: function(name, value){
          var data = this.attr('data-' + dasherize(name), value)
          return data !== null ? deserializeValue(data) : undefined
        },
        val: function(value){
          return (value === undefined) ?
            (this[0] && (this[0].multiple ?
               $(this[0]).find('option').filter(function(o){ return this.selected }).pluck('value') :
               this[0].value)
            ) :
            this.each(function(idx){
              this.value = funcArg(this, value, idx, this.value)
            })
        },
        offset: function(coordinates){
          if (coordinates) return this.each(function(index){
            var $this = $(this),
                coords = funcArg(this, coordinates, index, $this.offset()),
                parentOffset = $this.offsetParent().offset(),
                props = {
                  top:  coords.top  - parentOffset.top,
                  left: coords.left - parentOffset.left
                }

            if ($this.css('position') == 'static') props['position'] = 'relative'
            $this.css(props)
          })
          if (this.length==0) return null
          var obj = this[0].getBoundingClientRect()
          return {
            left: obj.left + window.pageXOffset,
            top: obj.top + window.pageYOffset,
            width: Math.round(obj.width),
            height: Math.round(obj.height)
          }
        },
        css: function(property, value){
          if (arguments.length < 2 && typeof property == 'string')
            return this[0] && (this[0].style[camelize(property)] || getComputedStyle(this[0], '').getPropertyValue(property))

          var css = ''
          if (type(property) == 'string') {
            if (!value && value !== 0)
              this.each(function(){ this.style.removeProperty(dasherize(property)) })
            else
              css = dasherize(property) + ":" + maybeAddPx(property, value)
          } else {
            for (key in property)
              if (!property[key] && property[key] !== 0)
                this.each(function(){ this.style.removeProperty(dasherize(key)) })
              else
                css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
          }

          return this.each(function(){ this.style.cssText += ';' + css })
        },
        index: function(element){
          return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
        },
        hasClass: function(name){
          return emptyArray.some.call(this, function(el){
            return this.test(className(el))
          }, classRE(name))
        },
        addClass: function(name){
          return this.each(function(idx){
            classList = []
            var cls = className(this), newName = funcArg(this, name, idx, cls)
            newName.split(/\s+/g).forEach(function(klass){
              if (!$(this).hasClass(klass)) classList.push(klass)
            }, this)
            classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
          })
        },
        removeClass: function(name){
          return this.each(function(idx){
            if (name === undefined) return className(this, '')
            classList = className(this)
            funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
              classList = classList.replace(classRE(klass), " ")
            })
            className(this, classList.trim())
          })
        },
        toggleClass: function(name, when){
          return this.each(function(idx){
            var $this = $(this), names = funcArg(this, name, idx, className(this))
            names.split(/\s+/g).forEach(function(klass){
              (when === undefined ? !$this.hasClass(klass) : when) ?
                $this.addClass(klass) : $this.removeClass(klass)
            })
          })
        },
        scrollTop: function(){
          if (!this.length) return
          return ('scrollTop' in this[0]) ? this[0].scrollTop : this[0].scrollY
        },
        position: function() {
          if (!this.length) return

          var elem = this[0],
            // Get *real* offsetParent
            offsetParent = this.offsetParent(),
            // Get correct offsets
            offset       = this.offset(),
            parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

          // Subtract element margins
          // note: when an element has margin: auto the offsetLeft and marginLeft
          // are the same in Safari causing offset.left to incorrectly be 0
          offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
          offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

          // Add offsetParent borders
          parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
          parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

          // Subtract the two offsets
          return {
            top:  offset.top  - parentOffset.top,
            left: offset.left - parentOffset.left
          }
        },
        offsetParent: function() {
          return this.map(function(){
            var parent = this.offsetParent || document.body
            while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
              parent = parent.offsetParent
            return parent
          })
        }
      }

      // for now
      $.fn.detach = $.fn.remove

      // Generate the `width` and `height` functions
      ;['width', 'height'].forEach(function(dimension){
        $.fn[dimension] = function(value){
          var offset, el = this[0],
            Dimension = dimension.replace(/./, function(m){ return m[0].toUpperCase() })
          if (value === undefined) return isWindow(el) ? el['inner' + Dimension] :
            isDocument(el) ? el.documentElement['offset' + Dimension] :
            (offset = this.offset()) && offset[dimension]
          else return this.each(function(idx){
            el = $(this)
            el.css(dimension, funcArg(this, value, idx, el[dimension]()))
          })
        }
      })

      function traverseNode(node, fun) {
        fun(node)
        for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
      }

      // Generate the `after`, `prepend`, `before`, `append`,
      // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
      adjacencyOperators.forEach(function(operator, operatorIndex) {
        var inside = operatorIndex % 2 //=> prepend, append

        $.fn[operator] = function(){
          // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
          var argType, nodes = $.map(arguments, function(arg) {
                argType = type(arg)
                return argType == "object" || argType == "array" || arg == null ?
                  arg : zepto.fragment(arg)
              }),
              parent, copyByClone = this.length > 1
          if (nodes.length < 1) return this

          return this.each(function(_, target){
            parent = inside ? target : target.parentNode

            // convert all methods to a "before" operation
            target = operatorIndex == 0 ? target.nextSibling :
                     operatorIndex == 1 ? target.firstChild :
                     operatorIndex == 2 ? target :
                     null

            nodes.forEach(function(node){
              if (copyByClone) node = node.cloneNode(true)
              else if (!parent) return $(node).remove()

              traverseNode(parent.insertBefore(node, target), function(el){
                if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
                   (!el.type || el.type === 'text/javascript') && !el.src)
                  window['eval'].call(window, el.innerHTML)
              })
            })
          })
        }

        // after    => insertAfter
        // prepend  => prependTo
        // before   => insertBefore
        // append   => appendTo
        $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
          $(html)[operator](this)
          return this
        }
      })

      zepto.Z.prototype = $.fn

      // Export internal API functions in the `$.zepto` namespace
      zepto.uniq = uniq
      zepto.deserializeValue = deserializeValue
      $.zepto = zepto

      return $
    })()

    ;(function($){
      var $$ = $.zepto.qsa, handlers = {}, _zid = 1, specialEvents={},
          hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

      specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

      function zid(element) {
        return element._zid || (element._zid = _zid++)
      }
      function findHandlers(element, event, fn, selector) {
        event = parse(event)
        if (event.ns) var matcher = matcherFor(event.ns)
        return (handlers[zid(element)] || []).filter(function(handler) {
          return handler
            && (!event.e  || handler.e == event.e)
            && (!event.ns || matcher.test(handler.ns))
            && (!fn       || zid(handler.fn) === zid(fn))
            && (!selector || handler.sel == selector)
        })
      }
      function parse(event) {
        var parts = ('' + event).split('.')
        return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
      }
      function matcherFor(ns) {
        return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
      }

      function eachEvent(events, fn, iterator){
        if ($.type(events) != "string") $.each(events, iterator)
        else events.split(/\s/).forEach(function(type){ iterator(type, fn) })
      }

      function eventCapture(handler, captureSetting) {
        return handler.del &&
          (handler.e == 'focus' || handler.e == 'blur') ||
          !!captureSetting
      }

      function realEvent(type) {
        return hover[type] || type
      }

      function add(element, events, fn, selector, getDelegate, capture){
        var id = zid(element), set = (handlers[id] || (handlers[id] = []))
        eachEvent(events, fn, function(event, fn){
          var handler   = parse(event)
          handler.fn    = fn
          handler.sel   = selector
          // emulate mouseenter, mouseleave
          if (handler.e in hover) fn = function(e){
            var related = e.relatedTarget
            if (!related || (related !== this && !$.contains(this, related)))
              return handler.fn.apply(this, arguments)
          }
          handler.del   = getDelegate && getDelegate(fn, event)
          var callback  = handler.del || fn
          handler.proxy = function (e) {
            var result = callback.apply(element, [e].concat(e.data))
            if (result === false) e.preventDefault(), e.stopPropagation()
            return result
          }
          handler.i = set.length
          set.push(handler)
          element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
        })
      }
      function remove(element, events, fn, selector, capture){
        var id = zid(element)
        eachEvent(events || '', fn, function(event, fn){
          findHandlers(element, event, fn, selector).forEach(function(handler){
            delete handlers[id][handler.i]
            element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
          })
        })
      }

      $.event = { add: add, remove: remove }

      $.proxy = function(fn, context) {
        if ($.isFunction(fn)) {
          var proxyFn = function(){ return fn.apply(context, arguments) }
          proxyFn._zid = zid(fn)
          return proxyFn
        } else if (typeof context == 'string') {
          return $.proxy(fn[context], fn)
        } else {
          throw new TypeError("expected function")
        }
      }

      $.fn.bind = function(event, callback){
        return this.each(function(){
          add(this, event, callback)
        })
      }
      $.fn.unbind = function(event, callback){
        return this.each(function(){
          remove(this, event, callback)
        })
      }
      $.fn.one = function(event, callback){
        return this.each(function(i, element){
          add(this, event, callback, null, function(fn, type){
            return function(){
              var result = fn.apply(element, arguments)
              remove(element, type, fn)
              return result
            }
          })
        })
      }

      var returnTrue = function(){return true},
          returnFalse = function(){return false},
          ignoreProperties = /^([A-Z]|layer[XY]$)/,
          eventMethods = {
            preventDefault: 'isDefaultPrevented',
            stopImmediatePropagation: 'isImmediatePropagationStopped',
            stopPropagation: 'isPropagationStopped'
          }
      function createProxy(event) {
        var key, proxy = { originalEvent: event }
        for (key in event)
          if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

        $.each(eventMethods, function(name, predicate) {
          proxy[name] = function(){
            this[predicate] = returnTrue
            return event[name].apply(event, arguments)
          }
          proxy[predicate] = returnFalse
        })
        return proxy
      }

      // emulates the 'defaultPrevented' property for browsers that have none
      function fix(event) {
        if (!('defaultPrevented' in event)) {
          event.defaultPrevented = false
          var prevent = event.preventDefault
          event.preventDefault = function() {
            this.defaultPrevented = true
            prevent.call(this)
          }
        }
      }

      $.fn.delegate = function(selector, event, callback){
        return this.each(function(i, element){
          add(element, event, callback, selector, function(fn){
            return function(e){
              var evt, match = $(e.target).closest(selector, element).get(0)
              if (match) {
                evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
                return fn.apply(match, [evt].concat([].slice.call(arguments, 1)))
              }
            }
          })
        })
      }
      $.fn.undelegate = function(selector, event, callback){
        return this.each(function(){
          remove(this, event, callback, selector)
        })
      }

      $.fn.live = function(event, callback){
        $(document.body).delegate(this.selector, event, callback)
        return this
      }
      $.fn.die = function(event, callback){
        $(document.body).undelegate(this.selector, event, callback)
        return this
      }

      $.fn.on = function(event, selector, callback){
        return !selector || $.isFunction(selector) ?
          this.bind(event, selector || callback) : this.delegate(selector, event, callback)
      }
      $.fn.off = function(event, selector, callback){
        return !selector || $.isFunction(selector) ?
          this.unbind(event, selector || callback) : this.undelegate(selector, event, callback)
      }

      $.fn.trigger = function(event, data){
        if (typeof event == 'string' || $.isPlainObject(event)) event = $.Event(event)
        fix(event)
        event.data = data
        return this.each(function(){
          // items in the collection might not be DOM elements
          // (todo: possibly support events on plain old objects)
          if('dispatchEvent' in this) this.dispatchEvent(event)
        })
      }

      // triggers event handlers on current element just as if an event occurred,
      // doesn't trigger an actual event, doesn't bubble
      $.fn.triggerHandler = function(event, data){
        var e, result
        this.each(function(i, element){
          e = createProxy(typeof event == 'string' ? $.Event(event) : event)
          e.data = data
          e.target = element
          $.each(findHandlers(element, event.type || event), function(i, handler){
            result = handler.proxy(e)
            if (e.isImmediatePropagationStopped()) return false
          })
        })
        return result
      }

      // shortcut methods for `.bind(event, fn)` for each event type
      ;('focusin focusout load resize scroll unload click dblclick '+
      'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
      'change select keydown keypress keyup error').split(' ').forEach(function(event) {
        $.fn[event] = function(callback) {
          return callback ?
            this.bind(event, callback) :
            this.trigger(event)
        }
      })

      ;['focus', 'blur'].forEach(function(name) {
        $.fn[name] = function(callback) {
          if (callback) this.bind(name, callback)
          else this.each(function(){
            try { this[name]() }
            catch(e) {}
          })
          return this
        }
      })

      $.Event = function(type, props) {
        if (typeof type != 'string') props = type, type = props.type
        var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
        if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
        event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null)
        event.isDefaultPrevented = function(){ return this.defaultPrevented }
        return event
      }

    })(Zepto)

    ;(function($){
      var jsonpID = 0,
          document = window.document,
          key,
          name,
          rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          scriptTypeRE = /^(?:text|application)\/javascript/i,
          xmlTypeRE = /^(?:text|application)\/xml/i,
          jsonType = 'application/json',
          htmlType = 'text/html',
          blankRE = /^\s*$/

      // trigger a custom event and return false if it was cancelled
      function triggerAndReturn(context, eventName, data) {
        var event = $.Event(eventName)
        $(context).trigger(event, data)
        return !event.defaultPrevented
      }

      // trigger an Ajax "global" event
      function triggerGlobal(settings, context, eventName, data) {
        if (settings.global) return triggerAndReturn(context || document, eventName, data)
      }

      // Number of active Ajax requests
      $.active = 0

      function ajaxStart(settings) {
        if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
      }
      function ajaxStop(settings) {
        if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
      }

      // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
      function ajaxBeforeSend(xhr, settings) {
        var context = settings.context
        if (settings.beforeSend.call(context, xhr, settings) === false ||
            triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
          return false

        triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
      }
      function ajaxSuccess(data, xhr, settings) {
        var context = settings.context, status = 'success'
        settings.success.call(context, data, status, xhr)
        triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
        ajaxComplete(status, xhr, settings)
      }
      // type: "timeout", "error", "abort", "parsererror"
      function ajaxError(error, type, xhr, settings) {
        var context = settings.context
        settings.error.call(context, xhr, type, error)
        triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error])
        ajaxComplete(type, xhr, settings)
      }
      // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
      function ajaxComplete(status, xhr, settings) {
        var context = settings.context
        settings.complete.call(context, xhr, status)
        triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
        ajaxStop(settings)
      }

      // Empty function, used as default callback
      function empty() {}

      $.ajaxJSONP = function(options){
        if (!('type' in options)) return $.ajax(options)

        var callbackName = 'jsonp' + (++jsonpID),
          script = document.createElement('script'),
          cleanup = function() {
            clearTimeout(abortTimeout)
            $(script).remove()
            delete window[callbackName]
          },
          abort = function(type){
            cleanup()
            // In case of manual abort or timeout, keep an empty function as callback
            // so that the SCRIPT tag that eventually loads won't result in an error.
            if (!type || type == 'timeout') window[callbackName] = empty
            ajaxError(null, type || 'abort', xhr, options)
          },
          xhr = { abort: abort }, abortTimeout

        if (ajaxBeforeSend(xhr, options) === false) {
          abort('abort')
          return false
        }

        window[callbackName] = function(data){
          cleanup()
          ajaxSuccess(data, xhr, options)
        }

        script.onerror = function() { abort('error') }

        script.src = options.url.replace(/=\?/, '=' + callbackName)
        $('head').append(script)

        if (options.timeout > 0) abortTimeout = setTimeout(function(){
          abort('timeout')
        }, options.timeout)

        return xhr
      }

      $.ajaxSettings = {
        // Default type of request
        type: 'GET',
        // Callback that is executed before request
        beforeSend: empty,
        // Callback that is executed if the request succeeds
        success: empty,
        // Callback that is executed the the server drops error
        error: empty,
        // Callback that is executed on request complete (both: error and success)
        complete: empty,
        // The context for the callbacks
        context: null,
        // Whether to trigger "global" Ajax events
        global: true,
        // Transport
        xhr: function () {
          return new window.XMLHttpRequest()
        },
        // MIME types mapping
        accepts: {
          script: 'text/javascript, application/javascript',
          json:   jsonType,
          xml:    'application/xml, text/xml',
          html:   htmlType,
          text:   'text/plain'
        },
        // Whether the request is to another domain
        crossDomain: false,
        // Default timeout
        timeout: 0,
        // Whether data should be serialized to string
        processData: true,
        // Whether the browser should be allowed to cache GET responses
        cache: true
      }

      function mimeToDataType(mime) {
        if (mime) mime = mime.split(';', 2)[0]
        return mime && ( mime == htmlType ? 'html' :
          mime == jsonType ? 'json' :
          scriptTypeRE.test(mime) ? 'script' :
          xmlTypeRE.test(mime) && 'xml' ) || 'text'
      }

      function appendQuery(url, query) {
        return (url + '&' + query).replace(/[&?]{1,2}/, '?')
      }

      // serialize payload and append it to the URL for GET requests
      function serializeData(options) {
        if (options.processData && options.data && $.type(options.data) != "string")
          options.data = $.param(options.data, options.traditional)
        if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
          options.url = appendQuery(options.url, options.data)
      }

      $.ajax = function(options){
        var settings = $.extend({}, options || {})
        for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

        ajaxStart(settings)

        if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
          RegExp.$2 != window.location.host

        if (!settings.url) settings.url = window.location.toString()
        serializeData(settings)
        if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())

        var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url)
        if (dataType == 'jsonp' || hasPlaceholder) {
          if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?')
          return $.ajaxJSONP(settings)
        }

        var mime = settings.accepts[dataType],
            baseHeaders = { },
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            xhr = settings.xhr(), abortTimeout

        if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest'
        if (mime) {
          baseHeaders['Accept'] = mime
          if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
          xhr.overrideMimeType && xhr.overrideMimeType(mime)
        }
        if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
          baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded')
        settings.headers = $.extend(baseHeaders, settings.headers || {})

        xhr.onreadystatechange = function(){
          if (xhr.readyState == 4) {
            xhr.onreadystatechange = empty;
            clearTimeout(abortTimeout)
            var result, error = false
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
              dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'))
              result = xhr.responseText

              try {
                // http://perfectionkills.com/global-eval-what-are-the-options/
                if (dataType == 'script')    (1,eval)(result)
                else if (dataType == 'xml')  result = xhr.responseXML
                else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
              } catch (e) { error = e }

              if (error) ajaxError(error, 'parsererror', xhr, settings)
              else ajaxSuccess(result, xhr, settings)
            } else {
              ajaxError(null, xhr.status ? 'error' : 'abort', xhr, settings)
            }
          }
        }

        var async = 'async' in settings ? settings.async : true
        xhr.open(settings.type, settings.url, async)

        for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

        if (ajaxBeforeSend(xhr, settings) === false) {
          xhr.abort()
          return false
        }

        if (settings.timeout > 0) abortTimeout = setTimeout(function(){
            xhr.onreadystatechange = empty
            xhr.abort()
            ajaxError(null, 'timeout', xhr, settings)
          }, settings.timeout)

        // avoid sending empty string (#319)
        xhr.send(settings.data ? settings.data : null)
        return xhr
      }

      // handle optional data/success arguments
      function parseArguments(url, data, success, dataType) {
        var hasData = !$.isFunction(data)
        return {
          url:      url,
          data:     hasData  ? data : undefined,
          success:  !hasData ? data : $.isFunction(success) ? success : undefined,
          dataType: hasData  ? dataType || success : success
        }
      }

      $.get = function(url, data, success, dataType){
        return $.ajax(parseArguments.apply(null, arguments))
      }

      $.post = function(url, data, success, dataType){
        var options = parseArguments.apply(null, arguments)
        options.type = 'POST'
        return $.ajax(options)
      }

      $.getJSON = function(url, data, success){
        var options = parseArguments.apply(null, arguments)
        options.dataType = 'json'
        return $.ajax(options)
      }

      $.fn.load = function(url, data, success){
        if (!this.length) return this
        var self = this, parts = url.split(/\s/), selector,
            options = parseArguments(url, data, success),
            callback = options.success
        if (parts.length > 1) options.url = parts[0], selector = parts[1]
        options.success = function(response){
          self.html(selector ?
            $('<div>').html(response.replace(rscript, "")).find(selector)
            : response)
          callback && callback.apply(self, arguments)
        }
        $.ajax(options)
        return this
      }

      var escape = encodeURIComponent

      function serialize(params, obj, traditional, scope){
        var type, array = $.isArray(obj)
        $.each(obj, function(key, value) {
          type = $.type(value)
          if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'
          // handle data in serializeArray() format
          if (!scope && array) params.add(value.name, value.value)
          // recurse into nested objects
          else if (type == "array" || (!traditional && type == "object"))
            serialize(params, value, traditional, key)
          else params.add(key, value)
        })
      }

      $.param = function(obj, traditional){
        var params = []
        params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
        serialize(params, obj, traditional)
        return params.join('&').replace(/%20/g, '+')
      }
    })(Zepto)
    VCO.getJSON = Zepto.getJSON;
})(VCO)

//     Based on https://github.com/madrobby/zepto/blob/5585fe00f1828711c04208372265a5d71e3238d1/src/ajax.js
//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.
/*
Copyright (c) 2010-2012 Thomas Fuchs
http://zeptojs.com

Permission is hereby granted, free of charge, to any person obtaining a copy 
of this software and associated documentation files (the "Software"), to deal 
in the Software without restriction, including without limitation the rights 
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
copies of the Software, and to permit persons to whom the Software is 
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
SOFTWARE.
*/


/* **********************************************
     Begin VCO.Class.js
********************************************** */

/*	VCO.Class
	Class powers the OOP facilities of the library.
================================================== */
VCO.Class = function () {};

VCO.Class.extend = function (/*Object*/ props) /*-> Class*/ {

	// extended class with the new prototype
	var NewClass = function () {
		if (this.initialize) {
			this.initialize.apply(this, arguments);
		}
	};

	// instantiate class without calling constructor
	var F = function () {};
	F.prototype = this.prototype;
	var proto = new F();

	proto.constructor = NewClass;
	NewClass.prototype = proto;

	// add superclass access
	NewClass.superclass = this.prototype;

	// add class name
	//proto.className = props;

	//inherit parent's statics
	for (var i in this) {
		if (this.hasOwnProperty(i) && i !== 'prototype' && i !== 'superclass') {
			NewClass[i] = this[i];
		}
	}

	// mix static properties into the class
	if (props.statics) {
		VCO.Util.extend(NewClass, props.statics);
		delete props.statics;
	}

	// mix includes into the prototype
	if (props.includes) {
		VCO.Util.extend.apply(null, [proto].concat(props.includes));
		delete props.includes;
	}

	// merge options
	if (props.options && proto.options) {
		props.options = VCO.Util.extend({}, proto.options, props.options);
	}

	// mix given properties into the prototype
	VCO.Util.extend(proto, props);

	// allow inheriting further
	NewClass.extend = VCO.Class.extend;

	// method for adding properties to prototype
	NewClass.include = function (props) {
		VCO.Util.extend(this.prototype, props);
	};

	return NewClass;
};


/* **********************************************
     Begin VCO.Events.js
********************************************** */

/*	VCO.Events
	adds custom events functionality to VCO classes
================================================== */
VCO.Events = {
	addEventListener: function (/*String*/ type, /*Function*/ fn, /*(optional) Object*/ context) {
		var events = this._vco_events = this._vco_events || {};
		events[type] = events[type] || [];
		events[type].push({
			action: fn,
			context: context || this
		});
		return this;
	},

	hasEventListeners: function (/*String*/ type) /*-> Boolean*/ {
		var k = '_vco_events';
		return (k in this) && (type in this[k]) && (this[k][type].length > 0);
	},

	removeEventListener: function (/*String*/ type, /*Function*/ fn, /*(optional) Object*/ context) {
		if (!this.hasEventListeners(type)) {
			return this;
		}

		for (var i = 0, events = this._vco_events, len = events[type].length; i < len; i++) {
			if (
				(events[type][i].action === fn) &&
				(!context || (events[type][i].context === context))
			) {
				events[type].splice(i, 1);
				return this;
			}
		}
		return this;
	},

	fireEvent: function (/*String*/ type, /*(optional) Object*/ data) {
		if (!this.hasEventListeners(type)) {
			return this;
		}

		var event = VCO.Extend({
			type: type,
			target: this
		}, data);

		var listeners = this._vco_events[type].slice();

		for (var i = 0, len = listeners.length; i < len; i++) {
			listeners[i].action.call(listeners[i].context || this, event);
		}

		return this;
	}
};

VCO.Events.on	= VCO.Events.addEventListener;
VCO.Events.off	= VCO.Events.removeEventListener;
VCO.Events.fire = VCO.Events.fireEvent;

/* **********************************************
     Begin VCO.Dom.js
********************************************** */

/*	VCO.Dom
	Utilities for working with the DOM
	Library abstraction for jQuery
================================================== */



VCO.Dom = {
	
	initialize: function() {
		if( typeof( jQuery ) != 'undefined' ){
			this.type.jQuery = true;
		} else {
			this.type.jQuery = false;
		}
	},
	
	get: function(id) {
		return (typeof id === 'string' ? document.getElementById(id) : id);
	},
	
	create: function(tagName, className, container) {
		var el = document.createElement(tagName);
		el.className = className;
		if (container) {
			container.appendChild(el);
		}
		return el;
	},
	
	createText: function(content, container) {
		var el = document.createTextNode(content);
		if (container) {
			container.appendChild(el);
		}
		return el;
	}
	
};

/* **********************************************
     Begin VCO.MediaType.js
********************************************** */

/*	VCO.MediaType
	Determines the type of media the url string is.
	returns an object with .type and .id
	You can add new media types by adding a regex 
	to match and the media class name to use to 
	render the media 
================================================== */
VCO.MediaType = function(url) {
	var media = {}, 
		media_types = 	[
			{
				type: 		"youtube",
				match_str: 	"(www.)?youtube|youtu\.be",
				classname: 	VCO.Media.YouTube
			},
			{
				type: 		"vimeo",
				match_str: 	"(player.)?vimeo\.com",
				classname: 	VCO.Media.Vimeo
			},
			{
				type: 		"dailymotion",
				match_str: 	"(www.)?dailymotion\.com",
				classname: 	VCO.Media.IFrame
			},
			{
				type: 		"vine",
				match_str: 	"(www.)?vine\.co",
				classname: 	VCO.Media.Vine
			},
			{
				type: 		"soundcloud",
				match_str: 	"(player.)?soundcloud\.com",
				classname: 	VCO.Media.SoundCloud
			},
			{
				type: 		"twitter",
				match_str: 	"(www.)?twitter\.com",
				classname: 	VCO.Media.Twitter
			},
			{
				type: 		"googlemaps",
				match_str: 	"maps.google",
				classname: 	VCO.Media.Map
			},
			{
				type: 		"googleplus",
				match_str: 	"plus.google",
				classname: 	VCO.Media.GooglePlus
			},
			{
				type: 		"flickr",
				match_str: 	"flickr.com/photos",
				classname: 	VCO.Media.Flickr
			},
			{
				type: 		"instagram",
				match_str: 	"instagr.am/p/",
				classname: 	VCO.Media
			},
			{
				type: 		"image",
				match_str: 	/jpg|jpeg|png|gif/i,
				classname: 	VCO.Media
			},
			{
				type: 		"googledocs",
				match_str: 	/\b.(doc|docx|xls|xlsx|ppt|pptx|pdf|pages|ai|psd|tiff|dxf|svg|eps|ps|ttf|xps|zip|tif)\b/,
				classname: 	VCO.Media.GoogleDoc
			},
			{
				type: 		"wikipedia",
				match_str: 	"(www.)?wikipedia\.org",
				classname: 	VCO.Media.Wikipedia
			},
			{
				type: 		"iframe",
				match_str: 	"iframe",
				classname: 	VCO.Media.IFrame
			},
			{
				type: 		"storify",
				match_str: 	"storify",
				classname: 	VCO.Media.Storify
			},
			{
				type: 		"blockquote",
				match_str: 	"blockquote",
				classname: 	"VCO.Media.Blockquote"
			},
			{
				type: 		"website",
				match_str: 	"http://",
				classname: 	VCO.Media.Website
			},
			{
				type: 		"",
				match_str: 	"",
				classname: 	VCO.Media
			}
		];
	
	for (var i = 0; i < media_types.length; i++) {
		if (url.match(media_types[i].match_str)) {
			media 		= media_types[i];
			media.url 	= url;
			return media;
			break;
		}
	};
	
	return false;
	
}

/* **********************************************
     Begin VCO.Media.js
********************************************** */

VCO.Media = VCO.Class.extend({
	
	includes: [VCO.Events],
	
	// DOM ELEMENTS
	_el: {
		container: {},
		content_container: {},
		content: {},
		content_item: {},
		caption: {},
		credit: {}
	},
	
	// Media Type
	mediatype: {},
	
	// Options
	options: {
		uniqueid: 			"",
		url: 				"http://2.bp.blogspot.com/-dxJbW0CG8Zs/TmkoMA5-cPI/AAAAAAAAAqw/fQpsz9GpFdo/s1600/voyage-dans-la-lune-1902-02-g.jpg",
		credit:				"Georges Méliès",
		caption:			"Le portrait mystérieux"
	},
	
	/*	Constructor
	================================================== */
	initialize: function(options, add_to_container) {
		VCO.Util.setOptions(this, options);
		//this._container = VCO.Dom.get(id);
		this._el.container = VCO.Dom.create("div", "vco-media");
		this._el.container.id = this.options.uniqueid;
		
		this._initLayout();
		
		if (add_to_container) {
			add_to_container.appendChild(this._el.container);
		};
		
	},
	/*	Constructor
	================================================== */
	loadMedia: function(url) {
		
	},
	
	/*	Adding, Hiding, Showing etc
	================================================== */
	show: function() {
		
	},
	
	hide: function() {
		
	},
	
	addTo: function(container) {
		container.appendChild(this._el.container);
		//this.onAdd();
	},
	
	removeFrom: function(container) {
		container.removeChild(this._el.container);
	},

	/*	Events
	================================================== */
	onLoaded: function() {
		this.fire("loaded", this.options);
	},
	
	onAdd: function() {
		this.fire("added", this.options);
	},

	onRemove: function() {
		this.fire("removed", this.options);
	},
	
	/*	Private Methods
	================================================== */
	_initLayout: function () {
		trace(" _initLayout");
		
		// Create Layout
		this._el.content_container			= VCO.Dom.create("div", "vco-media-content-container", this._el.container);
		this._el.content					= VCO.Dom.create("div", "vco-media-content", this._el.content_container);
		
		// Add Shadow
		this._el.content.className += ' vco-media-shadow';
		
		// Credit
		if (this.options.credit != "") {
			this._el.credit					= VCO.Dom.create("div", "vco-credit", this._el.content_container);
			this._el.credit.innerHTML		= this.options.credit;
		}
		
		// Caption
		if (this.options.caption != "") {
			this._el.caption				= VCO.Dom.create("div", "vco-caption", this._el.content_container);
			this._el.caption.innerHTML		= this.options.caption;
		}
		
		// Load Media
		//this.mediatype = VCO.MediaType(this.options.url);
		//trace(this.mediatype);
		
		this._el.content_item				= VCO.Dom.create("img", "vco-media-item", this._el.content);
		this._el.content_item.src			= this.options.url;
		
		// Fire event that the slide is loaded
		//this.onLoaded();
		
		
		
	}
	
});

/* **********************************************
     Begin VCO.Text.js
********************************************** */

VCO.Text = VCO.Class.extend({
	
	includes: [VCO.Events],
	
	// DOM ELEMENTS
	_el: {
		container: {},
		content_container: {},
		content: {},
		headline: {}
	},
	
	// Options
	options: {
		uniqueid: 			"",
		headline: 			"Le portrait mystérieux",
		text: 				"Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
	},
	
	
	/*	Constructor
	================================================== */
	initialize: function(options, add_to_container) {
		VCO.Util.setOptions(this, options);
		//this._container = VCO.Dom.get(id);
		this._el.container = VCO.Dom.create("div", "vco-text");
		this._el.container.id = this.options.uniqueid;
		
		this._initLayout();
		
		if (add_to_container) {
			add_to_container.appendChild(this._el.container);
		};
		
	},
	
	/*	Adding, Hiding, Showing etc
	================================================== */
	show: function() {
		
	},
	
	hide: function() {
		
	},
	
	addTo: function(container) {
		container.appendChild(this._el.container);
		//this.onAdd();
	},
	
	removeFrom: function(container) {
		container.removeChild(this._el.container);
	},
	
	/*	Events
	================================================== */
	onLoaded: function() {
		this.fire("loaded", this.options);
	},
	
	onAdd: function() {
		this.fire("added", this.options);
	},

	onRemove: function() {
		this.fire("removed", this.options);
	},
	
	/*	Private Methods
	================================================== */
	_initLayout: function () {
		trace(" _initLayout");
		
		// Create Layout
		this._el.content_container			= VCO.Dom.create("div", "vco-text-content-container", this._el.container);
		//this._el.content					= VCO.Dom.create("div", "vco-text-content", this._el.content_container);
		
		// Headline
		if (this.options.headline != "") {
			this._el.headline				= VCO.Dom.create("h2", "vco-headline", this._el.content_container);
			this._el.headline.innerHTML		= this.options.headline;
		}
		
		// Text
		if (this.options.text != "") {
			this._el.content				= VCO.Dom.create("div", "vco-text-content", this._el.content_container);
			this._el.content.innerHTML		= VCO.Util.htmlify(this.options.text);
		}
		
		// Fire event that the slide is loaded
		//this.onLoaded();
		
		
		
	}
	
});

/* **********************************************
     Begin VCO.Slide.js
********************************************** */

// TODO Create slide element

VCO.Slide = VCO.Class.extend({
	
	includes: [VCO.Events],
	
	// DOM ELEMENTS
	_el: {
		container: {},
		content_container: {},
		content: {}
	},
	
	// Components
	_media: {},
	_mediaclass: {},
	_text: {},
	
	// Options
	options: {
		uniqueid: 				"",
		background: {			// OPTIONAL
			url: 				null, //"http://2.bp.blogspot.com/-dxJbW0CG8Zs/TmkoMA5-cPI/AAAAAAAAAqw/fQpsz9GpFdo/s1600/voyage-dans-la-lune-1902-02-g.jpg",
			color: 				"#cdbfe3",
			opacity: 			50
		},
		date: 					null,
		location: {
			lat: 				-9.143962,
			lon: 				38.731094,
			zoom: 				13,
			icon: 				"http://maps.gstatic.com/intl/en_us/mapfiles/ms/micons/blue-pushpin.png"
		},
		text: {
			headline: 			"Le portrait mystérieux",
			text: 				"Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
		},
		media: {
			url: 				"http://2.bp.blogspot.com/-dxJbW0CG8Zs/TmkoMA5-cPI/AAAAAAAAAqw/fQpsz9GpFdo/s1600/voyage-dans-la-lune-1902-02-g.jpg",
			credit:				"Georges Méliès",
			caption:			"Le portrait mystérieux",
			mediatype: 			{}
		}
		
	},
	
	/*	Constructor
	================================================== */
	initialize: function(options, add_to_container) {
		
		VCO.Util.setOptions(this, options);
		
		//this._container = VCO.Dom.get(id);
		this._el.container = VCO.Dom.create("div", "vco-slide");
		this._el.container.id = this.options.uniqueid;
		
		this._initLayout();
		
		if (add_to_container) {
			add_to_container.appendChild(this._el.container);
		}
		
		//return this;
	},
	
	/*	Adding, Hiding, Showing etc
	================================================== */
	show: function() {
		
	},
	
	hide: function() {
		
	},
	
	addTo: function(container) {
		container.appendChild(this._el.container);
		//this.onAdd();
	},
	
	removeFrom: function(container) {
		container.removeChild(this._el.container);
	},
	
	/*	Events
	================================================== */
	onLoaded: function() {
		this.fire("loaded", this.options);
	},
	
	onAdd: function() {
		this.fire("added", this.options);
	},

	onRemove: function() {
		this.fire("removed", this.options);
	},
	
	/*	Private Methods
	================================================== */
	_initLayout: function () {
		trace(" _initLayout");
		
		// Create Layout
		this._el.content_container		= VCO.Dom.create("div", "vco-slide-content-container", this._el.container);
		this._el.content				= VCO.Dom.create("div", "vco-slide-content", this._el.content_container);
		
		// Style Slide Background
		if (this.options.background) {
			if (this.options.background.url) {
				this._el.container.className += ' vco-full-image-background';
				this._el.container.style.backgroundImage="url('" + this.options.background.url + "')";
			}
			if (this.options.background.color) {
				this._el.container.style.backgroundColor = this.options.background.color;
			}
		} 
		
		// Media
		if (this.options.media) {
			// Determine the media type
			this.options.media.mediatype = VCO.MediaType(this.options.media.url);
			
			// Create a media object using the matched class name
			this._media = new this.options.media.mediatype.classname(this.options.media);
			
			// add the object to the dom
			this._media.addTo(this._el.content);
		}
		
		// Text
		if (this.options.text) {
			this._text = new VCO.Text(this.options.text);
			this._text.addTo(this._el.content);
		}
		
		// Fire event that the slide is loaded
		//this.onLoaded();
		
	}
	
});


/* **********************************************
     Begin VCO.StorySlider.js
********************************************** */

/**
	* StorySlider
	* Designed and built by Zach Wise at VéritéCo

	* This Source Code Form is subject to the terms of the Mozilla Public
	* License, v. 2.0. If a copy of the MPL was not distributed with this
	* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/ 

/*	* CodeKit Import
	* http://incident57.com/codekit/
================================================== */
// @codekit-prepend "core/VCO.js";
// @codekit-prepend "core/VCO.Util.js";
// @codekit-prepend "data/VCO.Data.js";
// @codekit-prepend "core/VCO.Class.js";
// @codekit-prepend "core/VCO.Events.js";
// @codekit-prepend "dom/VCO.Dom.js";
// @codekit-prepend "media/VCO.MediaType.js";
// @codekit-prepend "media/VCO.Media.js";
// @codekit-prepend "media/VCO.Text.js";
// @codekit-prepend "slider/VCO.Slide.js";



/*	VCO.StorySlider
	is the central class of the API - it is used to create a StorySlider
================================================== */
VCO.StorySlider = VCO.Class.extend({
	
	// DOM ELEMENTS
	_el: {
		container: {},
		slider_container_mask: {},
		slider_container: {},
		slider_item_container: {}
	},
	
	// Slides Array
	_slides: [],
	
	includes: VCO.Events,
	
	options: {
		uniqueid: 				"",
		// state
		full_image_background: 	null,

		// interaction
		dragging: 				true
	},
	
	/*	Private Methods
	================================================== */
	initialize: function (id, options) { // (HTMLElement or String, Object)
		trace("StorySlider Initialized");
		
		VCO.Util.setOptions(this, this.options);
		
		this.options.uniqueid = id;
		this._el.container = VCO.Dom.get(id);
		this._initLayout();
		
	},
	
	/*	Create Slides
	================================================== */
	createSlides: function(slides) { // array of objects
		trace("createSlides");
		for (var i = 0; i < slides.length; i++) {
			trace("TEST");
			var slide = new VCO.Slide(slides[i]);
			slide.addTo(this._el.slider_item_container);
			slide.on('added', this._onSLideAdded, this);
			this._slides.push(slide);
			
		};
	},
	
	/*	Adding and Removing Slide Methods
	================================================== */
	
	// Add a slide or slides to the slider
	addSlides: function(slides) { // array of objects
		trace("addSlides");
		for (var i = 0; i < slides.length; i++) {
			slides[i].addTo(this._el.slider_item_container);
		};
	},
	
	// Remove a slide or slides to the slider
	removeSlides: function(slides) { // array of objects
		for (var i = 0; i < slides.length; i++) {
			slides[i].removeFrom(this._el.slider_item_container);
		};
	},
	
	/*	Private Methods
	================================================== */
	
	// Events
	_onSLideAdded: function(e) {
		
	},
	
	// Initialize the layout
	_initLayout: function () {
		trace(" _initLayout");
		
		this._el.container.className += ' vco-storyslider';
		
		// Create Layout
		this._el.slider_container_mask		= VCO.Dom.create('div', 'vco-slider-container-mask', this._el.container);
		this._el.slider_container			= VCO.Dom.create('div', 'vco-slider-container', this._el.slider_container_mask);
		this._el.slider_item_container		= VCO.Dom.create('div', 'vco-slider-item-container', this._el.slider_container);
		
		// Create Slides and then add them
		this.createSlides([{test:"yes"}, {test:"yes"}, {test:"yes"}]);
		this.addSlides(this._slides);
		
	},
	
	
	
	
});


