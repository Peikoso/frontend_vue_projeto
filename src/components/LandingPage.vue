<template>
  <div class="landing-container">
    <!-- Navigation Bar -->
    <header class="landing-header">
      <div class="logo">
        <h1>FinTrack</h1>
      </div>
      <nav class="nav-menu">
        <ul>
          <li><a href="#home" class="nav-link">Home</a></li>
          <li><a href="#about" class="nav-link">Sobre</a></li>
          <li><a href="#services" class="nav-link">Serviços</a></li>
          <li><a href="#contact" class="nav-link">Contato</a></li>
        </ul>
      </nav>
      <router-link to="/login" class="login-button">Entrar</router-link>
      <div class="menu-toggle" @click="toggleMenu">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>
    </header>

    <!-- Mobile Menu -->
    <div class="mobile-menu" :class="{ 'active': menuActive }">
      <a href="#home" class="mobile-link" @click="closeMenu">Home</a>
      <a href="#about" class="mobile-link" @click="closeMenu">Sobre</a>
      <a href="#services" class="mobile-link" @click="closeMenu">Serviços</a>
      <a href="#contact" class="mobile-link" @click="closeMenu">Contato</a>
      <router-link to="/login" class="mobile-link login" @click="closeMenu">Entrar</router-link>
    </div>

    <!-- Hero Section with Slideshow -->
    <section id="home" class="hero-section">
      <div class="slideshow-container">
        <div class="slideshow">
          <div class="slide" v-for="(slide, index) in slides" :key="index" :class="{ 'active': currentSlide === index }">
            <div class="slide-image" :style="{ 'background-image': 'url(' + slide.image + ')' }"></div>
            <div class="slide-content">
              <h1>{{ slide.title }}</h1>
              <p>{{ slide.description }}</p>
              <div class="hero-buttons">
                <router-link to="/login" class="cta-button">Começar agora</router-link>
                <a href="#services" class="secondary-button">Saiba mais</a>
              </div>
            </div>
          </div>
        </div>
        <div class="slide-indicators">
          <span 
            v-for="(slide, index) in slides" 
            :key="'indicator-'+index" 
            :class="{ 'active': currentSlide === index }"
            @click="setSlide(index)">
          </span>
        </div>
        <button class="slide-arrow prev" @click="prevSlide">❮</button>
        <button class="slide-arrow next" @click="nextSlide">❯</button>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="about-section">
      <div class="container">
        <div class="section-header">
          <h2>Sobre o FinTrack</h2>
          <div class="section-line"></div>
        </div>
        <div class="about-content">
          <div class="about-text">
            <p>O FinTrack é uma plataforma completa de gestão financeira pessoal, projetada para ajudar você a tomar controle das suas finanças e alcançar seus objetivos financeiros.</p>
            <p>Nossa missão é simplificar o gerenciamento financeiro, fornecendo ferramentas intuitivas e eficientes que permitem visualizar, planejar e otimizar seus recursos financeiros.</p>
            <p>Desenvolvida por uma equipe de especialistas em finanças e tecnologia, nossa plataforma combina segurança, facilidade de uso e recursos avançados para atender às necessidades de diferentes perfis de usuários.</p>
          </div>
          <div class="about-stats">
            <div class="stat-item">
              <div class="stat-number">10k+</div>
              <div class="stat-label">Usuários ativos</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">98%</div>
              <div class="stat-label">Satisfação</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">24/7</div>
              <div class="stat-label">Suporte</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="services-section">
      <div class="container">
        <div class="section-header">
          <h2>Nossos Serviços</h2>
          <div class="section-line"></div>
        </div>
        <div class="services-grid">
          <div class="service-card">
            <div class="service-icon">💰</div>
            <h3>Controle de Despesas</h3>
            <p>Acompanhe para onde seu dinheiro está indo com categorização automática de despesas e relatórios detalhados.</p>
          </div>
          <div class="service-card">
            <div class="service-icon">📊</div>
            <h3>Análise Financeira</h3>
            <p>Visualize seus dados financeiros com gráficos e relatórios personalizados para tomar decisões mais informadas.</p>
          </div>
          <div class="service-card">
            <div class="service-icon">🎯</div>
            <h3>Definição de Metas</h3>
            <p>Estabeleça objetivos financeiros claros e acompanhe seu progresso com nossas ferramentas de planejamento.</p>
          </div>
          <div class="service-card">
            <div class="service-icon">📱</div>
            <h3>Acesso Mobile</h3>
            <p>Gerencie suas finanças em qualquer lugar, a qualquer momento, com nosso aplicativo responsivo e intuitivo.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="contact-section">
      <div class="container">
        <div class="section-header">
          <h2>Entre em Contato</h2>
          <div class="section-line"></div>
        </div>
        <div class="contact-content">
          <div class="contact-info">
            <div class="contact-item">
              <div class="contact-icon">📞</div>
              <div class="contact-details">
                <h3>Telefone</h3>
                <p>(11) 9999-9999</p>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">📧</div>
              <div class="contact-details">
                <h3>Email</h3>
                <p>contato@fintrack.com</p>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">📍</div>
              <div class="contact-details">
                <h3>Endereço</h3>
                <p>Av. Airton Senna, 1000 - Feira de Santana, BA</p>
              </div>
            </div>
          </div>
          <div class="contact-form">
            <div class="form-group">
              <label for="name">Nome</label>
              <input type="text" id="name" placeholder="Seu nome completo">
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" placeholder="Seu email">
            </div>
            <div class="form-group">
              <label for="message">Mensagem</label>
              <textarea id="message" rows="4" placeholder="Digite sua mensagem"></textarea>
            </div>
            <button class="submit-button">Enviar mensagem</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="cta-section">
      <div class="container">
        <h2>Pronto para começar a transformar suas finanças?</h2>
        <p>Junte-se a milhares de usuários que já estão economizando e investindo melhor.</p>
        <router-link to="/login" class="cta-button">Acessar plataforma</router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <h2>FinTrack</h2>
            <p>Sua solução completa para gestão financeira</p>
          </div>
          <div class="footer-links">
            <div class="footer-column">
              <h3>Links rápidos</h3>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">Sobre</a></li>
                <li><a href="#services">Serviços</a></li>
                <li><a href="#contact">Contato</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 FinTrack. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',
  data() {
    return {
      menuActive: false,
      currentSlide: 0,
      slides: [
        {
          title: "Gerencie suas finanças com facilidade",
          description: "Acompanhe suas receitas, despesas e economias em um único lugar",
          image: "https://images.unsplash.com/photo-1565514458641-d07634a2632c?q=80&w=1470&auto=format&fit=crop"
        },
        {
          title: "Planeje seu futuro financeiro",
          description: "Defina metas e acompanhe seu progresso com nossas ferramentas inteligentes",
          image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1470&auto=format&fit=crop"
        },
        {
          title: "Decisões financeiras inteligentes",
          description: "Visualize seus dados e tome decisões baseadas em informações reais",
          image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=1374&auto=format&fit=crop"
        }
      ],
      slideInterval: null
    }
  },
  methods: {
    toggleMenu() {
      this.menuActive = !this.menuActive;
    },
    closeMenu() {
      this.menuActive = false;
    },
    nextSlide() {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    },
    prevSlide() {
      this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    },
    setSlide(index) {
      this.currentSlide = index;
    },
    startSlideshow() {
      this.slideInterval = setInterval(() => {
        this.nextSlide();
      }, 5000);
    },
    stopSlideshow() {
      clearInterval(this.slideInterval);
    }
  },
  mounted() {
    this.startSlideshow();
  },
  beforeUnmount() {
    this.stopSlideshow();
  }
}
</script>

