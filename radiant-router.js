import { Element } from '../@polymer/polymer/polymer-element.js'
export { default as RadiantRoute } from './radiant-route.js'

export class RadiantRouter extends Element {
  static get is () { return 'radiant-router' }

  static get properties () {
    return {
      url: { type: String, notify: true },
      routeState: { type: Object, notify: true },
      rootRoute: { type: Object, value: null }
    }
  }

  static get observers () {
    return [
      '_onURLChange(url, rootRoute)',
      '_onRouteStateChange(routeState, rootRoute, routeState.*)'
    ]
  }

  _onURLChange (url) {
    if (typeof url !== 'string') { return }
    this.rootRoute.url = url
    this._extractPropertiesFromRouter()
  }

  _onRouteStateChange (routeState) {
    if (typeof routeState !== 'object') { return }
    this.rootRoute.state = routeState
    this._extractPropertiesFromRouter()
  }

  _extractPropertiesFromRouter () {
    // URL
    this.url = this.rootRoute.url

    // routeState
    var newRouteState = this.rootRoute.state
    if (!deepEqual(this.routeState, newRouteState)) {
      this.routeState = newRouteState
    }
  }
}
customElements.define(RadiantRouter.is, RadiantRouter)
export default RadiantRouter

function deepEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}
