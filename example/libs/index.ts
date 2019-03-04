import Resolver, {interfaces} from '../../dist/index'
import ResolveTarget = interfaces.ResolveTarget

class test implements ResolveTarget {
  supports(str: string) {
    return false
  }
  handle() {
    return 'test'
  }
}
class test2 implements ResolveTarget {
  supports(str: string) {
    return true
  }
  handle() {
    return 'test2'
  }
}

const r = new Resolver(
  new test(),
  new test2()
)
const t = r.resolve('test')
console.log(t.handle())