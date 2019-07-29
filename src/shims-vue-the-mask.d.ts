declare module 'vue-the-mask' {
  import {DirectiveFunction} from 'vue';

  const mask: DirectiveFunction;
  const tokens: { [token: string]: RegExp };

  export {mask, tokens};
}
