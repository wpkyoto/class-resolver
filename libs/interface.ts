export interface ResolveTarget {
  supports(type: string): boolean
  handle(...args:any): any
}