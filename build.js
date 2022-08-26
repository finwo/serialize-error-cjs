const esbuild = require('esbuild');
const path = require('path');
const package = require('./package.json');
const tsconfig = require('./tsconfig.json');
const globber = require('fast-glob');
const fse = require('fs-extra');
const { exec } = require('child_process');

const { dtsPlugin } = require('esbuild-plugin-d.ts');

(async () => {
  console.log('Configuring build');
  const outdir = path.join(__dirname, tsconfig.compilerOptions.outDir);
  const entryPoints = await globber(
    tsconfig.include.map((glob) => path.join(__dirname, glob))
  );

  const options = {
    bundle: false,
    outdir,
    target: 'node14',
    platform: 'node',
    format: 'cjs',
    sourcemap: tsconfig.compilerOptions.sourceMap,
    tsconfig: path.join(__dirname, 'tsconfig.json'),
    entryPoints,
    plugins: [dtsPlugin()],
  };

  console.log('Building');
  const result = await esbuild.build(options);

  console.log({
    options,
    result,
  });

  if (result.errors.length) {
    console.log(result.errors);
    process.exit(1);
  }

  if (result.warnings.length) {
    console.log(result.warnings);
    process.exit(1);
  }

  console.log('Done');
})();

