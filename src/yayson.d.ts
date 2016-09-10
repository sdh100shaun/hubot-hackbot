declare module 'yayson' {
  class Store {
    sync(obj: Object): Object;
    sync<T>(obj: Object): T;
  }

  interface Yayson {
    Store: typeof Store;
  }

  function yayson(): Yayson;
  namespace yayson {}
  export = yayson;
}
