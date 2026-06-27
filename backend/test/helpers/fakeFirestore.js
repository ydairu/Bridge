// Minimal in-memory stand-in for the admin.firestore() surface that
// BridgeFirestoreService uses: collection/doc/get/set/add/where/orderBy/limit.
// Documents get a hidden __seq write-order counter so orderBy on non-comparable
// values (e.g. serverTimestamp sentinels) is deterministic in tests.

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function isComparable(v) {
  return typeof v === "string" || typeof v === "number" || typeof v === "boolean";
}

class DocSnapshot {
  constructor(id, data) {
    this.id = id;
    this._data = data;
    this.exists = data !== undefined;
  }
  data() {
    return clone(this._data);
  }
}

class DocRef {
  constructor(map, id, counter) {
    this._map = map;
    this.id = id;
    this._counter = counter;
  }
  async get() {
    const entry = this._map.get(this.id);
    return new DocSnapshot(this.id, entry ? entry.data : undefined);
  }
  async set(data, options = {}) {
    const existing = this._map.get(this.id);
    if (options.merge && existing) {
      existing.data = { ...existing.data, ...clone(data) };
    } else {
      this._map.set(this.id, { data: clone(data), __seq: existing?.__seq ?? this._counter.next() });
    }
    return { id: this.id };
  }
  async update(data) {
    const existing = this._map.get(this.id);
    if (!existing) throw new Error("No document to update: " + this.id);
    existing.data = { ...existing.data, ...clone(data) };
    return { id: this.id };
  }
}

class Query {
  constructor(map, filters = [], order = null, max = null) {
    this._map = map;
    this._filters = filters;
    this._order = order;
    this._max = max;
  }
  where(field, op, value) {
    if (op !== "==") throw new Error(`FakeFirestore only supports '==' (got '${op}')`);
    return new Query(this._map, [...this._filters, { field, value }], this._order, this._max);
  }
  orderBy(field, dir = "asc") {
    return new Query(this._map, this._filters, { field, dir }, this._max);
  }
  limit(n) {
    return new Query(this._map, this._filters, this._order, n);
  }
  async get() {
    let rows = [...this._map.entries()].map(([id, entry]) => ({ id, entry }));

    for (const { field, value } of this._filters) {
      rows = rows.filter((row) => row.entry.data?.[field] === value);
    }

    if (this._order) {
      const { field, dir } = this._order;
      rows.sort((a, b) => {
        const av = a.entry.data?.[field];
        const bv = b.entry.data?.[field];
        let cmp;
        if (isComparable(av) && isComparable(bv)) {
          cmp = av < bv ? -1 : av > bv ? 1 : 0;
        } else {
          cmp = a.entry.__seq - b.entry.__seq; // fallback: write order
        }
        return dir === "desc" ? -cmp : cmp;
      });
    } else {
      rows.sort((a, b) => a.entry.__seq - b.entry.__seq);
    }

    if (this._max != null) rows = rows.slice(0, this._max);

    const docs = rows.map(({ id, entry }) => new DocSnapshot(id, entry.data));
    return {
      docs,
      size: docs.length,
      empty: docs.length === 0,
      forEach: (fn) => docs.forEach(fn),
    };
  }
}

class CollectionRef {
  constructor(map, counter) {
    this._map = map;
    this._counter = counter;
  }
  doc(id) {
    const docId = id || `auto_${this._counter.next()}`;
    return new DocRef(this._map, docId, this._counter);
  }
  async add(data) {
    const id = `auto_${this._counter.next()}`;
    this._map.set(id, { data: clone(data), __seq: this._counter.next() });
    return { id };
  }
  where(field, op, value) {
    return new Query(this._map, []).where(field, op, value);
  }
  orderBy(field, dir) {
    return new Query(this._map, []).orderBy(field, dir);
  }
  limit(n) {
    return new Query(this._map, []).limit(n);
  }
  async get() {
    return new Query(this._map, []).get();
  }
}

export function createFakeFirestore(seed = {}) {
  const collections = new Map();
  const counter = { _n: 0, next() { return ++this._n; } };

  function collectionMap(name) {
    if (!collections.has(name)) collections.set(name, new Map());
    return collections.get(name);
  }

  for (const [name, docs] of Object.entries(seed)) {
    const map = collectionMap(name);
    for (const [id, data] of Object.entries(docs)) {
      map.set(id, { data: clone(data), __seq: counter.next() });
    }
  }

  return {
    collection(name) {
      return new CollectionRef(collectionMap(name), counter);
    },
    // test helper: read raw docs of a collection as plain objects
    _dump(name) {
      const map = collections.get(name);
      if (!map) return [];
      return [...map.entries()].map(([id, entry]) => ({ id, ...entry.data }));
    },
  };
}
