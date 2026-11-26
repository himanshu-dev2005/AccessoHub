const { getDb, onCacheClear } = require('./firebase');

const VALID_ID_REGEX = /^([a-fA-F0-9]{24}|[A-Za-z0-9]{20})$/;
const CACHE_TTL_MS = 10000;

const queryCache = new Map(); // `${col}:${pushdownKey}` -> { items: rawObj[], expiresAt }
const docCache = new Map(); // `${col}:${id}` -> { data: rawObj|null, expiresAt }
const inFlightQueries = new Map(); // cacheKey -> Promise

function clearCache(collectionName) {
  if (!collectionName) {
    queryCache.clear();
    docCache.clear();
    inFlightQueries.clear();
    return;
  }
  const prefix = `${collectionName}:`;
  for (const key of queryCache.keys()) {
    if (key.startsWith(prefix)) queryCache.delete(key);
  }
  for (const key of docCache.keys()) {
    if (key.startsWith(prefix)) docCache.delete(key);
  }
  for (const key of inFlightQueries.keys()) {
    if (key.startsWith(prefix)) inFlightQueries.delete(key);
  }
}

onCacheClear(() => clearCache());

class Schema {
  constructor(definition = {}, options = {}) {
    this.definition = definition;
    this.options = options;
    this.methods = {};
    this.preHooks = { save: [] };
  }

  plugin() {
    // Autopopulate and plugins are handled natively by FirestoreModel
    return this;
  }

  pre(hookName, fn) {
    if (!this.preHooks[hookName]) {
      this.preHooks[hookName] = [];
    }
    this.preHooks[hookName].push(fn);
    return this;
  }
}

Schema.Types = {
  ObjectId: 'ObjectId',
  Mixed: 'Mixed',
};

const modelRegistry = {};

function getCollectionName(modelName) {
  return String(modelName || '').trim().toLowerCase();
}

function isObjectIdLike(val) {
  return typeof val === 'string' && VALID_ID_REGEX.test(val.trim());
}

function generateId(db) {
  if (db && typeof db.collection === 'function') {
    const col = db.collection('_ids');
    if (col && typeof col.doc === 'function') {
      const ref = col.doc();
      if (ref && ref.id) return ref.id;
    }
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 20; i += 1) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function convertTimestamps(value) {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    return value.toDate();
  }
  if (
    typeof value === 'object' &&
    typeof value._seconds === 'number' &&
    typeof value._nanoseconds === 'number'
  ) {
    return new Date(value._seconds * 1000 + Math.floor(value._nanoseconds / 1e6));
  }
  if (Array.isArray(value)) {
    return value.map(convertTimestamps);
  }
  if (typeof value === 'object' && value.constructor === Object) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = convertTimestamps(v);
    }
    return out;
  }
  return value;
}

function getByPath(obj, dotPath) {
  if (!obj || !dotPath) return undefined;
  const parts = dotPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      const collected = [];
      for (const item of current) {
        const val = item && typeof item === 'object' ? item[part] : undefined;
        if (val !== undefined) collected.push(val);
      }
      current = collected;
    } else {
      current = current[part];
    }
  }
  return current;
}

function setByPath(obj, dotPath, value) {
  const parts = dotPath.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[parts[parts.length - 1]] = value;
}

function valuesEqual(a, b) {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (a && typeof a === 'object' && a._id && typeof b === 'string') {
    return String(a._id) === b;
  }
  if (b && typeof b === 'object' && b._id && typeof a === 'string') {
    return String(b._id) === a;
  }
  return false;
}

