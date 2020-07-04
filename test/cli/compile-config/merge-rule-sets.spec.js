const { expect } = require("chai");
const merge = require("../../../src/cli/compile-config/merge-configs");

describe("cli/mergeRuleSets - general", () => {
  it("two empty rule sets yield an empty rule set with named attributes", () => {
    expect(merge({}, {})).to.deep.equal({
      allowed: [],
      allowedSeverity: "warn",
      forbidden: [],
      options: {},
    });
  });
});

describe("cli/mergeRuleSets - forbidden", () => {
  it("extending empty forbidden yields that forbidden", () => {
    expect(
      merge({ forbidden: [{ from: "src", to: "test" }] }, {})
    ).to.deep.equal({
      allowed: [],
      allowedSeverity: "warn",
      forbidden: [{ from: "src", to: "test" }],
      options: {},
    });
  });

  it("extending forbidden with something already in yields that forbidden (dedup)", () => {
    expect(
      merge(
        { forbidden: [{ from: "src", to: "test" }] },
        { forbidden: [{ from: "src", to: "test" }] }
      )
    ).to.deep.equal({
      allowed: [],
      allowedSeverity: "warn",
      forbidden: [{ from: "src", to: "test" }],
      options: {},
    });
  });

  it("extending forbidden with nothing yields that the base forbidden (dedup)", () => {
    expect(
      merge({}, { forbidden: [{ from: "src", to: "test" }] })
    ).to.deep.equal({
      allowed: [],
      allowedSeverity: "warn",
      forbidden: [{ from: "src", to: "test" }],
      options: {},
    });
  });

  it("extending forbidden with something not yet in yields that forbidden + the extension", () => {
    expect(
      merge(
        { forbidden: [{ from: "bin", to: "test" }] },
        { forbidden: [{ from: "src", to: "test" }] }
      )
    ).to.deep.equal({
      allowed: [],
      allowedSeverity: "warn",
      forbidden: [
        { from: "bin", to: "test" },
        { from: "src", to: "test" },
      ],
      options: {},
    });
  });

  it("extending an existing named rule - the extended wins", () => {
    expect(
      merge(
        { forbidden: [{ name: "already-in-base", from: "bin", to: "test" }] },
        { forbidden: [{ name: "already-in-base", from: "src", to: "test" }] }
      )
    ).to.deep.equal({
      allowed: [],
      allowedSeverity: "warn",
      forbidden: [{ name: "already-in-base", from: "bin", to: "test" }],
      options: {},
    });
  });

  it("extending an existing named rule - keep attributes not in extended", () => {
    expect(
      merge(
        {
          forbidden: [
            {
              name: "already-in-base",
              from: { path: "bin" },
              to: { path: "test" },
            },
          ],
        },
        {
          forbidden: [
            {
              name: "already-in-base",
              severity: "error",
              from: { path: "src" },
              to: { path: "test" },
            },
          ],
        }
      )
    ).to.deep.equal({
      allowed: [],
      allowedSeverity: "warn",
      forbidden: [
        {
          name: "already-in-base",
          severity: "error",
          from: { path: "bin" },
          to: { path: "test" },
        },
      ],
      options: {},
    });
  });

  it("extending an existing named rule - adds attributes only in extended", () => {
    expect(
      merge(
        {
          forbidden: [
            {
              name: "already-in-base",
              severity: "info",
              from: { path: "bin" },
              to: { path: "test" },
            },
          ],
        },
        {
          forbidden: [
            {
              name: "already-in-base",
              from: { path: "src" },
              to: { path: "test" },
            },
          ],
        }
      )
    ).to.deep.equal({
      allowed: [],
      allowedSeverity: "warn",
      forbidden: [
        {
          name: "already-in-base",
          severity: "info",
          from: { path: "bin" },
          to: { path: "test" },
        },
      ],
      options: {},
    });
  });

  it("extending an existing named rule - adds attributes only in extended (which is very partial only)", () => {
    expect(
      merge(
        { forbidden: [{ name: "already-in-base", severity: "info" }] },
        {
          forbidden: [
            {
              name: "already-in-base",
              from: { path: "src" },
              to: { path: "test" },
            },
          ],
        }
      )
    ).to.deep.equal({
      allowed: [],
      allowedSeverity: "warn",
      forbidden: [
        {
          name: "already-in-base",
          severity: "info",
          from: { path: "src" },
          to: { path: "test" },
        },
      ],
      options: {},
    });
  });

  it("extending forbidden with a named rule not in there adds it", () => {
    expect(
      merge(
        { forbidden: [{ name: "not-in-base", from: "bin", to: "test" }] },
        { forbidden: [{ name: "already-in-base", from: "src", to: "test" }] }
      )
    ).to.deep.equal({
      allowed: [],
      allowedSeverity: "warn",
      forbidden: [
        { name: "not-in-base", from: "bin", to: "test" },
        { name: "already-in-base", from: "src", to: "test" },
      ],
      options: {},
    });
  });
});

