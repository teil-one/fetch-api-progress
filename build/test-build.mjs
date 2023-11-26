import esbuild from "esbuild";
import buildConfig from "./build.config.mjs";

await esbuild.build(
  Object.assign(buildConfig, {
    sourcemap: true,
    minify: false
  })
);
