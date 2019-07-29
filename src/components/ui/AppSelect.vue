<template lang="pug">
  .select__wrapper
    label.select__label {{label}}
    .select(@click.stop="toggleDropdown")
      input(disabled="true" :value="selectedValue")
      i.icon(:class="{open: dropdownOpen}")
        SvgIcon(name="arrow")
    .select__options(v-show="dropdownOpen")
      ul
        li(v-for="option in options" @click="selectValue(option)") {{option}}
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator';
  import SvgIcon from "@/components/ui/SvgIcon.vue";


  @Component({
    components: {SvgIcon}
  })
  export default class AppSelect extends Vue {
    @Prop() label!: string;
    @Prop() options!: string[];
    @Prop() value: string;


    private dropdownOpen: boolean = false;
    private selectedValue: string = this.options[0];

    toggleDropdown(): void {
      this.dropdownOpen = !this.dropdownOpen;
    }

    closeDropdown(): void {
      this.dropdownOpen = false;
    }

    selectValue(option: string): void {
      this.selectedValue = option;
      this.$emit("input", this.selectedValue);
      this.closeDropdown();
    }

    mounted() {
      if (this.value) {
        this.selectedValue = this.value;
      }

      this.$emit("input", this.selectedValue);
      this.$root.$on('window:click', this.closeDropdown);
    }

    beforeDestroy() {
      this.$root.$off('window:click', this.closeDropdown);
    }
  }
</script>

<style>
  .select {
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
    cursor: pointer;

    &:active,
    &.active,
    &:focus-within,
    &:focus {
      border-color: #6e42fe;
    }

    &__wrapper {
      position: relative;
      width: 100%;
      max-width: 272px;
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

    &__options {
      position: absolute;
      opacity: 1;
      z-index: 2;
      background: var(--white);
      width: 100%;
      margin-top: 4px;
      border-radius: 4px;
      border: 1px solid var(--gray-2);

      li {
        padding-left: 8px;
        height: 28px;
        width: 100%;
        display: flex;
        align-items: center;
        cursor: pointer;

        &:hover {
          background: #f3f4f8;
        }
      }
    }

    .icon.open {
      transform: rotate(180deg);
    }

    svg {
      stroke: none;
      color: currentColor;
      width: 10px;
      height: 6px;
    }
  }
</style>
