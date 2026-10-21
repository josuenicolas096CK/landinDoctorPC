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
    scrollOffset: 70,
    mobileBreakpoint: 980,
    maxPhotoBytes: 8 * 1024 * 1024,
    promotion: {
      enabled: true,
      eyebrow: 'Promoción destacada',
      title: 'Pregunta por promociones de mantenimiento preventivo',
      description: 'Consulta disponibilidad y condiciones para computadoras, impresoras o varios equipos.',
      whatsappTopic: 'Promociones vigentes de mantenimiento preventivo'
    }
  };

  const DOM = {
    header: document.getElementById('siteHeader'),
    menuToggle: document.getElementById('menuToggle'),
    navMenu: document.getElementById('navMenu'),
    navOverlay: document.getElementById('navOverlay'),
    scrollTopBtn: document.getElementById('scrollTopBtn'),
    currentYear: document.getElementById('currentYear'),
    sections: document.querySelectorAll('section[id]'),
    themeSwitcher: document.getElementById('themeSwitcher'),
    themeMenuButton: document.getElementById('themeMenuButton'),
    themeMenu: document.getElementById('themeMenu'),
    whatsappForm: document.getElementById('whatsappQuickForm'),
    businessStatus: document.getElementById('businessStatus'),
    businessHoursText: document.getElementById('businessHoursText'),
    themeColor: document.querySelector('meta[name="theme-color"]'),
    diagnosticForm: document.getElementById('diagnosticWizard'),
    quoteForm: document.getElementById('quoteForm'),
    appointmentForm: document.getElementById('appointmentForm'),
    trackingForm: document.getElementById('trackingForm'),
    pwaInstallSection: document.getElementById('pwaInstallSection'),
    pwaInstallStatus: document.getElementById('pwaInstallStatus'),
    installDialog: document.getElementById('installHelpDialog'),
    installInstructions: document.getElementById('installInstructions'),
    pwaUpdateToast: document.getElementById('pwaUpdateToast'),
    pwaUpdateButton: document.getElementById('pwaUpdateButton')
  };

  // 1.1 Actualizar año dinámico de copyright
  if (DOM.currentYear) {
    DOM.currentYear.textContent = new Date().getFullYear();
  }

  // Contenido promocional centralizado para poder actualizarlo sin tocar el diseño.
  const promotionBanner = document.getElementById('promotionBanner');
  if (promotionBanner) {
    promotionBanner.hidden = !CONFIG.promotion.enabled;
    const promoEyebrow = document.getElementById('promoEyebrow');
    const promoTitle = document.getElementById('promoTitle');
    const promoDescription = document.getElementById('promoDescription');
    const promoAction = document.getElementById('promoAction');
    if (promoEyebrow) promoEyebrow.textContent = CONFIG.promotion.eyebrow;
    if (promoTitle) promoTitle.textContent = CONFIG.promotion.title;
    if (promoDescription) promoDescription.textContent = CONFIG.promotion.description;
    if (promoAction) promoAction.dataset.service = CONFIG.promotion.whatsappTopic;
  }

  // =========================================================================
  // 2. CONTROL DEL MENÚ MÓVIL (ACCESIBILIDAD Y ESTADO)
  // =========================================================================
  const setMobileMenuState = (isOpen) => {
    if (!DOM.menuToggle || !DOM.navMenu || !DOM.navOverlay) return;
    DOM.menuToggle.classList.toggle('is-active', isOpen);
    DOM.navMenu.classList.toggle('is-active', isOpen);
    DOM.navOverlay.classList.toggle('is-active', isOpen);
    DOM.menuToggle.setAttribute('aria-expanded', String(isOpen));
    DOM.menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    DOM.navOverlay.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen && window.innerWidth <= CONFIG.mobileBreakpoint ? 'hidden' : '';
  };

  const closeMobileMenu = () => setMobileMenuState(false);
  const toggleMobileMenu = () => {
    if (DOM.navMenu) setMobileMenuState(!DOM.navMenu.classList.contains('is-active'));
  };

  // =========================================================================
  // 3. DESPLAZAMIENTO SUAVE (SMOOTH SCROLLING) CON COMPENSACIÓN
  // =========================================================================
  const scrollToSection = (targetId) => {
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;

    const headerHeight = DOM.header ? DOM.header.offsetHeight : CONFIG.scrollOffset;
    const topPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: topPosition, behavior: reduceMotion ? 'auto' : 'smooth' });
    closeMobileMenu();
  };

  // =========================================================================
  // 4. DELEGACIÓN DE EVENTOS DE CLIC (CLICK EVENT DELEGATION)
  // =========================================================================
  document.addEventListener('click', (e) => {
    if (DOM.themeSwitcher && !DOM.themeSwitcher.contains(e.target)) {
      setThemeMenuState(false);
    }

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
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      return;
    }

    const serviceLink = e.target.closest('.js-service-whatsapp[data-service]');
    if (serviceLink) {
      e.preventDefault();
      openWhatsApp(`¡Hola Doctor PC! Deseo recibir información sobre: *${serviceLink.dataset.service}*. ¿Podrían indicarme disponibilidad y los datos que necesitan para cotizar?`);
      return;
    }

    // 4.4 Navegación suave por anclas internas (#)
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      if (anchor.dataset.openTool) activateTool(anchor.dataset.openTool);
      const targetId = anchor.getAttribute('href');
      if (targetId && targetId !== '#') {
        e.preventDefault();
        scrollToSection(targetId);
      }
      return;
    }

    // 4.5 Abrir/cerrar el selector de tema
    if (e.target.closest('#themeMenuButton')) {
      setThemeMenuState(DOM.themeMenu?.hidden ?? true);
      return;
    }

    // 4.6 Aplicar una opción de tema
    const themeOption = e.target.closest('.theme-option[data-theme]');
    if (themeOption) {
      applyTheme(themeOption.dataset.theme);
      setThemeMenuState(false);
      DOM.themeMenuButton?.focus();
      return;
    }

  });

  // =========================================================================
  // 5. ASISTENTE RÁPIDO DE CONSULTAS POR WHATSAPP
  // =========================================================================
  const openWhatsApp = (message) => {
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const sendWhatsAppInquiry = () => {
    const name = document.getElementById('clientName')?.value.trim();
    const device = document.getElementById('deviceType')?.value || 'Equipo';
    const problem = document.getElementById('clientProblem')?.value.trim();

    let text = `¡Hola Doctor PC! `;
    if (name) text += `Mi nombre es ${name}. `;
    text += `Deseo cotizar un servicio técnico para: *${device}*.`;
    text += problem ? `\n\n*Detalles:* ${problem}` : `\n\n¿Podrían brindarme información y disponibilidad?`;

    openWhatsApp(text);
  };

  DOM.whatsappForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!DOM.whatsappForm.reportValidity()) return;
    sendWhatsAppInquiry();
  });

  // =========================================================================
  // 6. HERRAMIENTAS INTERACTIVAS
  // =========================================================================
  const toolTabs = [...document.querySelectorAll('.tool-tab[data-tool]')];
  const toolPanels = [...document.querySelectorAll('.tool-panel[data-panel]')];

  const activateTool = (toolName, focusTab = false) => {
    const selectedTab = toolTabs.find((tab) => tab.dataset.tool === toolName);
    const selectedPanel = toolPanels.find((panel) => panel.dataset.panel === toolName);
    if (!selectedTab || !selectedPanel) return;

    toolTabs.forEach((tab) => {
      const isSelected = tab === selectedTab;
      tab.classList.toggle('is-active', isSelected);
      tab.setAttribute('aria-selected', String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
    });
    toolPanels.forEach((panel) => {
      const isSelected = panel === selectedPanel;
      panel.hidden = !isSelected;
      panel.classList.toggle('is-active', isSelected);
    });
    if (focusTab) selectedTab.focus();
  };

  toolTabs.forEach((tab) => {
    tab.addEventListener('click', () => activateTool(tab.dataset.tool));
  });

  const requestedTool = new URLSearchParams(window.location.search).get('tool');
  if (requestedTool) activateTool(requestedTool);

  document.querySelector('.tool-tabs')?.addEventListener('keydown', (event) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = toolTabs.indexOf(document.activeElement);
    let nextIndex = 0;
    if (event.key === 'End') nextIndex = toolTabs.length - 1;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1 + toolTabs.length) % toolTabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + toolTabs.length) % toolTabs.length;
    activateTool(toolTabs[nextIndex].dataset.tool, true);
  });

  const setFeedback = (element, message = '') => {
    if (!element) return;
    element.textContent = message;
    element.hidden = !message;
  };

  const validateVisibleFields = (container) => {
    const fields = [...container.querySelectorAll('input, select, textarea')];
    const invalidField = fields.find((field) => !field.checkValidity());
    if (!invalidField) return true;
    invalidField.reportValidity();
    invalidField.focus({ preventScroll: true });
    return false;
  };

  // Diagnóstico guiado
  let diagnosticStep = 1;
  const diagnosticSteps = [...(DOM.diagnosticForm?.querySelectorAll('.wizard-step') || [])];
  const diagnosticBack = document.getElementById('diagnosticBack');
  const diagnosticNext = document.getElementById('diagnosticNext');
  const diagnosticSubmit = document.getElementById('diagnosticSubmit');
  const diagnosticFeedback = document.getElementById('diagnosticFeedback');
  const diagnosticProgressText = document.getElementById('diagnosticProgressText');
  const diagnosticProgressBar = document.getElementById('diagnosticProgressBar');
  const diagnosticPhoto = document.getElementById('diagnosticPhoto');
  const diagnosticPhotoLabel = document.getElementById('diagnosticPhotoLabel');

  const renderDiagnosticStep = () => {
    diagnosticSteps.forEach((step) => {
      const isActive = Number(step.dataset.step) === diagnosticStep;
      step.hidden = !isActive;
      step.classList.toggle('is-active', isActive);
    });
    if (diagnosticProgressText) diagnosticProgressText.textContent = `Paso ${diagnosticStep} de ${diagnosticSteps.length}`;
    if (diagnosticProgressBar) diagnosticProgressBar.style.width = `${(diagnosticStep / diagnosticSteps.length) * 100}%`;
    if (diagnosticBack) diagnosticBack.hidden = diagnosticStep === 1;
    if (diagnosticNext) diagnosticNext.hidden = diagnosticStep === diagnosticSteps.length;
    if (diagnosticSubmit) diagnosticSubmit.hidden = diagnosticStep !== diagnosticSteps.length;
    setFeedback(diagnosticFeedback);
  };

  diagnosticNext?.addEventListener('click', () => {
    const activeStep = diagnosticSteps.find((step) => Number(step.dataset.step) === diagnosticStep);
    if (!activeStep || !validateVisibleFields(activeStep)) {
      setFeedback(diagnosticFeedback, 'Selecciona una opción para continuar.');
      return;
    }
    diagnosticStep = Math.min(diagnosticStep + 1, diagnosticSteps.length);
    renderDiagnosticStep();
    diagnosticSteps[diagnosticStep - 1]?.querySelector('input, select, textarea')?.focus({ preventScroll: true });
  });

  diagnosticBack?.addEventListener('click', () => {
    diagnosticStep = Math.max(diagnosticStep - 1, 1);
    renderDiagnosticStep();
  });

  diagnosticPhoto?.addEventListener('change', () => {
    const file = diagnosticPhoto.files?.[0];
    if (!file) {
      diagnosticPhotoLabel.textContent = 'Seleccionar fotografía';
      diagnosticPhoto.setCustomValidity('');
      return;
    }
    const validType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    const validSize = file.size <= CONFIG.maxPhotoBytes;
    diagnosticPhoto.setCustomValidity(!validType ? 'Selecciona una imagen JPG, PNG o WebP.' : !validSize ? 'La fotografía no puede superar 8 MB.' : '');
    diagnosticPhotoLabel.textContent = validType && validSize ? file.name : 'Archivo no válido';
    if (!diagnosticPhoto.checkValidity()) diagnosticPhoto.reportValidity();
  });

  DOM.diagnosticForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const activeStep = diagnosticSteps.find((step) => Number(step.dataset.step) === diagnosticStep);
    if (!activeStep || !validateVisibleFields(activeStep) || !DOM.diagnosticForm.checkValidity()) {
      setFeedback(diagnosticFeedback, 'Revisa los campos requeridos antes de enviar.');
      return;
    }
    const data = new FormData(DOM.diagnosticForm);
    const hasPhoto = diagnosticPhoto?.files?.length > 0;
    const message = [
      '¡Hola Doctor PC! Completé el diagnóstico guiado:',
      `*Nombre:* ${data.get('diagnosticName')}`,
      `*Equipo o servicio:* ${data.get('diagnosticDevice')}`,
      `*Problema principal:* ${data.get('diagnosticSymptom')}`,
      `*Urgencia:* ${data.get('diagnosticUrgency')}`,
      `*Detalles:* ${data.get('diagnosticDetails')}`,
      hasPhoto ? '_Seleccioné una fotografía y la adjuntaré en este chat._' : ''
    ].filter(Boolean).join('\n');
    openWhatsApp(message);
  });

  // Cotizador sin precios inventados
  const quoteSummaryTitle = document.getElementById('quoteSummaryTitle');
  const quoteSummaryList = document.getElementById('quoteSummaryList');
  const quoteFeedback = document.getElementById('quoteFeedback');

  const getSelectedQuoteServices = () => [...(DOM.quoteForm?.querySelectorAll('input[name="quoteServices"]:checked') || [])].map((input) => input.value);
  const updateQuoteSummary = () => {
    const services = getSelectedQuoteServices();
    if (!quoteSummaryList || !quoteSummaryTitle) return;
    quoteSummaryList.replaceChildren();
    quoteSummaryTitle.textContent = services.length ? `${services.length} ${services.length === 1 ? 'servicio seleccionado' : 'servicios seleccionados'}` : 'Aún no has seleccionado servicios';
    const items = services.length ? services : ['Elige una o varias opciones para preparar tu solicitud.'];
    items.forEach((service) => {
      const item = document.createElement('li');
      item.textContent = service;
      quoteSummaryList.append(item);
    });
    if (services.length) setFeedback(quoteFeedback);
  };

  DOM.quoteForm?.addEventListener('change', updateQuoteSummary);
  DOM.quoteForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const services = getSelectedQuoteServices();
    if (!services.length) {
      setFeedback(quoteFeedback, 'Selecciona por lo menos un servicio.');
      DOM.quoteForm.querySelector('input[name="quoteServices"]')?.focus();
      return;
    }
    if (!DOM.quoteForm.reportValidity()) return;
    setFeedback(quoteFeedback);
    const data = new FormData(DOM.quoteForm);
    openWhatsApp([
      '¡Hola Doctor PC! Deseo solicitar una cotización:',
      `*Servicios:* ${services.join(', ')}`,
      `*Equipo o sistema:* ${data.get('quoteDevice')}`,
      `*Modalidad:* ${data.get('quoteLocation')}`,
      data.get('quoteNotes') ? `*Detalles:* ${data.get('quoteNotes')}` : ''
    ].filter(Boolean).join('\n'));
  });

  // Reserva de cita
  const appointmentDate = document.getElementById('appointmentDate');
  const appointmentFeedback = document.getElementById('appointmentFeedback');
  const guatemalaToday = () => {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Guatemala', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${values.year}-${values.month}-${values.day}`;
  };
  if (appointmentDate) appointmentDate.min = guatemalaToday();

  const validateAppointmentDate = () => {
    if (!appointmentDate?.value) return true;
    const [year, month, day] = appointmentDate.value.split('-').map(Number);
    const isSunday = new Date(year, month - 1, day, 12).getDay() === 0;
    appointmentDate.setCustomValidity(isSunday ? 'Selecciona una fecha de lunes a sábado.' : '');
    setFeedback(appointmentFeedback, isSunday ? 'Los domingos no hay atención. Selecciona una fecha de lunes a sábado.' : '');
    return !isSunday;
  };
  appointmentDate?.addEventListener('change', validateAppointmentDate);

  DOM.appointmentForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateAppointmentDate() || !DOM.appointmentForm.reportValidity()) return;
    const data = new FormData(DOM.appointmentForm);
    openWhatsApp([
      '¡Hola Doctor PC! Deseo solicitar una cita:',
      `*Nombre:* ${data.get('appointmentName')}`,
      `*Servicio:* ${data.get('appointmentService')}`,
      `*Fecha preferida:* ${data.get('appointmentDate')}`,
      `*Hora preferida:* ${data.get('appointmentTime')}`,
      data.get('appointmentNotes') ? `*Detalles:* ${data.get('appointmentNotes')}` : '',
      '_Comprendo que la cita queda pendiente de confirmación._'
    ].filter(Boolean).join('\n'));
  });

  // Seguimiento privado por código
  const trackingCode = document.getElementById('trackingCode');
  trackingCode?.addEventListener('input', () => {
    trackingCode.value = trackingCode.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  });
  DOM.trackingForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!DOM.trackingForm.reportValidity()) return;
    const code = trackingCode.value.trim();
    openWhatsApp(`¡Hola Doctor PC! Deseo consultar el estado de mi reparación.\n\n*Código de orden:* ${code}`);
  });

  // Mantiene una sola pregunta frecuente abierta para facilitar la lectura.
  document.querySelectorAll('.faq-item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      document.querySelectorAll('.faq-item[open]').forEach((openItem) => {
        if (openItem !== item) openItem.removeAttribute('open');
      });
    });
  });

  // =========================================================================
  // 7. INSTALACIÓN Y ACTUALIZACIÓN DE LA PWA
  // =========================================================================
  let deferredInstallPrompt = null;
  let waitingServiceWorker = null;
  let reloadingForUpdate = false;
  const installTriggers = [...document.querySelectorAll('.install-app-trigger')];
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  const markAppAsInstalled = () => {
    DOM.pwaInstallSection?.classList.add('is-installed');
    if (DOM.pwaInstallStatus) DOM.pwaInstallStatus.textContent = 'Doctor PC ya está instalada en este dispositivo.';
  };

  const setInstallInstructions = () => {
    if (!DOM.installInstructions) return;
    if (isIOS) {
      DOM.installInstructions.innerHTML = `
        <p>En iPhone o iPad, instala la aplicación desde Safari:</p>
        <ol>
          <li>Toca el botón <span class="ios-share-icon"><i class="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i></span> <strong>Compartir</strong>.</li>
          <li>Selecciona <strong>Agregar a pantalla de inicio</strong>.</li>
          <li>Activa <strong>Abrir como app web</strong> y toca <strong>Agregar</strong>.</li>
        </ol>`;
      return;
    }
    DOM.installInstructions.innerHTML = `
      <p>Tu navegador no mostró el aviso automático. Abre su menú principal y selecciona:</p>
      <ol>
        <li><strong>Instalar aplicación</strong>, <strong>Instalar Doctor PC</strong> o <strong>Agregar a pantalla de inicio</strong>.</li>
        <li>Confirma la instalación cuando el navegador lo solicite.</li>
      </ol>`;
  };

  const openInstallDialog = () => {
    if (!DOM.installDialog) return;
    setInstallInstructions();
    if (typeof DOM.installDialog.showModal === 'function') DOM.installDialog.showModal();
    else DOM.installDialog.setAttribute('open', '');
  };

  const closeInstallDialog = () => {
    if (!DOM.installDialog) return;
    if (typeof DOM.installDialog.close === 'function') DOM.installDialog.close();
    else DOM.installDialog.removeAttribute('open');
  };

  const requestAppInstallation = async () => {
    if (isStandalone()) {
      markAppAsInstalled();
      return;
    }
    if (!deferredInstallPrompt) {
      openInstallDialog();
      return;
    }

    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    if (outcome === 'accepted') {
      if (DOM.pwaInstallStatus) DOM.pwaInstallStatus.textContent = 'Finalizando la instalación…';
    } else if (DOM.pwaInstallStatus) {
      DOM.pwaInstallStatus.textContent = 'Puedes instalarla cuando quieras desde este botón.';
    }
  };

  installTriggers.forEach((button) => button.addEventListener('click', requestAppInstallation));
  document.querySelector('[data-close-install-dialog]')?.addEventListener('click', closeInstallDialog);
  DOM.installDialog?.addEventListener('click', (event) => {
    if (event.target === DOM.installDialog) closeInstallDialog();
  });

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (DOM.pwaInstallStatus) DOM.pwaInstallStatus.textContent = 'Lista para instalar en este dispositivo.';
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    markAppAsInstalled();
    closeInstallDialog();
  });

  if (isStandalone()) markAppAsInstalled();
  else if (isIOS && DOM.pwaInstallStatus) DOM.pwaInstallStatus.textContent = 'En iPhone se instala desde Safari en pocos pasos.';

  const showUpdateAvailable = (worker) => {
    waitingServiceWorker = worker;
    if (DOM.pwaUpdateToast) DOM.pwaUpdateToast.hidden = false;
  };

  DOM.pwaUpdateButton?.addEventListener('click', () => {
    waitingServiceWorker?.postMessage({ type: 'SKIP_WAITING' });
  });

  if ('serviceWorker' in navigator && /^https?:$/.test(window.location.protocol)) {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then((registration) => {
        if (registration.waiting && navigator.serviceWorker.controller) showUpdateAvailable(registration.waiting);

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          installingWorker?.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateAvailable(installingWorker);
            }
          });
        });
      })
      .catch(() => {
        if (DOM.pwaInstallStatus) DOM.pwaInstallStatus.textContent = 'La instalación estará disponible cuando el sitio se publique con HTTPS.';
      });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloadingForUpdate) return;
      reloadingForUpdate = true;
      window.location.reload();
    });
  } else if (DOM.pwaInstallStatus && window.location.protocol !== 'https:') {
    DOM.pwaInstallStatus.textContent = 'La instalación se habilitará al publicar el sitio con HTTPS.';
  }

  // =========================================================================
  // 8. CONTROLADORES DE SCROLL (SCROLLSPY, HEADER SHADOW, BACK-TO-TOP)
  // =========================================================================
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

  // =========================================================================
  // 9. SELECTOR DE TEMA (SISTEMA / CLARO / OSCURO)
  // =========================================================================
  const THEMES = {
    system: { label: 'Sistema', icon: 'fa-circle-half-stroke' },
    light: { label: 'Claro', icon: 'fa-sun' },
    dark: { label: 'Oscuro', icon: 'fa-moon' }
  };
  const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const getSavedTheme = () => {
    try {
      const saved = localStorage.getItem('doctorpc-theme');
      return THEMES[saved] ? saved : 'system';
    } catch (_) {
      return 'system';
    }
  };

  const setThemeMenuState = (isOpen) => {
    if (!DOM.themeMenu || !DOM.themeMenuButton || !DOM.themeSwitcher) return;
    DOM.themeMenu.hidden = !isOpen;
    DOM.themeMenuButton.setAttribute('aria-expanded', String(isOpen));
    DOM.themeSwitcher.classList.toggle('is-open', isOpen);
  };

  const applyTheme = (preference, persist = true) => {
    const safePreference = THEMES[preference] ? preference : 'system';
    const effectiveTheme = safePreference === 'system'
      ? (systemThemeQuery.matches ? 'dark' : 'light')
      : safePreference;

    document.documentElement.dataset.theme = effectiveTheme;
    document.documentElement.dataset.themePreference = safePreference;
    DOM.themeColor?.setAttribute('content', effectiveTheme === 'dark' ? '#161b22' : '#0d2238');

    const selectedTheme = THEMES[safePreference];
    const currentIcon = DOM.themeMenuButton?.querySelector('.theme-current-icon');
    const currentLabel = DOM.themeMenuButton?.querySelector('.theme-current-label');
    if (currentIcon) currentIcon.className = `fa-solid ${selectedTheme.icon} theme-current-icon`;
    if (currentLabel) currentLabel.textContent = selectedTheme.label;
    DOM.themeMenuButton?.setAttribute('aria-label', `Tema: ${selectedTheme.label}`);

    DOM.themeMenu?.querySelectorAll('.theme-option').forEach((option) => {
      option.setAttribute('aria-checked', String(option.dataset.theme === safePreference));
    });

    if (persist) {
      try {
        localStorage.setItem('doctorpc-theme', safePreference);
      } catch (_) {}
    }
  };

  const handleSystemThemeChange = () => {
    if (getSavedTheme() === 'system') applyTheme('system', false);
  };
  if (typeof systemThemeQuery.addEventListener === 'function') {
    systemThemeQuery.addEventListener('change', handleSystemThemeChange);
  } else {
    systemThemeQuery.addListener(handleSystemThemeChange);
  }

  DOM.themeSwitcher?.addEventListener('keydown', (event) => {
    const options = [...(DOM.themeMenu?.querySelectorAll('.theme-option') || [])];

    if (event.key === 'Escape') {
      setThemeMenuState(false);
      DOM.themeMenuButton?.focus();
      return;
    }

    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (DOM.themeMenu?.hidden) setThemeMenuState(true);

    const currentIndex = options.indexOf(document.activeElement);
    let nextIndex = 0;
    if (event.key === 'End') nextIndex = options.length - 1;
    if (event.key === 'ArrowDown' && currentIndex >= 0) nextIndex = (currentIndex + 1) % options.length;
    if (event.key === 'ArrowUp') nextIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
    options[nextIndex]?.focus();
  });

  applyTheme(getSavedTheme(), false);

  // =========================================================================
  // 10. HORARIO LOCAL DE HUEHUETENANGO
  // =========================================================================
  const updateBusinessStatus = () => {
    if (!DOM.businessStatus || !DOM.businessHoursText) return;

    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Guatemala',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    const minutes = Number(values.hour) * 60 + Number(values.minute);
    const isWorkday = values.weekday !== 'Sun';
    const isOpen = isWorkday && minutes >= 600 && minutes < 1200;

    DOM.businessStatus.textContent = isOpen ? 'Abierto ahora' : 'Cerrado ahora';
    DOM.businessStatus.classList.toggle('is-closed', !isOpen);

    if (values.weekday === 'Sun') {
      DOM.businessHoursText.textContent = 'Cerrado hoy · Abrimos el lunes a las 10:00 a. m.';
    } else if (minutes < 600) {
      DOM.businessHoursText.textContent = 'Abrimos hoy a las 10:00 a. m.';
    } else if (minutes >= 1200 && values.weekday === 'Sat') {
      DOM.businessHoursText.textContent = 'Abrimos el lunes a las 10:00 a. m.';
    } else if (minutes >= 1200) {
      DOM.businessHoursText.textContent = 'Abrimos mañana a las 10:00 a. m.';
    } else {
      DOM.businessHoursText.textContent = 'Hoy: 10:00 a. m. a 8:00 p. m.';
    }
  };

  updateBusinessStatus();
  window.setInterval(updateBusinessStatus, 60000);

  // Cierra controles flotantes con Escape y normaliza el menú al redimensionar.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (DOM.navMenu?.classList.contains('is-active')) {
      closeMobileMenu();
      DOM.menuToggle?.focus();
    }
    setThemeMenuState(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > CONFIG.mobileBreakpoint) closeMobileMenu();
    setThemeMenuState(false);
  }, { passive: true });
});
