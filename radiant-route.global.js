(function () {
  function BooleanQueryParam (options) {
    this._variableName = options.variableName
    this._queryParamName = options.queryParamName
    this._value = false
  }
  BooleanQueryParam.prototype = {
    extractFromRouteState: function (routeState) {
      this._value = routeState.queryParams[this._variableName]
    },

    exportToRouteState: function (routeState) {
      routeState.queryParams[this._variableName] = this._value
    },

    extractFromURLObject: function (urlObject) {
      this._value = urlObject.queryParams[this._queryParamName] !== undefined
    },

    exportToURLObject: function (urlObject) {
      if (this._value) { urlObject.queryParams[this._queryParamName] = '' }
    }
  }

  function StringQueryParam (options) {
    this._variableName = options.variableName
    this._queryParamName = options.queryParamName
    this._value = ''
  }
  StringQueryParam.prototype = {
    extractFromRouteState: function (routeState) {
      this._value = routeState.queryParams[this._variableName]
    },

    exportToRouteState: function (routeState) {
      routeState.queryParams[this._variableName] = this._value
    },

    extractFromURLObject: function (urlObject) {
      this._value = urlObject.queryParams[this._queryParamName] || ''
    },

    exportToURLObject: function (urlObject) {
      if (this._value) {
        urlObject.queryParams[this._queryParamName] = this._value
      }
    }
  }

  function RadiantRoute (name) {
    this._name = name
    this._childRoutes = []
    this._activeChildRoute = null
    this._capturePath = false
    this._path = '' // For path capturing
    this._queryParams = []
  }
  RadiantRoute.prototype = {
    add: function (childRoute) {
      this._childRoutes.push(childRoute)
      childRoute._parent = this
      return this
    },

    capturePath: function () {
      this._capturePath = true
      return this
    },

    booleanQueryParam: function (options) {
      this._queryParams.push(new BooleanQueryParam(options))
      return this
    },

    stringQueryParam: function (options) {
      this._queryParams.push(new StringQueryParam(options))
      return this
    },

    get _active () {
      if (this._parent) {
        return this._parent._activeChildRoute === this
      } else {
        return true
      }
    },

    get url () {
      return urlObjectToURL(this._getURLObject())
    },

    set url (url) {
      this._applyURLObject(urlToURLObject(url))
    },

    _getURLObject: function () {
      var urlObject
      if (this._activeChildRoute) {
        urlObject = this._activeChildRoute._getURLObject()
      } else {
        urlObject = { path: '', queryParams: {} }

        if (this._capturePath && this._path.length > 0) {
          urlObject.path = '/' + this._path
        }
      }

      // Append name to path
      urlObject.path = this._name + urlObject.path
      if (urlObject.path[0] !== '/') { urlObject.path = '/' + urlObject.path }

      // Query params
      this._queryParams.forEach(function (p) { p.exportToURLObject(urlObject) })

      return urlObject
    },

    _applyURLObject: function (urlObject) {
      var result = /\/*([^\/]*)(.*)/.exec(urlObject.path)
      var name = result[1]
      var pathTail = result[2]

      // Determine active child route
      this._activeChildRoute = null
      this._childRoutes.forEach(function (c) {
        if (c._name === name) { this._activeChildRoute = c }
      }.bind(this))

      if (this._activeChildRoute) { // Go deeper
        if (this._capturePath) { this._path = null }
        urlObject.path = pathTail
        this._activeChildRoute._applyURLObject(urlObject)
      } else { // No active child route
        if (this._capturePath) {
          this._path = urlObject.path.substr(1) // Remove slash at the start
        }
      }

      // Query params
      this._queryParams.forEach(function (p) { p.extractFromURLObject(urlObject) })
    },

    get state () {
      // Recursive calls
      var children = {}
      this._childRoutes.forEach(function (c) {
        children[c._name] = c.state
      })

      // Assemble state object
      var state = {
        activeChild: this._activeChildRoute ?
                     this._activeChildRoute._name : null,
        queryParams: {},
        children: children
      }

      // Query params
      this._queryParams.forEach(function (p) { p.exportToRouteState(state) })

      // Path capturing
      if (this._capturePath) { state.path = this._path }

      return state
    },

    set state (state) {
      if (state.activeChild) { // Child routes
        this._childRoutes.forEach(function (childRoute) {
          // Find route specified as active
          if (childRoute._name === state.activeChild) {
            this._activeChildRoute = childRoute
          }

          // Recursive call
          var childState = state.children[childRoute._name]
          childRoute.state = childState
        }.bind(this))
      } else {
        this._activeChildRoute = null
      }

      // Path capturing
      if (!this._activeChildRoute && this._capturePath) {
        this._path = state.path
      }

      // Query params
      this._queryParams.forEach(function (p) { p.extractFromRouteState(state) })
    }
  }

  function urlObjectToURL (urlObject) {
    var query = ''
    Object.keys(urlObject.queryParams).forEach(function (key) {
      var value = urlObject.queryParams[key]
      query += '&' + encodeURIComponent(key)
      if (value) { query += '=' + encodeURIComponent(value) }
    })
    query = query.slice(1)

    return query ? urlObject.path + '?' + query : urlObject.path
  }

  function urlToURLObject (url) {
    var result = /([^\?]*)\??(.*)/.exec(url)
    var path = result[1]
    var query = result[2]

    var queryParams = {}
    query.split('&').forEach(function (pair) {
      var result = /([^=]*)=?(.*)/.exec(pair)
      var key = result[1]
      var value = result[2]
      queryParams[decodeURIComponent(key)] = decodeURIComponent(value)
    })
    return { path: path, queryParams: queryParams }
  }

  window.RadiantRoute = RadiantRoute
})()
