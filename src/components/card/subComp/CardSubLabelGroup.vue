<template>
    <div>
        <template v-for="(group,index) in labelGroup">
            <v-chip-group column :key="index">
                <v-chip
                    ripple
                    outlined
                    :small="small"
                    :x-small="xSmall"
                    :large="large"
                    :x-large="xLarge">
                    {{group.name + ":"}}
                </v-chip>
                <global-chip
                    :index="index"
                    :key="label"
                    :label="label"
                    :small="small"
                    :x-small="xSmall"
                    :large="large"
                    :x-large="xLarge"
                    :closeable="group.editable"
                    @close-chip="removeTag(arguments[0], group.labels, group.prop)"
                    v-for="(label, index) in group.labels">
                </global-chip>
                <v-edit-dialog v-if="group.editable">
                    <v-chip
                        :small="small"
                        :x-small="xSmall"
                        :large="large"
                        :x-large="xLarge">
                        <v-icon small>mdi-pencil</v-icon>
                    </v-chip>
                    <template v-slot:input>
                        <field-array
                            :available-tags="labelItems"
                            :base-array="group.labels"
                            :prop-name="'Labels'"
                            :width="300"
                            @update-value="addTag(arguments[1], group.prop)"
                            v-if="group.editable">

                        </field-array>
                    </template>
                </v-edit-dialog>
            </v-chip-group>
        </template>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import GlobalChip from "@/components/global/GlobalChip.vue";
    import FieldArray from "@/components/field/FieldArray.vue";
    import {TagRecommendation} from "@/api/user";
    import {LabelExistProp, LabelGroup} from "@/utils/interfaceInComponent";

    export default Vue.extend({
        name: "CardSubLabelGroup",
        components: {
            GlobalChip,
            FieldArray
        },
        data() {
            return {}
        },
        props: {
            labelGroup: {
                type: Array as () => LabelGroup[],
                required: true
            },
            small: {
                type: Boolean,
                default: false
            },
            xSmall: {
                type: Boolean,
                default: false
            },
            large: {
                type: Boolean,
                default: false
            },
            xLarge: {
                type: Boolean,
                default: false
            },
            labelItems: {
                type: Object as () => TagRecommendation,
                default() {
                    return {
                        'recommend': []
                    }
                }
            }
        },
        computed: {},
        methods: {
            removeTag(index: number, labels: string[], prop: LabelExistProp) {
                let removeLabel = labels.splice(index, 1);
                this.$emit('remove-label', removeLabel, prop)
            },
            addTag(value: string[], prop: LabelExistProp) {
                this.$emit('add-label', value, prop)
            }
        },
        watch: {},
        record: {
            status: 'done',
            description: '一组标签，带有增删功能',
            // todo 标签跳转
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/29
* Updated by [whb on 2020年1月8日19:42:24]
*/
