<template>
  <div class="admin-section">
    <div class="section-header">
      <button class="btn-primary" @click="showAddModal">
        <i class="fas fa-plus"></i> Nova Notícia
      </button>
    </div>

    <!-- Loading and Error states -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando notícias...</p>
    </div>

    <div v-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button class="btn-retry" @click="fetchNoticias">Tentar novamente</button>
    </div>

    <!-- Search & filter -->
    <div v-if="!loading && !error" class="filters-container">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Pesquisar notícias..." 
          class="search-input"
        >
      </div>
      
      <div class="filter-options">
        <div class="filter-item">
          <label for="category-filter">Categoria:</label>
          <select id="category-filter" v-model="categoryFilter" class="filter-select">
            <option value="all">Todas</option>
            <option 
              v-for="categoria in categorias" 
              :key="categoria.id" 
              :value="categoria.id"
            >
              {{ categoria.nome }}
            </option>
          </select>
        </div>
    
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && !error && filteredNoticias.length === 0" class="empty-state">
      <i class="fas fa-newspaper"></i>
      <p>Nenhuma notícia encontrada</p>
      <button class="btn-primary" @click="showAddModal">Adicionar agora</button>
    </div>

    <!-- Card grid -->
    <div v-if="!loading && !error && filteredNoticias.length > 0" class="cards-grid">
      <div 
        v-for="noticia in filteredNoticias" 
        :key="noticia.id" 
        class="noticia-card"
      >
        <div class="card-image" v-if="noticia.imagemUrl">
          <img :src="noticia.imagemUrl" :alt="noticia.titulo">
        </div>
        <div class="card-image placeholder" v-else>
          <i class="fas fa-image"></i>
        </div>
        
        <div class="card-content">
          <div class="card-header">
            <span class="card-category">{{ getCategoryName(noticia.categoria_id) }}</span>
          </div>
          
          <h3 class="card-title">{{ noticia.titulo }}</h3>
          
          <div class="card-meta">
            <div class="meta-item">
              <i class="fas fa-user"></i>
              <span>{{ noticia.autor }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-calendar-alt"></i>
              <span>{{ formatDate(noticia.criado_em) }}</span>
            </div>
          </div>
        </div>
        
        <div class="card-actions">
          <button class="btn-edit-small" @click="editNoticia(noticia)" title="Editar">
            <i class="fas fa-edit"></i>
          </button>

          <button class="btn-delete-small" @click="confirmDelete(noticia)" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? 'Editar Notícia' : 'Nova Notícia' }}</h3>
          <button class="btn-close" @click="closeModal">&times;</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveNoticia">
            <div class="form-group">
              <label for="titulo">Título *</label>
              <input 
                type="text" 
                id="titulo" 
                v-model="form.titulo" 
                required
                class="form-control"
              >
            </div>


            <div class="form-row">
              <div class="form-group">
                <label for="categoria">Categoria *</label>
                <select 
                  id="categoria" 
                  v-model="form.categoria_id" 
                  required
                  class="form-control"
                >
                  <option value="" disabled>Selecione uma categoria</option>
                  <option 
                    v-for="categoria in categorias" 
                    :key="categoria.id" 
                    :value="categoria.id"
                  >
                    {{ categoria.nome }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="autor">Autor *</label>
                <input 
                  type="text" 
                  id="autor" 
                  v-model="form.autor" 
                  required
                  class="form-control"
                >
              </div>
            </div>

            <div class="form-group">
              <label for="imagem">Imagem</label>
              <div class="image-input-container">
                <input 
                  type="number" 
                  id="imagem" 
                  v-model="form.imagem" 
                  class="form-control"
                  placeholder="Imagem ID: 1"
                >
                <button type="button" class="btn-primary btn-select-image" @click="showImageManagerModal">
                  <i class="fas fa-images"></i> Selecionar
                </button>
              </div>
              <div v-if="form.imagem" class="selected-image-preview">
                <img v-if="previewImageUrl" :src="previewImageUrl" alt="Imagem selecionada" />
                <div v-else class="preview-placeholder">
                  <i class="fas fa-image"></i>
                  <span>Imagem #{{ form.imagem }}</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="conteudo">Conteúdo *</label>
              <textarea 
                id="conteudo" 
                v-model="form.conteudo" 
                required
                class="form-control content-editor"
                rows="12"
              ></textarea>
            </div>


            <div v-if="formError" class="form-error">
              <i class="fas fa-exclamation-circle"></i>
              {{ formError }}
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
              <button 
                type="submit" 
                class="btn-primary" 
                :disabled="formSubmitting"
              >
                <span v-if="!formSubmitting">Salvar</span>
                <div v-else class="btn-spinner"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Confirmar Exclusão</h3>
          <button class="btn-close" @click="cancelDelete">&times;</button>
        </div>

        <div class="modal-body">
          <div class="delete-confirmation">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Tem certeza que deseja excluir a notícia <strong>"{{ selectedNoticia?.titulo }}"</strong>?</p>
            <p class="delete-warning">Esta ação não pode ser desfeita!</p>
          </div>

          <div class="form-actions">
            <button class="btn-secondary" @click="cancelDelete">Cancelar</button>
            <button 
              class="btn-danger" 
              @click="deleteNoticia"
              :disabled="deleteSubmitting"
            >
              <span v-if="!deleteSubmitting">Confirmar Exclusão</span>
              <div v-else class="btn-spinner"></div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Manager Modal -->
    <div v-if="showImageModal" class="modal-overlay" @click="closeImageManagerModal">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>Gerenciador de Imagens</h3>
          <button class="btn-close" @click="closeImageManagerModal">&times;</button>
        </div>

        <div class="modal-body">
          <!-- Upload new image section -->
          <div class="image-upload-section">
            <h4>Enviar Nova Imagem</h4>
            <form @submit.prevent="uploadImage" class="upload-form">
              <div class="form-group">
                <label for="fileInput">Selecione uma imagem:</label>
                <input 
                  type="file" 
                  id="fileInput" 
                  ref="fileInput"
                  accept="image/*"
                  @change="handleFileChange"
                  class="form-control"
                >
              </div>
              <button 
                type="submit" 
                class="btn-primary" 
                :disabled="!selectedFile || uploadingImage"
              >
                <span v-if="!uploadingImage">Enviar</span>
                <div v-else class="btn-spinner"></div>
              </button>
            </form>
          </div>

          <!-- Loading state -->
          <div v-if="loadingImages" class="loading-state">
            <div class="spinner"></div>
            <p>Carregando imagens...</p>
          </div>

          <!-- Error state -->
          <div v-if="imageError" class="error-state">
            <i class="fas fa-exclamation-circle"></i>
            <p>{{ imageError }}</p>
            <button class="btn-retry" @click="fetchImages">Tentar novamente</button>
          </div>

          <!-- Images grid -->
          <div v-if="!loadingImages && !imageError && images.length === 0" class="empty-state small-empty">
            <i style="color: #333;" class="fas fa-image"></i>
            <p>Nenhuma imagem encontrada</p>
          </div>

          <div v-if="!loadingImages && !imageError && images.length > 0" class="images-grid">
            <div 
              v-for="image in images" 
              :key="image.id" 
              class="image-item"
              :class="{ 'selected': form.imagem === image.id, 'to-be-selected': selectedImageUrl === image.id && form.imagem !== image.id }"
              @click="selectImage(image)"
            >
              <img :src="image.imagem_url" :alt="image.nome || 'Imagem'" />
              <div class="image-actions">
                <button 
                  type="button" 
                  class="btn-delete-small" 
                  @click.stop="confirmDeleteImage(image)"
                  title="Excluir"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="closeImageManagerModal">Cancelar</button>
          <button 
            type="button" 
            class="btn-primary" 
            @click="confirmImageSelection"
            :disabled="!selectedImageUrl"
          >
            Confirmar Seleção
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Image Confirmation Modal -->
    <div v-if="showDeleteImageModal" class="modal-overlay" @click="cancelDeleteImage">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Confirmar Exclusão</h3>
          <button class="btn-close" @click="cancelDeleteImage">&times;</button>
        </div>

        <div class="modal-body">
          <div class="delete-confirmation">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Tem certeza que deseja excluir esta imagem?</p>
            <p class="delete-warning">Esta ação não pode ser desfeita!</p>
          </div>

          <div class="form-actions">
            <button class="btn-secondary" @click="cancelDeleteImage">Cancelar</button>
            <button 
              class="btn-danger" 
              @click="deleteImage"
              :disabled="deletingImage"
            >
              <span v-if="!deletingImage">Confirmar Exclusão</span>
              <div v-else class="btn-spinner"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminNoticias',
  data() {
    return {
      noticias: [],
      categorias: [],
      loading: false,
      error: null,
      searchQuery: '',
      categoryFilter: 'all',
      statusFilter: 'all',
      showModal: false,
      showDeleteModal: false,
      isEditing: false,
      selectedNoticia: null,
      formSubmitting: false,
      deleteSubmitting: false,
      formError: null,
      form: {
        titulo: '',
        conteudo: '',
        autor: '',
        categoria_id: '',
        imagem: null,
        criado_em: '',
      },
      
      // Image manager related data
      showImageModal: false,
      showDeleteImageModal: false,
      images: [],
      loadingImages: false,
      imageError: null,
      selectedImageUrl: null,
      selectedImage: null,
      selectedFile: null,
      uploadingImage: false,
      deletingImage: false,
      previewImageUrl: null,
    };
  },
  computed: {
    filteredNoticias() {
      let result = [...this.noticias];
      
      // Search filter
      if (this.searchQuery.trim() !== '') {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(noticia => 
          noticia.titulo.toLowerCase().includes(query) ||
          noticia.conteudo.toLowerCase().includes(query) ||
          noticia.autor.toLowerCase().includes(query)
        );
      }
      
      // Category filter
      if (this.categoryFilter !== 'all') {
        result = result.filter(noticia => 
          noticia.categoria_id === this.categoryFilter
        );
      }
      
      // Status filter
      if (this.statusFilter !== 'all') {
        result = result.filter(noticia => 
          noticia.status === this.statusFilter
        );
      }
      
      return result;
    }
  },
  mounted() {
    this.fetchNoticias();
    this.fetchCategorias();
  },
  watch: {
    saveNoticia(newValue, oldValue) {
        this.fetchNoticias();
    }
  },
  methods: {
    getEmptyForm() {
      return {
        titulo: '',
        conteudo: '',
        autor: '',
        categoria_id: '',
        imagem: '',
        criado_em: '',
      };
    },
    async fetchImagem(id) {
      const response = await axios.get(`/Admin/Imagem/${id}`);
      const imagem = String(response.data.imagem_url);
      return imagem;
    },
    async fetchNoticias() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get('/Admin/Noticia');
        const noticiasRecebidas = response.data;

        for (const noticia of noticiasRecebidas) {
          if (noticia.imagem) {
            noticia.imagemUrl = await this.fetchImagem(noticia.imagem);
          }
          if(!noticia.imagem) {
            noticia.imagemUrl = null;
          }
        }

        this.noticias = noticiasRecebidas;
      } catch (err) {
        console.error('Erro ao buscar notícias:', err);
        this.error = 'Não foi possível carregar as notícias. Tente novamente.';
      } finally {
        this.loading = false;
      }
    },
    async fetchCategorias() {
      try {
        const response = await axios.get('/Admin/Categoria');
        this.categorias = response.data;
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('pt-BR', options);
    },
    getCategoryName(categoryId) {
      const category = this.categorias.find(c => c.id === categoryId);
      return category ? category.nome : 'Categoria não encontrada';
    },
    showAddModal() {
      this.isEditing = false;
      this.form = this.getEmptyForm();
      this.showModal = true;
      this.formError = null;
    },
    editNoticia(noticia) {
      this.isEditing = true;
      this.selectedNoticia = noticia;
      
      // Convert tags array to comma-separated string if needed
      const tags = Array.isArray(noticia.tags) 
        ? noticia.tags.join(', ')
        : noticia.tags || '';
      
      this.form = {
        id: noticia.id,
        titulo: noticia.titulo,
        conteudo: noticia.conteudo,
        autor: noticia.autor,
        categoria_id: noticia.categoria_id,
        imagem: noticia.imagem || '',
        criado_em: noticia.criado_em || '',
      };
      
      // Load preview image if imagem is set
      this.loadPreviewImage();
      
      this.showModal = true;
      this.formError = null;
    },
    closeModal() {
      this.showModal = false;
      this.form = this.getEmptyForm();
      this.formError = null;
    },
    async saveNoticia() {
      this.formSubmitting = true;
      this.formError = null;
      
      try {
        const token = localStorage.getItem('adminToken');
        const tokenType = localStorage.getItem('adminTokenType') || 'Bearer';
        
        // Convert tags string to array if needed by the API
        const formData = {...this.form};

        if(formData.imagem === "") {
          formData.imagem = null;
        }

        let response;

        if (this.isEditing) {
          response = await axios.put(`/Admin/Noticia/${this.form.id}`, formData, {
            headers: {
              'Authorization': `${tokenType} ${token}`
            }
          });
          

        } else {
          response = await axios.post('/Admin/Noticia', formData, {
            headers: {
              'Authorization': `${tokenType} ${token}`
            }
          });
          
          
        }
        
        await this.fetchNoticias();

        this.closeModal();
      } catch (err) {
        if (err.response.status === 404){
          this.formError = 'Imagem não encontrada. Tente novamente.';
        }
        if(err.response.status != 404){
          this.formError = 'Erro ao salvar notícia. Tente novamente.';
          console.error('Erro ao salvar notícia:', err);
        }
      } finally {
        this.formSubmitting = false;
      }
    },
    confirmDelete(noticia) {
      this.selectedNoticia = noticia;
      this.showDeleteModal = true;
    },
    cancelDelete() {
      this.showDeleteModal = false;
      this.selectedNoticia = null;
    },
    async deleteNoticia() {
      this.deleteSubmitting = true;
      
      try {
        const token = localStorage.getItem('adminToken');
        const tokenType = localStorage.getItem('adminTokenType') || 'Bearer';
        
        await axios.delete(`/Admin/Noticia/${this.selectedNoticia.id}`, {
          headers: {
            'Authorization': `${tokenType} ${token}`
          }
        });
        
        // Remove from local state
        this.noticias = this.noticias.filter(n => n.id !== this.selectedNoticia.id);
        this.cancelDelete();
      } catch (err) {
        console.error('Erro ao excluir notícia:', err);
        alert('Erro ao excluir notícia. Tente novamente.');
      } finally {
        this.deleteSubmitting = false;
      }
    },
    searchNoticias() {
      // This is handled by the computed property
      // Just added for clarity of UX with the search button
    },
    
    // Image Manager Methods
    showImageManagerModal() {
      this.showImageModal = true;
      this.selectedImageUrl = this.form.imagem.id;
      this.fetchImages();
    },
    
    closeImageManagerModal() {
      this.showImageModal = false;
      this.selectedImageUrl = null;
      this.selectedFile = null;
    },
    
    async fetchImages() {
      this.loadingImages = true;
      this.imageError = null;
      
      try {
        const token = localStorage.getItem('adminToken');
        const tokenType = localStorage.getItem('adminTokenType') || 'Bearer';
        
        const response = await axios.get('/Admin/Imagem', {
          headers: {
            'Authorization': `${tokenType} ${token}`
          }
        });
        
        this.images = response.data;
        
        // Update preview image if we have a selected image
        if (this.form.imagem) {
          this.loadPreviewImage();
        }
      } catch (err) {
        console.error('Erro ao buscar imagens:', err);
        this.imageError = 'Não foi possível carregar as imagens. Tente novamente.';
      } finally {
        this.loadingImages = false;
      }
    },
    
    selectImage(image) {
      this.selectedImageUrl = image.id;
      this.selectedImage = image;
    },
    
    confirmImageSelection() {
      this.form.imagem = this.selectedImageUrl;
      this.previewImageUrl = this.selectedImage ? this.selectedImage.imagem_url : null;
      this.closeImageManagerModal();
    },
    
    handleFileChange(e) {
      this.selectedFile = e.target.files[0];
    },
    
    async uploadImage() {
      if (!this.selectedFile) {
        return;
      }
      
      this.uploadingImage = true;
      
      try {
        const token = localStorage.getItem('adminToken');
        const tokenType = localStorage.getItem('adminTokenType') || 'Bearer';
        
        const formData = new FormData();
        formData.append('imagem', this.selectedFile);
        
        
        const response = await axios.post('/Admin/Imagem', formData, {
          headers: {
            'Authorization': `${tokenType} ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Refresh images list
        await this.fetchImages();
        
        // Reset file input
        this.$refs.fileInput.value = '';
        this.selectedFile = null;
      } catch (err) {
        console.error('Erro ao enviar imagem:', err);
        alert('Erro ao enviar imagem. Tente novamente.');
      } finally {
        this.uploadingImage = false;
      }
    },
    
    confirmDeleteImage(image) {
      this.selectedImage = image;
      this.showDeleteImageModal = true;
      // Stop event propagation to prevent image selection
      event.stopPropagation();
    },
    
    cancelDeleteImage() {
      this.showDeleteImageModal = false;
      this.selectedImage = null;
    },
    
    async deleteImage() {
      this.deletingImage = true;
      
      try {
        const token = localStorage.getItem('adminToken');
        const tokenType = localStorage.getItem('adminTokenType') || 'Bearer';
        
        await axios.delete(`/Admin/Imagem/${this.selectedImage.id}`, {
          headers: {
            'Authorization': `${tokenType} ${token}`
          }
        });
        
        // If deleted image was selected, clear selection
        if (this.selectedImageUrl === this.selectedImage.id) {
          this.selectedImageUrl = null;
        }
        
        // If deleted image was used in form, clear form image
        if (this.form.imagem === this.selectedImage.id) {
          this.form.imagem = '';
        }
        
        // Refresh images list
        await this.fetchImages();
        
        this.cancelDeleteImage();
      } catch (err) {
        console.error('Erro ao excluir imagem:', err);
        alert('Erro ao excluir imagem. Tente novamente.');
      } finally {
        this.deletingImage = false;
      }
    },
    loadPreviewImage() {
      if (this.form.imagem) {
        // Find image in the existing images array
        const image = this.images.find(img => img.id === this.form.imagem);
        if (image) {
          this.previewImageUrl = image.imagem_url;
          return;
        }
        
        // If not found in the array, try to fetch it
        this.fetchImagePreview(this.form.imagem);
      } else {
        this.previewImageUrl = null;
      }
    },
    
    async fetchImagePreview(imageId) {
      try {
        const response = await axios.get(`/Admin/Imagem/${imageId}`);
        if (response.data && response.data.imagem_url) {
          this.previewImageUrl = response.data.imagem_url;
        }
      } catch (err) {
        console.error('Erro ao buscar preview da imagem:', err);
        this.previewImageUrl = null;
      }
    }
  }
};
</script>

<style scoped>
.admin-section {
  padding: 0;
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  gap: 16px;
  margin-bottom: 24px;
}

.empty-state i, .error-state i {
  font-size: 48px;
  color: #9e9e9e;
}

.error-state i {
  color: #f44336;
}

.empty-state p, .error-state p {
  margin: 0;
  color: #616161;
  font-size: 16px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #4CAF50;
  width: 36px;
  height: 36px;
  animation: spin 1s linear infinite;
}

.filters-container {  
  display: flex;
  flex-direction: column;
  max-width: 800px;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9e9e9e;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 42px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.filter-options {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-item label {
  font-size: 14px;
  color: #616161;
}

.filter-select {
  min-width: 150px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  font-size: 14px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.noticia-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  position: relative;
}

.noticia-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.noticia-card.featured::before {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 193, 7, 0.9);
  color: #212121;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  z-index: 1;
}

.card-image {
  height: 180px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.card-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-image.placeholder i {
  font-size: 48px;
  color: #bdbdbd;
}

.noticia-card:hover .card-image img {
  transform: scale(1.05);
}

.card-content {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-category {
  background-color: #e0f2f1;
  color: #00796b;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.card-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #757575;
  font-size: 13px;
}

.meta-item i {
  width: 14px;
  color: #9e9e9e;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #f5f5f5;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.published {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status-badge.draft {
  background-color: #f5f5f5;
  color: #616161;
}

.form-group {
  margin-bottom: 16px;
  flex: 1;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #424242;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #4CAF50;
}

.content-editor {
  font-family: inherit;
  min-height: 250px;
  resize: vertical;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-text {
  color: #424242;
}

.form-error {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.delete-confirmation {
  color: #f44336;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  margin-bottom: 24px;
}

.delete-confirmation i {
  font-size: 48px;
  color: #f44336;
}

.delete-warning {
  color: #f44336;
  font-weight: 500;
  margin: 8px 0 0 0;
}

.delete-modal {
  max-width: 450px;
}

/* Buttons */
.btn-primary, .btn-secondary, .btn-danger, .btn-retry {
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #388E3C;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #e0e0e0;
}

.btn-secondary:hover {
  background-color: #eeeeee;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover {
  background-color: #d32f2f;
}

.btn-retry {
  background-color: #f44336;
  color: white;
}

.btn-edit-small, .btn-delete-small, .btn-publish-small, .btn-unpublish-small {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-edit-small {
  background-color: #2196F3;
  color: white;
}

.btn-edit-small:hover {
  background-color: #1976D2;
}

.btn-publish-small {
  background-color: #4CAF50;
  color: white;
}

.btn-publish-small:hover {
  background-color: #388E3C;
}

.btn-unpublish-small {
  background-color: #FF9800;
  color: white;
}

.btn-unpublish-small:hover {
  background-color: #F57C00;
}

.btn-delete-small {
  background-color: #F44336;
  color: white;
}

.btn-delete-small:hover {
  background-color: #D32F2F;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #616161;
  cursor: pointer;
}

.btn-spinner {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 3px solid white;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.large-modal {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.modal-body {
  padding: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .filters-container {
    flex-direction: column;
  }
  
  .filter-options {
    margin-top: 16px;
  }
}

.image-input-container {
  display: flex;
  gap: 8px;
}

.btn-select-image {
  white-space: nowrap;
}

.image-upload-section {
  color: #333;
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.image-upload-section h4 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  color: #424242;
}

.upload-form {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.upload-form .form-group {
  margin-bottom: 0;
  flex: 1;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.image-item {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  height: 150px;
  transition: all 0.2s;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.image-item.selected {
  box-shadow: 0 0 0 3px #4CAF50, 0 2px 5px rgba(0, 0, 0, 0.2);
}

.image-item.to-be-selected {
  box-shadow: 0 0 0 3px #2196F3, 0 2px 5px rgba(0, 0, 0, 0.2);
}

.image-actions {
  position: absolute;
  top: 5px;
  right: 5px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.small-empty {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #f5f5f5;
}

.selected-image-preview {
  margin-top: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected-image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9e9e9e;
  gap: 8px;
}

.preview-placeholder i {
  font-size: 48px;
}
</style> 