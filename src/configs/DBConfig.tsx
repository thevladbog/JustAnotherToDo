export const DBConfig = {
  name: 'TodoDB',
  version: 1,
  objectStoresMeta: [
    {
      store: 'todos',
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [
        { name: 'text', keypath: 'text', options: { unique: false } },
        { name: 'done', keypath: 'done', options: { unique: false } }
      ]
    }
  ]
};
