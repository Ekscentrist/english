<script setup>
import WarmupBlock from '../components/WarmupBlock.vue'
import ShadowingBlock from '../components/ShadowingBlock.vue'
import ReadinessBlock from '../components/ReadinessBlock.vue'
import PostSessionGuide from '../components/PostSessionGuide.vue'
</script>

<template>
  <div class="habits">
    <header class="panel head">
      <div class="eyebrow">Habits</div>
      <h1>Warm-up, shadowing & readiness</h1>
      <p class="muted">Daily practice tools and market-ready checklist.</p>
    </header>

    <WarmupBlock class="section-gap" />
    <ShadowingBlock class="section-gap" />
    <ReadinessBlock class="section-gap" />
    <PostSessionGuide class="section-gap" />
  </div>
</template>

<style scoped>
.head h1 {
  margin-top: 0.25rem;
  font-size: 1.45rem;
}

.head .muted {
  margin-top: 0.35rem;
}
</style>
