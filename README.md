# asset-rev

Append hash to assets and updates references in each file specified

## Installation

This module is distributed via npm which is bundled with node and should be installed as one of your project's `devDependencies`:

```
npm install --save-dev asset-rev
```
or
```
yarn add -D asset-rev
```

## Usage

With npm scripts you can do:

```json
{
  "scripts": {
    "rev": "asset-rev dist 'scripts/**/*.* images/**/*.*'"
  }
}
```

or with node

```js
const rev = require('asset-rev');

const workingDir = 'dist';
const patterns = ['scripts/**/*.*', 'images/**/*.*'];

rev(workingDir, patterns);
```

## API

### npm scripts

```
asset-rev [workingDir] [patterns] [options]
```

- `workingDir`: Relative to your project root, specifies where the script should look for your patterns and also defines that all files in this folder will have their references of the rev'd files updated.
- `patterns`: String of glob patterns for files to be rev'd inside the `workingDir`. You can specify multiple globs separated by a space ` ` and encapsulated by single quotes, `'test/*.* test1/*.*'`.
- `options`:
    - `--contenthash`: By default the hash generated will be random every time, if you would instead prefer the hash to be generated based on content then you can pass in this variable.

### Node

```js
rev(workingDir, patterns).then(() => {
  // ...
}).catch(err => {
  // ...
});
```

- `workingDir`: Much like for the command line usage relative to your project root, this will be a string of where the script should look for your patterns and also defines that all files in this folder will have their references of the rev'd files updated.
- `patterns`: This accepts an array of strings of glob patterns for the files to be rev'd inside the `workingDir`.
- `options`: `typeof Object`
    - `contenthash`: Boolean variable that when passed in will generate the hash based on content, by default hashes are random each time.

## Caveat

When specifying your globs, be careful that if your patterns match a dir name, that dir name will be rev'd. Whether or not this is desirable is up to you.

## Inspiration

I created this little script as I wanted an alternative to [grunt-usemin](https://github.com/yeoman/grunt-usemin), but without grunt. I searched for quite a while and wasn't able to find a solid alternative that makes use of npm scripts so I decided to write my own.

## License

MIT
