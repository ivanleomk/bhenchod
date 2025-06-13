# TypeScript GitHub Action

A template for creating GitHub Actions with TypeScript.

## Usage

```yaml
uses: ./
with:
  myInput: 'World'
```

## Development

Install the dependencies
```bash
npm install
```

Build the typescript and package it for distribution
```bash
npm run build && npm run package
```

Run the tests :heavy_check_mark:
```bash
npm test
```

## Package for distribution

GitHub Actions will run the entry point from the action.yml. Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos so we will checkin the packed dist folder.

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
npm run package
git add dist
git commit -a -m "prod dependencies"
git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
