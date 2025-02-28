import { ResolveTarget } from './interface'

/**
 * Chain of Responsibilityパターンを実装するリゾルバークラス
 * 特定のタイプに対応するハンドラーを解決します
 */
class Resolver<TBase extends ResolveTarget = ResolveTarget> {
  /**
   * 登録されたリゾルバーターゲットの配列
   * @private
   */
  private updaters: TBase[] = [];

  /**
   * リゾルバーを初期化します
   * @param args 初期リゾルバーターゲット
   */
  constructor(...args: TBase[]) {
    if (args.length > 0) {
      this.set(args);
    }
  }

  /**
   * 引数の配列を処理します
   * @param args リゾルバーターゲットの配列
   * @returns 処理された配列
   * @private
   */
  private getArgs(args: TBase[]): TBase[] {
    return [...args];
  }

  /**
   * リゾルバーターゲットを設定します
   * @param updaters リゾルバーターゲットの配列
   */
  public set(updaters: TBase[]): void {
    this.updaters = updaters;
  }

  /**
   * リゾルバーターゲットを設定します（可変長引数版）
   * @param args リゾルバーターゲット
   */
  public setUpdaters(...args: TBase[]): void {
    this.set(this.getArgs(args));
  }

  /**
   * リゾルバーターゲットを追加します
   * @param updater 追加するリゾルバーターゲット
   */
  public addUpdater(updater: TBase): void {
    this.updaters.push(updater);
  }

  /**
   * 指定されたタイプに対応するリゾルバーターゲットを解決します
   * @param type 解決するタイプ
   * @returns 解決されたリゾルバーターゲット
   * @throws {Error} リゾルバーターゲットが登録されていない場合
   * @throws {Error} 指定されたタイプをサポートするリゾルバーターゲットが見つからない場合
   */
  public resolve(type: string): TBase {
    if (this.updaters.length < 1) {
      throw new Error('Unasigned resolve target.');
    }
    
    const target = this.updaters.find(updater => updater.supports(type));
    
    if (!target) {
      throw new Error(`Unsupported type: ${type}`);
    }
    
    return target;
  }
}

export default Resolver;