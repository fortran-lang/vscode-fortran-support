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
suite("test subroutine declarations", () => {
    test("gives the correct number of subroutines", () => {
        const filePath = "./test/resources/sample.f90";
        let document = fs.readFileSync(filePath, 'utf8');
        var declaration = grammar.declarations(document).subroutines;
        assert.equal(declaration.length, 1);
    });

    test("gives the correct number of arguments", () => {
        const filePath = "./test/resources/sample.f90";
        let document = fs.readFileSync(filePath, 'utf8');
        var declaration = grammar.declarations(document).subroutines;
        assert.equal(declaration[0].arguments.length, 2);
    });

    test("gives the correct line number", () => {
        const filePath = "./test/resources/sample.f90";
        let document = fs.readFileSync(filePath, 'utf8');
        var declaration = grammar.declarations(document).subroutines;
        assert.equal(declaration[0].line, 24);
    });

    test("gives the correct column position", () => {
        const filePath = "./test/resources/sample.f90";
        let document = fs.readFileSync(filePath, 'utf8');
        var [declaration] = grammar.declarations(document).subroutines;
        var args = declaration.arguments;
        assert.equal(declaration.column, 13);
        assert.equal(args[0].column, 23);
        assert.equal(args[1].column, 25);
    });

    test("gives the correct names", () => {
        const filePath = "./test/resources/sample.f90";
        let document = fs.readFileSync(filePath, 'utf8');
        var [declaration] = grammar.declarations(document).subroutines;
        var args = declaration.arguments;
        assert.equal(declaration.name, "say_hello");
        assert.equal(args[0].name, "a");
        assert.equal(args[1].name, "b");
    });
});
