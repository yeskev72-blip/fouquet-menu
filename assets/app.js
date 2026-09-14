/* Le Fouquet — menu digital + commande WhatsApp */
(function () {
  'use strict';

  var DATA = window.MENU_DATA;
  if (!DATA) return;

  var INFO = DATA.restaurant;
  var CURRENCY = INFO.currency || 'F';
  var STORAGE_KEY = 'fouquet.cart.v1';

  /* ------------------------------------------------------------------ *
   * Utilitaires
   * ------------------------------------------------------------------ */

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /** 15000 -> "15.000 F" (séparateur point, comme sur la carte papier). */
  function formatPrice(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ' + CURRENCY;
  }

  /** Retire les accents pour que « crepe » trouve « crêpe ». */
  function normalize(str) {
    return String(str).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* ------------------------------------------------------------------ *
   * Index du menu : une entrée plate par plat (et par déclinaison)
   * ------------------------------------------------------------------ */

  var CATALOG = [];   // toutes les lignes commandables, indexées par id
  var CATEGORIES = []; // { id, label, icon, note, sectionId, items: [...] }

  DATA.sections.forEach(function (section) {
    section.categories.forEach(function (category) {
      var entry = {
        id: section.id + '-' + category.id,
        label: category.label,
        icon: category.icon || '',
        note: category.note || '',
        sectionId: section.id,
        sectionLabel: section.label,
        sectionNote: section.note || '',
        items: []
      };

      category.items.forEach(function (item, itemIndex) {
        var variants;
        if (Array.isArray(item.prices)) {
          variants = item.prices.map(function (p, i) { return { label: p.label, price: p.price, index: i }; });
        } else {
          variants = [{ label: null, price: item.price, index: 0 }];
        }

        var record = {
          id: entry.id + '-' + itemIndex,
          name: item.name,
          desc: item.desc || '',
          categoryLabel: category.label,
          searchText: normalize(item.name + ' ' + (item.desc || '') + ' ' + category.label),
          variants: variants.map(function (v) {
            return {
              id: entry.id + '-' + itemIndex + '-' + v.index,
              label: v.label,
              price: v.price,
              itemName: item.name,
              categoryLabel: category.label
            };
          })
        };

        entry.items.push(record);
        record.variants.forEach(function (v) { CATALOG.push(v); });
      });

      CATEGORIES.push(entry);
    });
  });

  var CATALOG_BY_ID = CATALOG.reduce(function (acc, v) { acc[v.id] = v; return acc; }, {});

  /* ------------------------------------------------------------------ *
   * Panier
   * ------------------------------------------------------------------ */

  var cart = loadCart();

  function loadCart() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      var clean = {};
      Object.keys(parsed).forEach(function (id) {
        var qty = parseInt(parsed[id], 10);
        // On ignore les lignes d'une version antérieure du menu.
        if (CATALOG_BY_ID[id] && qty > 0) clean[id] = Math.min(qty, 99);
      });
      return clean;
    } catch (err) {
      return {};
    }
  }

  function saveCart() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (err) { /* mode privé */ }
  }

  function cartLines() {
    return Object.keys(cart).map(function (id) {
      var variant = CATALOG_BY_ID[id];
      return { id: id, qty: cart[id], variant: variant, total: variant.price * cart[id] };
    });
  }

  function cartCount() {
    return Object.keys(cart).reduce(function (sum, id) { return sum + cart[id]; }, 0);
  }

  function cartTotal() {
    return cartLines().reduce(function (sum, line) { return sum + line.total; }, 0);
  }

  function itemQty(record) {
    return record.variants.reduce(function (sum, v) { return sum + (cart[v.id] || 0); }, 0);
  }

  function setQty(variantId, qty) {
    if (qty > 0) cart[variantId] = Math.min(qty, 99);
    else delete cart[variantId];
    saveCart();
    renderCart();
    refreshItemStates();
  }

  function addToCart(variantId) {
    setQty(variantId, (cart[variantId] || 0) + 1);
    var variant = CATALOG_BY_ID[variantId];
    showToast(variant.itemName + (variant.label ? ' (' + variant.label + ')' : '') + ' ajouté');
  }

  /* ------------------------------------------------------------------ *
   * Rendu du menu
   * ------------------------------------------------------------------ */

  var menuRoot = $('#menuRoot');
  var emptyState = $('#emptyState');
  var chipsNav = $('#categoryChips');
  var tabsNav = $('#sectionTabs');

  var activeSection = 'all';
  var query = '';

  function buildMenu() {
    var fragment = document.createDocumentFragment();
    var lastSection = null;

    CATEGORIES.forEach(function (category) {
      if (category.sectionId !== lastSection) {
        lastSection = category.sectionId;
        var banner = el('div', 'section-banner');
        banner.dataset.section = category.sectionId;
        banner.appendChild(el('h2', null, category.sectionLabel));
        if (category.sectionNote) banner.appendChild(el('p', null, category.sectionNote));
        fragment.appendChild(banner);
      }

      var block = el('section', 'category');
      block.id = 'cat-' + category.id;
      block.dataset.section = category.sectionId;
      block.dataset.category = category.id;

      var head = el('div', 'category-head');
      if (category.icon) head.appendChild(el('span', 'category-icon', category.icon));
      head.appendChild(el('h2', null, category.label));
      head.appendChild(el('span', 'category-count', category.items.length + ' article' + (category.items.length > 1 ? 's' : '')));
      block.appendChild(head);

      if (category.note) block.appendChild(el('p', 'category-note', category.note));

      var list = el('ul', 'items');
      category.items.forEach(function (record) { list.appendChild(renderItem(record)); });
      block.appendChild(list);

      fragment.appendChild(block);
    });

    menuRoot.appendChild(fragment);
  }

  function renderItem(record) {
    var li = el('li', 'item');
    li.dataset.itemId = record.id;
    li.dataset.search = record.searchText;

    var main = el('div', 'item-main');
    main.appendChild(el('p', 'item-name', record.name));
    if (record.desc) main.appendChild(el('p', 'item-desc', record.desc));

    var single = record.variants.length === 1;

    if (single) {
      li.appendChild(main);
      var side = el('div', 'item-side');
      var variant = record.variants[0];
      if (variant.price == null) {
        side.appendChild(el('span', 'price-ask', 'Prix sur demande'));
      } else {
        side.appendChild(el('span', 'price', formatPrice(variant.price)));
        side.appendChild(makeAddButton(variant));
      }
      li.appendChild(side);
    } else {
      var variantList = el('div', 'variants');
      record.variants.forEach(function (variant) {
        var row = el('div', 'variant');
        row.appendChild(el('span', 'variant-label', variant.label));
        row.appendChild(el('span', 'price', formatPrice(variant.price)));
        row.appendChild(makeAddButton(variant));
        variantList.appendChild(row);
      });
      main.appendChild(variantList);
      li.appendChild(main);
    }

    return li;
  }

  function makeAddButton(variant) {
    var btn = el('button', 'add-btn', '+');
    btn.type = 'button';
    btn.dataset.add = variant.id;
    var name = variant.itemName + (variant.label ? ' — ' + variant.label : '');
    btn.setAttribute('aria-label', 'Ajouter ' + name + ' à la commande');
    btn.title = 'Ajouter à la commande';
    return btn;
  }

  /** Souligne les plats déjà présents dans la commande. */
  function refreshItemStates() {
    CATEGORIES.forEach(function (category) {
      category.items.forEach(function (record) {
        var node = menuRoot.querySelector('[data-item-id="' + record.id + '"]');
        if (!node) return;
        var qty = itemQty(record);
        node.classList.toggle('is-in-cart', qty > 0);

        var badge = node.querySelector('.qty-badge');
        if (qty > 0) {
          if (!badge) {
            badge = el('span', 'qty-badge');
            var host = node.querySelector('.item-side') || node.querySelector('.item-main');
            host.insertBefore(badge, host.firstChild);
          }
          badge.textContent = '×' + qty;
        } else if (badge) {
          badge.remove();
        }
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Navigation : onglets de section + puces de catégorie
   * ------------------------------------------------------------------ */

  function buildNav() {
    var tabs = [{ id: 'all', label: 'Tout' }].concat(
      DATA.sections.map(function (s) { return { id: s.id, label: s.short || s.label }; })
    );

    tabs.forEach(function (tab) {
      var btn = el('button', 'tab', tab.label);
      btn.type = 'button';
      btn.dataset.sectionTab = tab.id;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(tab.id === activeSection));
      btn.addEventListener('click', function () { selectSection(tab.id); });
      tabsNav.appendChild(btn);
    });

    buildChips();
  }

  function buildChips() {
    chipsNav.textContent = '';
    CATEGORIES.filter(function (c) { return activeSection === 'all' || c.sectionId === activeSection; })
      .forEach(function (category) {
        var chip = el('button', 'chip', (category.icon ? category.icon + ' ' : '') + category.label);
        chip.type = 'button';
        chip.dataset.jump = 'cat-' + category.id;
        chip.addEventListener('click', function () {
          var target = document.getElementById('cat-' + category.id);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        chipsNav.appendChild(chip);
      });
  }

  function selectSection(sectionId) {
    activeSection = sectionId;
    $$('[data-section-tab]', tabsNav).forEach(function (btn) {
      btn.setAttribute('aria-selected', String(btn.dataset.sectionTab === sectionId));
    });
    buildChips();
    applyFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ------------------------------------------------------------------ *
   * Recherche / filtrage
   * ------------------------------------------------------------------ */

  function applyFilters() {
    var needle = normalize(query.trim());
    var terms = needle ? needle.split(/\s+/) : [];
    var visibleTotal = 0;

    $$('.category', menuRoot).forEach(function (block) {
      var inSection = activeSection === 'all' || block.dataset.section === activeSection;
      var visibleHere = 0;

      $$('.item', block).forEach(function (item) {
        var haystack = item.dataset.search;
        var matches = inSection && terms.every(function (t) { return haystack.indexOf(t) !== -1; });
        item.hidden = !matches;
        if (matches) visibleHere++;
      });

      block.hidden = visibleHere === 0;
      visibleTotal += visibleHere;
    });

    // Les bandeaux de partie ne s'affichent que si la partie a des résultats.
    $$('.section-banner', menuRoot).forEach(function (banner) {
      var hasVisible = $$('.category[data-section="' + banner.dataset.section + '"]', menuRoot)
        .some(function (block) { return !block.hidden; });
      banner.hidden = !hasVisible;
    });

    emptyState.hidden = visibleTotal > 0;
  }

  /* ------------------------------------------------------------------ *
   * Panier : rendu et interactions
   * ------------------------------------------------------------------ */

  var cartPanel = $('#cartPanel');
  var overlay = $('#overlay');
  var cartFab = $('#cartFab');
  var cartLinesEl = $('#cartLines');
  var cartEmptyEl = $('#cartEmpty');
  var lastFocused = null;

  function renderCart() {
    var lines = cartLines();
    var count = cartCount();
    var total = cartTotal();

    cartLinesEl.textContent = '';
    lines.forEach(function (line) {
      var li = el('li', 'cart-line');

      var main = el('div', 'cart-line-main');
      main.appendChild(el('p', 'cart-line-name', line.variant.itemName));
      var meta = [line.variant.label, formatPrice(line.variant.price) + ' l’unité'].filter(Boolean).join(' · ');
      main.appendChild(el('p', 'cart-line-meta', meta));
      li.appendChild(main);

      var stepper = el('div', 'stepper');
      var minus = el('button', null, '−');
      minus.type = 'button';
      minus.setAttribute('aria-label', 'Retirer un ' + line.variant.itemName);
      minus.addEventListener('click', function () { setQty(line.id, line.qty - 1); });

      var output = el('output', null, String(line.qty));

      var plus = el('button', null, '+');
      plus.type = 'button';
      plus.setAttribute('aria-label', 'Ajouter un ' + line.variant.itemName);
      plus.addEventListener('click', function () { setQty(line.id, line.qty + 1); });

      stepper.appendChild(minus);
      stepper.appendChild(output);
      stepper.appendChild(plus);
      li.appendChild(stepper);

      li.appendChild(el('span', 'cart-line-total', formatPrice(line.total)));
      cartLinesEl.appendChild(li);
    });

    cartEmptyEl.hidden = lines.length > 0;
    $('#orderForm').hidden = lines.length === 0;
    $('.cart-total-row').hidden = lines.length === 0;
    $('#cartTotal').textContent = formatPrice(total);

    cartFab.hidden = count === 0;
    $('#cartFabCount').textContent = String(count);
    $('#cartFabTotal').textContent = formatPrice(total);

    if (count === 0 && !cartPanel.hidden) closeCart();
  }

  function openCart() {
    lastFocused = document.activeElement;
    cartPanel.hidden = false;
    overlay.hidden = false;
    cartFab.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    $('#cartClose').focus();
  }

  function closeCart() {
    cartPanel.hidden = true;
    overlay.hidden = true;
    cartFab.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  }

  /* ------------------------------------------------------------------ *
   * Message WhatsApp
   * ------------------------------------------------------------------ */

  var MODE_LABELS = {
    surplace: 'Sur place',
    emporter: 'À emporter',
    livraison: 'Livraison'
  };

  function readForm() {
    var mode = ($('input[name="mode"]:checked') || {}).value || 'surplace';
    return {
      mode: mode,
      name: $('#customerName').value.trim(),
      table: $('#tableNumber').value.trim(),
      address: $('#address').value.trim(),
      time: $('#wantedTime').value.trim(),
      note: $('#orderNote').value.trim()
    };
  }

  /** Construit le récapitulatif envoyé au restaurant. */
  function buildMessage(form) {
    var lines = [];
    lines.push('*NOUVELLE COMMANDE — ' + INFO.name + '*');
    lines.push('');

    if (form.name) lines.push('👤 Client : ' + form.name);

    var where = MODE_LABELS[form.mode];
    if (form.mode === 'surplace' && form.table) where += ' — Table ' + form.table;
    if (form.mode === 'livraison' && form.address) where += ' — ' + form.address;
    lines.push('📍 ' + where);

    if (form.time) lines.push('🕐 Pour : ' + form.time);

    lines.push('');
    lines.push('*Commande :*');
    cartLines().forEach(function (line) {
      var name = line.variant.itemName + (line.variant.label ? ' (' + line.variant.label + ')' : '');
      lines.push('• ' + line.qty + ' × ' + name + ' — ' + formatPrice(line.total));
    });

    lines.push('');
    lines.push('*TOTAL : ' + formatPrice(cartTotal()) + '*');

    if (form.note) {
      lines.push('');
      lines.push('📝 Note : ' + form.note);
    }

    lines.push('');
    lines.push('_Commande envoyée depuis le menu en ligne._');

    return lines.join('\n');
  }

  function whatsappUrl(message) {
    return 'https://wa.me/' + INFO.whatsapp + '?text=' + encodeURIComponent(message);
  }

  function validate(form) {
    if (cartCount() === 0) return 'Ajoutez au moins un article avant d’envoyer la commande.';
    if (form.mode === 'livraison' && !form.address) return 'Indiquez une adresse de livraison.';
    return null;
  }

  /* ------------------------------------------------------------------ *
   * Toast
   * ------------------------------------------------------------------ */

  var toastEl = $('#toast');
  var toastTimer = null;

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toastEl.hidden = true; }, 2200);
  }

  /* ------------------------------------------------------------------ *
   * Câblage
   * ------------------------------------------------------------------ */

  function hydrateRestaurantInfo() {
    $$('[data-restaurant-name]').forEach(function (n) { n.textContent = INFO.name; });
    $$('[data-restaurant-tagline]').forEach(function (n) { n.textContent = INFO.tagline; });
    $$('[data-restaurant-specialites]').forEach(function (n) { n.textContent = INFO.specialites; });

    document.title = INFO.name + ' — Menu';

    var tel = (INFO.phones[0] || '').replace(/\s/g, '');
    $('#callLink').href = 'tel:' + tel;
    $('#waContactLink').href = whatsappUrl('Bonjour ' + INFO.name + ', j’aimerais avoir un renseignement.');

    var footer = $('#footerPhones');
    INFO.phones.forEach(function (phone, i) {
      if (i > 0) footer.appendChild(document.createTextNode(' · '));
      var a = el('a', null, phone);
      a.href = 'tel:' + phone.replace(/\s/g, '');
      footer.appendChild(a);
    });
  }

  function wireEvents() {
    // Ajout au panier (délégation : un seul écouteur pour tout le menu).
    menuRoot.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-add]');
      if (btn) addToCart(btn.dataset.add);
    });

    // Recherche
    var searchInput = $('#search');
    var searchClear = $('#searchClear');
    searchInput.addEventListener('input', function () {
      query = searchInput.value;
      searchClear.hidden = query.length === 0;
      applyFilters();
    });
    searchClear.addEventListener('click', function () {
      searchInput.value = '';
      query = '';
      searchClear.hidden = true;
      applyFilters();
      searchInput.focus();
    });

    // Panier
    cartFab.addEventListener('click', openCart);
    $('#cartClose').addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !cartPanel.hidden) closeCart();
    });

    // Champs conditionnels selon le mode de commande
    $$('input[name="mode"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        var mode = radio.value;
        $('#tableField').hidden = mode !== 'surplace';
        $('#addressField').hidden = mode !== 'livraison';
      });
    });

    $('#clearCart').addEventListener('click', function () {
      if (!window.confirm('Vider toute la commande ?')) return;
      cart = {};
      saveCart();
      renderCart();
      refreshItemStates();
      showToast('Commande vidée');
    });

    // Envoi WhatsApp
    $('#orderForm').addEventListener('submit', function (event) {
      event.preventDefault();
      var form = readForm();
      var error = validate(form);
      var errorEl = $('#formError');

      if (error) {
        errorEl.textContent = error;
        errorEl.hidden = false;
        return;
      }
      errorEl.hidden = true;
      window.open(whatsappUrl(buildMessage(form)), '_blank', 'noopener');
    });

    // Copie du récapitulatif (utile si WhatsApp n'est pas installé)
    $('#copyOrder').addEventListener('click', function () {
      var message = buildMessage(readForm());
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(message)
          .then(function () { showToast('Récapitulatif copié'); })
          .catch(function () { fallbackCopy(message); });
      } else {
        fallbackCopy(message);
      }
    });
  }

  function fallbackCopy(text) {
    var area = el('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      showToast('Récapitulatif copié');
    } catch (err) {
      showToast('Copie impossible sur cet appareil');
    }
    area.remove();
  }

  /* ------------------------------------------------------------------ *
   * Démarrage
   * ------------------------------------------------------------------ */

  hydrateRestaurantInfo();
  buildMenu();
  buildNav();
  applyFilters();
  wireEvents();
  renderCart();
  refreshItemStates();

  // Exposé pour d'éventuels tests manuels dans la console.
  window.FouquetMenu = { buildMessage: buildMessage, readForm: readForm, catalog: CATALOG };
})();
