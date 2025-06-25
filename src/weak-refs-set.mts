export class WeakRefsSet<T extends object = object> {
  protected set = new Set<WeakRef<T>>();
  #cleanup = new FinalizationRegistry<WeakRef<T>>((ref) => this.set.delete(ref));

  get size() {
    return this.set.size;
  }

  get(value: T) {
    if (value === undefined) return;
    for (const ref of this.set) {
      if (ref.deref() === value) return ref;
    }
  }

  addRef(ref: WeakRef<T>) {
    const value = ref.deref();
    if (value === undefined) return this;
    this.set.add(ref);
    this.#cleanup.register(value, ref, value);
    return this;
  }

  add(value: T, check = true) {
    if (check && this.has(value)) return this;
    const ref = new WeakRef(value);
    this.set.add(ref);
    this.#cleanup.register(value, ref, value);
    return this;
  }

  clear(fast = false) {
    if (!fast) {
      for (const ref of this.set) {
        const o = ref.deref();
        if (o !== undefined) this.#cleanup.unregister(o);
      }
    }
    return this.set.clear();
  }

  deleteRef(value: WeakRef<T>): boolean {
    if (this.set.delete(value)) {
      const o = value.deref();
      if (o !== undefined) this.#cleanup.unregister(o);
      return true;
    }
    return false;
  }

  delete(value: T) {
    const ref = this.get(value);
    return ref !== undefined && this.deleteRef(ref);
  }

  forEach(callbackfn: (value: WeakRef<T>, value2: WeakRef<T>, set: Set<WeakRef<T>>) => void, thisArg?: any) {
    return this.set.forEach(callbackfn, thisArg);
  }

  hasRef(value: WeakRef<T>): boolean {
    return this.set.has(value);
  }

  has(value: T): boolean {
    return this.get(value) !== undefined;
  }

  entries() {
    return this.set.entries();
  }
  keys() {
    return this.set.keys();
  }
  values() {
    return this.set.values();
  }
  [Symbol.iterator]() {
    return this.set[Symbol.iterator]();
  }
}
WeakRefsSet[Symbol.toStringTag] = "WeakRefSet";
export default WeakRefsSet;
