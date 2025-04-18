<template>
  <div class="page-container">
    <NavBar />
    <div class="content-container">
      <h1>Relatório</h1>
      <p>Página de relatórios em construção.</p>
    </div>
  </div>
</template>

<script>
import NavBar from './NavBar.vue';

export default {
  name: 'Relatorio',
  components: {
    NavBar
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(to bottom, #ffffff, #e8f5e9);
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  position: absolute;
  left: 0;
  top: 0;
}

.content-container {
  padding: 30px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

h1 {
  color: #4CAF50;
  margin-bottom: 20px;
}
</style> 