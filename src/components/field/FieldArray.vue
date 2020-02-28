<template>
    <v-card :width="width" tile flat class="pa-2">
        <v-card-text>
            <span class="subheading">Current {{ propName }}</span>
            <v-chip-group column active-class="primary--text">
                <v-chip
                    v-for="(item, index) in existTags"
                    :key="item"
                    :color="indexToColor(index)"
                    label
                    outlined
                    :close="editMode"
                    tile
                    @click:close="removeTag(item)">
                    {{ item }}
                </v-chip>
            </v-chip-group>
        </v-card-text>

        <v-card-text v-for="(list, key) in recommendTags" :key="key">
            <span class="subheading">{{ key }}</span>
            <v-chip-group column active-class="primary--text">
                <v-chip v-for="(item, index) in list" :key="item" :color="indexToColor(index)" label outlined tile>
                    {{ item }}
                    <v-icon right @click="addTag(item)" small>mdi-plus</v-icon>
                </v-chip>
            </v-chip-group>
        </v-card-text>

        <v-card-text v-if="editMode">
            <span class="subheading">Rollback delete</span>
            <v-chip-group column active-class="primary--text">
                <v-chip v-for="(item, index) in removedTags" :key="item" label tile>
                    {{item}}
                    <v-icon @click="restoreTag(index)" right>mdi-restore</v-icon>
                </v-chip>
            </v-chip-group>
        </v-card-text>

        <v-card-text v-if="editMode">
            <span class="subheading">Tips</span>
            <v-icon @click="checkTags">mdi-magnify-outline</v-icon>
            <p style="font-weight: bolder; color: darkred">
                {{tipsContent}}
            </p>
        </v-card-text>

        <v-card-text v-if="editMode">
            <v-textarea
                :value="tagsToString"
                @input="updateValue"
                outlined
                label="直接使用字符编辑"
                placeholder="使用;分隔内容">

            </v-textarea>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {indexToColor, checkDuplicate} from '@/utils/utils'
    import {ResolveType} from '@/utils/fieldResolve'
    import {TagRecommendation} from "@/api/user/queryInfo";

    export default Vue.extend({
        name: 'FieldArray',
        data() {
            return {
                removedTags: [] as string[],
                cacheText: ''
            }
        },
        props: {
            baseArray: {
                type: Array as () => string[],
                default: function () {
                    return []
                }
            },
            availableTags: {
                type: Object as () => TagRecommendation,
                default: function () {
                    return {
                        'recommend': []
                    }
                }
            },
            propName: {
                type: String,
                required: true
            },
            width: {
                type: Number,
                default: 400
            },
            resolveType: {
                type: String as () => ResolveType,
                default: 'normal',
                validator: function (value) {
                    return ['normal', 'time', 'location', 'name'].indexOf(value) !== -1
                }
            },
            basePool: {
                type: Array as () => string[],
                default() {
                    return []
                }
            },
            editMode: {
                type: Boolean,
                default: true
            },
            defaultValue: {
                type: Array as () => string[],
                default: function () {
                    return []
                }
            }
        },
        computed: {
            tagsToString: function (): string {
                return this.existTags.join(';');
            },

            //组件状态
            status: function (): string {
                return !this.duplicate
                    ? 'default'
                    : 'error'
            },

            // 默认字符池
            pool: function (): string[] {
                return this.existTags.concat(this.basePool)
            },

            // 是否重复
            duplicate: function (): boolean {
                return this.existTags.length > 0 &&
                    this.existTags.filter((tag: string) => checkDuplicate(this.pool, tag)).length === this.existTags.length
            },

            //推荐的标签
            recommendTags: function () {
                return this.editMode
                    ? this.availableTags
                    : {}
            },

            // 提示的内容
            tipsContent: function (): string {
                return this.duplicate
                    ? 'duplicate tag'
                    : ''
            },

            //已有的标签
            existTags: function (): string[] {
                if (this.baseArray) {
                    return this.baseArray.filter((item: string) => item !== '')
                } else {
                    return this.defaultValue
                }
            }
        },
        methods: {
            removeTag(item: string) {
                this.removedTags.indexOf(item) === -1 && this.removedTags.push(item);
                let index = this.existTags.indexOf(item);
                this.existTags.splice(index, 1);
                this.updateTags(this.existTags);
            },

            // 添加标签
            addTag(item: string) {
                this.existTags.push(item);
                this.updateTags(this.existTags)
            },

            restoreTag(index: number) {
                let item = this.removedTags[index];
                this.removedTags.splice(index, 1);
                this.addTag(item)
            },

            // 检查标签
            checkTags() {

            },

            updateTags(value: string[]) {
                this.$emit('update-value', this.propName, value, this.status)
            },

            // chip颜色
            indexToColor(index: number) {
                return indexToColor(index)
            },

            updateValue($event: string) {
                this.updateTags($event.split(';').filter(tag => tag !== ''))
            }
        },

        record: {
            status: 'done',
            description: '数组编辑器'
        }
    })
</script>

<style scoped>

</style>
/**
* Created by whb on 2019/12/4
* Updated by [whb on 2020年1月8日19:58:44]
*/