function matchCondition(fieldValue, condition) {
  if (condition instanceof RegExp) {
    if (Array.isArray(fieldValue)) {
      return fieldValue.some((item) => typeof item === 'string' && condition.test(item));
    }
    return typeof fieldValue === 'string' && condition.test(fieldValue);
  }

  if (condition && typeof condition === 'object' && !Array.isArray(condition) && !(condition instanceof Date)) {
    const keys = Object.keys(condition);
    const isOperator = keys.some((k) => k.startsWith('$'));

    if (isOperator) {
      if ('$regex' in condition) {
        const flags = condition.$options || '';
        const regex =
          condition.$regex instanceof RegExp
            ? condition.$regex
            : new RegExp(condition.$regex, flags);
        if (Array.isArray(fieldValue)) {
          if (!fieldValue.some((v) => regex.test(String(v ?? '')))) return false;
        } else if (!regex.test(String(fieldValue ?? ''))) {
          return false;
        }
      }
      if ('$in' in condition) {
        const list = Array.isArray(condition.$in) ? condition.$in : [];
        if (Array.isArray(fieldValue)) {
          if (!fieldValue.some((fv) => list.some((lv) => valuesEqual(fv, lv)))) return false;
        } else if (!list.some((lv) => valuesEqual(fieldValue, lv))) {
          return false;
        }
      }
      if ('$nin' in condition) {
        const list = Array.isArray(condition.$nin) ? condition.$nin : [];
        if (Array.isArray(fieldValue)) {
          if (fieldValue.some((fv) => list.some((lv) => valuesEqual(fv, lv)))) return false;
        } else if (list.some((lv) => valuesEqual(fieldValue, lv))) {
          return false;
        }
      }
      if ('$ne' in condition) {
        if (valuesEqual(fieldValue, condition.$ne)) return false;
      }
      if ('$eq' in condition) {
        if (!valuesEqual(fieldValue, condition.$eq)) return false;
      }
      if ('$gt' in condition) {
        const cmp = condition.$gt instanceof Date ? condition.$gt.getTime() : condition.$gt;
        const val = fieldValue instanceof Date ? fieldValue.getTime() : fieldValue;
        if (val === undefined || val === null || !(val > cmp)) return false;
      }
      if ('$gte' in condition) {
        const cmp = condition.$gte instanceof Date ? condition.$gte.getTime() : condition.$gte;
        const val = fieldValue instanceof Date ? fieldValue.getTime() : fieldValue;
        if (val === undefined || val === null || !(val >= cmp)) return false;
      }
      if ('$lt' in condition) {
        const cmp = condition.$lt instanceof Date ? condition.$lt.getTime() : condition.$lt;
        const val = fieldValue instanceof Date ? fieldValue.getTime() : fieldValue;
        if (val === undefined || val === null || !(val < cmp)) return false;
      }
      if ('$lte' in condition) {
        const cmp = condition.$lte instanceof Date ? condition.$lte.getTime() : condition.$lte;
        const val = fieldValue instanceof Date ? fieldValue.getTime() : fieldValue;
        if (val === undefined || val === null || !(val <= cmp)) return false;
      }
      if ('$exists' in condition) {
        const exists = fieldValue !== undefined;
        if (Boolean(condition.$exists) !== exists) return false;
      }
      return true;
    }
  }

  if (Array.isArray(fieldValue)) {
    return fieldValue.some((fv) => valuesEqual(fv, condition));
  }
  return valuesEqual(fieldValue, condition);
}

function matchFilter(doc, filter = {}) {
  if (!filter || typeof filter !== 'object') return true;

  for (const [key, value] of Object.entries(filter)) {
    if (value === undefined) continue;
    if (key === '$or') {
      if (!Array.isArray(value) || !value.some((sub) => matchFilter(doc, sub))) {
        return false;
      }
      continue;
    }
    if (key === '$and') {
      if (!Array.isArray(value) || !value.every((sub) => matchFilter(doc, sub))) {
        return false;
      }
      continue;
    }
    if (key === '$nor') {
      if (!Array.isArray(value) || value.some((sub) => matchFilter(doc, sub))) {
        return false;
      }
      continue;
    }

    const fieldVal = getByPath(doc, key);
    if (!matchCondition(fieldVal, value)) {
      return false;
    }
  }
  return true;
}

function normalizeSortSpec(sortSpec) {
  if (!sortSpec) return null;
  if (typeof sortSpec === 'string') {
    if (sortSpec === 'desc' || sortSpec === '-1') return [['created', -1]];
    if (sortSpec === 'asc' || sortSpec === '1') return [['created', 1]];
    const dir = sortSpec.startsWith('-') ? -1 : 1;
    const field = sortSpec.replace(/^-/, '');
    return [[field, dir]];
  }
  if (typeof sortSpec === 'object') {
    return Object.entries(sortSpec).map(([k, v]) => {
      const dir = v === 'desc' || v === -1 || v === '-1' ? -1 : 1;
      return [k, dir];
    });
  }
  return null;
}

function compareSortValues(a, b) {
  const va = a instanceof Date ? a.getTime() : a;
  const vb = b instanceof Date ? b.getTime() : b;
  if (va === vb) return 0;
  if (va === undefined || va === null) return -1;
  if (vb === undefined || vb === null) return 1;
  if (typeof va === 'number' && typeof vb === 'number') return va - vb;
  return String(va).localeCompare(String(vb));
}

