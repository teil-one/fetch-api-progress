import esbuild from "esbuild";
import buildConfig from "./build.config.mjs";

await esbuild.build(buildConfig);