describe("cli/mergeRuleSets - allowed", () => {
  it("extending empty allowed yields that allowed", () => {
    expect(merge({ allowed: [{ from: "test", to: "src" }] }, {})).to.deep.equal(
      {
        allowed: [{ from: "test", to: "src" }],
        allowedSeverity: "warn",
        forbidden: [],
        options: {},
      }
    );
  });

  it("extending allowed with something already in yields that allowed (dedup)", () => {
    expect(
      merge(
        { allowed: [{ from: "test", to: "src" }] },
        { allowed: [{ from: "test", to: "src" }] }
      )
    ).to.deep.equal({
      allowed: [{ from: "test", to: "src" }],
      allowedSeverity: "warn",
      forbidden: [],
      options: {},
    });
  });

  it("extending allowed with nothing yields that the base allowed (dedup)", () => {
    expect(merge({}, { allowed: [{ from: "test", to: "src" }] })).to.deep.equal(
      {
        allowed: [{ from: "test", to: "src" }],
        allowedSeverity: "warn",
        forbidden: [],
        options: {},
      }
    );
  });

  it("extending allowed with something not yet in yields that allowed + the extension", () => {
    expect(
      merge(
        { allowed: [{ from: "bin", to: "test" }] },
        { allowed: [{ from: "src", to: "test" }] }
      )
    ).to.deep.equal({
      allowed: [
        { from: "bin", to: "test" },
        { from: "src", to: "test" },
      ],
      allowedSeverity: "warn",
      forbidden: [],
      options: {},
    });
  });
});

describe("cli/mergeRuleSets - allowedSeverity", () => {
  it("extending empty allowed yields allowedSeverity warn", () => {
    expect(merge({}, {})).to.deep.equal({
      allowed: [],
      allowedSeverity: "warn",
      forbidden: [],
      options: {},
    });
  });

  it("extending empty set with allowedSeverity error yields allowedSeverity error", () => {
    expect(merge({ allowedSeverity: "error" }, {})).to.deep.equal({
      allowed: [],
      allowedSeverity: "error",
      forbidden: [],
      options: {},
    });
  });

  it("extending allowedSeverity error with nothing yields allowedSeverity error", () => {
    expect(merge({}, { allowedSeverity: "error" })).to.deep.equal({
      allowed: [],
      allowedSeverity: "error",
      forbidden: [],
      options: {},
    });
  });

  it("extending allowedSeverity error with info yields allowedSeverity info", () => {
    expect(
      merge({ allowedSeverity: "info" }, { allowedSeverity: "error" })
    ).to.deep.equal({
      allowed: [],
      allowedSeverity: "info",
      forbidden: [],
      options: {},
    });
  });
});

describe("cli/mergeRuleSets - options", () => {
  it("extending empty options with some options yield those options", () => {
    expect(
      merge(
        {
          options: {
            doNotFollow: "node_modules",
            tsConfig: { fileName: "./tsConfig.json" },
          },
        },
        {}
      )
    ).to.deep.equal({
      allowed: [],
      allowedSeverity: "warn",
      forbidden: [],
      options: {
        doNotFollow: "node_modules",
        tsConfig: {
          fileName: "./tsConfig.json",
        },
      },
    });
  });

  it("extending some options with empty options yield those options", () => {
    expect(
      merge(
        {},
        {
          options: {
            doNotFollow: "node_modules",
            tsConfig: { fileName: "./tsConfig.json" },
          },
        }
      )
    ).to.deep.equal({
      allowed: [],
      allowedSeverity: "warn",
      forbidden: [],
      options: {
        doNotFollow: "node_modules",
        tsConfig: {
          fileName: "./tsConfig.json",
        },
      },
    });
  });

  it("extending some options with some other options yield those options", () => {
    expect(
      merge(
        { options: { tsConfig: {} } },
        {
          options: {
            doNotFollow: "node_modules",
            tsConfig: { fileName: "./tsConfig.json" },
          },
        }
      )
    ).to.deep.equal({
      allowed: [],
      allowedSeverity: "warn",
      forbidden: [],
      options: {
        doNotFollow: "node_modules",
        tsConfig: {},
      },
    });
  });
});
