<template>
  <footer class="site-footer">
    <div class="footer-top">
      <div class="container">
        <div class="footer-content">
          <div class="footer-info">
            <div class="footer-logo">
              <h2>FinTrack</h2>
              <p>Sua solução completa para gestão financeira pessoal</p>
            </div>
            <div class="social-links">
              <a href="#" class="social-link"><i class="fab fa-facebook-f"></i></a>
              <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
              <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
              <a href="#" class="social-link"><i class="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          
          <div class="footer-widgets">
            <div class="footer-widget">
              <h3>Links rápidos</h3>
              <ul>
                <li><a href="/#home">Home</a></li>
                <li><a href="/#about">Sobre</a></li>
                <li><a href="/#services">Serviços</a></li>
                <li><a href="/#contact">Contato</a></li>
                <li><router-link to="/noticias">Notícias</router-link></li>
              </ul>
            </div>
            
            <div class="footer-widget">
              <h3>Serviços</h3>
              <ul>
                <li><a href="/#services">Controle de Despesas</a></li>
                <li><a href="/#services">Análise Financeira</a></li>
                <li><a href="/#services">Definição de Metas</a></li>
                <li><a href="/#services">Acesso Mobile</a></li>
              </ul>
            </div>
            
            <div class="footer-widget">
              <h3>Contato</h3>
              <ul class="contact-info">
                <li>
                  <span class="contact-icon">
                    <i class="fas fa-map-marker-alt"></i>
                  </span>
                  <span>Av. Airton Senna, 1000 - Feira de Santana, BA</span>
                </li>
                <li>
                  <span class="contact-icon">
                    <i class="fas fa-phone-alt"></i>
                  </span>
                  <span>(11) 9999-9999</span>
                </li>
                <li>
                  <span class="contact-icon">
                    <i class="fas fa-envelope"></i>
                  </span>
                  <span>contato@fintrack.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <div class="container">
        <p>&copy; {{ currentYear }} FinTrack. Todos os direitos reservados.</p>
        <div class="footer-links">
          <a href="#">Termos de Uso</a>
          <a href="#">Política de Privacidade</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  }
}
</script>

<style scoped>
.site-footer {
  background-color: #292929;
  color: #f5f5f5;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-top {
  padding: 70px 0 40px;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
}

.footer-info {
  flex: 1;
  min-width: 250px;
}

.footer-logo h2 {
  font-size: 2rem;
  color: #4CAF50;
  margin: 0 0 15px;
}

.footer-logo p {
  color: #b0b0b0;
  margin-bottom: 20px;
  line-height: 1.6;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.social-link:hover {
  background-color: #4CAF50;
  transform: translateY(-3px);
}

.footer-widgets {
  flex: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: space-between;
}

.footer-widget {
  flex: 1;
  min-width: 160px;
}

.footer-widget h3 {
  font-size: 1.2rem;
  color: white;
  margin-bottom: 20px;
  position: relative;
  padding-bottom: 10px;
}

.footer-widget h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 3px;
  background-color: #4CAF50;
}

.footer-widget ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-widget ul li {
  margin-bottom: 12px;
}

.footer-widget ul li a {
  color: #b0b0b0;
  text-decoration: none;
  transition: color 0.3s;
  display: inline-block;
}

.footer-widget ul li a:hover {
  color: #4CAF50;
  transform: translateX(5px);
}

.contact-info li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  color: #b0b0b0;
}

.contact-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 12px;
  color: #4CAF50;
  flex-shrink: 0;
}

.footer-bottom {
  background-color: #1e1e1e;
  padding: 20px 0;
  text-align: center;
}

.footer-bottom .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.footer-bottom p {
  margin: 0;
  color: #888;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-links a {
  color: #888;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #4CAF50;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 30px;
  }
  
  .footer-widget {
    min-width: 100%;
  }
  
  .footer-bottom .container {
    flex-direction: column;
    text-align: center;
  }
}
</style> 