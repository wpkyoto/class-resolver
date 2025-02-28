# Class Resolver Example

このディレクトリには、class-resolverライブラリの使用例が含まれています。

## セットアップ

```bash
# 依存関係をインストール
npm install

# ビルドを実行
npm run build

# テストを実行
npm test
```

## JavaScript Example

`index.js`ファイルには、JavaScriptでの基本的な使用例が含まれています。

```bash
node index.js
```

## TypeScript Example

`libs/index.ts`ファイルには、TypeScriptでの使用例が含まれています。v2.0.0からはジェネリクスをサポートしており、型安全性が向上しています。

### v2.0.0の新機能

- ジェネリクスによる型安全性の向上
- `ResolveTarget<TArgs, TReturn>`インターフェースで引数と戻り値の型を指定可能
- `Resolver<TBase>`クラスで扱うターゲットの型を指定可能

### TypeScriptの例

```typescript
import Resolver, { ResolveTarget } from 'class-resolver';

// ジェネリクスを使用して引数と戻り値の型を指定
class StringFormatter implements ResolveTarget<[string], string> {
  supports(type: string): boolean {
    return type === 'string-format';
  }
  
  handle(input: string): string {
    return input.toUpperCase();
  }
}

// Resolverにも型パラメータを指定
const resolver = new Resolver<ResolveTarget<[string], string>>(new StringFormatter());
const formatter = resolver.resolve('string-format');
const result = formatter.handle('hello'); // result is typed as string
console.log(result); // "HELLO"
```

## 注意点

- JavaScriptユーザーは変更なしで既存のコードを使用できます
- TypeScriptユーザーは型安全性を向上させるためにジェネリクスを活用できます

## テスト結果

```bash
$ npm test

> example@1.0.0 test
> npm run build && node dist/index.js && node index.js

> example@1.0.0 build
> tsc

test2
hoge
fuga
Error: Unsupported type: xxx
```