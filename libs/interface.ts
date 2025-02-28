/**
 * リゾルバーのターゲットとなるクラスが実装すべきインターフェース
 */
export interface ResolveTarget<TArgs extends any[] = any[], TReturn = any> {
  /**
   * 指定されたタイプをサポートしているかどうかを判定します
   * @param type サポートを確認するタイプ
   * @returns サポートしている場合はtrue、そうでない場合はfalse
   */
  supports(type: string): boolean
  
  /**
   * リクエストを処理します
   * @param args 処理に必要な引数
   * @returns 処理結果
   */
  handle(...args: TArgs): TReturn
}

// 後方互換性のために名前空間を維持
export namespace interfaces {
  export interface ResolveTarget<TArgs extends any[] = any[], TReturn = any> {
    supports(type: string): boolean
    handle(...args: TArgs): TReturn
  }
}