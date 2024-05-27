const postcss = require("postcss");

const plugin = require("./");

async function expectOutput(input, output, opts = {}, warnLength = 0) {
  let result = await postcss([plugin(opts)]).process(input, {
    from: undefined,
  });
  expect(result.css).toEqual(output);
  expect(result.warnings()).toHaveLength(warnLength);
}

it("uses a fixed prefix", async () => {
  const input = `
  @keyframes loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both loader;
  }
  .animation-3 {
    animation: 1.2s infinite loader ease-in-out both;
  }
  .animation-4 {
    animation-name: loader;
  }
  `;
  const output = `
  @keyframes prefixed-loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: prefixed-loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both prefixed-loader;
  }
  .animation-3 {
    animation: 1.2s infinite prefixed-loader ease-in-out both;
  }
  .animation-4 {
    animation-name: prefixed-loader;
  }
  `;
  await expectOutput(input, output, { prefix: "prefixed-" });
});

it("uses a hashed prefix", async () => {
  const input = `
  @keyframes loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both loader;
  }
  .animation-3 {
    animation: 1.2s infinite loader ease-in-out both;
  }
  .animation-4 {
    animation-name: loader;
  }
  `;
  const output = `
  @keyframes <HASH>-loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: <HASH>-loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both <HASH>-loader;
  }
  .animation-3 {
    animation: 1.2s infinite <HASH>-loader ease-in-out both;
  }
  .animation-4 {
    animation-name: <HASH>-loader;
  }
  `;
  await expectOutput(input, output, { prefix: "<hash>" });
});

it("fails with wrong shorthand property", async () => {
  const input = `
  .animation {
    animation: 100ms;
  }
  `;
  await expectOutput(input, input, { prefix: "prefixed-" }, 1);
});
