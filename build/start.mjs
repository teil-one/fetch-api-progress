import esbuild from "esbuild";
import buildConfig from "./build.config.mjs";

const context = await esbuild.context(
  Object.assign(buildConfig, {
    sourcemap: true
  })
);

// Manually do an incremental build
await context.rebuild();

// Enable watch mode
await context.watch();

// Enable serve mode
const host = await context.serve({
  servedir: "./",
  host: "localhost",
  port: 4170
});

console.log("Serving at \x1b[36m", `http://${host.host}:${host.port}`);

const keypress = async (keys) => {
  process.stdin.setRawMode(true);
  return new Promise((resolve) =>
    process.stdin.on("data", (key) => {
      if (keys.filter((k) => key.indexOf(k) === 0).length) {
        process.stdin.setRawMode(false);
        resolve();
      } else {
        process.stdout.write(key);
      }
    })
  );
};

(async () => {
  console.log("\x1b[0mPress q or Ctrl+C to stop");

  await keypress(["\u0003", "q"]);

  // Dispose of the context
  context.dispose();
})().then(process.exit);
