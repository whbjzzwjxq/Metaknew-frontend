import Vue, {ComputedOptions} from 'vue'
import {DefaultComputed, DefaultData, DefaultMethods, DefaultProps, PropsDefinition} from 'vue/types/options'

type ComponentStatus = 'editing' | 'done' | 'empty' | 'done-old'

interface ComponentRecord {
    status: ComponentStatus,
    description?: string
}

declare module 'vue/types/options' {

    interface ComponentOptions<V extends Vue> {
        record?: ComponentRecord,
    }
}
