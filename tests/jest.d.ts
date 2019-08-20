declare namespace jest {
  interface Matchers<R> {
    toAllow(): R
    toDeny(): R
  }
}
