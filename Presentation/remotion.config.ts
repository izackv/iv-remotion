import { Config } from "@remotion/cli/config";

Config.setChromiumOpenGlRenderer("swangle");

Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    symlinks: false,
  },
}));
