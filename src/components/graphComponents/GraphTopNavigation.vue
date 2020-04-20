<template>
    <div :style="topNavigationStyle" class="unselected">
        <v-breadcrumbs
            :items="navigationList"
            :divider="'->'"
            class="pa-4">
            <template v-slot:item="{item}">
                <v-breadcrumbs-item
                    :disabled="item.disabled"
                    :style="{'color': item.color}"
                    @click="gotoDocument(item.document)"
                    large>
                    {{ item.text }}
                </v-breadcrumbs-item>
            </template>
        </v-breadcrumbs>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {DocumentSelfPart} from "@/class/settingBase";
    import {commitGraphChange} from "@/store/modules/_mutations";

    interface NavigationItem {
        disabled: boolean;
        document: DocumentSelfPart;
        text: string;
        color: string
    }

    export default Vue.extend({
        name: "GraphTopNavigation",
        components: {},
        data: function () {
            return {
                topNavigationStyle: {
                    width: '100%',
                    height: '54px'
                } as CSSProp,
            }
        },
        props: {
            document: {
                type: Object as () => DocumentSelfPart,
                required: true
            }
        },
        computed: {
            navigationList: function (): NavigationItem[] {
                let result: DocumentSelfPart[] = (this.document.docsRootList).concat([this.document]);
                return result.map(doc => ({
                    disabled: doc._id === this.document._id,
                    document: doc,
                    text: doc._name,
                    color: doc._id === this.document._id ? 'grey' : 'royalblue'
                }) as NavigationItem)
            },
        },
        methods: {
            gotoDocument(graph: DocumentSelfPart) {
                console.log(graph)
                commitGraphChange({graph})
            },
        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
