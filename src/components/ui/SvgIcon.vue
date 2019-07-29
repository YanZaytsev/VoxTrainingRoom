<template lang="pug">
  svg(:class="className" xmlns="http://www.w3.org/2000/svg")
   use(:href="iconPath" xmlns:xlink="http://www.w3.org/1999/xlink")
</template>

<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";

  @Component({
    components: {}
  })
  export default class SvgIcon extends Vue {
    @Prop() name!:string;

    private get iconPath() {
      return require(`../../assets/svg/${this.name}.svg`).default.url;
    }
    private get className() {
      return 'svg-icon svg-icon__' + this.name;
    }
  }
</script>

<style>
  .svg-icon {
    /*Почитай про currentColor, удобно бывает*/

    /*fill: currentColor;*/
    stroke: currentColor;
    height: 24px;
    width: 24px;
  }
</style>
