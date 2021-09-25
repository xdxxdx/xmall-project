// Table列表中的二维码悬浮显示
<template>
  <el-popover :placement="placement" :width="width" :trigger="trigger">
    <vueqr :text="text" :size="bigsize" />
    <vueqr slot="reference" :text="text" :size="smallsize" />
  </el-popover>
</template>

<script >
import vueQr from 'vue-qr' // 引入vue-qr
export default {
  name: 'TableErCodePop', // 起个名字
  components: {
    vueqr: vueQr // 用上
  },
  props: {
    width: { // 悬浮窗宽度
      type: Number,
      default: 200
    },
    trigger: { // 触发方式
      type: String,
      default: 'hover'
    },
    text: { // 生成二维码的内容
      type: String,
      default: ''
    },
    placement: { // 出现的位置
      type: String,
      default: 'top-start'
    },
    smallsize: { // 缩略图的大小
      type: Number,
      default: 40
    },
    bigsize: { // 大二维码大小
      type: Number,
      default: 180
    }
  }
}
</script>
