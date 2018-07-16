import * as assert from "assert";
import { getDerivedTypeDefinition } from "../src/lib";

suite("derived type matcher", () => {

  test("works with simple type definition", () => {
    assert.deepEqual(getDerivedTypeDefinition("type Person"), {name: "Person"})
  });

  test("works with type definition including colons", () => {
    assert.deepEqual(getDerivedTypeDefinition("type :: Person"), {name: "Person"})
  });

  test("works with with extends keyword", () => {
    assert.deepEqual(getDerivedTypeDefinition("type, extends(PersonBase) :: Person"), {name: "Person"})
  });

  test("works with public keyword", () => {
    assert.deepEqual(getDerivedTypeDefinition("type, public :: Person"), {name: "Person"})
  });

  test("works with public and extends keyword", () => {
    assert.deepEqual(getDerivedTypeDefinition("type, public, extends(BasePerson) :: Person"), {name: "Person"})
  });

  test("works with extends and public keyword", () => {
    assert.deepEqual(getDerivedTypeDefinition("type,  extends(BasePerson), public :: Person"), {name: "Person"})
  });

  test("must include :: if extends is used", () => {
    assert.equal(getDerivedTypeDefinition("type,  extends(BasePerson) Person"), undefined)
  });

});
