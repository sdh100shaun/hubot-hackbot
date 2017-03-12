declare module 'slug' {
  function slug(string: string, opts: slug.Options): string;
  namespace slug {
    interface Options {
      mode?: 'pretty' | 'rfc3986';
      replacement?: string;
      symbols?: boolean;
      remove?: RegExp;
      lower?: boolean;
      charmap?: { [char: string]: string },
      multicharmap?: { [char: string]: string },
    }
  }
  export = slug;
}