import Vue, {ComputedOptions} from 'vue'

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
