<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  average: { type: Number, default: 0 },
  count: { type: Number, default: 0 },
  readonly: { type: Boolean, default: false },
  size: { type: String, default: '1.25rem' },
  showMeta: { type: Boolean, default: true },
  label: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'rate'])

const hoverVal = ref(0)
const stars = [1, 2, 3, 4, 5]

const cur = () => hoverVal.value || props.modelValue || 0

const onEnter = (v) => {
  if (!props.readonly) hoverVal.value = v
}
const onLeave = () => {
  if (!props.readonly) hoverVal.value = 0
}
const onClick = (v) => {
  if (props.readonly) return
  emit('update:modelValue', v)
  emit('rate', v)
}
</script>

<template>
  <div class="d-flex align-items-center gap-2">
    <div class="d-flex align-items-center" :aria-label="label || 'rating'">
      <button
        v-for="v in stars"
        :key="v"
        type="button"
        class="btn p-0 border-0 bg-transparent"
        :style="{ lineHeight: 1, fontSize: size, cursor: readonly ? 'default' : 'pointer' }"
        @mouseenter="onEnter(v)"
        @mouseleave="onLeave"
        @click="onClick(v)"
        :aria-pressed="cur() >= v"
        :disabled="readonly"
        title="Click to rate"
      >
        <span :class="cur() >= v ? 'text-warning' : 'text-secondary'">★</span>
      </button>
    </div>

    <div v-if="showMeta" class="text-muted small">
      <span v-if="count > 0">{{ average.toFixed(2) }} · {{ count }}</span>
      <span v-else>No ratings yet</span>
    </div>
  </div>
</template>
