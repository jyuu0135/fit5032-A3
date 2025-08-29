<script setup>
import { ref } from 'vue'
import Resources from './components/Resources.vue';
import Recommend from './components/Recommend.vue';

const tab = ref('resources') 
</script>

<template>
  <div>
    <nav class="navbar navbar-expand-lg bg-light border-bottom mb-3">
      <div class="container">
        <a class="navbar-brand" href="#"> Youth Mental Health and Wellbeing</a>
        <div class="ms-auto">
          <button class="btn btn-outline-primary me-2" @click="tab='resources'">Resources</button>
          <button class="btn btn-outline-primary" @click="tab='recommend'">Recommend</button>
        </div>
      </div>
    </nav>

    <main class="container py-2">
      <Resources v-if="tab==='resources'" />
      <Recommend v-if="tab==='recommend'" />
    </main>
  </div>
</template>
 