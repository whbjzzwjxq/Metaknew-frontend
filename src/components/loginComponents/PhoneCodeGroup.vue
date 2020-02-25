<template>
    <div>
        <v-text-field
            :clearable="phoneFieldSetting.clearable"
            :label="phoneFieldSetting.label"
            :rules="phoneFieldSetting.rules"
            class="py-1"
            dense
            v-model="currentPhone">
        </v-text-field>
        <div class="pa-0" style="text-align: right">
            <v-text-field
                :rules="messageSetting.rules"
                :style="styleCodeField"
                class="pr-4"
                dense
                label="Code"
                v-model="currentCode">

            </v-text-field>
            <send-message-button
                :phone="phone"
                :style="styleButtonField">

            </send-message-button>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import SendMessageButton from "@/components/loginComponents/SendMessageButton.vue";
    import {TextFieldSetting} from "@/interface/interfaceInComponent";
    import {validGroup} from "@/utils/validation";

    export default Vue.extend({
        name: "PhoneCodeGroup",
        components: {
            SendMessageButton
        },
        data: function () {
            return {
                buttonWidth: 120
            }
        },
        props: {
            width: {
                type: Number,
                default: 360
            },

            phone: {
                type: String,
                required: true
            },

            code: {
                type: String,
                required: true
            }
        },
        computed: {
            phoneFieldSetting: function (): TextFieldSetting {
                let stringGroup = validGroup.String;
                return {
                    label: 'Phone',
                    rules: [stringGroup.phoneCheck()],
                    prop: 'Phone',
                    clearable: true
                }
            },

            messageSetting: function (): TextFieldSetting {
                return {
                    label: 'Message',
                    clearable: true,
                    rules: [validGroup.String.messageCheck()],
                    prop: 'Message',
                }
            },

            styleCodeField: function (): CSSProp {
                return {
                    display: "inline-block",
                    width: (this.width - this.buttonWidth) + 'px'
                }
            },

            styleButtonField: function (): CSSProp {
                return {
                    display: "inline-block",
                    width: (this.buttonWidth) + 'px'
                }
            },

            currentPhone: {
                get(): string {
                    return this.phone
                },
                set(value: string): void {
                    this.$emit('update:phone', value)
                }
            },

            currentCode: {
                get(): string {
                    return this.code
                },

                set(value: string): void {
                    this.$emit('update:code', value)
                }
            }
        },
        methods: {},
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
