/**
 * DOCTOR PC - CONTROLADOR PRINCIPAL (VANILLA JS)
 * Arquitectura: Modular, Delegación de Eventos, Rendimiento y Accesibilidad.
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. CONFIGURACIÓN Y REFERENCIAS PRINCIPALES
  // =========================================================================
  const CONFIG = {
    whatsappNumber: '50231393354',
    scrollOffset: 70
  };

  const DOM = {
    header: document.getElementById('siteHeader'),
    menuToggle: document.getElementById('menuToggle'),
    navMenu: document.getElementById('navMenu'),
    navOverlay: document.getElementById('navOverlay'),
    scrollTopBtn: document.getElementById('scrollTopBtn'),
    currentYear: document.getElementById('currentYear'),
    sections: document.querySelectorAll('section[id]')
  };

  // 1.1 Actualizar año dinámico de copyright
  if (DOM.currentYear) {
    DOM.currentYear.textContent = new Date().getFullYear();
  }

  // =========================================================================
  // 2. CONTROL DEL MENÚ MÓVIL (ACCESIBILIDAD Y ESTADO)
  // =========================================================================
  const setMobileMenuState = (isOpen) => {
    DOM.menuToggle.classList.toggle('is-active', isOpen);
    DOM.navMenu.classList.toggle('is-active', isOpen);
    DOM.navOverlay.classList.toggle('is-active', isOpen);
    DOM.menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen && window.innerWidth <= 768 ? 'hidden' : '';
  };

  const closeMobileMenu = () => setMobileMenuState(false);
  const toggleMobileMenu = () => setMobileMenuState(!DOM.navMenu.classList.contains('is-active'));

  // Cerrar con la tecla ESC si está abierto
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && DOM.navMenu.classList.contains('is-active')) {
      closeMobileMenu();
    }
  });

  // =========================================================================
  // 3. DESPLAZAMIENTO SUAVE (SMOOTH SCROLLING) CON COMPENSACIÓN
  // =========================================================================
  const scrollToSection = (targetId) => {
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;

    const headerHeight = DOM.header ? DOM.header.offsetHeight : CONFIG.scrollOffset;
    const topPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

    window.scrollTo({ top: topPosition, behavior: 'smooth' });
    closeMobileMenu();
  };

  // =========================================================================
  // 4. DELEGACIÓN DE EVENTOS DE CLIC (CLICK EVENT DELEGATION)
  // =========================================================================
  document.addEventListener('click', (e) => {
    // 4.1 Toggle del menú hamburguesa
    if (e.target.closest('#menuToggle')) {
      toggleMobileMenu();
      return;
    }

    // 4.2 Clic en overlay para cerrar menú móvil
    if (e.target.matches('#navOverlay')) {
      closeMobileMenu();
      return;
    }

    // 4.3 Botón volver arriba
    if (e.target.closest('#scrollTopBtn')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 4.4 Navegación suave por anclas internas (#)
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      const targetId = anchor.getAttribute('href');
      if (targetId && targetId !== '#') {
        e.preventDefault();
        scrollToSection(targetId);
      }
      return;
    }

    // 4.5 Envío de consulta personalizada por WhatsApp
    if (e.target.closest('#btnSendCustomWhatsapp')) {
      sendWhatsAppInquiry();
    }
  });

  // =========================================================================
  // 5. ASISTENTE RÁPIDO DE CONSULTAS POR WHATSAPP
  // =========================================================================
  const sendWhatsAppInquiry = () => {
    const name = document.getElementById('clientName')?.value.trim();
    const device = document.getElementById('deviceType')?.value || 'Equipo';
    const problem = document.getElementById('clientProblem')?.value.trim();

    let text = `¡Hola Doctor PC! `;
    if (name) text += `Mi nombre es ${name}. `;
    text += `Deseo cotizar un servicio técnico para: *${device}*.`;
    text += problem ? `\n\n*Detalles:* ${problem}` : `\n\n¿Podrían brindarme información y disponibilidad?`;

    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // =========================================================================
  // 6. CONTROLADORES DE SCROLL (SCROLLSPY, HEADER SHADOW, BACK-TO-TOP)
  // =========================================================================
  let scrollTimeout;
  const onScroll = () => {
    const scrollY = window.pageYOffset;
    const headerHeight = DOM.header ? DOM.header.offsetHeight : CONFIG.scrollOffset;

    // 6.1 Sombra en la cabecera al hacer scroll
    DOM.header?.classList.toggle('scrolled', scrollY > 20);

    // 6.2 Visibilidad del botón Volver Arriba
    DOM.scrollTopBtn?.classList.toggle('is-visible', scrollY > 350);

    // 6.3 Scrollspy: Resaltar enlace de navegación según la sección activa
    DOM.sections.forEach((section) => {
      const top = section.offsetTop - headerHeight - 100;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const navLink = document.querySelector(`.nav-menu a[href="#${id}"]`);

      if (navLink && scrollY >= top && scrollY < top + height) {
        document.querySelectorAll('.nav-link').forEach((link) => link.classList.remove('active'));
        navLink.classList.add('active');
      }
    });
  };

  // Listener pasivo para máxima fluidez a 60 FPS
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Verificación inicial
});
