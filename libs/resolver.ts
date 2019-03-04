import { interfaces } from './interface'
import ResolveTarget = interfaces.ResolveTarget

class Resolver {
  private updater: ResolveTarget[]
  constructor (...args: ResolveTarget[]) {
    this.updater = []
    this.set(this.getArgs(args))
  }
  getArgs (arg: ResolveTarget[]): ResolveTarget[] {
    return Array.prototype.slice.call(arg, 0)
  }
  set (updaters: ResolveTarget[]) {
    this.updater = updaters
  }
  setUpdaters (...args: ResolveTarget[]) {
    this.set(this.getArgs(args))
  }
  addUpdater (updater: ResolveTarget) {
    this.updater.push(updater)
  }
  resolve (type: string): ResolveTarget {
    if (this.updater.length < 1) throw new Error('Unasigned resolve target.')
    const target = this.updater.filter(updater => updater.supports(type))
    if (target.length < 1) throw new Error(`Unsupported type: ${type}`)
    return target[0]
  }
}
export default Resolver