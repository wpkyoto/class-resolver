# Simple Class resolver

クラスベースのリゾルバーを使用して責任連鎖パターンを実装するための軽量なTypeScript/JavaScriptライブラリです。

## 特徴

- さまざまなタイプのリクエストを処理するためのシンプルで直感的なAPI
- TypeScriptによる型安全な実装
- 柔軟なリゾルバー登録（コンストラクタ、setUpdaters、addUpdater）
- 異なる処理ロジックを持つ複数のリゾルバーのサポート
- サポートされていないタイプに対する明確なエラー処理
- より良い型安全性のためのジェネリック型サポート
- **サポートされていないタイプのためのフォールバックハンドラーサポート**
- **メソッドチェーンサポートによる流れるようなAPI**

## インストール

```bash
npm install class-resolver
# または
yarn add class-resolver
```

## 基本的な使い方

```typescript
const Resolver = require('class-resolver')

class ExampleClass {
  supports(type) {
    return type === 'hoge'
  }
  handle() {
    return 'hoge'
  }
}
class ExampleClass2 {
  supports(type) {
    return type === 'fuga'
  }
  handle() {
    return 'fuga'
  }
}

const resolver = new Resolver(new ExampleClass(), new ExampleClass2())
const c = resolver.resolve('hoge')
console.log(c.handle()) // 出力: hoge

const c2 = resolver.resolve('fuga')
console.log(c2.handle()) // 出力: fuga

try {
  resolver.resolve('xxx') // これはエラーをスローします
} catch (e) {
  console.log(e) // Error: Unsupported type: xxx
}
```

## フォールバックハンドラーの使い方

フォールバックハンドラーを使用すると、サポートされていないタイプをエラーをスローすることなく適切に処理できます：

```typescript
const resolver = new Resolver(new ExampleClass(), new ExampleClass2())

// サポートされていないタイプのためのフォールバックハンドラーを設定
resolver.setFallbackHandler((type) => {
  return `フォールバック: ${type}`
})

// これでサポートされていないタイプはエラーをスローせずにフォールバックハンドラーが使用されます
const result = resolver.resolve('xxx')
console.log(result.handle('xxx')) // 出力: フォールバック: xxx

// サポートされているタイプは通常通り動作します
const c = resolver.resolve('hoge')
console.log(c.handle()) // 出力: hoge
```

## 高度な使い方

### TypeScriptとパラメータの使用

```typescript
import Resolver from 'class-resolver';
import { ResolveTarget } from 'class-resolver';

// より良い型安全性のためにジェネリクスを使用
class MessageFormatter implements ResolveTarget<[string, number], string> {
  supports(type: string): boolean {
    return type === 'greeting'
  }
  
  handle(name: string, count: number): string {
    return `Hello ${name}, this is message #${count}!`
  }
}

class ErrorFormatter implements ResolveTarget<[string, number], string> {
  supports(type: string): boolean {
    return type === 'error'
  }
  
  handle(message: string, code: number): string {
    return `Error ${code}: ${message}`
  }
}

// より良い型安全性のためにジェネリック型を指定
const resolver = new Resolver<ResolveTarget<[string, number], string>>(
  new MessageFormatter(), 
  new ErrorFormatter()
)

// グリーティングフォーマッターの使用
const greeting = resolver.resolve('greeting')
console.log(greeting.handle('John', 1)) // 出力: Hello John, this is message #1!

// エラーフォーマッターの使用
const error = resolver.resolve('error')
console.log(error.handle('Not Found', 404)) // 出力: Error 404: Not Found
```

### 動的リゾルバー登録

```typescript
// より良い型安全性のためにジェネリック型を指定
const resolver = new Resolver<ResolveTarget<[string, number], string>>()

// 初期化後にリゾルバーを追加
resolver.setUpdaters(new MessageFormatter(), new ErrorFormatter())

// または一つずつ追加
resolver.addUpdater(new MessageFormatter())
resolver.addUpdater(new ErrorFormatter())
```

### TypeScriptでのフォールバックハンドラー

フォールバックハンドラーは完全な型安全性を維持し、リゾルバーの設定から自動的に型を推論します：

```typescript
// 特定の型でリゾルバーを作成
const resolver = new Resolver<ResolveTarget<[string, number], string>>(
  new MessageFormatter()
)

// 同じ型シグネチャでフォールバックハンドラーを設定
resolver.setFallbackHandler((name: string, count: number): string => {
  return `${name}のデフォルトの挨拶（メッセージ #${count}）`
})

// フォールバックハンドラーはサポートされていないタイプに使用されます
const result = resolver.resolve('unknown').handle('田中', 5)
console.log(result) // 出力: 田中 のデフォルトの挨拶（メッセージ #5）

// メソッドチェーンもサポートされています
resolver
  .setFallbackHandler((name: string, count: number): string => {
    return `カスタムフォールバック: ${name} - ${count}`
  })
  .addUpdater(new ErrorFormatter())
```

## ジェネリック型サポート

バージョン2.0.0から、class-resolverはより良い型安全性のためにジェネリック型をサポートしています：

```typescript
// ジェネリクスを使用したインターフェースの定義
interface ResolveTarget<TArgs extends any[] = any[], TReturn = any> {
  supports(type: string): boolean;
  handle(...args: TArgs): TReturn;
}

// 特定の型でインターフェースを実装するクラスを定義
class StringFormatter implements ResolveTarget<[string], string> {
  supports(type: string): boolean {
    return type === 'string-format';
  }
  
  handle(input: string): string {
    return input.toUpperCase();
  }
}

