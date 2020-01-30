<template>
    <div>
        <p>
           {{ createTypeAndUser }}
        </p>
        <p>
            {{ createTime }}
        </p>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        name: "ItemMarker",
        components: {},
        data: function () {
            return {}
        },
        props: {
            ctrl: {
                type: Object as () => BaseCtrl,
                required: true
            }
        },
        computed: {
            createTypeAndUser: function (): string {
                return 'createType' + this.ctrl.CreateType + 'createSource' + this.ctrl.CreateUser
            },
            createTime: function (): string {
                return 'createTime' + this.ctrl.UpdateTime
            }
        },
        methods: {},
        record: {
            status: 'editing',
            description: '',
            //todo Resolve Source
        }
    })
</script>

<style scoped>

</style>
