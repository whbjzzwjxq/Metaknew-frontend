<template>
    <div class="d-flex flex-column">
        <v-dialog
            :width="dialogWidth"
            persistent
            v-model="dialogOn">
            <template v-slot:activator="{ on }">
                <v-btn
                    v-on="on"
                    @click="changeKey(key)"
                    text
                    tile
                    block
                    depressed
                    v-for="(item, key) in itemsDict"
                    :key="key">
                    <v-icon left> {{ item.icon }}</v-icon>
                    {{ item.text }}
                </v-btn>
            </template>
            <v-card>
                <v-card-text>
                    <field-file
                        v-if="currentKey === 'upload'"
                        :prop-name="'IncludedMedia'"
                        :base-files="currentMediaIdList"
                        :width="dialogWidth"
                        @update-value="updateIncludedMediaCache(arguments[1])"
                        show-current
                        upload-mode>

                    </field-file>
                    <div v-else-if="currentKey === 'fromCloud'">
                    </div>
                    <div v-else-if="currentKey === 'fromWeb'">
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="closeDialog">
                        Cancel
                    </v-btn>
                    <v-btn text @click="updateMedia">
                        Save
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import FieldFile from "@/components/field/FieldFile.vue";
    import {getIcon} from "@/utils/icon";

    export default Vue.extend({
        name: "MediaAdder",
        components: {
            FieldFile
        },
        data() {
            return {
                dialogOn: false,
                cacheIdList: [] as id[],
                dialogWidth: 720,
                itemsDict: {
                    'upload': {
                        icon: getIcon('i-add-media-method', 'upload'),
                        text: 'Upload NewFile',
                    },
                    'fromCloud': {
                        icon: getIcon('i-add-media-method', 'fromCloud'),
                        text: 'From CloudRepo'
                    },
                    'fromWeb': {
                        icon: getIcon('i-add-media-method', 'fromWeb'),
                        text: 'From HyperLink'
                    }
                },
                currentKey: 'upload'
            }
        },
        props: {
            currentMediaIdList: {
                type: Array as () => id[],
                default: () => {
                    return []
                }
            },

        },
        computed: {},
        methods: {
            closeDialog() {
                this.dialogOn = false
            },
            updateMedia() {
                this.dialogOn = false;
                this.$emit('update-media', this.cacheIdList)
            },
            updateIncludedMediaCache(mediaIdList: id[]) {
                this.cacheIdList = mediaIdList;
            },
            changeKey(key: string) {
                this.currentKey = key
            }

        },
        watch: {},
        record: {
            status: 'done',
            description: 'Media的添加工具'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2020/1/4
* Updated by []
*/
