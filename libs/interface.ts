export interface ResolveTarget {
  supports(type: string): boolean
  handle(...args:any): any
}
export namespace interfaces {
  export interface ResolveTarget {
    supports(type: string): boolean
    handle(...args:any): any
  }
}