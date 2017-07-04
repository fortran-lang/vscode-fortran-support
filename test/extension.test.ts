//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as fs from 'fs';
import { _loadDocString, intrinsics}  from '../src/lib/helper';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    // Defines a Mocha unit test
    test("Something 1", () => {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });

    let saveKeywordToJson = (keyword) => {
        let doc =  _loadDocString(keyword);
        let docObject = JSON.stringify({"keyword": keyword, "docstr": doc});
        fs.appendFile( "src/docs/" + keyword + ".json", docObject, function (err) {
            if (err) throw err;
                console.log('Saved!');
        });
    };   

    test("load doc files", () => {
      intrinsics.map( keyword => saveKeywordToJson(keyword));
    });
});


