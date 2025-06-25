import WeakRefsSet from "./weak-refs-set.mjs";

export interface MemoObjOptions {
  forceOptimizationAsFrozen?: boolean;
}

const fastLookupMap = new WeakMap<object, WeakRef<object>>();
const circularLookupMap = new WeakMap<object, WeakRef<object>>();
const memoRefsSet = new WeakRefsSet();
const backupRefs = new WeakRefsSet();

export function memoObj<T>(object: T, options?: MemoObjOptions): T {
  const {
    forceOptimizationAsFrozen = false,
  } = options || {};
  if (object && typeof object === "object") {
    let ref = circularLookupMap.get(object);
    let memoized = ref?.deref() as T | undefined;
    if (memoized !== undefined) {
      return memoized;
    }
    ref = fastLookupMap.get(object);
    memoized = ref?.deref() as T | undefined;

    if (memoized !== undefined && (forceOptimizationAsFrozen || Object.isFrozen(object))) {
      return memoized;
    }
    const objectStringKeys = new Set(Object.getOwnPropertyNames(object));
    const objectSymbolKeys = new Set(Object.getOwnPropertySymbols(object));
    const proto = Object.getPrototypeOf(object);
    const compareValues = (key: string | symbol) => {
      if (memoized === undefined) return false;
      const objectChild = object[key];
      const memoizedChild = memoized![key];
      return Object.is(objectChild, memoizedChild) || Object.is(memoObj(objectChild), memoObj(memoizedChild));
    };
    const compareWithMemoized = () => {
      if (memoized === undefined) return false;
      if (!Object.is(proto, Object.getPrototypeOf(memoized))) return false;
      const memoizedStringKeys = Object.getOwnPropertyNames(memoized);
      const memoizedSymbolKeys = Object.getOwnPropertySymbols(memoized);
      if (objectStringKeys.size !== memoizedStringKeys.length || objectSymbolKeys.size !== memoizedSymbolKeys.length) return false;
      if (!(memoizedStringKeys.every(key => objectStringKeys.has(key)) && memoizedSymbolKeys.every(key => objectSymbolKeys.has(key)))) return false;
      circularLookupMap.set(object, ref!);
      const result = memoizedStringKeys.every(compareValues) && memoizedSymbolKeys.every(compareValues);
      circularLookupMap.delete(object);
      return result;
    };
    if (memoized !== undefined) {
      if (compareWithMemoized()) {
        return memoized;
      } else {
        fastLookupMap.delete(object);
      }
    }
    for (const ref_ of memoRefsSet) {
      ref = ref_;
      memoized = ref.deref() as T;
      if (compareWithMemoized()) {
        backupRefs.add(object);
        if (forceOptimizationAsFrozen || Object.isFrozen(object)) {
          fastLookupMap.set(object, ref);
        }
        return memoized;
      }
    }
    for (const ref_ of backupRefs) {
      ref = ref_;
      memoized = ref.deref() as T;
      if (compareWithMemoized()) {
        memoRefsSet.addRef(ref);
        backupRefs.deleteRef(ref);
        backupRefs.add(object);
        if (forceOptimizationAsFrozen || Object.isFrozen(object)) {
          fastLookupMap.set(object, ref);
        }
        return memoized;
      }
    }
    ref = new WeakRef(object);
    memoRefsSet.addRef(ref);
    if (forceOptimizationAsFrozen || Object.isFrozen(object)) {
      circularLookupMap.set(object, ref);
    }
  }
  return object;
}

export default memoObj;
