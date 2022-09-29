export {
  str,
  sequenceOf,
  coroutine,
  choice,
  char,
  possibly,
  many,
  sepBy1,
  many1,
  between,
  startOfInput,
  endOfInput,
  digits,
  anyCharExcept,
  skip,
  getData,
  setData,
  withData,
} from "https://cdn.skypack.dev/arcsecond@v4.1.0";
export { equal } from "https://deno.land/std@0.154.0/testing/asserts.ts";

const res = await fetch("https://raw.githubusercontent.com/vwkd/ka-dict-verbs/main/vz/vz.txt");
const input = await res.text();
export const inputObj = ByteCodePointConverter(input);