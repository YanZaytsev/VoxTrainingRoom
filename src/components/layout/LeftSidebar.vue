<template lang="pug">
  aside.left-sidebar
    .menu
      p.menu__title Menu
      .menu__item(v-for="{name, icon} in listItems")
        .menu__item-logo
          SvgIcon(:name="icon")
          span {{name}}
</template>

<script lang="ts">
  import {Component, Vue} from "vue-property-decorator";
  import {SidebarItem} from "@/lib/types";
  import SvgIcon from "@/components/ui/SvgIcon.vue";

  @Component({
    components: {SvgIcon}
  })
  export default class LeftSidebar extends Vue {
    private listItems: SidebarItem[] = [
      {name: "Calendar", icon: "calendar"},
      {name: "Documents", icon: "documents"},
      {name: "Events", icon: "events"},
      {name: "Email", icon: "email"},
      {name: "Chat", icon: "chat"},
      {name: "Settings", icon: "settings"},
    ];
  }
</script>

<style>
  .left-sidebar {
    background: #eceff1;

    .menu {
      &__title {
        padding-left: 60px;
        margin-top: 120px;
        margin-bottom: 26px;
        font-size: 16px;
        text-transform: uppercase;
        color: var(--grey-blue);
      }

      &__item {
        padding-left: 60px;
        display: flex;
        align-items: center;
        color: var(--grey-blue);
        height: 30px;
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 500;
        position: relative;

        &-logo {
          margin-right: 26px;
          display: flex;
          align-items: center;

        }

        svg {
          margin-right: 20px;
        }

        &:hover {
          cursor: pointer;
          color: var(--dark-blue-100);

          &::before {
            content: '';
            position: absolute;
            left: 0px;
            background: var(--dark-blue-100);
            width: 5px;
            border-top-right-radius: 3px;
            border-bottom-right-radius: 3px;
            height: 120%;
          }

          svg {
            color: var(--dark-blue-100);
          }
        }
      }
    }
  }
</style>
