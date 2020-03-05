<template>
    <div>
        <v-slider
            :value="activeValue"
            :min="activeRange[0]"
            :max="activeRange[1]"
            @change="update($event)"
            thumb-label>
            <template v-slot:append>
                <v-text-field
                    :value="activeValue"
                    @input="update(parseFloat($event))"
                    :rules="rules"
                    class="mt-0 pt-0"
                    single-line
                    :type="'number'"
                    style="width: 80px">

                </v-text-field>
            </template>
        </v-slider>
        <p>{{'minValue: ' + activeRange[0]}}</p>
        <p>{{'maxValue: ' + activeRange[1]}}</p>
        <p v-if="percent">Count As Percent</p>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {Rule} from "@/interface/interfaceInComponent";
    import {validGroup} from "@/utils/validation";

    export default Vue.extend({
        name: "CardSubStyleNumber",
        components: {},
        data: function () {
            return {}
        },
        props: {
            min: {
                type: Number,
                required: true
            },
            max: {
                type: Number,
                required: true
            },
            value: {
                type: Number,
                required: true
            },
            propName: {
                type: String,
                default: ''
            }
        },
        computed: {
            percent: function (): boolean {
                return this.min < 1
            },
            activeValue: function (): number {
                return this.value !== undefined
                    ? this.percent
                        ? this.value * 100
                        : this.value
                    : this.min
            },
            activeRange: function (): number[] {
                return this.percent
                    ? [this.min * 100, this.max * 100]
                    : [this.min, this.max]
            },
            rules: function (): Rule<number>[] {
                return [
                    validGroup.Number.minCheck(this.propName, this.activeRange[0]),
                    validGroup.Number.maxCheck(this.propName, this.activeRange[1])
                ]
            }
        },
        methods: {
            update(value: number) {
                let update = this.percent
                    ? value / 100
                    : value;
                this.$emit('update', update)
            }
        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
