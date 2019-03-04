# Example

```bash
$ npm install
$ npm test

> example@1.0.0 test /Users/develop/npm/class-resolver/example
> npm run build && node dist/index.js && node index.js

> example@1.0.0 build /Users/develop/npm/class-resolver/example
> tsc

test2
[Function: Resolver]
hoge
fuga
Error: Unsupported type: xxx
    at Resolver.resolve (/Users/develop/npm/class-resolver/example/node_modules/class-resolver/dist/libs/resolver.js:25:19)
    at Object.<anonymous> (/Users/develop/npm/class-resolver/example/index.js:27:12)
    at Module._compile (internal/modules/cjs/loader.js:702:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:713:10)
    at Module.load (internal/modules/cjs/loader.js:612:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:551:12)
    at Function.Module._load (internal/modules/cjs/loader.js:543:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:744:10)
    at startup (internal/bootstrap/node.js:240:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:564:3)
```