<style scoped>
/* General Styles - Fix fullscreen issue */
.landing-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  line-height: 1.6;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-header h2 {
  font-size: 2.2rem;
  margin-bottom: 15px;
  color: #333;
}

.section-line {
  height: 4px;
  width: 60px;
  background-color: #4CAF50;
  margin: 0 auto;
  border-radius: 4px;
}

/* Header Styles */
.landing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 50px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

.logo h1 {
  font-size: 2rem;
  color: #4CAF50;
  margin: 0;
}

.nav-menu ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  color: #333;
  text-decoration: none;
  padding: 10px 15px;
  margin: 0 5px;
  font-weight: 500;
  transition: all 0.3s;
  position: relative;
}

.nav-link:after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 5px;
  left: 50%;
  background-color: #4CAF50;
  transform: translateX(-50%);
  transition: width 0.3s;
}

.nav-link:hover:after {
  width: 50%;
}

.login-button {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
}

.login-button:hover {
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
  transform: translateY(-2px);
}

.menu-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
}

.bar {
  width: 25px;
  height: 3px;
  background-color: #333;
  margin: 3px 0;
  transition: 0.4s;
  border-radius: 3px;
}

/* Mobile Menu */
.mobile-menu {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 80px 0 20px;
  z-index: 999;
  flex-direction: column;
  transform: translateY(-100%);
  transition: transform 0.3s ease-in-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mobile-menu.active {
  transform: translateY(0);
}

.mobile-link {
  color: #333;
  text-decoration: none;
  padding: 15px 20px;
  text-align: center;
  font-weight: 500;
  border-bottom: 1px solid #f1f1f1;
  transition: background-color 0.3s;
}

.mobile-link:hover {
  background-color: #f9f9f9;
}

.mobile-link.login {
  background-color: #4CAF50;
  color: white;
  margin: 15px 20px;
  border-radius: 25px;
  border: none;
}

/* Slideshow Styles */
.hero-section {
  padding: 0;
  position: relative;
  height: 100vh;
  overflow: hidden;
  margin-top: 0;
  padding-top: 0;
}

.slideshow-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.slideshow {
  width: 100%;
  height: 100%;
  position: relative;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  display: flex;
  align-items: center;
}

.slide.active {
  opacity: 1;
  z-index: 1;
}

.slide-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: brightness(0.7);
}

