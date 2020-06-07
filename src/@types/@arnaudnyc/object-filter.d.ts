declare module '@arnaudnyc/object-filter' {
  type ObjectType = Record<string, any>;
  type ObjectFilter = (
    obj: ObjectType,
    filterFunction: (key: string, value: string) => boolean
  ) => ObjectType;
  let f: ObjectFilter;
  export = f;
}
