const metObjectToMemoized = new WeakMap<object, object>();
const memoizedRefsSet = new Set<WeakRef<object>>();
const finalizationRegistry = new FinalizationRegistry<WeakRef<object>>(ref => memoizedRefsSet.delete(ref));

export function memoObj<T>(object: T): T {
  if (object && typeof object === "object") {
    const memoized = metObjectToMemoized.get(object);
    if (memoized !== undefined) {
      return memoized as T;
    }
    const objectStringKeys = new Set(Object.getOwnPropertyNames(object));
    const objectSymbolKeys = new Set(Object.getOwnPropertySymbols(object));
    for (const ref of memoizedRefsSet) {
      const memoized = ref.deref();
      if (!memoized) {
        memoizedRefsSet.delete(ref);
        continue;
      }
      const memoizedStringKeys = Object.getOwnPropertyNames(memoized);
      const memoizedSymbolKeys = Object.getOwnPropertySymbols(memoized);
      if (objectStringKeys.size !== memoizedStringKeys.length || objectSymbolKeys.size !== memoizedSymbolKeys.length) continue;
      if (!(memoizedStringKeys.every(key => objectStringKeys.has(key)) && memoizedSymbolKeys.every(key => objectSymbolKeys.has(key)))) continue;
      metObjectToMemoized.set(object, memoized); // For circular references, assume it is memoized
      const compareValues = (key: string | symbol) => {
        const objectChild = object[key];
        const memoizedChild = memoized[key];
        return Object.is(objectChild, memoizedChild) || Object.is(memoObj(objectChild), memoObj(memoizedChild));
      };
      if (memoizedStringKeys.every(compareValues) && memoizedSymbolKeys.every(compareValues)) {
        //metObjectToMemoized.set(object, memoized); // Already set
        return memoized as T;
      }
    }
    metObjectToMemoized.delete(object); // Clean after it was set in loop
    const ref = new WeakRef(object);
    memoizedRefsSet.add(ref);
    finalizationRegistry.register(object, ref);
  }
  return object;
}

export default memoObj;
