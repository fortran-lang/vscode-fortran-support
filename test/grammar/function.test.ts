//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from "assert";
import * as fs from "fs";
import * as grammar from "../../src/lib/grammar";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it

// Defines a Mocha test suite to group tests of similar kind together
suite("test function declarations", () => {
    test("gives the correct number of functions", () => {
        const filePath = "./test/resources/sample.f90";
        let document = fs.readFileSync(filePath, 'utf8');
        var declaration = grammar.declarations(document).functions;
        assert.equal(declaration.length, 5);
    });

    test("gives the correct function names", () => {
        const filePath = "./test/resources/sample.f90";
        let document = fs.readFileSync(filePath, 'utf8');
        var declaration = grammar.declarations(document).functions;
        var expected = ['sum', 'mul', 'sub', 'div', 'pow'];
        assert.deepEqual(declaration.map(f => f.name), expected);
    });
});