function sortDocs(docs, sortSpec) {
  const entries = normalizeSortSpec(sortSpec);
  if (!entries || !entries.length) return docs;
  return [...docs].sort((docA, docB) => {
    for (const [field, dir] of entries) {
      const res = compareSortValues(getByPath(docA, field), getByPath(docB, field));
      if (res !== 0) return res * dir;
    }
    return 0;
  });
}

function isFieldDefinitionObject(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  return (
    'type' in obj ||
    'default' in obj ||
    'required' in obj ||
    'ref' in obj ||
    'enum' in obj ||
    'trim' in obj ||
    'lowercase' in obj ||
    'autopopulate' in obj
  );
}

function coerceType(val, type) {
  if (val === undefined || val === null) return val;
  if (type === String) return String(val);
  if (type === Number) {
    if (val === '') return undefined;
    const num = Number(val);
    return Number.isNaN(num) ? val : num;
  }
  if (type === Boolean) {
    if (typeof val === 'string') return val === 'true' || val === '1';
    return Boolean(val);
  }
  if (type === Date) {
    if (val instanceof Date) return val;
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? val : d;
  }
  if (type === 'ObjectId') {
    if (typeof val === 'object' && val._id) return String(val._id);
    return String(val);
  }
  return val;
}

function applySchemaOnObject(target, def, isCreate = false) {
  const result = target && typeof target === 'object' ? { ...target } : {};

  for (const [key, rawDef] of Object.entries(def)) {
    if (Array.isArray(rawDef)) {
      if (result[key] === undefined && isCreate) {
        result[key] = [];
      } else if (Array.isArray(result[key]) && rawDef.length === 1) {
        const elemDef = rawDef[0];
        if (isFieldDefinitionObject(elemDef)) {
          result[key] = result[key].map((item) => {
            if (elemDef.type === 'ObjectId' && item && typeof item === 'object' && item._id) {
              return String(item._id);
            }
            return coerceType(item, elemDef.type);
          });
        } else if (typeof elemDef === 'object') {
          result[key] = result[key].map((item) => applySchemaOnObject(item, elemDef, isCreate));
        }
      }
      continue;
    }

    const isFieldObj = isFieldDefinitionObject(rawDef);
    const fieldDef = isFieldObj
      ? rawDef
      : typeof rawDef === 'function' || typeof rawDef === 'string'
        ? { type: rawDef }
        : null;

    if (!fieldDef && rawDef && typeof rawDef === 'object') {
      // Nested object schema (e.g. converted: { from: ..., quote: ... })
      if (result[key] !== undefined || isCreate) {
        result[key] = applySchemaOnObject(result[key] || {}, rawDef, isCreate);
      }
      continue;
    }

    if (!fieldDef) continue;

    if (result[key] === undefined && 'default' in fieldDef && (isCreate || key in result)) {
      result[key] =
        typeof fieldDef.default === 'function' ? fieldDef.default() : structuredCloneSafe(fieldDef.default);
    }

    if (result[key] !== undefined && result[key] !== null) {
      if (fieldDef.type === 'ObjectId' && typeof result[key] === 'object' && result[key]._id) {
        result[key] = String(result[key]._id);
      } else if (fieldDef.type) {
        result[key] = coerceType(result[key], fieldDef.type);
      }
      if (typeof result[key] === 'string') {
        if (fieldDef.trim) result[key] = result[key].trim();
        if (fieldDef.lowercase) result[key] = result[key].toLowerCase();
      }
    }

    if (fieldDef.required) {
      const val = result[key];
      if (val === undefined || val === null || val === '') {
        const err = new Error(`Path \`${key}\` is required.`);
        err.name = 'ValidationError';
        throw err;
      }
    }

    if (fieldDef.enum && result[key] !== undefined && result[key] !== null && result[key] !== '') {
      const allowed = Array.isArray(fieldDef.enum) ? fieldDef.enum : [];
      if (allowed.length && !allowed.includes(result[key])) {
        const err = new Error(`\`${result[key]}\` is not a valid enum value for path \`${key}\`.`);
        err.name = 'ValidationError';
        throw err;
      }
    }
  }

  return result;
}

function structuredCloneSafe(val) {
  if (val === null || val === undefined || typeof val !== 'object') return val;
  if (val instanceof Date) return new Date(val.getTime());
  if (Array.isArray(val)) return val.map(structuredCloneSafe);
  const out = {};
  for (const [k, v] of Object.entries(val)) {
    if (typeof v !== 'function') out[k] = structuredCloneSafe(v);
  }
  return out;
}

