import dotenv from "dotenv";
import commonjs from "rollup-plugin-commonjs";

dotenv.config();

export default {
  input: "./src/main.js",
  plugins: [commonjs()],
  output: {
    exports: "named",
    file: process.env.OUTPUT_FILE,
    format: "cjs",
  },
  watch: {
    buildDelay: 2000,
  },
};
