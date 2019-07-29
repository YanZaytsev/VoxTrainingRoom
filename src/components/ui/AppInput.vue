<template lang="pug">
  .input__wrapper(:class="{input_short: short}")
    label.input__label(:for="id") {{label}}
    div.input(
      :class="{textarea: type === 'textarea', 'input--error': showError}"
      @click="focus")
      input(
        v-if="type === 'input' && !mask"
        :placeholder="placeholder"
        :id="id"
        :value="value"
        :name="name"
        ref="inputField"
        @blur="checkError"
        @focus="resetError"
        @input="changeInput")
      input(
        v-else-if="type === 'input' && mask"
        :placeholder="placeholder"
        :id="id"
        :value="value"
        ref="inputField"
        :name="name"
        v-mask="mask"
        @blur="checkError"
        @focus="resetError"
        @input="changeInput")
      textarea.vox-scroll(
        v-else
        :placeholder="placeholder"
        :id="id"
        :value="value"
        :name="name"
        ref="inputField"
        @blur="setError"
        @focus="resetError"
        @input="changeInput")
      div.input__tooltip(v-if="showError")
        | {{ error }}
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
  import {mask} from 'vue-the-mask';

  import {InputType} from "@/lib/enums";
  import {InputValidator} from "@/lib/types";
  import {idGenerator} from "@/lib/helpers/common";

  const generateId: Function = idGenerator();

  @Component({
    directives: {mask}
  })
  export default class AppInput extends Vue {
    @Prop({default: ''}) placeholder: string;
    @Prop({default: InputType.input}) type!: InputType;

    @Prop() mask: string;
    @Prop() label!: string;
    @Prop() value!: string;
    @Prop() name!: string;
    @Prop() short: boolean;
    @Prop() parentError: string;
    @Prop() validators: InputValidator[];

    private error = "";
    private showError = false;

    @Watch('parentError')
    onParentErrorChanged(oldVal: string, val: string) {
      this.setError(oldVal || val);
    }

    private get id(): string {
      return `input-${generateId()}`;
    }

    mounted() {
      this.setError();
    }

    private focus(): void {
      (<HTMLInputElement>this.$refs.inputField).focus();
    }

    private changeInput(e: Event) {
      const {value} = (<HTMLInputElement>e.target);
      this.$emit('input', value);

      this.setError(value);
    }

    private setError(value?: string): void {
      const valueToCheck = typeof value !== 'undefined'  ? value : this.value;

      if (this.validators) {
        const hasError: InputValidator | undefined = this.validators.find(({isValid}) => !isValid(valueToCheck));

        this.error = (hasError && hasError.error) || ''
      }

      if (!this.error) {
        this.error = this.parentError || "";
      }

      this.$emit('error', {[this.name]: this.error});
    }

    private resetError(): void {
      this.showError = false;
    }

    private checkError(): void {
      this.setError();

      if (this.error) {
        this.showError = true;
      }
    }

  }
</script>

<style>
  .input {
    width: 100%;
    display: flex;
    align-items: center;
    border-radius: 4px;
    height: 40px;
    font-size: 12px;
    padding: 10px 16px;
    justify-content: space-between;
    background: var(--white);
    border: 1px solid var(--gray-2);

    &:active,
    &.active,
    &:focus-within,
    &:focus {
      border-color: #6e42fe;
    }

    &__wrapper {
      position: relative;
      width: 100%;
    }

    &__label {
      font-weight: 500;
      font-size: 12px;
      margin-bottom: 8px;
      display: block;
    }

    &_short {
      width: 67px;
    }

    &--error {
      border-color: red;
    }

    &__tooltip {
      font-weight: 500;
      position: absolute;
      left: calc(100% + 12px);
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.12);
      width: 200px;
      background: var(--white);
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      white-space: pre-wrap;
      border: 1px solid var(--gray-400);
      border-radius: 4px;
      padding: 12px;
      z-index: 2;


      &::before {
        content: "";
        width: 10px;
        height: 10px;
        top: calc(50% - 5px);
        position: absolute;
        left: -7px;
        transform: rotate(-45deg);
        border-top: 1px solid var(--gray-400);
        border-left: 1px solid var(--gray-400);
        background: var(--white);
      }
    }
  }

  .textarea {
    font-size: 12px;
    padding-right: 0px;
    padding-top: 16px;
    height: 148px;
  }

</style>
