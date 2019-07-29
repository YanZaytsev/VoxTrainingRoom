import {ButtonTypes} from "../../lib/enums";
<template lang="pug">
  button.btn(:class="className" @click="$emit('click')") {{label}}
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator';
  import {ButtonTypes} from "@/lib/enums";


  @Component
  export default class AppSelect extends Vue {
    @Prop() label!: string;
    @Prop({default: ButtonTypes.Default}) type: ButtonTypes;

    get className(): string {
      let color: string = '';

      switch (this.type) {
        case ButtonTypes.Submit:
          color = 'purple';
          break;
        case ButtonTypes.Delete:
          color = 'red';
          break;
        case ButtonTypes.Default:
        default:
          color = 'gray';
          break;
      }

      return `btn_${color}`;
    }
  }
</script>

<style>
  .btn {
    border: 1px solid transparent;
    display: flex;
    font-size: 12px;
    font-weight: 500;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    padding: 8px 24px;
    min-height: 32px;
    width: 74px;
    line-height: normal;
    color: var(--white);

    &:disabled {
      cursor: default;
      opacity: 0.6;
    }

    &_purple {
      background: #662eff;

      &:hover {
        background: #5b29e5;
      }
    }

    &_gray {
      background: #f3f4f8;
      color: #495057;

      &:hover {
        background: #DADBDF;
      }
    }

    &_red {
      background: #dc3545;

      &:hover {
        background: #bd2130;
      }
    }
  }
</style>
