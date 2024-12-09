import { CanActivateFn, Route } from '@angular/router'

export const AdminAuthGuard: CanActivateFn = (route, state) => {
  const isAdmin = true // debug, todo

  // provides the route configuration options.
  const { routeConfig } = route

  // provides the path of the route.
  const { path } = routeConfig as Route

  if (path?.includes('admin')) {
    // if user is administrator and is trying to access admin routes, allow access.
    if (isAdmin) return true

    // otherwise deny
    return false
  }

  return true // default allow
}
