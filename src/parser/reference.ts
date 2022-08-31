import {
  str,
  coroutine,
  choice,
  char,
  recursiveParser,
} from "../deps.ts";

import { whitespaceParser } from "./chars.ts";
import keyParser from "./key.ts";
import tagsParser from "./tag.ts";

/*
Reference
    ReferenceValue
    ReferenceValueTagged
*/
const referenceParser = choice([
  referenceValueParser,
  referenceValueTaggedParser
]);

/*
ReferenceValueTagged
    Tags ws ReferenceValue
*/
const referenceValueTaggedParser = coroutine( function* () {
  const tags = yield tagsParser,
  yield whitespaceParser;
  const reference = yield referenceValueParser;
  
  return {
    ...reference
    // note: overwrites empty tags property from referenceValueParser!
    tags
  }
});

/*
ReferenceValue
    ReferenceDirect
    ReferenceMeaning
    ReferenceIdentical
*/
const referenceValueParser = choice([
  referenceDirectParser,
  referenceMeaningParser,
  referenceIdenticalParser
]).map(o => {
  o.tags = [];
  return o;
});

/*
ReferenceDirect
    "s." ws Key
*/
const referenceDirectParser = coroutine( function* () {
  yield str("s."),
  yield whitespaceParser;
  const key = yield keyParser;
  
  return {
    kind: "direct",
    key,
  }
});

/*
ReferenceMeaning
    "s." ws "Bed." ws Key
*/
const referenceMeaningParser = coroutine( function* () {
  yield str("s."),
  yield whitespaceParser;
  yield str("Bed."),
  yield whitespaceParser;
  const key = yield keyParser;
  
  return {
    kind: "meaning",
    key,
  }
});

/*
ReferenceIdentical
    "id." ws Key
*/
const referenceIdenticalParser = coroutine( function* () {
  yield str("id."),
  yield whitespaceParser;
  const key = yield keyParser;
  
  return {
    kind: "identical",
    key,
  }
});

export default referenceParser;