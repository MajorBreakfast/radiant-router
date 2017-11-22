[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/MajorBreakfast/radiant-router)
[![npm version](https://badge.fury.io/js/radiant-router.svg)](https://badge.fury.io/js/radiant-router)

# Radiant Router
The `<radiant-router>` is a custom element which synchronizes a URL to a JavaScript object and vice versa. It supports query parameters and path capturing.

## Installation

NPM (Polymer 3):
```sh
npm install radiant-router
```

Bower (Polymer 1 and 2):
```sh
bower install --save MajorBreakfast/radiant-router
```

## Demo
This router is used in production in the [Wolf Service App](https://www.wolfserviceapp.com/) (Spare parts catalog app for the heating, air handling and ventilation systems supplier Wolf GmbH).

## How It Works
When the `url` property changes:
```
URL -----(1)---> routing              routeState
    <----(2)---- system  ----(2)---->
```

When the `routeState` object changes:
```
                 routing <---(1)----- routeState
URL <----(2)---- system  ----(2)---->
```

- The routing system connects the url with the `routeState` bidirectionally.
- The `url` property is meant to be synced to the URL bar,
  e.g. using `<iron-location>`. The routing system keeps the URL in a consitent state, this means that after it detects changes, it might further change the URL, e.g. to remove a trailing slash.
- The `routeState` property is an object which is meant to be manipulated by the app. The routing system keeps the `routeState` object in a consistent state, this means that after it detects changes, it might further change the `routeState` object, e.g. to remove unknown properties. You can see in the example in the next section how the `routeState` object looks like.

## How To Use

This section shows you how to use the `<radiant-router>`.

Polymer 3:
```JS
import { Element } from '../@polymer/polymer/polymer-element.js'
import '../@polymer/iron-location/iron-location.js'
import { RadiantRoute } from '../radiant-router/radiant-router.js'

class MyApp extends Element {
  static get template () {
    return `
      <iron-location hash="{{url}}"></iron-location>
      <radiant-router url="{{url}}"
                      route-state="{{routeState}}"
                      root-route="[[rootRoute]]"></radiant-router>
    `
  }

  static get is () { return 'my-app' }

  static get properties () {
    return {
      rootRoute: {
        type: Object,
        value: function () {
          return new RadiantRoute('')
            .add(new RadiantRoute('home'))
            .add(new RadiantRoute('about')
              .add(new RadiantRoute('terms-of-use'))
              .add(new RadiantRoute('imprint'))
            )
            .add(new RadiantRoute('catalog')
              .capturePath()
              .booleanQueryParam({ variableName: 'isSearchShown',
                                   queryParamName: 'search' })
              .stringQueryParam({ variableName: 'searchTerm',
                                  queryParamName: 'search-term' })
            )
        }
      }
    }
  }
}
customElements.define(RadiantRouter.is, RadiantRouter)
```

Polymer 1 and 2:
```HTML
<link rel="import" href="../bower_components/polymer/polymer.html">
<link rel="import" href="../bower_components/iron-location/iron-location.html">
<link rel="import" href="../bower_components/radiant-router/radiant-router.html">

<dom-module id="my-app">
  <template>
    <iron-location hash="{{url}}"></iron-location>
    <radiant-router url="{{url}}"
                    route-state="{{routeState}}"
                    root-route="[[rootRoute]]"></radiant-router>
  </template>
  <script>
    Polymer({
      is: 'my-app',

      properties: {
        rootRoute: {
          type: Object,
          value: function () {
            return new RadiantRoute('')
              .add(new RadiantRoute('home'))
              .add(new RadiantRoute('about')
                .add(new RadiantRoute('terms-of-use'))
                .add(new RadiantRoute('imprint'))
              )
              .add(new RadiantRoute('catalog')
                .capturePath()
                .booleanQueryParam({ variableName: 'isSearchShown',
                                     queryParamName: 'search' })
                .stringQueryParam({ variableName: 'searchTerm',
                                    queryParamName: 'search-term' })
              )
          }
        }
      }
    })
  </script>
</dom-module>
```

`<iron-location>` is used to sync the url string to the url bar of the browser.


The `routeState` object looks like this:

```JS
{
  activeChild: 'about',
  queryParams: {},
  children: {
    home: { activeChild: null, queryParams: {}, children: {} },
    about: {
      activeChild: null,
      queryParams: {},
      children: {
        'terms-of-use': { activeChild: null, queryParams: {}, children: {} },
        imprint: { activeChild: null, queryParams: {}, children: {} }
      }
    },
    catalog: {
      activeChild: null,
      queryParams: { isSearchShown: false, searchTerm: 'My query' },
      children: {},
      path: ''
    }
  }
}
```

You can freely modify the `routeState` object in your application. You may:
- Set the `activeChild` properties to change which routes are active.
- Change properties of the `queryParams` objects.
- Change the `path` property of the `'catalog'` route (which has path capturing enabled)

All changes will be reflected back to the URL.

## Tips and Tricks

### How to Redirect
Redirecting can be implemented by setting up an observer to the `routeState` object.

The following code redirects from any unknown route to the `'home'` route. Simply checking whether the `activeChild` property is `null` suffices, because the router automatically sets it to `null` whenever it encounters an unknown route.

```JS
static get observers () {
  return ['_onActiveChildRouteChange(routeState.activeChild)']
}
_onActiveChildRouteChange (routeName) {
  if (!routeName) { // null? => Redirect to home
    setTimeout(() => {
      this.set('routeState.activeChild', 'home')
    }, 0)
  }
}
```

Polymer expects that `_onActiveChildRouteChange()` doesn't change the value while it runs. Therefore the desired modification is done asynchronously using `setTimeout()`. More about Polymer's observers in the [documentation chapter about observers](https://www.polymer-project.org/2.0/docs/devguide/observers).
