/**
 * EcomFlow Store - Customer Storefront Application (Single Page Application Router & Interactive Engine)
 * Tích hợp toàn diện 5 phân hệ: Trang chủ, Chi tiết sản phẩm (PDP), Giỏ hàng, Thanh toán & Tra cứu đơn hàng
 */

document.addEventListener("DOMContentLoaded", function () {
  // Trạng thái ứng dụng SPA & Bộ lọc toàn cục
  const AppRouter = {
    currentView: "home", // "home", "product", "cart", "checkout", "orders"
    currentProductId: "PR001",
    currentOrderQuery: ""
  };

  let isHomeInitialized = false;
  let catalogCategoryFilter = "ALL";
  let catalogBrandFilter = "ALL";
  let catalogPriceFilter = "ALL";
  let catalogSortFilter = "FEATURED";
  let currentStatusFilter = "ALL";
  let searchKeyword = "";
  let compareList = [];

  // Khởi tạo các thành phần chung
  initHeader();
  initSearchAutocomplete();
  initLocationModal();
  initCompareFloatingBar();
  initResetStoreBtn();

  // Khởi tạo router theo URL hash
  initHashRouter();

  // ==========================================================================
  // 1. SPA ROUTER & VIEW SWITCHER
  // ==========================================================================
  function initHashRouter() {
    function handleRoute() {
      const hash = window.location.hash || "#home";
      if (hash.startsWith("#product")) {
        const params = new URLSearchParams(hash.split("?")[1] || "");
        const id = params.get("id") || "PR001";
        navigateTo("product", { id });
      } else if (hash === "#cart") {
        navigateTo("cart");
      } else if (hash === "#checkout") {
        navigateTo("checkout");
      } else if (hash.startsWith("#orders")) {
        const params = new URLSearchParams(hash.split("?")[1] || "");
        const id = params.get("id") || "";
        navigateTo("orders", { id });
      } else {
        navigateTo("home");
      }
    }

    window.addEventListener("hashchange", handleRoute);
    handleRoute();
  }

  function navigateTo(viewName, params = {}) {
    AppRouter.currentView = viewName;

    // Ẩn tất cả các view
    document.querySelectorAll(".spa-view").forEach(v => v.classList.add("d-none"));

    // Breadcrumb toàn cục
    const breadcrumb = document.getElementById("globalBreadcrumb");
    const bcSec = document.getElementById("breadcrumbSectionName");
    const bcSep2 = document.getElementById("breadcrumbSeparator2");
    const bcItem = document.getElementById("breadcrumbItemName");

    // Header active state buttons
    const cartBtn = document.getElementById("headerCartBtn");
    const trackBtn = document.getElementById("headerTrackingBtn");
    if (cartBtn) cartBtn.classList.remove("active");
    if (trackBtn) trackBtn.classList.remove("active");

    if (viewName === "home") {
      const v = document.getElementById("viewHome");
      if (v) v.classList.remove("d-none");
      if (breadcrumb) breadcrumb.classList.add("d-none");
      initHomeView();
    } else if (viewName === "product") {
      const v = document.getElementById("viewProductDetail");
      if (v) v.classList.remove("d-none");
      if (breadcrumb) {
        breadcrumb.classList.remove("d-none");
        bcSec.textContent = "Thiết bị công nghệ";
        bcSec.onclick = () => { window.location.hash = "#home"; };
        bcSep2.classList.remove("d-none");
        bcItem.classList.remove("d-none");
      }
      AppRouter.currentProductId = params.id || "PR001";
      initProductDetailView(AppRouter.currentProductId);
    } else if (viewName === "cart") {
      const v = document.getElementById("viewCart");
      if (v) v.classList.remove("d-none");
      if (cartBtn) cartBtn.classList.add("active");
      if (breadcrumb) {
        breadcrumb.classList.remove("d-none");
        bcSec.textContent = "Giỏ hàng của bạn";
        bcSec.onclick = null;
        bcSep2.classList.add("d-none");
        bcItem.classList.add("d-none");
      }
      initCartView();
    } else if (viewName === "checkout") {
      const v = document.getElementById("viewCheckout");
      if (v) v.classList.remove("d-none");
      if (breadcrumb) {
        breadcrumb.classList.remove("d-none");
        bcSec.textContent = "Giỏ hàng";
        bcSec.onclick = () => { window.location.hash = "#cart"; };
        bcSep2.classList.remove("d-none");
        bcItem.classList.remove("d-none");
        bcItem.textContent = "Thanh toán đơn hàng";
      }
      initCheckoutView();
    } else if (viewName === "orders") {
      const v = document.getElementById("viewOrderTracking");
      if (v) v.classList.remove("d-none");
      if (trackBtn) trackBtn.classList.add("active");
      if (breadcrumb) {
        breadcrumb.classList.remove("d-none");
        bcSec.textContent = "Tra cứu đơn hàng";
        bcSec.onclick = null;
        bcSep2.classList.add("d-none");
        bcItem.classList.add("d-none");
      }
      initOrderTrackingView(params.id || "");
    }

    updateCartBadge();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ==========================================================================
  // 2. HEADER & LOCATION SHOWROOM MODAL
  // ==========================================================================
  function initHeader() {
    const customer = EcomStore.getCurrentCustomer();
    const rankEl = document.getElementById("headerCustomerRank");
    if (rankEl && customer) {
      rankEl.innerHTML = `<i class="bi bi-gem"></i> Smember <span class="rank-tag">${customer.customer_rank}</span>`;
    }

    const cityLabel = document.getElementById("selectedCityLabel");
    if (cityLabel) {
      const selectedCity = EcomStore.getSelectedCity();
      cityLabel.textContent = selectedCity === "ALL" ? "Toàn quốc" : selectedCity;
    }
  }

  function updateCartBadge() {
    const cart = EcomStore.getCart();
    const count = cart.total_items || 0;
    document.querySelectorAll(".cart-badge-count").forEach(b => {
      b.textContent = count;
    });
  }

  function initResetStoreBtn() {
    const btn = document.getElementById("resetStoreBtn");
    if (btn) {
      btn.addEventListener("click", function () {
        if (confirm("Khôi phục toàn bộ dữ liệu mẫu ban đầu của EcomFlow Store?")) {
          EcomStore.resetStore();
          showToast("Đã khôi phục dữ liệu gốc thành công!", "success");
          setTimeout(() => {
            window.location.hash = "#home";
            window.location.reload();
          }, 500);
        }
      });
    }
  }

  function initSearchAutocomplete() {
    const input = document.getElementById("searchInput");
    const dropdown = document.getElementById("searchDropdown");
    const btn = document.getElementById("searchBtn");
    if (!input || !dropdown) return;

    input.addEventListener("input", function () {
      const q = this.value.trim().toLowerCase();
      if (q.length < 2) {
        dropdown.classList.remove("active");
        dropdown.innerHTML = "";
        return;
      }

      const products = EcomStore.getProducts();
      const matched = products.filter(p =>
        p.product_name.toLowerCase().includes(q) ||
        (p.product_version && p.product_version.toLowerCase().includes(q))
      ).slice(0, 6);

      if (matched.length === 0) {
        dropdown.innerHTML = `<div class="p-3 text-muted text-center" style="font-size:0.85rem">Không tìm thấy sản phẩm phù hợp với "${q}"</div>`;
        dropdown.classList.add("active");
        return;
      }

      dropdown.innerHTML = matched.map(p => `
        <div class="search-item" data-id="${p.product_id}">
          <img src="${p.product_photos_link}" alt="${p.product_name}">
          <div>
            <div class="search-item-title">${p.product_name} - <span class="text-muted" style="font-size:0.8rem">${p.product_version || ""}</span></div>
            <div>
              <span class="search-item-price">${formatVND(p.sale_price || p.product_listprice)}</span>
              ${p.sale_price ? `<span class="search-item-oldprice">${formatVND(p.product_listprice)}</span>` : ""}
            </div>
          </div>
        </div>
      `).join("");

      dropdown.classList.add("active");

      dropdown.querySelectorAll(".search-item").forEach(item => {
        item.addEventListener("click", function () {
          const id = this.getAttribute("data-id");
          dropdown.classList.remove("active");
          input.value = "";
          window.location.hash = `#product?id=${encodeURIComponent(id)}`;
        });
      });
    });

    if (btn) {
      btn.addEventListener("click", function () {
        if (input.value.trim()) {
          window.location.hash = "#catalogSection";
        }
      });
    }

    document.addEventListener("click", function (e) {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove("active");
      }
    });
  }

  function initLocationModal() {
    const locBtn = document.getElementById("headerLocationBtn");
    const locModalEl = document.getElementById("locationModal");
    if (!locBtn || !locModalEl) return;

    let locModal = null;
    if (window.bootstrap && bootstrap.Modal) {
      locModal = new bootstrap.Modal(locModalEl);
      locBtn.addEventListener("click", function () {
        renderModalShowrooms(EcomStore.getSelectedCity());
        locModal.show();
      });
    }

    const cityTabs = document.querySelectorAll("#modalCityTabs .city-tab-btn");
    cityTabs.forEach(tab => {
      tab.addEventListener("click", function () {
        cityTabs.forEach(t => t.classList.remove("active"));
        this.classList.add("active");
        const city = this.getAttribute("data-city");
        renderModalShowrooms(city);
      });
    });

    function renderModalShowrooms(city) {
      const container = document.getElementById("modalShowroomList");
      if (!container) return;

      const showrooms = EcomStore.getSubsidiariesByCity(city);
      const currentSelectedCity = EcomStore.getSelectedCity();

      if (showrooms.length === 0) {
        container.innerHTML = `<div class="text-center p-4 text-muted">Không có chi nhánh phù hợp</div>`;
        return;
      }

      container.innerHTML = showrooms.map(s => {
        const isCurrent = s.sub_city === currentSelectedCity;
        return `
          <div class="showroom-card-item ${isCurrent ? "active-showroom" : ""}">
            <div>
              <div class="showroom-info-name">
                <i class="bi bi-shop text-danger"></i> ${s.sub_name}
                ${isCurrent ? '<span class="badge bg-danger ms-2" style="font-size:0.7rem">Đang chọn</span>' : ''}
              </div>
              <div class="showroom-info-address">
                <i class="bi bi-geo-alt"></i> ${s.sub_address}, ${s.sub_district}, ${s.sub_city}
              </div>
              <div class="showroom-info-hours">
                <i class="bi bi-clock"></i> Mở cửa: 8:00 - 22:00 tất cả các ngày • Hotline: 1800.2097
              </div>
            </div>
            <div>
              <button class="btn btn-outline-danger btn-sm fw-bold btn-select-showroom" data-city="${s.sub_city}" data-subid="${s.sub_id}" data-name="${s.sub_name}">
                ${isCurrent ? 'Đã chọn' : 'Chọn khu vực này'}
              </button>
            </div>
          </div>
        `;
      }).join("");

      container.querySelectorAll(".btn-select-showroom").forEach(btn => {
        btn.addEventListener("click", function () {
          const c = this.getAttribute("data-city");
          const name = this.getAttribute("data-name");
          EcomStore.setSelectedCity(c);

          const cityLabel = document.getElementById("selectedCityLabel");
          if (cityLabel) {
            cityLabel.textContent = c === "ALL" ? "Toàn quốc" : c;
          }

          showToast(`Đã chuyển khu vực mua sắm sang ${c} (${name})`, "success");
          if (locModal) locModal.hide();

          const pdpCitySelect = document.getElementById("pdpStockCitySelect");
          if (pdpCitySelect) {
            pdpCitySelect.value = c;
            pdpCitySelect.dispatchEvent(new Event("change"));
          }
        });
      });
    }
  }

  // ==========================================================================
  // 3. VIEW 1: TRANG CHỦ (HOME VIEW)
  // ==========================================================================
  function initHomeView() {
    if (!isHomeInitialized) {
      initCountdownTimer();
      renderHeroCategoryMenu();
      setupCatalogFilters();
      isHomeInitialized = true;
    }
    renderHotSaleSection();
    renderCatalogProducts();
  }

  function initCountdownTimer() {
    function updateTimer() {
      const now = new Date();
      const target = new Date();
      target.setHours(23, 59, 59, 999);
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return;

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const hEl = document.getElementById("timerHours");
      const mEl = document.getElementById("timerMinutes");
      const sEl = document.getElementById("timerSeconds");
      if (hEl) hEl.textContent = hours.toString().padStart(2, "0");
      if (mEl) mEl.textContent = minutes.toString().padStart(2, "0");
      if (sEl) sEl.textContent = seconds.toString().padStart(2, "0");
    }
    updateTimer();
    setInterval(updateTimer, 1000);
  }

  function renderHeroCategoryMenu() {
    const sidebar = document.getElementById("heroCategorySidebar");
    if (!sidebar) return;

    const categories = EcomStore.getCategories();
    sidebar.innerHTML = categories.map(cat => {
      const catId = cat.category_id || cat.cate_id;
      const catName = cat.category_name || cat.cate_name;
      const icon = cat.icon || "bi-box";
      const tag = cat.tag || "Hot";

      return `
        <div class="category-menu-item" data-cat="${catId}">
          <i class="bi ${icon}"></i>
          <span>${catName}</span>
          <span class="category-badge-tag">${tag}</span>
        </div>
      `;
    }).join("");

    sidebar.querySelectorAll(".category-menu-item").forEach(item => {
      item.addEventListener("click", function () {
        const catId = this.getAttribute("data-cat");
        sidebar.querySelectorAll(".category-menu-item").forEach(i => i.classList.remove("active"));
        this.classList.add("active");
        catalogCategoryFilter = catId;
        renderCatalogProducts();
        const catalogEl = document.getElementById("catalogSection");
        if (catalogEl) catalogEl.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  // Render Product Card (CellPhoneS Style)
  function createProductCardHTML(p) {
    const discount = (p.sale_price && p.sale_price < p.product_listprice)
      ? Math.round((1 - p.sale_price / p.product_listprice) * 100)
      : 0;
    const score = EcomStore.getProductScore(p.product_id);
    const rating = score ? score.rating_average : (p.product_rating || 5);
    const smemberPrice = Math.round((p.sale_price || p.product_listprice) * 0.985);
    const promoNote = p.hot_deal_label
      ? p.hot_deal_label
      : "Trả góp 0% • Trợ giá thu cũ 5 triệu";

    return `
      <div class="product-card" data-id="${p.product_id}">
        <!-- Badges Top -->
        <div class="product-badges-top">
          ${discount > 0 ? `<span class="product-badge-discount">Giảm ${discount}%</span>` : `<span></span>`}
          <span class="product-badge-installment">Trả góp 0%</span>
        </div>

        <!-- Product Image -->
        <div class="product-thumb-wrapper">
          <img class="product-thumb" src="${p.product_photos_link}" alt="${p.product_name}" loading="lazy">
        </div>

        <!-- Product Info -->
        <div class="product-info">
          <h3 class="product-title" title="${p.product_name} - ${p.product_version || ''}">${p.product_name}</h3>
          
          <div class="product-price-row">
            <span class="product-sale-price">${formatVND(p.sale_price || p.product_listprice)}</span>
            ${p.sale_price && p.sale_price < p.product_listprice ? `<span class="product-list-price">${formatVND(p.product_listprice)}</span>` : ""}
          </div>

          <div class="product-smember-pill">
            <span>Giá Smember: <strong>${formatVND(smemberPrice)}</strong></span>
          </div>

          <div class="product-promo-box" title="${promoNote}">
            ${promoNote}
          </div>

          <div class="product-card-footer">
            <span class="badge-delivery-fast" title="Giao hàng siêu tốc 2 Giờ">
              <i class="bi bi-truck"></i> 2 Giờ
            </span>
            <div class="product-rating-box">
              <i class="bi bi-star-fill text-warning"></i>
              <span>${rating}</span>
            </div>
            <button class="btn-card-wishlist" title="Thêm vào yêu thích" onclick="event.stopPropagation(); this.querySelector('i').classList.toggle('bi-heart'); this.querySelector('i').classList.toggle('bi-heart-fill'); this.querySelector('i').classList.toggle('text-danger');">
              <i class="bi bi-heart"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderHotSaleSection() {
    const container = document.getElementById("hotsaleProductGrid");
    if (!container) return;

    const products = EcomStore.getProducts();
    const hotsale = products.filter(p => p.sale_price && p.sale_price < p.product_listprice).slice(0, 4);

    container.innerHTML = hotsale.map(p => createProductCardHTML(p)).join("");
    bindCardClickNavigation(container);
  }

  function setupCatalogFilters() {
    document.querySelectorAll(".brand-pill").forEach(btn => {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".brand-pill").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        catalogBrandFilter = this.getAttribute("data-brand");
        renderCatalogProducts();
      });
    });

    document.querySelectorAll(".filter-price-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".filter-price-btn").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        catalogPriceFilter = this.getAttribute("data-price");
        renderCatalogProducts();
      });
    });

    const sortSelect = document.getElementById("catalogSortSelect");
    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        catalogSortFilter = this.value;
        renderCatalogProducts();
      });
    }
  }

  function renderCatalogProducts() {
    const container = document.getElementById("catalogProductGrid");
    const countEl = document.getElementById("catalogProductCount");
    if (!container) return;

    let list = EcomStore.getProducts();

    if (catalogCategoryFilter !== "ALL") {
      list = list.filter(p => (p.category_id || p.cate_id) === catalogCategoryFilter);
    }
    if (catalogBrandFilter !== "ALL") {
      list = list.filter(p => p.brand_id === catalogBrandFilter);
    }
    if (catalogPriceFilter !== "ALL") {
      list = list.filter(p => {
        const price = p.sale_price || p.product_listprice;
        if (catalogPriceFilter === "UNDER_5M") return price < 5000000;
        if (catalogPriceFilter === "5M_10M") return price >= 5000000 && price <= 10000000;
        if (catalogPriceFilter === "10M_20M") return price > 10000000 && price <= 20000000;
        if (catalogPriceFilter === "OVER_20M") return price > 20000000;
        return true;
      });
    }

    if (catalogSortFilter === "PRICE_ASC") {
      list.sort((a, b) => (a.sale_price || a.product_listprice) - (b.sale_price || b.product_listprice));
    } else if (catalogSortFilter === "PRICE_DESC") {
      list.sort((a, b) => (b.sale_price || b.product_listprice) - (a.sale_price || a.product_listprice));
    } else if (catalogSortFilter === "RATING_DESC") {
      list.sort((a, b) => {
        const sA = EcomStore.getProductScore(a.product_id);
        const sB = EcomStore.getProductScore(b.product_id);
        return (sB ? sB.rating_average : 0) - (sA ? sA.rating_average : 0);
      });
    }

    if (countEl) countEl.textContent = `(${list.length} sản phẩm)`;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-inbox text-muted" style="font-size:3rem"></i>
          <p class="text-muted mt-2">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(p => createProductCardHTML(p)).join("");
    bindCardClickNavigation(container);
  }

  function bindCardClickNavigation(parent) {
    parent.querySelectorAll(".product-card").forEach(card => {
      card.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        window.location.hash = `#product?id=${encodeURIComponent(id)}`;
      });
    });
  }

  // ==========================================================================
  // 4. VIEW 2: CHI TIẾT SẢN PHẨM (PRODUCT DETAIL PDP)
  // ==========================================================================
  function initProductDetailView(productId) {
    const product = EcomStore.getProductById(productId) || EcomStore.getProducts()[0];
    if (!product) return;

    const score = EcomStore.getProductScore(product.product_id);
    const category = EcomStore.getCategories().find(c => (c.category_id || c.cate_id) === (product.category_id || product.cate_id));
    const brand = EcomStore.getBrands().find(b => b.brand_id === product.brand_id);

    // Breadcrumb text
    const bcItem = document.getElementById("breadcrumbItemName");
    if (bcItem) bcItem.textContent = product.product_name;

    // Badges & Title
    const brandBadge = document.getElementById("pdpBrandBadge");
    const catBadge = document.getElementById("pdpCategoryBadge");
    const pIdEl = document.getElementById("pdpProductId");
    const nameEl = document.getElementById("pdpName");
    if (brandBadge && brand) brandBadge.textContent = brand.brand_name;
    if (catBadge && category) catBadge.textContent = category.category_name || category.cate_name;
    if (pIdEl) pIdEl.textContent = product.product_id;
    if (nameEl) nameEl.textContent = `${product.product_name} - Chính Hãng`;

    // Main Image
    const imgEl = document.getElementById("pdpMainImage");
    if (imgEl) {
      imgEl.src = product.product_photos_link;
      imgEl.alt = product.product_name;
    }

    // Rating
    const ratingEl = document.getElementById("pdpRatingScore");
    const reviewCountEl = document.getElementById("pdpReviewCount");
    if (ratingEl && score) ratingEl.textContent = score.rating_average;
    if (reviewCountEl && score) reviewCountEl.textContent = score.review_count;

    // Price
    const salePrice = product.sale_price || product.product_listprice;
    const listPrice = product.product_listprice;
    const discountPercent = Math.round((1 - salePrice / listPrice) * 100);

    const priceSaleEl = document.getElementById("pdpPriceSale");
    const priceListEl = document.getElementById("pdpPriceList");
    const badgeDiscountEl = document.getElementById("pdpBadgeDiscount");
    const saveAmountEl = document.getElementById("pdpSaveAmount");
    const smemberTextEl = document.getElementById("pdpSmemberDiscountText");

    if (priceSaleEl) priceSaleEl.textContent = formatVND(salePrice);
    if (priceListEl) {
      if (product.sale_price && product.sale_price < product.product_listprice) {
        priceListEl.textContent = formatVND(listPrice);
        priceListEl.style.display = "inline";
      } else {
        priceListEl.style.display = "none";
      }
    }
    if (badgeDiscountEl) {
      badgeDiscountEl.textContent = discountPercent > 0 ? `-${discountPercent}%` : "Chính Hãng";
    }
    if (saveAmountEl) {
      const saved = listPrice - salePrice;
      saveAmountEl.textContent = saved > 0 ? `Tiết kiệm ${formatVND(saved)}` : "Giá tốt nhất";
    }
    if (smemberTextEl) {
      const smemberSave = Math.round(salePrice * 0.015);
      smemberTextEl.textContent = `${formatVND(smemberSave)}`;
    }

    // Description
    const descEl = document.getElementById("pdpDesc");
    if (descEl) descEl.textContent = product.product_description;

    // Logistics specs
    const logisticsTable = document.getElementById("pdpLogisticsTable");
    if (logisticsTable) {
      logisticsTable.innerHTML = `
        <tr><td class="text-muted" style="width:40%">Trọng lượng máy:</td><td class="fw-bold">${product.product_weight_g} g</td></tr>
        <tr><td class="text-muted">Kích thước đóng gói:</td><td class="fw-bold">${product.product_length_cm} x ${product.product_width_cm} x ${product.product_height_cm} cm</td></tr>
        <tr><td class="text-muted">Xuất xứ:</td><td class="fw-bold">${brand ? brand.brand_name : "Quốc tế"}</td></tr>
        <tr><td class="text-muted">Bảo hành:</td><td class="fw-bold text-success">12 tháng chính hãng (1 đổi 1 trong 30 ngày)</td></tr>
        <tr><td class="text-muted">Bộ sản phẩm gồm:</td><td class="fw-bold">Thân máy, Cáp sạc Type-C, Sách hướng dẫn, Cây lấy sim</td></tr>
      `;
    }

    // Version selector
    let selectedVersion = product.product_version || "256GB";
    const versionContainer = document.getElementById("pdpVersionPills");
    if (versionContainer) {
      const versions = [
        { label: "256GB", addPrice: 0 },
        { label: "512GB", addPrice: 4000000 },
        { label: "1TB", addPrice: 9000000 }
      ];

      versionContainer.innerHTML = versions.map((v, i) => `
        <button class="version-pill-btn ${v.label === selectedVersion || i === 0 ? "active" : ""}" data-version="${v.label}" data-add="${v.addPrice}">
          <i class="bi bi-memory"></i> ${v.label}
          ${v.addPrice > 0 ? `<span class="badge bg-light text-danger ms-1">+${formatVND(v.addPrice)}</span>` : ""}
        </button>
      `).join("");

      versionContainer.querySelectorAll(".version-pill-btn").forEach(btn => {
        btn.addEventListener("click", function () {
          versionContainer.querySelectorAll(".version-pill-btn").forEach(b => b.classList.remove("active"));
          this.classList.add("active");
          selectedVersion = this.getAttribute("data-version");
          const add = parseInt(this.getAttribute("data-add") || "0", 10);
          const currentSale = (product.sale_price || product.product_listprice) + add;
          if (priceSaleEl) priceSaleEl.textContent = formatVND(currentSale);
        });
      });
    }

    // Color selector
    let selectedColor = "Titan Tự Nhiên";
    const colorContainer = document.getElementById("pdpColorPills");
    if (colorContainer) {
      colorContainer.querySelectorAll(".version-pill-btn").forEach(btn => {
        btn.addEventListener("click", function () {
          colorContainer.querySelectorAll(".version-pill-btn").forEach(b => b.classList.remove("active"));
          this.classList.add("active");
          selectedColor = this.getAttribute("data-color");
        });
      });
    }

    // Showroom stock checker
    const stockCitySelect = document.getElementById("pdpStockCitySelect");
    function renderShowroomStock(city) {
      const stockListEl = document.getElementById("pdpStockList");
      if (!stockListEl) return;

      const subProducts = EcomStore.getSubProductsByProductId(product.product_id);
      const filtered = city === "ALL" ? subProducts : subProducts.filter(sp => sp.sub_city === city);

      if (filtered.length === 0) {
        stockListEl.innerHTML = `<div class="p-3 text-center text-muted">Không có chi nhánh tại khu vực này</div>`;
        return;
      }

      stockListEl.innerHTML = filtered.map(sp => `
        <div class="stock-item">
          <div>
            <strong class="d-block text-dark">${sp.sub_name}</strong>
            <span class="text-muted" style="font-size:0.78rem"><i class="bi bi-geo-alt"></i> ${sp.sub_street || ""}, ${sp.sub_district}, ${sp.sub_city}</span>
          </div>
          <div>
            <span class="${sp.badgeClass}">${sp.statusText}</span>
          </div>
        </div>
      `).join("");
    }

    if (stockCitySelect) {
      stockCitySelect.value = EcomStore.getSelectedCity();
      renderShowroomStock(stockCitySelect.value);
      stockCitySelect.onchange = function () {
        renderShowroomStock(this.value);
      };
    }

    // Button: Thêm vào giỏ
    const btnAddToCart = document.getElementById("btnPdpAddToCart");
    if (btnAddToCart) {
      btnAddToCart.onclick = function () {
        const fullVersion = `${selectedVersion} - ${selectedColor}`;
        EcomStore.addToCart(product, fullVersion, 1);
        updateCartBadge();
        showToast(`Đã thêm ${product.product_name} (${fullVersion}) vào giỏ hàng! <a href="#cart" class="fw-bold text-white text-decoration-underline ms-2">Xem giỏ hàng</a>`, "success");
      };
    }

    // Button: Mua ngay
    const btnBuyNow = document.getElementById("btnPdpBuyNow");
    if (btnBuyNow) {
      btnBuyNow.onclick = function () {
        const fullVersion = `${selectedVersion} - ${selectedColor}`;
        EcomStore.addToCart(product, fullVersion, 1);
        updateCartBadge();
        window.location.hash = "#checkout";
      };
    }

    // Reviews & Sentiment NLP
    let activeSentiment = "ALL";
    function renderReviews() {
      const container = document.getElementById("pdpReviewsContainer");
      if (!container) return;

      const reviews = EcomStore.getReviewsByProductId(product.product_id, activeSentiment);
      if (reviews.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-muted bg-light rounded-3">Chưa có đánh giá nào cho bộ lọc này.</div>`;
        return;
      }

      container.innerHTML = reviews.map(r => {
        let sentBadge = `<span class="sentiment-badge-pos"><i class="bi bi-hand-thumbs-up"></i> Tích cực</span>`;
        if (r.review_sentiment === "Neutral") {
          sentBadge = `<span class="sentiment-badge-neu"><i class="bi bi-chat-dots"></i> Trung tính</span>`;
        } else if (r.review_sentiment === "Negative") {
          sentBadge = `<span class="sentiment-badge-neg"><i class="bi bi-exclamation-triangle"></i> Cần cải thiện</span>`;
        }

        const stars = "★".repeat(Math.floor(r.review_score)) + "☆".repeat(5 - Math.floor(r.review_score));

        return `
          <div class="card border p-3 bg-white shadow-sm">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <div class="d-flex align-items-center gap-2">
                <div class="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold" style="width:36px; height:36px">
                  ${r.customer_name ? r.customer_name.charAt(0) : "K"}
                </div>
                <div>
                  <strong class="d-block" style="font-size:0.9rem">${r.customer_name || "Khách hàng"}</strong>
                  <span class="text-success" style="font-size:0.75rem"><i class="bi bi-check-circle-fill"></i> Đã mua tại EcomFlow Store</span>
                </div>
              </div>
              <div class="text-end">
                ${sentBadge}
                <div class="text-muted" style="font-size:0.75rem">${r.created_at || r.review_date || "Hôm nay"}</div>
              </div>
            </div>

            <div class="text-warning mb-1">${stars} <strong class="text-dark ms-1" style="font-size:0.85rem">${r.review_title || ""}</strong></div>
            <p class="text-muted mb-2" style="font-size:0.86rem; line-height:1.5">${r.review_message || r.review_comment_message || ""}</p>

            ${r.has_reply ? `
              <div class="cskh-reply-box">
                <div class="fw-bold text-danger mb-1"><i class="bi bi-shield-check"></i> Phản hồi từ CSKH EcomFlow:</div>
                <div>${r.reply_content || "Cảm ơn quý khách đã tin tưởng và ủng hộ hệ thống! Mọi thắc mắc kỹ thuật vui lòng liên hệ tổng đài 1800.2063 để được hỗ trợ 24/7."}</div>
              </div>
            ` : ""}
          </div>
        `;
      }).join("");
    }

    renderReviews();

    document.querySelectorAll(".sentiment-filter-btn").forEach(btn => {
      btn.onclick = function () {
        document.querySelectorAll(".sentiment-filter-btn").forEach(b => {
          b.classList.remove("active");
          b.classList.remove("btn-danger");
          b.classList.add("btn-outline-" + (b.getAttribute("data-sentiment") === "Positive" ? "success" : b.getAttribute("data-sentiment") === "Neutral" ? "warning" : b.getAttribute("data-sentiment") === "Negative" ? "danger" : "danger"));
        });
        this.classList.add("active");
        this.classList.add("btn-danger");
        activeSentiment = this.getAttribute("data-sentiment");
        renderReviews();
      };
    });

    const reviewForm = document.getElementById("formSubmitReview");
    if (reviewForm) {
      reviewForm.onsubmit = function (e) {
        e.preventDefault();
        const scoreVal = parseFloat(document.getElementById("inputReviewScore").value);
        const titleVal = document.getElementById("inputReviewTitle").value.trim();
        const msgVal = document.getElementById("inputReviewMessage").value.trim();

        if (!titleVal || !msgVal) {
          alert("Vui lòng nhập đầy đủ tiêu đề và nội dung đánh giá!");
          return;
        }

        const res = EcomStore.addReview(product.product_id, {
          review_score: scoreVal,
          review_title: titleVal,
          review_comment_message: msgVal
        });

        showToast(`Cảm ơn bạn! Đánh giá đã được ghi nhận với sắc thái: ${res.review.review_sentiment}`, "success");
        reviewForm.reset();
        renderReviews();
      };
    }
  }

  // ==========================================================================
  // 5. VIEW 3: GIỎ HÀNG (CART VIEW)
  // ==========================================================================
  function initCartView() {
    renderCartViewContent();
  }

  function renderCartViewContent() {
    const container = document.getElementById("cartContentWrapper");
    const titleCount = document.getElementById("cartCountTitle");
    if (!container) return;

    const cart = EcomStore.getCart();
    if (titleCount) titleCount.textContent = `(${cart.total_items} sản phẩm)`;
    updateCartBadge();

    if (cart.items.length === 0) {
      container.innerHTML = `
        <div class="cart-card text-center p-5">
          <i class="bi bi-cart-x text-muted" style="font-size: 4.5rem"></i>
          <h4 class="fw-bold text-dark mt-3">Giỏ hàng của bạn đang trống</h4>
          <p class="text-muted" style="font-size: 0.95rem">
            Không có sản phẩm nào trong giỏ hàng. Hãy khám phá hàng ngàn ưu đãi công nghệ tại EcomFlow Store ngay hôm nay!
          </p>
          <a href="#home" class="btn btn-danger btn-lg fw-bold px-4 mt-2">
            <i class="bi bi-bag-check"></i> Khám phá sản phẩm ngay
          </a>
        </div>
      `;
      return;
    }

    const subTotal = cart.total_amount;
    const discountVoucher = cart.voucher_discount || 0;
    const discountSmember = Math.round(subTotal * 0.015);
    const grandTotal = Math.max(0, subTotal - discountVoucher - discountSmember);

    container.innerHTML = `
      <div class="row g-4">
        <!-- Items Table -->
        <div class="col-lg-8">
          <div class="cart-card">
            <div class="table-responsive">
              <table class="table cart-table align-middle">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Đơn giá</th>
                    <th style="width:120px">Số lượng</th>
                    <th>Tạm tính</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${cart.items.map(item => `
                    <tr>
                      <td>
                        <div class="d-flex align-items-center gap-3">
                          <img src="${item.product_photo || item.product_photos_link}" alt="${item.product_name}" class="rounded border p-1" style="width:64px; height:64px; object-fit:contain">
                          <div>
                            <strong class="d-block text-dark" style="font-size:0.9rem">${item.product_name}</strong>
                            <span class="text-muted" style="font-size:0.8rem">Phiên bản: <strong>${item.product_version}</strong></span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="fw-bold text-dark">${formatVND(item.unit_price || item.sale_price)}</span>
                      </td>
                      <td>
                        <div class="input-group input-group-sm" style="width:110px">
                          <button class="btn btn-outline-secondary cart-qty-btn btn-qty-dec" data-id="${item.product_id}" data-ver="${item.product_version}">-</button>
                          <input type="text" class="form-control text-center fw-bold bg-white" value="${item.quantity}" readonly>
                          <button class="btn btn-outline-secondary cart-qty-btn btn-qty-inc" data-id="${item.product_id}" data-ver="${item.product_version}">+</button>
                        </div>
                      </td>
                      <td>
                        <strong class="text-danger">${formatVND(item.item_total || item.item_total_amount)}</strong>
                      </td>
                      <td>
                        <button class="btn btn-link text-danger p-0 btn-remove-item" data-id="${item.product_id}" data-ver="${item.product_version}" title="Xóa">
                          <i class="bi bi-trash fs-5"></i>
                        </button>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
              <a href="#home" class="btn btn-outline-secondary btn-sm">
                <i class="bi bi-arrow-left"></i> Tiếp tục chọn sản phẩm khác
              </a>
              <button class="btn btn-outline-danger btn-sm" id="btnClearCart">
                <i class="bi bi-trash"></i> Xóa toàn bộ giỏ hàng
              </button>
            </div>
          </div>
        </div>

        <!-- Voucher & Summary -->
        <div class="col-lg-4">
          <div class="cart-card">
            <h5 class="fw-bold text-dark mb-3 border-bottom pb-2">
              <i class="bi bi-tag-fill text-danger"></i> Mã Giảm Giá / Voucher
            </h5>

            <div class="mb-3">
              <div class="input-group">
                <input type="text" class="form-control" id="cartVoucherInput" placeholder="Nhập mã voucher" value="${cart.applied_voucher ? cart.applied_voucher.code : ""}">
                <button class="btn btn-danger fw-bold" id="btnApplyCartVoucher">Áp dụng</button>
              </div>

              <div class="d-flex gap-1 flex-wrap mt-2">
                <span class="badge bg-light text-danger border voucher-chip py-1 px-2 cursor-pointer" data-code="WEEKEND10">WEEKEND10 (-10%)</span>
                <span class="badge bg-light text-danger border voucher-chip py-1 px-2 cursor-pointer" data-code="SMEMBER5">SMEMBER5 (-5%)</span>
                <span class="badge bg-light text-danger border voucher-chip py-1 px-2 cursor-pointer" data-code="TECHPRO15">TECHPRO15 (-15%)</span>
                <span class="badge bg-light text-danger border voucher-chip py-1 px-2 cursor-pointer" data-code="FREESHIP">FREESHIP</span>
              </div>
            </div>

            <div class="border-top pt-3">
              <div class="d-flex justify-content-between text-muted mb-2" style="font-size:0.88rem">
                <span>Tạm tính:</span>
                <strong class="text-dark">${formatVND(subTotal)}</strong>
              </div>

              ${discountVoucher > 0 ? `
                <div class="d-flex justify-content-between text-danger mb-2" style="font-size:0.88rem">
                  <span>Giảm giá Voucher (${cart.applied_voucher.code}):</span>
                  <strong>-${formatVND(discountVoucher)}</strong>
                </div>
              ` : ""}

              <div class="d-flex justify-content-between text-danger mb-2" style="font-size:0.88rem">
                <span>Ưu đãi Smember Diamond (-1.5%):</span>
                <strong>-${formatVND(discountSmember)}</strong>
              </div>

              <div class="d-flex justify-content-between text-muted mb-2" style="font-size:0.88rem">
                <span>Vận chuyển hỏa tốc:</span>
                <strong class="text-success">MIỄN PHÍ</strong>
              </div>

              <div class="d-flex justify-content-between align-items-baseline border-top pt-3 mt-2">
                <strong class="fs-6">Tổng thanh toán:</strong>
                <strong class="text-danger fs-4">${formatVND(grandTotal)}</strong>
              </div>

              <a href="#checkout" class="btn btn-danger btn-lg w-100 fw-bold py-3 mt-4 shadow-sm">
                TIẾN HÀNH ĐẶT HÀNG <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    // Cart Steppers
    container.querySelectorAll(".btn-qty-inc").forEach(btn => {
      btn.onclick = function () {
        const id = this.getAttribute("data-id");
        const ver = this.getAttribute("data-ver");
        const item = cart.items.find(i => i.product_id === id && i.product_version === ver);
        if (item) {
          EcomStore.updateCartItemQty(id, ver, item.quantity + 1);
          renderCartViewContent();
        }
      };
    });

    container.querySelectorAll(".btn-qty-dec").forEach(btn => {
      btn.onclick = function () {
        const id = this.getAttribute("data-id");
        const ver = this.getAttribute("data-ver");
        const item = cart.items.find(i => i.product_id === id && i.product_version === ver);
        if (item) {
          EcomStore.updateCartItemQty(id, ver, item.quantity - 1);
          renderCartViewContent();
        }
      };
    });

    container.querySelectorAll(".btn-remove-item").forEach(btn => {
      btn.onclick = function () {
        const id = this.getAttribute("data-id");
        const ver = this.getAttribute("data-ver");
        EcomStore.removeFromCart(id, ver);
        showToast("Đã xóa sản phẩm khỏi giỏ hàng", "info");
        renderCartViewContent();
      };
    });

    const clearBtn = document.getElementById("btnClearCart");
    if (clearBtn) {
      clearBtn.onclick = function () {
        if (confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?")) {
          EcomStore.clearCart();
          showToast("Đã làm trống giỏ hàng", "info");
          renderCartViewContent();
        }
      };
    }

    // Voucher
    const voucherInput = document.getElementById("cartVoucherInput");
    const applyVoucherBtn = document.getElementById("btnApplyCartVoucher");
    if (applyVoucherBtn && voucherInput) {
      applyVoucherBtn.onclick = function () {
        const code = voucherInput.value.trim().toUpperCase();
        if (!code) return;
        const res = EcomStore.applyVoucher(code);
        if (res.success) {
          showToast(res.message, "success");
          renderCartViewContent();
        } else {
          showToast(res.message, "danger");
        }
      };
    }

    container.querySelectorAll(".voucher-chip").forEach(chip => {
      chip.onclick = function () {
        const code = this.getAttribute("data-code");
        if (voucherInput) voucherInput.value = code;
        const res = EcomStore.applyVoucher(code);
        if (res.success) {
          showToast(res.message, "success");
          renderCartViewContent();
        } else {
          showToast(res.message, "danger");
        }
      };
    });
  }

  // ==========================================================================
  // 6. VIEW 4: THANH TOÁN (CHECKOUT VIEW)
  // ==========================================================================
  function initCheckoutView() {
    const cart = EcomStore.getCart();
    if (cart.items.length === 0) {
      alert("Giỏ hàng đang trống! Vui lòng chọn sản phẩm.");
      window.location.hash = "#home";
      return;
    }

    // Reset views
    const mainRow = document.getElementById("checkoutMainRow");
    const successView = document.getElementById("checkoutSuccessView");
    if (mainRow) mainRow.classList.remove("d-none");
    if (successView) successView.classList.add("d-none");

    renderCheckoutSummary();

    const citySelect = document.getElementById("checkoutCity");
    if (citySelect) {
      citySelect.onchange = function () {
        updateAssignedShowroom(this.value);
      };
      updateAssignedShowroom(citySelect.value);
    }

    function updateAssignedShowroom(city) {
      const showrooms = EcomStore.getSubsidiariesByCity(city);
      const nameEl = document.getElementById("assignedShowroomName");
      const addrEl = document.getElementById("assignedShowroomAddress");
      if (showrooms.length > 0 && nameEl && addrEl) {
        nameEl.textContent = showrooms[0].sub_name;
        addrEl.textContent = `${showrooms[0].sub_street || ""}, ${showrooms[0].sub_district}, ${showrooms[0].sub_city}`;
      }
    }

    const form = document.getElementById("spaCheckoutForm");
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();

        const fullName = document.getElementById("checkoutFullName").value.trim();
        const phone = document.getElementById("checkoutPhone").value.trim();
        const city = document.getElementById("checkoutCity").value;
        const district = document.getElementById("checkoutDistrict").value.trim();
        const street = document.getElementById("checkoutStreet").value.trim();
        const pmEl = document.querySelector('input[name="spaPaymentMethod"]:checked');
        const paymentMethod = pmEl ? pmEl.value : "COD";

        const address = `${street}, ${district}, ${city}`;

        const newOrder = EcomStore.createOrder({
          fullName,
          phone,
          city,
          district,
          street,
          address,
          paymentMethod
        });

        EcomStore.clearCart();
        updateCartBadge();

        if (mainRow) mainRow.classList.add("d-none");
        if (successView) {
          successView.classList.remove("d-none");
          document.getElementById("placedOrderId").textContent = newOrder.order_id;
          document.getElementById("placedTotal").textContent = formatVND(newOrder.grand_total);
          document.getElementById("placedPayment").textContent = `${paymentMethod} (${paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : "Đã thanh toán"})`;
          document.getElementById("placedCustomer").textContent = `${fullName} - ${phone}`;
          document.getElementById("placedAddress").textContent = address;

          const linkTrack = document.getElementById("linkToOrderTracking");
          if (linkTrack) {
            linkTrack.href = `#orders?id=${encodeURIComponent(newOrder.order_id)}`;
          }
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
      };
    }
  }

  function renderCheckoutSummary() {
    const cart = EcomStore.getCart();
    const listEl = document.getElementById("checkoutItemsList");
    const countEl = document.getElementById("checkoutSummaryCount");
    const subEl = document.getElementById("coSubTotal");
    const discVoucherEl = document.getElementById("coDiscountVoucher");
    const discSmemberEl = document.getElementById("coDiscountSmember");
    const grandEl = document.getElementById("coGrandTotal");

    if (countEl) countEl.textContent = `${cart.total_items} món`;

    if (listEl) {
      listEl.innerHTML = cart.items.map(item => `
        <div class="d-flex align-items-center justify-content-between gap-3 border-bottom pb-2">
          <div class="d-flex align-items-center gap-2">
            <img src="${item.product_photo || item.product_photos_link}" alt="${item.product_name}" class="rounded border p-1" style="width:50px; height:50px; object-fit:contain">
            <div>
              <strong class="d-block" style="font-size:0.85rem">${item.product_name}</strong>
              <span class="text-muted" style="font-size:0.75rem">${item.product_version} x ${item.quantity}</span>
            </div>
          </div>
          <strong class="text-danger" style="font-size:0.88rem">${formatVND(item.item_total || item.item_total_amount)}</strong>
        </div>
      `).join("");
    }

    const subTotal = cart.total_amount;
    const discountVoucher = cart.voucher_discount || 0;
    const discountSmember = Math.round(subTotal * 0.015);
    const grandTotal = Math.max(0, subTotal - discountVoucher - discountSmember);

    if (subEl) subEl.textContent = formatVND(subTotal);
    if (discVoucherEl) discVoucherEl.textContent = `-${formatVND(discountVoucher)}`;
    if (discSmemberEl) discSmemberEl.textContent = `-${formatVND(discountSmember)}`;
    if (grandEl) grandEl.textContent = formatVND(grandTotal);
  }

  // ==========================================================================
  // 7. VIEW 5: TRA CỨU ĐƠN HÀNG (ORDER TRACKING VIEW)
  // ==========================================================================
  function initOrderTrackingView(orderId) {
    if (orderId) {
      searchKeyword = orderId;
      const searchInput = document.getElementById("orderSearchKeyword");
      if (searchInput) searchInput.value = orderId;
    }
    renderOrderTrackingList();

    document.querySelectorAll("#orderStatusTabs .city-tab-btn").forEach(tab => {
      tab.onclick = function () {
        document.querySelectorAll("#orderStatusTabs .city-tab-btn").forEach(t => t.classList.remove("active"));
        this.classList.add("active");
        currentStatusFilter = this.getAttribute("data-status");
        renderOrderTrackingList();
      };
    });

    const form = document.getElementById("orderSearchForm");
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        const input = document.getElementById("orderSearchKeyword");
        searchKeyword = input ? input.value.trim() : "";
        renderOrderTrackingList();
      };
    }
  }

  function renderOrderTrackingList() {
    const container = document.getElementById("ordersListContainer");
    if (!container) return;

    const allOrders = EcomStore.getOrders();
    updateOrderStatusCounts(allOrders);

    let filtered = allOrders;

    if (currentStatusFilter !== "ALL") {
      filtered = filtered.filter(o => o.order_status === currentStatusFilter);
    }

    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      filtered = filtered.filter(o =>
        o.order_id.toLowerCase().includes(kw) ||
        (o.customer_phone && o.customer_phone.includes(kw)) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(kw))
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="cart-card text-center p-5">
          <i class="bi bi-box-seam text-muted" style="font-size:4rem"></i>
          <h5 class="fw-bold mt-3">Không tìm thấy đơn hàng nào</h5>
          <p class="text-muted" style="font-size:0.88rem">
            Không có đơn hàng nào khớp với điều kiện tìm kiếm "${searchKeyword || currentStatusFilter}".
          </p>
          <a href="#home" class="btn btn-outline-danger fw-bold">Khám phá sản phẩm ngay</a>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(order => renderOrderCard(order)).join("");
    bindOrderCardActions(container);
  }

  function updateOrderStatusCounts(orders) {
    const setCnt = (id, count) => {
      const el = document.getElementById(id);
      if (el) el.textContent = count;
    };
    setCnt("tabCountAll", orders.length);
    setCnt("tabCountPending", orders.filter(o => o.order_status === "PENDING").length);
    setCnt("tabCountConfirmed", orders.filter(o => o.order_status === "CONFIRMED").length);
    setCnt("tabCountShipping", orders.filter(o => o.order_status === "SHIPPING").length);
    setCnt("tabCountDelivered", orders.filter(o => o.order_status === "DELIVERED").length);
    setCnt("tabCountCancelled", orders.filter(o => o.order_status === "CANCELLED").length);
  }

  function renderOrderCard(order) {
    const steps = [
      { key: "PENDING", label: "Đã đặt hàng", icon: "bi-cart-check" },
      { key: "CONFIRMED", label: "Đã xác nhận", icon: "bi-check2-circle" },
      { key: "PROCESSING", label: "Đang đóng gói", icon: "bi-box-seam" },
      { key: "SHIPPING", label: "Đang giao hàng", icon: "bi-truck" },
      { key: "DELIVERED", label: "Giao thành công", icon: "bi-house-check" }
    ];

    const statusMap = {
      "PENDING": 0,
      "CONFIRMED": 1,
      "PROCESSING": 2,
      "SHIPPING": 3,
      "DELIVERED": 4,
      "CANCELLED": -1
    };

    const currentIdx = statusMap[order.order_status] !== undefined ? statusMap[order.order_status] : 0;
    const isCancelled = order.order_status === "CANCELLED";

    let statusBadge = `<span class="badge bg-warning text-dark fs-6">Chờ xác nhận</span>`;
    if (order.order_status === "CONFIRMED") statusBadge = `<span class="badge bg-info text-dark fs-6">Đã xác nhận</span>`;
    else if (order.order_status === "PROCESSING") statusBadge = `<span class="badge bg-primary fs-6">Đang đóng gói</span>`;
    else if (order.order_status === "SHIPPING") statusBadge = `<span class="badge bg-primary fs-6"><i class="bi bi-truck"></i> Đang vận chuyển hỏa tốc</span>`;
    else if (order.order_status === "DELIVERED") statusBadge = `<span class="badge bg-success fs-6"><i class="bi bi-check-all"></i> Đã giao thành công</span>`;
    else if (order.order_status === "CANCELLED") statusBadge = `<span class="badge bg-secondary fs-6"><i class="bi bi-x-circle"></i> Đã hủy</span>`;

    return `
      <div class="order-tracking-card mb-4" data-id="${order.order_id}">
        <div class="order-tracking-header">
          <div>
            <span class="text-muted" style="font-size:0.8rem">MÃ ĐƠN HÀNG:</span>
            <strong class="text-danger fs-5 ms-1">${order.order_id}</strong>
            <span class="text-muted ms-3" style="font-size:0.82rem"><i class="bi bi-calendar"></i> ${order.order_date}</span>
          </div>
          <div>${statusBadge}</div>
        </div>

        ${!isCancelled ? `
          <div class="timeline-stepper">
            ${steps.map((s, idx) => {
              let cls = "";
              if (idx < currentIdx) cls = "completed";
              else if (idx === currentIdx) cls = "active";
              return `
                <div class="timeline-step ${cls}">
                  <div class="timeline-icon"><i class="bi ${s.icon}"></i></div>
                  <div class="timeline-label">${s.label}</div>
                </div>
              `;
            }).join("")}
          </div>
        ` : `
          <div class="alert alert-secondary py-2 mb-3" style="font-size:0.85rem">
            <i class="bi bi-info-circle"></i> Đơn hàng này đã bị hủy.
          </div>
        `}

        <div class="row g-3 py-2 border-top border-bottom my-2" style="font-size:0.85rem">
          <div class="col-md-6">
            <div><i class="bi bi-person"></i> Người nhận: <strong>${order.customer_name || "Nguyễn Văn An"}</strong> (${order.customer_phone || "0987654321"})</div>
            <div><i class="bi bi-geo-alt"></i> Địa chỉ giao: <strong>${order.shipping_address || "68 Nguyễn Huệ, Q.1"}</strong></div>
          </div>
          <div class="col-md-6 text-md-end">
            <div><i class="bi bi-shop"></i> Kho xuất: <strong>${order.sub_name || "Showroom Flagship Nguyễn Huệ"}</strong></div>
            <div><i class="bi bi-credit-card"></i> Thanh toán: <strong>${order.payment ? order.payment.payment_method : "COD"}</strong> (${order.payment ? order.payment.payment_status : "PENDING"})</div>
          </div>
        </div>

        <div class="d-flex flex-column gap-2 my-3">
          ${(order.items || []).map(item => `
            <div class="d-flex align-items-center justify-content-between gap-3">
              <div class="d-flex align-items-center gap-2">
                <img src="${item.product_photo || "images/products/" + item.product_id + ".jpg"}" alt="${item.product_name}" class="rounded border p-1" style="width:48px; height:48px; object-fit:contain">
                <div>
                  <strong class="d-block" style="font-size:0.86rem">${item.product_name}</strong>
                  <span class="text-muted" style="font-size:0.75rem">${item.product_version} • SL: ${item.quantity}</span>
                </div>
              </div>
              <div class="text-end">
                <strong class="text-dark" style="font-size:0.88rem">${formatVND(item.item_total || item.item_total_amount)}</strong>
              </div>
            </div>
          `).join("")}
        </div>

        <div class="d-flex justify-content-between align-items-baseline border-top pt-2">
          <span class="text-muted" style="font-size:0.85rem">Tổng tiền thanh toán:</span>
          <strong class="text-danger fs-5">${formatVND(order.grand_total)}</strong>
        </div>

        <div class="demo-control-bar mt-3 flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-lightning-charge-fill text-warning fs-5"></i>
            <span><strong>Công cụ Demo:</strong> Mô phỏng quy trình xử lý đơn hàng</span>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            ${!isCancelled && order.order_status !== "DELIVERED" ? `
              <button class="btn btn-warning btn-sm fw-bold btn-advance-order" data-id="${order.order_id}">
                ⚡ Chuyển trạng thái tiếp theo
              </button>
            ` : ""}
            ${!isCancelled && order.order_status === "PENDING" ? `
              <button class="btn btn-outline-secondary btn-sm btn-cancel-order" data-id="${order.order_id}">
                Hủy đơn
              </button>
            ` : ""}
            ${order.order_status === "DELIVERED" ? `
              <a href="#product?id=${(order.items && order.items[0]) ? order.items[0].product_id : "PR001"}" class="btn btn-outline-danger btn-sm fw-bold">
                <i class="bi bi-star"></i> Đánh giá sản phẩm
              </a>
            ` : ""}
          </div>
        </div>
      </div>
    `;
  }

  function bindOrderCardActions(parent) {
    parent.querySelectorAll(".btn-advance-order").forEach(btn => {
      btn.onclick = function () {
        const id = this.getAttribute("data-id");
        const res = EcomStore.advanceOrderStatus(id);
        const statusText = (res && res.order) ? res.order.order_status : res;
        showToast(`Đơn hàng ${id} đã chuyển sang trạng thái: ${statusText}`, "success");
        renderOrderTrackingList();
      };
    });

    parent.querySelectorAll(".btn-cancel-order").forEach(btn => {
      btn.onclick = function () {
        const id = this.getAttribute("data-id");
        if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${id}?`)) {
          EcomStore.cancelOrder(id);
          showToast(`Đã hủy đơn hàng ${id}`, "info");
          renderOrderTrackingList();
        }
      };
    });
  }

  // ==========================================================================
  // 8. COMPARE FLOATING BAR
  // ==========================================================================
  function initCompareFloatingBar() {
    const bar = document.getElementById("compareFloatingBar");
    const countEl = document.getElementById("compareCount");
    const openBtn = document.getElementById("openCompareBtn");
    const clearBtn = document.getElementById("clearCompareBtn");

    if (clearBtn) {
      clearBtn.onclick = function () {
        compareList = [];
        if (bar) bar.style.display = "none";
      };
    }

    if (openBtn) {
      openBtn.onclick = function () {
        openCompareModal();
      };
    }
  }

  function openCompareModal() {
    if (compareList.length < 2) {
      showToast("Vui lòng chọn tối thiểu 2 sản phẩm để so sánh", "info");
      return;
    }
    const modalEl = document.getElementById("compareModal");
    if (!modalEl || !window.bootstrap) return;

    const modal = new bootstrap.Modal(modalEl);
    const tbody = document.getElementById("compareTableBody");
    const products = compareList.map(id => EcomStore.getProductById(id)).filter(Boolean);

    tbody.innerHTML = `
      <tr>
        <th style="width:200px">Sản phẩm</th>
        ${products.map(p => `
          <td class="text-center">
            <img src="${p.product_photos_link}" alt="${p.product_name}" style="height:120px; object-fit:contain">
            <h6 class="fw-bold mt-2">${p.product_name}</h6>
            <div class="text-danger fw-bold">${formatVND(p.sale_price || p.product_listprice)}</div>
          </td>
        `).join("")}
      </tr>
      <tr>
        <th>Thương hiệu</th>
        ${products.map(p => {
          const b = EcomStore.getBrands().find(brand => brand.brand_id === p.brand_id);
          return `<td>${b ? b.brand_name : "N/A"}</td>`;
        }).join("")}
      </tr>
      <tr>
        <th>Khối lượng</th>
        ${products.map(p => `<td>${p.product_weight_g} g</td>`).join("")}
      </tr>
      <tr>
        <th>Kích thước</th>
        ${products.map(p => `<td>${p.product_length_cm} x ${p.product_width_cm} x ${p.product_height_cm} cm</td>`).join("")}
      </tr>
    `;

    modal.show();
  }

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================
  function formatVND(amount) {
    if (isNaN(amount) || amount === null) return "0 VND";
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
  }

  function showToast(message, type = "danger") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toastId = "toast_" + Date.now();
    const bgClass = type === "success" ? "bg-success" : (type === "info" ? "bg-primary" : "bg-danger");

    const toastEl = document.createElement("div");
    toastEl.className = `toast align-items-center text-white ${bgClass} border-0 show shadow-lg mb-2`;
    toastEl.id = toastId;
    toastEl.setAttribute("role", "alert");
    toastEl.setAttribute("aria-live", "assertive");
    toastEl.setAttribute("aria-atomic", "true");

    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body fw-bold" style="font-size:0.85rem">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    container.appendChild(toastEl);

    setTimeout(() => {
      toastEl.classList.remove("show");
      setTimeout(() => toastEl.remove(), 400);
    }, 4500);
  }

  window.EcomApp = {
    navigateTo,
    showToast,
    formatVND
  };
});