.slide-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
  margin-left: 10%;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.slide-content h1 {
  font-size: 3rem;
  margin-bottom: 20px;
}

.slide-content p {
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.slide-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2rem;
  color: white;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  transition: background 0.3s;
}

.slide-arrow:hover {
  background: rgba(0, 0, 0, 0.5);
}

.slide-arrow.prev {
  left: 20px;
}

.slide-arrow.next {
  right: 20px;
}

.slide-indicators {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  z-index: 100;
}

.slide-indicators span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s;
}

.slide-indicators span.active {
  background: white;
  transform: scale(1.2);
}

/* Hero Buttons */
.hero-buttons {
  display: flex;
  gap: 15px;
}

.cta-button {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
}

.cta-button:hover {
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.2);
  transform: translateY(-3px);
}

.secondary-button {
  background: transparent;
  color: white;
  border: 2px solid white;
  padding: 13px 28px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
}

.secondary-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* About Section */
.about-section {
  padding: 100px 0;
  background-color: white;
}

.about-content {
  display: flex;
  gap: 50px;
}

.about-text {
  flex: 3;
}

.about-text p {
  margin-bottom: 20px;
  font-size: 1.1rem;
  color: #555;
}

.about-stats {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.stat-item {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 25px;
  text-align: center;
  transition: transform 0.3s;
  border-left: 4px solid #4CAF50;
}

.stat-item:hover {
  transform: translateY(-5px);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #4CAF50;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 1.1rem;
  color: #666;
}

/* Services Section */
.services-section {
  padding: 100px 0;
  background-color: #f8f9fa;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
}

.service-card {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  text-align: center;
}

.service-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.service-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.service-card h3 {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #333;
}

.service-card p {
  color: #666;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.service-link {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
  position: relative;
  transition: all 0.3s;
}

.service-link:after {
  content: '→';
  margin-left: 5px;
  transition: margin-left 0.3s;
}

.service-link:hover:after {
  margin-left: 10px;
}

/* Contact Section */
.contact-section {
  padding: 100px 0;
  background-color: white;
}

.contact-content {
  display: flex;
  gap: 50px;
}

.contact-info {
  flex: 1;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.contact-icon {
  font-size: 2rem;
  margin-right: 20px;
  color: #4CAF50;
}

.contact-details h3 {
  font-size: 1.2rem;
  margin-bottom: 5px;
  color: #333;
}

.contact-details p {
  color: #666;
}

.contact-form {
  flex: 1.5;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.submit-button {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
}

.submit-button:hover {
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  text-align: center;
  padding: 80px 0;
}

.cta-section h2 {
  font-size: 2.2rem;
  margin-bottom: 15px;
}

.cta-section p {
  font-size: 1.1rem;
  margin-bottom: 30px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  opacity: 0.9;
}

.cta-section .cta-button {
  background: white;
  color: #4CAF50;
  border: none;
}

.cta-section .cta-button:hover {
  background: #f8f8f8;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

/* Footer */
.landing-footer {
  background-color: #333;
  color: white;
  padding: 70px 0 20px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  margin-bottom: 50px;
}

.footer-logo h2 {
  color: white;
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.footer-logo p {
  color: #aaa;
  max-width: 300px;
}

.footer-links {
  display: flex;
  gap: 50px;
}

.footer-column h3 {
  color: white;
  font-size: 1.2rem;
  margin-bottom: 20px;
  position: relative;
}

.footer-column h3:after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 30px;
  height: 2px;
  background-color: #4CAF50;
}

.footer-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-column ul li {
  margin-bottom: 10px;
}

.footer-column ul li a {
  color: #aaa;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-column ul li a:hover {
  color: #4CAF50;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #444;
  color: #888;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .about-content,
  .contact-content {
    flex-direction: column;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 40px;
  }
  
  .footer-links {
    flex-wrap: wrap;
    gap: 30px;
  }
}

/* Responsive Fixes */
@media (max-width: 768px) {
  .landing-header {
    padding: 15px 20px;
  }
  
  .nav-menu {
    display: none;
  }
  
  .menu-toggle {
    display: flex;
  }
  
  .mobile-menu {
    display: flex;
  }
  
  .login-button {
    display: none;
  }
  
  .section-header h2 {
    font-size: 1.8rem;
  }
  
  .slide-content h1 {
    font-size: 2rem;
  }
  
  .slide-content {
    margin-left: 5%;
    max-width: 90%;
    text-align: center;
  }
  
  .about-section,
  .services-section,
  .contact-section {
    padding: 70px 0;
  }
  
  .cta-section h2 {
    font-size: 1.8rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
  
  .cta-button, .secondary-button {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .slide-content h1 {
    font-size: 1.8rem;
  }
  
  .stat-item {
    padding: 15px;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .service-card {
    padding: 20px;
  }
  
  .slide-arrow {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
}
</style> 