function stripUndefined(value) {
  if (value === undefined) return undefined;
  if (value === null || value instanceof Date || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(stripUndefined).filter((v) => v !== undefined);
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === 'function' || k === 'id') continue;
    const cleaned = stripUndefined(v);
    if (cleaned !== undefined) out[k] = cleaned;
  }
  return out;
}

function applyUpdatePayload(currentDoc, updatePayload) {
  const next = structuredCloneSafe(currentDoc);
  const hasOperators = Object.keys(updatePayload).some((k) => k.startsWith('$'));

  if (!hasOperators) {
    for (const [k, v] of Object.entries(updatePayload)) {
      if (k === '_id' || k === 'id' || v === undefined) continue;
      if (k.includes('.')) {
        setByPath(next, k, v);
      } else {
        next[k] = v;
      }
    }
    return next;
  }

  for (const [op, fields] of Object.entries(updatePayload)) {
    if (!op.startsWith('$')) {
      if (op !== '_id' && op !== 'id' && fields !== undefined) {
        next[op] = fields;
      }
      continue;
    }

    if (op === '$set' && fields && typeof fields === 'object') {
      for (const [k, v] of Object.entries(fields)) {
        if (k === '_id' || k === 'id' || v === undefined) continue;
        if (k.includes('.')) setByPath(next, k, v);
        else next[k] = v;
      }
    } else if (op === '$unset' && fields && typeof fields === 'object') {
      for (const k of Object.keys(fields)) {
        delete next[k];
      }
    } else if (op === '$inc' && fields && typeof fields === 'object') {
      for (const [k, delta] of Object.entries(fields)) {
        const cur = Number(getByPath(next, k) || 0);
        const updated = cur + Number(delta || 0);
        if (k.includes('.')) setByPath(next, k, updated);
        else next[k] = updated;
      }
    } else if (op === '$push' && fields && typeof fields === 'object') {
      for (const [k, val] of Object.entries(fields)) {
        const existing = Array.isArray(next[k]) ? [...next[k]] : [];
        if (val && typeof val === 'object' && Array.isArray(val.$each)) {
          existing.push(...val.$each);
        } else {
          existing.push(val);
        }
        next[k] = existing;
      }
    } else if (op === '$pull' && fields && typeof fields === 'object') {
      for (const [k, val] of Object.entries(fields)) {
        const existing = Array.isArray(next[k]) ? next[k] : [];
        next[k] = existing.filter((item) => !valuesEqual(item, val));
      }
    }
  }

  return next;
}

function getAutopopulateRefs(schema) {
  const specs = [];
  for (const [field, rawDef] of Object.entries(schema.definition)) {
    if (Array.isArray(rawDef) && rawDef.length === 1 && isFieldDefinitionObject(rawDef[0])) {
      if (rawDef[0].ref && rawDef[0].autopopulate) {
        specs.push({ path: field, ref: rawDef[0].ref, isArray: true });
      }
    } else if (isFieldDefinitionObject(rawDef) && rawDef.ref && rawDef.autopopulate) {
      specs.push({ path: field, ref: rawDef.ref, isArray: false });
    }
  }
  return specs;
}

function getRefForPath(schema, pathName) {
  const rawDef = schema.definition[pathName];
  if (Array.isArray(rawDef) && rawDef.length === 1 && rawDef[0]?.ref) {
    return { path: pathName, ref: rawDef[0].ref, isArray: true };
  }
  if (rawDef && rawDef.ref) {
    return { path: pathName, ref: rawDef.ref, isArray: false };
  }
  return null;
}

function applySelect(doc, selectSpec) {
  if (!selectSpec || !doc) return doc;
  const fields =
    typeof selectSpec === 'string'
      ? selectSpec.trim().split(/\s+/)
      : Object.entries(selectSpec).map(([k, v]) => (v ? k : `-${k}`));

  const excludes = fields.filter((f) => f.startsWith('-')).map((f) => f.slice(1));
  const includes = fields.filter((f) => !f.startsWith('-'));

  const cloned = { ...doc };
  if (includes.length > 0) {
    const allowed = new Set(['_id', 'id', ...includes]);
    for (const key of Object.keys(cloned)) {
      if (!allowed.has(key)) delete cloned[key];
    }
  } else if (excludes.length > 0) {
    for (const key of excludes) {
      delete cloned[key];
    }
  }
  return cloned;
}

