<template>
    <div>
        <v-chip-group column class="">
            <v-chip
                ripple
                outlined
                :small="small"
                :x-small="xSmall"
                :large="large"
                :x-large="xLarge">
                {{name + ':'}}
            </v-chip>
            <global-chip
                :index="index"
                :key="label"
                :label="label"
                :small="small"
                :x-small="xSmall"
                :large="large"
                :x-large="xLarge"
                :closeable="editable"
                @close-chip="removeTag"
                v-for="(label, index) in labelList">
            </global-chip>
            <v-edit-dialog v-if="editable">
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
                        :base-array="labelList"
                        :prop-name="'Labels'"
                        :width="300"
                        @update-value="addTag"
                        v-if="editable">

                    </field-array>
                </template>
            </v-edit-dialog>
        </v-chip-group>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import GlobalChip from "@/components/global/GlobalChip.vue";
    import FieldArray from "@/components/field/FieldArray.vue";
    import {TagRecommendation} from "@/api/user/queryInfo";

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
            labelList: {
                type: Array as () => string[],
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
            },
            editable: {
                type: Boolean,
                default: false
            },
            name: {
                type: String,
                default: ''
            }
        },
        computed: {},
        methods: {
            removeTag(index: number) {
                let removeLabel = this.labelList.splice(index, 1);
                this.$emit('remove-label', removeLabel)
            },
            addTag(propName: string, value: string[]) {
                this.$emit('add-label', value)
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
