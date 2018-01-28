//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from "assert";
import * as fs from "fs";
import {
  validVariableName,
  parseFunction,
  parseArgs
} from "../src/lib/functions";

suite("function helper test", () => {
  test("validVariableName does not allow variables starting with number", () => {
    assert.equal(false, validVariableName("1as"));
  });

  test("validVariableName returns true  with correct variable", () => {
    assert.equal(true, validVariableName("matA"));
  });

  test("validVariableName returns true for variables starting with uppercase", () => {
    assert.equal(true, validVariableName("MatA"));
  });

  test("validVariableName return true for variable starting with _", () => {
    assert.equal(true, validVariableName("_matA"));
  });

  test("parseFuntion return undefined on empty line", () => {
    // assert.equal(undefined, parseFunction({text: ""}));
  });

  test("parseFuntion return undefined if function keyword is missing", () => {
    // assert.equal(undefined, parseFunction({"hello"));
  });

  test("parseFuntion return correct function name", () => {
    // assert.equal("hello", parseFunction("function hello()").name);
  });

  test("parseFuntion return correct number of args", () => {
    // assert.equal(2, parseFunction("function hello( a, b)").args.length);
  });

  test("parseArgs return the correct number of args", () => {
    assert.equal(2, parseArgs("a,b").length);
  });

  test("parseArgs handle spaces well", () => {
    assert.equal(2, parseArgs(" a, b").length);
  });

  test("parseArgs handle empty args", () => {
    assert.equal(0, parseArgs("").length);
  });
});