function createModel(modelName, schema) {
  const normalizedName = modelName.trim();
  const collectionName = getCollectionName(normalizedName);
  const autopopulateSpecs = getAutopopulateRefs(schema);

  class FirestoreDocument {
    constructor(data = {}) {
      Object.assign(this, data);
      if (data._id && !this.id) {
        this.id = String(data._id);
      }
    }

    toObject() {
      const out = {};
      for (const [k, v] of Object.entries(this)) {
        if (typeof v !== 'function') out[k] = v;
      }
      return out;
    }

    toJSON() {
      return this.toObject();
    }

    async save() {
      const db = getDb();
      const isNew = !this._id;
      if (!this._id) {
        this._id = generateId(db);
      }
      this._id = String(this._id);
      this.id = this._id;

      // Run pre-save hooks
      for (const hook of schema.preHooks.save || []) {
        if (hook.length >= 1) {
          await new Promise((resolve, reject) => {
            hook.call(this, (err) => (err ? reject(err) : resolve()));
          });
        } else {
          await hook.call(this);
        }
      }

      if (schema.options?.timestamps && !this.created && !this.createdAt) {
        this.createdAt = new Date();
      }
      if (schema.options?.timestamps) {
        this.updatedAt = new Date();
      }
      if ('updated' in schema.definition) {
        this.updated = new Date();
      }

      const validated = applySchemaOnObject(this.toObject(), schema.definition, isNew);
      validated._id = this._id;
      const toStore = stripUndefined(validated);

      await db.collection(collectionName).doc(this._id).set(toStore);
      clearCache(collectionName);
      const hydrated = FirestoreModel._wrapDoc({ ...toStore, _id: this._id });
      const populated = await FirestoreModel._populateDocs([hydrated], [], 0);
      Object.assign(this, populated[0]);
      return this;
    }
  }

  for (const [methodName, fn] of Object.entries(schema.methods || {})) {
    FirestoreDocument.prototype[methodName] = fn;
  }

  class Query {
    constructor({ mode, filter = {}, update = null, options = {} }) {
      this.mode = mode; // 'find' | 'findOne' | 'findOneAndUpdate' | 'countDocuments'
      this.filter = { ...filter };
      this.update = update;
      this.options = options;
      this._sort = null;
      this._skip = 0;
      this._limit = 0;
      this._select = null;
      this._populates = [];
      this._skipPopulate = false;
      this._whereField = null;
    }

    skipPopulate(flag = true) {
      this._skipPopulate = Boolean(flag);
      return this;
    }

    lean() {
      this._skipPopulate = true;
      return this;
    }

    where(field) {
      this._whereField = field;
      return this;
    }

    equals(value) {
      if (this._whereField && value !== undefined) {
        this.filter[this._whereField] = value;
      }
      this._whereField = null;
      return this;
    }

    sort(spec) {
      this._sort = spec;
      return this;
    }

    skip(n) {
      this._skip = Number(n) || 0;
      return this;
    }

    limit(n) {
      this._limit = Number(n) || 0;
      return this;
    }

    select(spec) {
      this._select = spec;
      return this;
    }

    populate(spec, select) {
      if (!spec) return this;
      if (typeof spec === 'string') {
        for (const p of spec.split(/\s+/).filter(Boolean)) {
          this._populates.push({ path: p, select });
        }
      } else if (Array.isArray(spec)) {
        for (const item of spec) this.populate(item);
      } else if (typeof spec === 'object' && spec.path) {
        this._populates.push(spec);
      }
      return this;
    }

    async exec() {
      if (this.mode === 'findOneAndUpdate') {
        return FirestoreModel._execFindOneAndUpdate(
          this.filter,
          this.update,
          this.options,
          this._populates
        );
      }

      const matched = await FirestoreModel._queryFiltered(this.filter);

      if (this.mode === 'countDocuments') {
        return matched.length;
      }

      const sorted = this._sort ? sortDocs(matched, this._sort) : matched;

      if (this.mode === 'findOne') {
        if (!sorted.length) return null;
        const first = this._skipPopulate
          ? sorted[0]
          : (await FirestoreModel._populateDocs([sorted[0]], this._populates, 0))[0];
        return this._select ? applySelect(first, this._select) : first;
      }

      let sliced = sorted;
      if (this._skip > 0) sliced = sliced.slice(this._skip);
      if (this._limit > 0) sliced = sliced.slice(0, this._limit);

      let results = this._skipPopulate
        ? sliced
        : await FirestoreModel._populateDocs(sliced, this._populates, 0);
      if (this._select) {
        results = results.map((d) => applySelect(d, this._select));
      }
      return results;
    }

    then(resolve, reject) {
      return this.exec().then(resolve, reject);
    }

    catch(reject) {
      return this.exec().catch(reject);
    }
  }

  class FirestoreModel {
    constructor(data = {}) {
      return new FirestoreDocument(data);
    }

    static get modelName() {
      return normalizedName;
    }

    static get schema() {
      return schema;
    }

    static _wrapDoc(rawData) {
      const converted = convertTimestamps(rawData);
      converted._id = String(converted._id);
      converted.id = converted._id;
      return new FirestoreDocument(converted);
    }

    static _pickPushdownField(filter = {}) {
      const candidates = [];
      for (const [k, v] of Object.entries(filter)) {
        if (k.startsWith('$') || k.includes('.')) continue;
        if (v === undefined || v === null) continue;
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
          candidates.push([k, v]);
        }
      }
      if (!candidates.length) return null;
      const selective = candidates.find(([k]) => k !== 'removed' && k !== 'enabled');
      return selective || candidates[0];
    }

    static async _fetchRawById(id) {
      if (!id) return null;
      const docId = String(id).trim();
      if (!docId) return null;
      const cacheKey = `${collectionName}:id:${docId}`;
      const now = Date.now();
      const cached = docCache.get(cacheKey);
      if (cached && cached.expiresAt > now) {
        return cached.data;
      }

      if (inFlightQueries.has(cacheKey)) {
        return inFlightQueries.get(cacheKey);
      }

      const promise = (async () => {
        const db = getDb();
        const snap = await db.collection(collectionName).doc(docId).get();
        const raw = snap.exists ? { _id: snap.id, ...snap.data() } : null;
        docCache.set(cacheKey, { data: raw, expiresAt: Date.now() + CACHE_TTL_MS });
        return raw;
      })();

      inFlightQueries.set(cacheKey, promise);
      try {
        return await promise;
      } finally {
        inFlightQueries.delete(cacheKey);
      }
    }

    static async _fetchRawBatchByIds(ids = []) {
      const uniqueIds = [...new Set(ids.map((x) => String(x || '').trim()).filter(Boolean))];
      const resultMap = new Map();
      if (!uniqueIds.length) return resultMap;

      const now = Date.now();
      const missingIds = [];
      for (const id of uniqueIds) {
        const cached = docCache.get(`${collectionName}:id:${id}`);
        if (cached && cached.expiresAt > now) {
          if (cached.data) resultMap.set(id, cached.data);
        } else {
          missingIds.push(id);
        }
      }

      if (!missingIds.length) return resultMap;

      const db = getDb();
      const colRef = db.collection(collectionName);
      if (typeof db.getAll === 'function') {
        for (let i = 0; i < missingIds.length; i += 100) {
          const chunk = missingIds.slice(i, i + 100);
          const refs = chunk.map((id) => colRef.doc(id));
          const snaps = await db.getAll(...refs);
          const exp = Date.now() + CACHE_TTL_MS;
          for (const snap of snaps) {
            const raw = snap.exists ? { _id: snap.id, ...snap.data() } : null;
            docCache.set(`${collectionName}:id:${snap.id}`, { data: raw, expiresAt: exp });
            if (raw) resultMap.set(snap.id, raw);
          }
        }
      } else {
        const fetched = await Promise.all(
          missingIds.map(async (id) => [id, await FirestoreModel._fetchRawById(id)])
        );
        for (const [id, raw] of fetched) {
          if (raw) resultMap.set(id, raw);
        }
      }

      return resultMap;
    }

    static async _queryFiltered(filter = {}) {
      if (filter && typeof filter._id === 'string' && filter._id.trim()) {
        const raw = await FirestoreModel._fetchRawById(filter._id.trim());
        if (!raw) return [];
        const doc = FirestoreModel._wrapDoc(raw);
        return matchFilter(doc, filter) ? [doc] : [];
      }

      const pushdown = FirestoreModel._pickPushdownField(filter);
      const pushdownKey = pushdown
        ? `${pushdown[0]}==${typeof pushdown[1]}:${String(pushdown[1])}`
        : 'ALL';
      const cacheKey = `${collectionName}:q:${pushdownKey}`;
      const now = Date.now();

      let rawItems;
      const cached = queryCache.get(cacheKey);
      if (cached && cached.expiresAt > now) {
        rawItems = cached.items;
      } else if (inFlightQueries.has(cacheKey)) {
        rawItems = await inFlightQueries.get(cacheKey);
      } else {
        const promise = (async () => {
          const db = getDb();
          const colRef = db.collection(collectionName);
          const snapshot = pushdown
            ? await colRef.where(pushdown[0], '==', pushdown[1]).get()
            : await colRef.get();

          const items = [];
          const exp = Date.now() + CACHE_TTL_MS;
          snapshot.forEach((snap) => {
            const data = typeof snap.data === 'function' ? snap.data() : snap;
            const raw = { _id: snap.id, ...data };
            items.push(raw);
            docCache.set(`${collectionName}:id:${snap.id}`, { data: raw, expiresAt: exp });
          });

          queryCache.set(cacheKey, { items, expiresAt: exp });
          return items;
        })();

        inFlightQueries.set(cacheKey, promise);
        try {
          rawItems = await promise;
        } finally {
          inFlightQueries.delete(cacheKey);
        }
      }

      const docs = [];
      for (const raw of rawItems) {
        const wrapped = FirestoreModel._wrapDoc(raw);
        if (matchFilter(wrapped, filter)) {
          docs.push(wrapped);
        }
      }
      return docs;
    }

    static async _populateDocs(docs, extraSpecs = [], depth = 0) {
      if (!docs.length || depth >= 2) return docs;

      const specMap = new Map();
      for (const spec of autopopulateSpecs) {
        specMap.set(spec.path, spec);
      }
      for (const spec of extraSpecs) {
        const refInfo = getRefForPath(schema, spec.path);
        if (refInfo) {
          specMap.set(spec.path, { ...refInfo, select: spec.select });
        }
      }

      if (!specMap.size) return docs;

      for (const spec of specMap.values()) {
        const targetModel = modelRegistry[spec.ref];
        if (!targetModel) continue;

        const idSet = new Set();
        for (const doc of docs) {
          const raw = doc[spec.path];
          if (!raw) continue;
          if (spec.isArray && Array.isArray(raw)) {
            for (const item of raw) {
              const id = typeof item === 'object' ? item._id : item;
              if (id) idSet.add(String(id));
            }
          } else {
            const id = typeof raw === 'object' ? raw._id : raw;
            if (id) idSet.add(String(id));
          }
        }

        if (!idSet.size) continue;

        const rawMap = await targetModel._fetchRawBatchByIds([...idSet]);
        const hydratedDocs = [];
        for (const [id, raw] of rawMap.entries()) {
          hydratedDocs.push({ id, doc: targetModel._wrapDoc(raw) });
        }
        await targetModel._populateDocs(
          hydratedDocs.map((e) => e.doc),
          [],
          depth + 1
        );

        const byId = new Map();
        for (const { id, doc: resolvedDoc } of hydratedDocs) {
          byId.set(id, spec.select ? applySelect(resolvedDoc, spec.select) : resolvedDoc);
        }

        for (const doc of docs) {
          const raw = doc[spec.path];
          if (!raw) continue;
          if (spec.isArray && Array.isArray(raw)) {
            doc[spec.path] = raw
              .map((item) => {
                const id = typeof item === 'object' ? item._id : item;
                return byId.get(String(id)) || item;
              })
              .filter(Boolean);
          } else {
            const id = typeof raw === 'object' ? raw._id : raw;
            const resolved = byId.get(String(id));
            if (resolved) doc[spec.path] = resolved;
          }
        }
      }

      return docs;
    }

    static async _findByIdRaw(id, depth = 0) {
      if (!id) return null;
      const db = getDb();
      const snap = await db.collection(collectionName).doc(String(id)).get();
      if (!snap.exists) return null;
      const wrapped = FirestoreModel._wrapDoc({ _id: snap.id, ...snap.data() });
      const [populated] = await FirestoreModel._populateDocs([wrapped], [], depth);
      return populated;
    }

    static find(filter = {}) {
      return new Query({ mode: 'find', filter });
    }

    static findOne(filter = {}) {
      return new Query({ mode: 'findOne', filter });
    }

    static findById(id) {
      return new Query({ mode: 'findOne', filter: { _id: id ? String(id) : '' } });
    }

    static countDocuments(filter = {}) {
      return new Query({ mode: 'countDocuments', filter });
    }

    static async create(docOrDocs) {
      if (Array.isArray(docOrDocs)) {
        return FirestoreModel.insertMany(docOrDocs);
      }
      const instance = new FirestoreDocument(docOrDocs);
      return instance.save();
    }

    static async insertMany(docs = []) {
      const created = [];
      for (const item of docs) {
        const instance = new FirestoreDocument(item);
        created.push(await instance.save());
      }
      return created;
    }

    static findOneAndUpdate(filter = {}, update = {}, options = {}) {
      return new Query({ mode: 'findOneAndUpdate', filter, update, options });
    }

    static findByIdAndUpdate(id, update = {}, options = {}) {
      return new Query({
        mode: 'findOneAndUpdate',
        filter: { _id: id ? String(id) : '' },
        update,
        options,
      });
    }

    static async _execFindOneAndUpdate(filter, update, options = {}, extraPopulates = []) {
      const db = getDb();
      const matched = await FirestoreModel._queryFiltered(filter);

      if (!matched.length) {
        if (!options.upsert) return null;
        const baseDoc = {};
        for (const [k, v] of Object.entries(filter || {})) {
          if (!k.startsWith('$') && (typeof v !== 'object' || v instanceof Date)) {
            baseDoc[k] = v;
          }
        }
        const merged = applyUpdatePayload(baseDoc, update);
        const created = new FirestoreDocument(merged);
        return created.save();
      }

      const existing = matched[0];
      const existingPlain = existing.toObject();
      const updatedRaw = applyUpdatePayload(existingPlain, update);
      updatedRaw._id = existing._id;

      if ('updated' in schema.definition && updatedRaw.updated === existingPlain.updated) {
        updatedRaw.updated = new Date();
      }

      const validated = applySchemaOnObject(
        updatedRaw,
        schema.definition,
        false
      );
      validated._id = existing._id;

      // Also validate if options.runValidators and explicit $set touched something invalid
      const toStore = stripUndefined(validated);
      await db.collection(collectionName).doc(existing._id).set(toStore);
      clearCache(collectionName);

      const finalDoc = options.new === false ? existing : FirestoreModel._wrapDoc(toStore);
      const [populated] = await FirestoreModel._populateDocs([finalDoc], extraPopulates, 0);
      return populated;
    }

    static async updateMany(filter = {}, update = {}) {
      const db = getDb();
      const matched = await FirestoreModel._queryFiltered(filter);
      let modifiedCount = 0;

      for (const doc of matched) {
        const updatedRaw = applyUpdatePayload(doc.toObject(), update);
        updatedRaw._id = doc._id;
        const validated = applySchemaOnObject(updatedRaw, schema.definition, false);
        validated._id = doc._id;
        await db.collection(collectionName).doc(doc._id).set(stripUndefined(validated));
        modifiedCount += 1;
      }

      if (modifiedCount > 0) clearCache(collectionName);
      return { matchedCount: matched.length, modifiedCount, nMatched: matched.length, nModified: modifiedCount };
    }

    static async deleteMany(filter = {}) {
      const db = getDb();
      const matched = await FirestoreModel._queryFiltered(filter);
      if (!matched.length) return { deletedCount: 0 };

      const colRef = db.collection(collectionName);
      if (typeof db.batch === 'function') {
        for (let i = 0; i < matched.length; i += 400) {
          const batch = db.batch();
          for (const doc of matched.slice(i, i + 400)) {
            batch.delete(colRef.doc(doc._id));
          }
          await batch.commit();
        }
      } else {
        for (const doc of matched) {
          await colRef.doc(doc._id).delete();
        }
      }
      clearCache(collectionName);
      return { deletedCount: matched.length };
    }

    static async bulkWrite(operations = []) {
      let nMatched = 0;
      let nModified = 0;

      for (const op of operations) {
        if (op.updateOne) {
          const { filter, update, upsert } = op.updateOne;
          const res = await FirestoreModel._execFindOneAndUpdate(filter, update, {
            new: true,
            upsert: Boolean(upsert),
          });
          if (res) {
            nMatched += 1;
            nModified += 1;
          }
        } else if (op.insertOne) {
          await FirestoreModel.create(op.insertOne.document || op.insertOne);
          nModified += 1;
        } else if (op.deleteOne) {
          const found = await FirestoreModel._queryFiltered(op.deleteOne.filter || {});
          if (found.length) {
            await getDb().collection(collectionName).doc(found[0]._id).delete();
            clearCache(collectionName);
            nMatched += 1;
            nModified += 1;
          }
        }
      }

      return { nMatched, matchedCount: nMatched, nModified, modifiedCount: nModified };
    }
  }

  return FirestoreModel;
}

function model(name, schema) {
  const key = String(name || '').trim();
  if (schema) {
    const ModelClass = createModel(key, schema);
    modelRegistry[key] = ModelClass;
    // Also index by un-trimmed name if caller passed e.g. 'Upload '
    modelRegistry[name] = ModelClass;
    return ModelClass;
  }
  const existing = modelRegistry[key] || modelRegistry[name];
  if (!existing) {
    throw new Error(`Model "${name}" has not been registered yet.`);
  }
  return existing;
}

module.exports = {
  Schema,
  model,
  models: modelRegistry,
  isObjectIdLike,
  clearCache,
};
