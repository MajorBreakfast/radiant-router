[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/MajorBreakfast/radiant-router)

# Radiant Router
The `<radiant-router>` is a custom element which synchronizes a URL to a JavaScript object and vice versa. It supports query parameters and path capturing.

## Installation

```sh
bower install --save MajorBreakfast/radiant-router
```

## Demo
This router is used in production in the [Wolf Service App](https://www.wolfserviceapp.com/) (Spare parts catalog app for the heating, air handling and ventilation systems supplier Wolf GmbH). 

## Example router setup

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

You may:
- Set the `activeChild` property to change the active route
- Change properties of the `queryParams` objects
- Change the `path` property of the `'catalog'` route (which has path capturing enabled)

## Tips and Tricks

### How to Redirect
Redirecting can be implemented by setting up an observer to the `routeState` object.

The following code redirects from any unknown route to the `'home'` route. Simply checking whether the `activeChild` property is `null` suffices, because the router automatically sets it to `null` whenever it encounters an unknown route.

```JS
observers: [
  '_onActiveChildRouteChange(routeState.activeChild)'
],
_onActiveChildRouteChange (routeName) {
  if (!routeName) { // null? => Redirect to home
    setTimeout(() => {
      this.set('routeState.activeChild', 'home')
    }, 0)
  }
}
```

Polymer expects that `_onActiveChildRouteChange()` doesn't change the value while it runs. Therefore the modification is done asynchronously using `setTimeout()`. More about Polymer's observers in the [documentation chapter about observers](https://www.polymer-project.org/2.0/docs/devguide/observers).