// 特定の型でリゾルバーを作成
const resolver = new Resolver<ResolveTarget<[string], string>>(new StringFormatter());
const formatter = resolver.resolve('string-format');
const result = formatter.handle('hello'); // resultはstring型として型付けされます
```

## ユースケース

1. **コマンドパターンの実装**: 特定のハンドラーで異なるタイプのコマンドを処理
2. **フォーマット変換**: タイプに基づいてデータを異なるフォーマット間で変換
3. **リクエスト処理**: 専用のハンドラーで異なるタイプのリクエストを処理
4. **プラグインシステム**: 異なるプラグインが特定のタイプの操作を処理するプラグインシステムを実装
5. **メッセージフォーマット**: 特定のフォーマッターで異なるタイプのメッセージをフォーマット
6. **適切な機能低下**: フォールバックハンドラーを使用して未知のタイプのデフォルト動作を提供
7. **APIバージョニング**: フォールバックを使用して後方互換性のある動作で異なるAPIバージョンを処理
8. **フィーチャーフラグ**: フォールバックを使用して基本的な機能にフィーチャーフラグを実装

## エラー処理

リゾルバーは以下の場合にエラーをスローします：
- リゾルバーが登録されていない場合: `"Unasigned resolve target."`
- サポートされていないタイプを解決しようとした場合: `"Unsupported type: xxx"`

### フォールバックハンドラーによるエラー防止

フォールバックハンドラーを使用すると、サポートされていないタイプのエラーを防ぐことができます：

```typescript
const resolver = new Resolver(new ExampleClass())

// フォールバックハンドラーなし - エラーがスローされる
try {
  resolver.resolve('unknown')
} catch (e) {
  console.log(e) // Error: Unsupported type: unknown
}

// フォールバックハンドラーあり - エラーはスローされない
resolver.setFallbackHandler((type) => `デフォルト: ${type}`)
const result = resolver.resolve('unknown') // エラーなし、フォールバックが使用される
console.log(result.handle('unknown')) // 出力: デフォルト: unknown
```

## アップグレードガイド

### 1.xから2.0.0へのアップグレード

バージョン2.0.0では、より良い型安全性のためにジェネリック型サポートが導入されました。この変更はJavaScriptユーザーにとって後方互換性がありますが、TypeScriptユーザーはコードを更新する必要があるかもしれません。

#### TypeScriptユーザーの変更点

1. `ResolveTarget`インターフェースがジェネリクスをサポートするようになりました：
   ```typescript
   // 以前 (1.x)
   interface ResolveTarget {
     supports(type: string): boolean;
     handle(...args: any[]): any;
   }
   
   // 以後 (2.0.0)
   interface ResolveTarget<TArgs extends any[] = any[], TReturn = any> {
     supports(type: string): boolean;
     handle(...args: TArgs): TReturn;
   }
   ```

2. `Resolver`クラスがジェネリクスをサポートするようになりました：
   ```typescript
   // 以前 (1.x)
   class Resolver {
     // ...
   }
   
   // 以後 (2.0.0)
   class Resolver<TBase extends ResolveTarget = ResolveTarget> {
     // ...
   }
   ```

#### 移行手順

1. デフォルトの`any`型を使用してTypeScriptを使用している場合、コードは変更なしで引き続き動作するはずです。

2. 改善された型安全性を活用するには、クラスの実装を更新してください：
   ```typescript
   // 以前 (1.x)
   class MyHandler implements ResolveTarget {
     supports(type: string): boolean {
       return type === 'my-type';
     }
     handle(name: string): string {
       return `Hello ${name}`;
     }
   }
   
   // 以後 (2.0.0)
   class MyHandler implements ResolveTarget<[string], string> {
     supports(type: string): boolean {
       return type === 'my-type';
     }
     handle(name: string): string {
       return `Hello ${name}`;
     }
   }
   ```

3. 新しいResolverを作成する際に、ジェネリック型を指定してください：
   ```typescript
   // 以前 (1.x)
   const resolver = new Resolver(new MyHandler());
   
   // 以後 (2.0.0)
   const resolver = new Resolver<ResolveTarget<[string], string>>(new MyHandler());
   ```

4. 混合ハンドラータイプがある場合は、ユニオン型を使用するか、デフォルトの`any`型を引き続き使用できます：
   ```typescript
   // ユニオン型の使用
   type MyHandlers = ResolveTarget<[string], string> | ResolveTarget<[number], boolean>;
   const resolver = new Resolver<MyHandlers>(new StringHandler(), new NumberHandler());
   
   // またはデフォルトのany型を引き続き使用
   const resolver = new Resolver(new StringHandler(), new NumberHandler());
   ```

## 貢献

```bash
$ npm install
$ git checkout -b YOUR_TOPIC_BRANCH
$ npm test
$ npm run build
$ git add ./
$ git commit -m "YOUR UPDATE DESCRIPTION"
$ git push YOUR_ORIGIN YOUR_TOPIC_BRANCH
```

## サンプル

このライブラリには、使用方法を示すサンプルが含まれています。サンプルを実行するには：

```bash
# サンプルディレクトリに移動
cd example

# 依存関係をインストール
npm install

# ビルドを実行
npm run build

# サンプルを実行
npm test
```

### JavaScriptサンプル

JavaScriptでの基本的な使用例は`index.js`ファイルにあります：

```bash
node index.js
```

### TypeScriptサンプル

TypeScriptでの使用例は`libs/index.ts`ファイルにあります。v2.0.0からはジェネリクスをサポートしており、型安全性が向上しています：

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
const result = formatter.handle('hello'); // resultはstring型として型付けされます
console.log(result); // "HELLO"
``` 