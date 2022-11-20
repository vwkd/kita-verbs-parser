import { equal } from "$std/testing/asserts.ts";

import type { EntryType } from "../types.ts";
import { createId, pipe } from "../utils.ts";

export default function transform(entries: EntryType[]) {
  const p = pipe(
    renameTags,
    sortTags,
    addId,
    addReferenceId,
    renameReferenceKind,
    removeOld,
  );

  return p(entries);
}

/* Add entry.id
 * uses source value and meaning as id using UUID v5
*/
function addId(entries: EntryType[]) {
  entries.forEach((e) => {
    const data = e.source.value + (e.source.meaning ?? "");

    e.id = createId(data);
  });

  return entries;
}

/* Add reference id
 * beware: assumes entries have unique source, no duplicates!
*/
function addReferenceId(entries: EntryType[]) {
  entries.forEach((e) => {
    e.target.forEach(({ value }) => {
      value.forEach((value) => {
        // checks if reference
        if (value.source) {
          const eRef = entries.find((f) => equal(f.source, value.source));

          if (!eRef) {
            throw new Error(
              `Couldn't find referenced entry '${
                Object.values(value.source).join("^")
              }' at entry '${Object.values(e.source).join("^")}'.`,
            );
          }
          const id = eRef.id;

          value.id = id;
        }
      });
    });
  });

  return entries;
}

/* Rename reference kind
* expand word and make uppercase
*/
function renameReferenceKind(entries: EntryType[]) {
  const KIND = {
    "s.": "DIRECT",
    "Bed. s.": "MEANING",
    "id.": "IDENTICAL",
  };

  entries.forEach((e) => {
    e.target.forEach(({ value }) => {
      value.forEach((value) => {
        // checks if reference
        if (value.kind) {
          value.kind = KIND[value.kind];
        }
      });
    });
  });

  return entries;
}

/* Rename tags
* remove trailing period and make uppercase
* note: saves database to keep short and expand only on client, also GraphQL server only allows _a-zA-Z
* note: assumes all tags have trailing period
*/
function renameTags(entries: EntryType[]) {
  function newTags(tags) {
    return tags.map((tag) => tag.slice(0, -1).toUpperCase().replace("-", "_"));
  }

  entries.forEach((e) => {
    e.target.forEach(({ value }) => {
      value.forEach((value) => {
        value.tags = newTags(value.tags);
      });
    });
  });

  return entries;
}

/* Sort tags alphabetically
*/
function sortTags(entries: EntryType[]) {
  entries.forEach((e) => {
    e.target.forEach(({ value }) => {
      value.forEach((value) => {
        value.tags.sort();
      });
    });
  });

  return entries;
}

/* Remove old entries or values and references
*/
function removeOld(entries: EntryType[]) {
  return entries.map((e) => {
    e.target = e.target.map((t) => {
      t.value = t.value.filter(({ tags }) => !tags.includes("VA"));

      if (t.value.length == 0) {
        return null;
      }

      return t;
    }).filter((t) => t != null);

    if (e.target.length == 0) {
      return null;
    }

    return e;
  })
    .filter((e) => e != null)
    .map((e) => {
      e.target = e.target.map((target) => {
        target.value = target.value.map((value) => {
          // check if reference
          if (value.kind) {
            // check if referenced entry still exists
            if (!entries.some((f) => f.id == value.id)) {
              return null;
            }
          }

          return value;
        }).filter((value) => value != null);

        if (target.value.length == 0) {
          return null;
        }

        return target;
      }).filter((target) => target != null);

      if (e.target.length == 0) {
        return null;
      }

      return e;
    })
    .filter((e) => e != null);
}
