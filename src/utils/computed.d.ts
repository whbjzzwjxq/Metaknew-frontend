import Vue, {ComputedOptions} from 'vue'
import {DefaultComputed, DefaultData, DefaultMethods, DefaultProps, PropsDefinition, Accessors} from 'vue/types/options'

type FileStatus = 'edit' | 'done' | 'empty'

interface ComponentRecord{
  status: FileStatus
}

declare module 'vue/types/options' {

  interface ComponentOptions<V extends Vue,
    Data = DefaultData<V>,
    Methods = DefaultMethods<V>,
    Computed = DefaultComputed,
    PropsDef = PropsDefinition<DefaultProps>,
    Props = DefaultProps> {
    record?: ComponentRecord,

  }

  type AccessorsVm<T> = Accessors<T> | {
    [K in keyof T]: ((vm: any) => T[K])
  }
}
