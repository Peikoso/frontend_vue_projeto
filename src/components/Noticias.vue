<template>
  <div class="page-container">
    <NavBarTwo />
    <div class="noticias-container">
      <div class="header-section">
        <h1>Notícias</h1>
        <p>Fique por dentro das últimas atualizações</p>
      </div>
      
      <div class="filter-section">
        <div class="category-filters">
          <button 
            @click="setActiveCategory(null)" 
            :class="{ active: activeCategory === null }"
            class="category-button all"
          >
            Todas
          </button>
          <button 
            v-for="categoria in categorias" 
            :key="categoria.id"
            @click="setActiveCategory(categoria)"
            :class="{ active: activeCategory?.id === categoria.id }"
            class="category-button"
          >
            {{ categoria.nome }}
          </button>
        </div>
      </div>
      
      <!-- Loading and Error Messages -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando notícias...</p>
      </div>
      
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchData" class="retry-button">Tentar novamente</button>
      </div>
      
      <!-- Empty State -->
      <div v-if="!loading && !error && filteredNoticias.length === 0" class="empty-state">
        <div class="empty-icon">📰</div>
        <h2>Nenhuma notícia encontrada</h2>
        <p>Não há notícias disponíveis para esta categoria</p>
      </div>
      
      <!-- News Grid -->
      <div v-if="!loading && !error && filteredNoticias.length > 0" class="noticias-grid">
        <div v-for="noticia in filteredNoticias" :key="noticia.id" class="noticia-card">
          <div class="noticia-image">
            <img :src="noticia.imagem_url || getPlaceholderImage(noticia.id)" alt="Imagem da notícia">
            <div class="categoria-badge">{{ getCategoriaName(noticia.categoria_id) }}</div>
          </div>
          <div class="noticia-content">
            <h3 class="noticia-title">{{ noticia.titulo }}</h3>
            <p class="noticia-date">{{ formatDate(noticia.criado_em) }}</p>
            <p v-html="truncateText(noticia.conteudo, 150)" class="noticia-excerpt"></p>
            <div class="noticia-footer">
              <button class="read-more-btn" @click="showNoticiaDetails(noticia)">
                Ler mais
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal for News Details -->
      <div v-if="selectedNoticia" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button class="close-modal" @click="closeModal">&times;</button>
          <div class="modal-image">
            <img :src="selectedNoticia.imagem_url || getPlaceholderImage(selectedNoticia.id)" alt="Imagem da notícia">
            <div class="categoria-badge">{{ getCategoriaName(selectedNoticia.categoria_id) }}</div>
          </div>
          <div class="modal-body">
            <h2>{{ selectedNoticia.titulo }}</h2>
            <p class="modal-date">Publicado em {{ formatDate(selectedNoticia.criado_em) }}</p>
            <div v-html="selectedNoticia.conteudo" class="modal-text"></div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
import NavBarTwo from './NavBarTwo.vue';
import Footer from './Footer.vue';
import axios from 'axios';

export default {
  name: 'Noticias',
  components: {
    NavBarTwo,
    Footer
  },
  data() {
    return {
      noticias: [],
      categorias: [],
      loading: false,
      error: null,
      activeCategory: null,
      selectedNoticia: null
    };
  },
  computed: {
    filteredNoticias() {
      if (!this.activeCategory) {
        return this.noticias;
      }
      return this.noticias.filter(noticia => noticia.categoria_id === this.activeCategory.id);
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.error = null;
      
      try {
        // Fetch categories
        const categoriasResponse = await axios.get('/Admin/Categoria');
        this.categorias = categoriasResponse.data;
        
        // Fetch news
        const noticiasResponse = await axios.get('/Admin/Noticia');
        this.noticias = noticiasResponse.data;
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        this.error = 'Ocorreu um erro ao carregar os dados. Por favor, tente novamente.';
      } finally {
        this.loading = false;
      }
    },
    setActiveCategory(categoria) {
      this.activeCategory = categoria;
    },
    getCategoriaName(categoriaId) {
      const categoria = this.categorias.find(cat => cat.id === categoriaId);
      return categoria ? categoria.nome : 'Sem categoria';
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('pt-BR', options);
    },
    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    showNoticiaDetails(noticia) {
      this.selectedNoticia = noticia;
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    },
    closeModal() {
      this.selectedNoticia = null;
      document.body.style.overflow = ''; // Restore scrolling
    },
    getPlaceholderImage(id) {
      // Generate a placeholder image based on the news ID for variety
      return `https://picsum.photos/seed/news${id}/800/500`;
    }
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
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.noticias-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 20px 40px;
  width: 100%;
  flex: 1;
}

.header-section {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px 0;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  border-radius: 8px;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.header-section h1 {
  font-size: 2.5rem;
  margin-bottom: 8px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.header-section p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.filter-section {
  margin-bottom: 30px;
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.category-button {
  padding: 8px 15px;
  border: none;
  border-radius: 25px;
  background-color: #e0e0e0;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.category-button:hover {
  background-color: #d0d0d0;
}

.category-button.active {
  background-color: #4CAF50;
  color: white;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.category-button.all {
  background-color: #333;
  color: white;
}

.category-button.all.active {
  background-color: #4CAF50;
}

.noticias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.noticia-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.noticia-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.noticia-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.noticia-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.noticia-card:hover .noticia-image img {
  transform: scale(1.05);
}

.categoria-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: #4CAF50;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.noticia-content {
  padding: 20px;
}

.noticia-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  line-height: 1.3;
}

.noticia-date {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.noticia-excerpt {
  color: #555;
  margin-bottom: 20px;
  line-height: 1.5;
}

.noticia-footer {
  display: flex;
  justify-content: flex-end;
}

.read-more-btn {
  background: none;
  border: none;
  color: #4CAF50;
  padding: 8px 0;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s;
}

.read-more-btn:hover {
  color: #2E7D32;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  gap: 15px;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #4CAF50;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin: 30px 0;
}

.retry-button {
  background-color: #c62828;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #b71c1c;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin: 30px 0;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #9e9e9e;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-modal {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-image {
  position: relative;
  height: 300px;
}

.modal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-body {
  padding: 30px;
}

.modal-body h2 {
  font-size: 1.8rem;
  margin-bottom: 10px;
  color: #333;
}

.modal-date {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.modal-text {
  line-height: 1.6;
  color: #444;
}


/* Responsive Design */
@media (max-width: 768px) {
  .noticias-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  
  .header-section h1 {
    font-size: 2rem;
  }
  
  .header-section p {
    font-size: 1rem;
  }
  
  .modal-image {
    height: 200px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-body h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .noticias-grid {
    grid-template-columns: 1fr;
  }
  
  .category-filters {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 10px;
    justify-content: flex-start;
  }
  
  .category-button {
    flex-shrink: 0;
  }
}
</style>
