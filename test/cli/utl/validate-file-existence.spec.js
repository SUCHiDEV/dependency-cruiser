const { expect } = require("chai");
const validateFileExistence = require("~/src/cli/utl/validate-file-existence");

describe("cli/utl/validateFileExistence", () => {
  it("throws when the file or dir passed does not exists", () => {
    expect(() => {
      validateFileExistence("file-or-dir-does-not-exist");
    }).to.throw(
      "Can't open 'file-or-dir-does-not-exist' for reading. Does it exist?"
    );
  });

  it("passes when the file or dir passed exists", () => {
    expect(() => {
      validateFileExistence("package.json");
    }).to.not.throw();
  });
});
