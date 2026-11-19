/**
 * EcomFlow Store - Customer Storefront Application (Multi-Page Interactive Engine)
 * Xử lý toàn bộ logic cho 5 trang: index.html, product-detail.html, cart.html, checkout.html, order-tracking.html
 */

document.addEventListener("DOMContentLoaded", function () {
  // 1. Khởi tạo các thành phần chung trên mọi trang
  initCommonHeader();
  initSearchAutocomplete();
  initShowroomLocationModal();
  updateHeaderCartBadge();
  initResetStoreBtn();

  // 2. Định tuyến theo trang hiện tại
  const path = window.location.pathname.toLowerCase();

  if (path.includes("product-detail.html")) {
    initProductDetailPage();
  } else if (path.includes("cart.html")) {
    initCartPage();
  } else if (path.includes("checkout.html")) {
    initCheckoutPage();
  } else if (path.includes("order-tracking.html")) {
    initOrderTrackingPage();
  } else {
    // Trang chủ index.html
    initIndexPage();
  }

  // ==========================================================================
  // PHẦN CHUNG: HEADER, SEARCH, SHOWROOM MODAL, TOAST
  // ==========================================================================
  function initCommonHeader() {
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

  function updateHeaderCartBadge() {
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
            window.location.reload();
          }, 600);
        }
      });
    }
  }

  // Live Search Autocomplete
  function initSearchAutocomplete() {
    const input = document.getElementById("searchInput");
    const dropdown = document.getElementById("searchDropdown");
    const btn = document.getElementById("searchBtn");
    if (!input || !dropdown) return;

    function handleSearch() {
      const q = input.value.trim().toLowerCase();
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
          window.location.href = `product-detail.html?id=${encodeURIComponent(id)}`;
        });
      });
    }

    input.addEventListener("input", handleSearch);

    if (btn) {
      btn.addEventListener("click", function () {
        const q = input.value.trim();
        if (q) {
          window.location.href = `index.html#catalogSection`;
        }
      });
    }

    document.addEventListener("click", function (e) {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove("active");
      }
    });
  }

  // Showroom Picker Modal
  function initShowroomLocationModal() {
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
                <i class="bi bi-clock"></i> Mở cửa: 8:00 - 22:00 tất cả các ngày (Cả T7 & CN) • Hotline: 1800.2097
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

          // Nếu đang ở PDP, cập nhật lại stock checker
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
  // TRANG CHỦ: INDEX.HTML
  // ==========================================================================
  function initIndexPage() {
    initCountdownTimer();
    renderHeroCategoryMenu();
    renderHotSaleSection();
    renderCatalogProducts();
    setupCatalogFilters();
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
    const icons = [
      { id: "CAT001", icon: "bi-phone", tag: "Hot Deal" },
      { id: "CAT002", icon: "bi-laptop", tag: "Giảm 15%" },
      { id: "CAT003", icon: "bi-tablet", tag: "Mới" },
      { id: "CAT004", icon: "bi-headphones", tag: "Chính hãng" },
      { id: "CAT005", icon: "bi-smartwatch", tag: "Thể thao" },
      { id: "CAT006", icon: "bi-usb-symbol", tag: "Mua 1 tặng 1" },
      { id: "CAT007", icon: "bi-display", tag: "Gaming" },
      { id: "CAT008", icon: "bi-house-gear", tag: "Smarthome" }
    ];

    sidebar.innerHTML = categories.map((cat, idx) => {
      const meta = icons[idx] || { icon: "bi-box", tag: "Hot" };
      return `
        <div class="category-menu-item" data-cat="${cat.category_id}">
          <i class="bi ${meta.icon}"></i>
          <span>${cat.category_name}</span>
          <span class="category-badge-tag">${meta.tag}</span>
        </div>
      `;
    }).join("");

    sidebar.querySelectorAll(".category-menu-item").forEach(item => {
      item.addEventListener("click", function () {
        const catId = this.getAttribute("data-cat");
        sidebar.querySelectorAll(".category-menu-item").forEach(i => i.classList.remove("active"));
        this.classList.add("active");
        filterCatalogByCategory(catId);
        const catalogEl = document.getElementById("catalogSection");
        if (catalogEl) catalogEl.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  function renderHotSaleSection() {
    const container = document.getElementById("hotsaleProductGrid");
    if (!container) return;

    const products = EcomStore.getProducts();
    const hotsale = products.filter(p => p.sale_price && p.sale_price < p.product_listprice).slice(0, 4);

    container.innerHTML = hotsale.map(p => {
      const discount = Math.round((1 - p.sale_price / p.product_listprice) * 100);
      const score = EcomStore.getProductScore(p.product_id);
      return `
        <div class="product-card" data-id="${p.product_id}">
          <span class="product-badge-discount">-${discount}%</span>
          <div class="product-img-wrapper">
            <img src="${p.product_photos_link}" alt="${p.product_name}">
          </div>
          <div class="product-info">
            <h3 class="product-title">${p.product_name}</h3>
            <div class="product-specs">${p.product_version || "Chính hãng"}</div>
            <div class="product-price-box">
              <span class="product-price-sale">${formatVND(p.sale_price)}</span>
              <span class="product-price-list">${formatVND(p.product_listprice)}</span>
            </div>
            <div class="smember-card-perk">
              <i class="bi bi-gem"></i> Smember giảm thêm đến 1.5%
            </div>
            <div class="product-rating">
              <i class="bi bi-star-fill star-icon"></i>
              <span class="fw-bold">${score ? score.rating_average : "4.9"}</span>
              <span class="rating-count">(${score ? score.review_count : "180"})</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    bindProductCardNavigation(container);
  }

  let catalogCategoryFilter = "ALL";
  let catalogBrandFilter = "ALL";
  let catalogPriceFilter = "ALL";
  let catalogSortFilter = "FEATURED";

  function filterCatalogByCategory(catId) {
    catalogCategoryFilter = catId;
    renderCatalogProducts();
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
      list = list.filter(p => p.category_id === catalogCategoryFilter);
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
          <p class="text-muted mt-2">Không tìm thấy sản phẩm nào phù hợp với bộ lọc đã chọn.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(p => {
      const discount = p.sale_price ? Math.round((1 - p.sale_price / p.product_listprice) * 100) : 0;
      const score = EcomStore.getProductScore(p.product_id);
      return `
        <div class="product-card" data-id="${p.product_id}">
          ${discount > 0 ? `<span class="product-badge-discount">-${discount}%</span>` : ""}
          <div class="product-img-wrapper">
            <img src="${p.product_photos_link}" alt="${p.product_name}">
          </div>
          <div class="product-info">
            <h3 class="product-title">${p.product_name}</h3>
            <div class="product-specs">${p.product_version || "Phiên bản tiêu chuẩn"}</div>
            <div class="product-price-box">
              <span class="product-price-sale">${formatVND(p.sale_price || p.product_listprice)}</span>
              ${p.sale_price ? `<span class="product-price-list">${formatVND(p.product_listprice)}</span>` : ""}
            </div>
            <div class="smember-card-perk">
              <i class="bi bi-gem"></i> Smember giảm thêm đến 1.5%
            </div>
            <div class="product-rating">
              <i class="bi bi-star-fill star-icon"></i>
              <span class="fw-bold">${score ? score.rating_average : "4.8"}</span>
              <span class="rating-count">(${score ? score.review_count : "120"})</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    bindProductCardNavigation(container);
  }

  function bindProductCardNavigation(parent) {
    parent.querySelectorAll(".product-card").forEach(card => {
      card.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        window.location.href = `product-detail.html?id=${encodeURIComponent(id)}`;
      });
    });
  }

  // ==========================================================================
  // TRANG CHI TIẾT SẢN PHẨM: PRODUCT-DETAIL.HTML
  // ==========================================================================
  function initProductDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    let productId = urlParams.get("id");
    if (!productId) productId = "PR001";

    const product = EcomStore.getProductById(productId);
    if (!product) {
      alert("Không tìm thấy sản phẩm! Về trang chủ.");
      window.location.href = "index.html";
      return;
    }

    const score = EcomStore.getProductScore(productId);
    const category = EcomStore.getCategories().find(c => c.category_id === product.category_id);
    const brand = EcomStore.getBrands().find(b => b.brand_id === product.brand_id);

    // Breadcrumbs
    const catBreadcrumb = document.getElementById("breadcrumbCategory");
    const nameBreadcrumb = document.getElementById("breadcrumbProductName");
    if (catBreadcrumb && category) catBreadcrumb.textContent = category.category_name;
    if (nameBreadcrumb) nameBreadcrumb.textContent = product.product_name;

    // Badges & Title
    const brandBadge = document.getElementById("pdpBrandBadge");
    const catBadge = document.getElementById("pdpCategoryBadge");
    const pIdEl = document.getElementById("pdpProductId");
    const nameEl = document.getElementById("pdpName");
    if (brandBadge && brand) brandBadge.textContent = brand.brand_name;
    if (catBadge && category) catBadge.textContent = category.category_name;
    if (pIdEl) pIdEl.textContent = product.product_id;
    if (nameEl) nameEl.textContent = `${product.product_name} - Chính Hãng`;

    // Image
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

    // Prices & Discounts
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

    // Logistics Specs Table
    const logisticsTable = document.getElementById("pdpLogisticsTable");
    if (logisticsTable) {
      logisticsTable.innerHTML = `
        <tr><td class="text-muted" style="width:40%">Trọng lượng máy:</td><td class="fw-bold">${product.product_weight_g} g</td></tr>
        <tr><td class="text-muted">Kích thước đóng gói:</td><td class="fw-bold">${product.product_length_cm} x ${product.product_width_cm} x ${product.product_height_cm} cm</td></tr>
        <tr><td class="text-muted">Xuất xứ:</td><td class="fw-bold">${brand ? brand.brand_name : "Quốc tế"}</td></tr>
        <tr><td class="text-muted">Bảo hành:</td><td class="fw-bold text-success">12 tháng chính hãng (1 đổi 1 30 ngày)</td></tr>
        <tr><td class="text-muted">Bộ sản phẩm gồm:</td><td class="fw-bold">Thân máy, Cáp sạc Type-C, Sách hướng dẫn, Cây lấy sim</td></tr>
      `;
    }

    // Versions selector
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

    // Color Selector
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

    // Showroom Stock Checker
    const stockCitySelect = document.getElementById("pdpStockCitySelect");
    function renderShowroomStock(city) {
      const stockListEl = document.getElementById("pdpStockList");
      if (!stockListEl) return;

      const subProducts = EcomStore.getSubProductsByProductId(productId);
      const filtered = city === "ALL" ? subProducts : subProducts.filter(sp => sp.sub_city === city);

      if (filtered.length === 0) {
        stockListEl.innerHTML = `<div class="p-3 text-center text-muted">Không có chi nhánh tại khu vực này</div>`;
        return;
      }

      stockListEl.innerHTML = filtered.map(sp => {
        let badgeClass = "badge-in-stock";
        let statusText = `Còn hàng (${sp.quantity} máy)`;
        if (sp.quantity === 0) {
          badgeClass = "badge-out-of-stock";
          statusText = "Tạm hết hàng";
        } else if (sp.quantity < 5) {
          badgeClass = "badge-low-stock";
          statusText = `Sắp hết (${sp.quantity} máy)`;
        }

        return `
          <div class="stock-item">
            <div>
              <strong class="d-block text-dark">${sp.sub_name}</strong>
              <span class="text-muted" style="font-size:0.78rem"><i class="bi bi-geo-alt"></i> ${sp.sub_address}, ${sp.sub_district}, ${sp.sub_city}</span>
            </div>
            <div>
              <span class="${badgeClass}">${statusText}</span>
            </div>
          </div>
        `;
      }).join("");
    }

    if (stockCitySelect) {
      stockCitySelect.value = EcomStore.getSelectedCity();
      renderShowroomStock(stockCitySelect.value);
      stockCitySelect.addEventListener("change", function () {
        renderShowroomStock(this.value);
      });
    }

    // Action: Thêm vào giỏ hàng
    const btnAddToCart = document.getElementById("btnAddToCart");
    if (btnAddToCart) {
      btnAddToCart.addEventListener("click", function () {
        const fullVersion = `${selectedVersion} - ${selectedColor}`;
        EcomStore.addToCart(product, fullVersion, 1);
        updateHeaderCartBadge();
        showToast(`Đã thêm ${product.product_name} (${fullVersion}) vào giỏ hàng! <a href="cart.html" class="fw-bold text-white text-decoration-underline ms-2">Xem giỏ</a>`, "success");
      });
    }

    // Action: Mua ngay
    const btnBuyNow = document.getElementById("btnBuyNow");
    if (btnBuyNow) {
      btnBuyNow.addEventListener("click", function () {
        const fullVersion = `${selectedVersion} - ${selectedColor}`;
        EcomStore.addToCart(product, fullVersion, 1);
        updateHeaderCartBadge();
        window.location.href = "checkout.html";
      });
    }

    // Reviews Section & Sentiment Filter
    let activeSentiment = "ALL";
    function renderReviews() {
      const container = document.getElementById("pdpReviewsContainer");
      if (!container) return;

      const reviews = EcomStore.getReviewsByProductId(productId, activeSentiment);
      if (reviews.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-muted bg-light rounded-3">Chưa có đánh giá nào cho bộ lọc này. Hãy là người đầu tiên để lại nhận xét!</div>`;
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
                  <strong class="d-block" style="font-size:0.9rem">${r.customer_name}</strong>
                  <span class="text-success" style="font-size:0.75rem"><i class="bi bi-check-circle-fill"></i> Đã mua tại EcomFlow Store</span>
                </div>
              </div>
              <div class="text-end">
                ${sentBadge}
                <div class="text-muted" style="font-size:0.75rem">${r.review_date}</div>
              </div>
            </div>

            <div class="text-warning mb-1">${stars} <strong class="text-dark ms-1" style="font-size:0.85rem">${r.review_title || ""}</strong></div>
            <p class="text-muted mb-2" style="font-size:0.86rem; line-height:1.5">${r.review_comment_message}</p>

            ${r.has_reply ? `
              <div class="cskh-reply-box">
                <div class="fw-bold text-danger mb-1"><i class="bi bi-shield-check"></i> Phản hồi từ Chăm sóc khách hàng EcomFlow:</div>
                <div>Cảm ơn quý khách đã tin tưởng và ủng hộ hệ thống! Mọi thắc mắc kỹ thuật vui lòng liên hệ tổng đài 1800.2063 để được hỗ trợ 24/7.</div>
              </div>
            ` : ""}
          </div>
        `;
      }).join("");
    }

    renderReviews();

    document.querySelectorAll(".sentiment-filter-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".sentiment-filter-btn").forEach(b => {
          b.classList.remove("active");
          b.classList.remove("btn-danger");
          b.classList.add("btn-outline-" + (b.getAttribute("data-sentiment") === "Positive" ? "success" : b.getAttribute("data-sentiment") === "Neutral" ? "warning" : b.getAttribute("data-sentiment") === "Negative" ? "danger" : "danger"));
        });
        this.classList.add("active");
        this.classList.add("btn-danger");
        activeSentiment = this.getAttribute("data-sentiment");
        renderReviews();
      });
    });

    // Review Submission Form
    const reviewForm = document.getElementById("formSubmitReview");
    if (reviewForm) {
      reviewForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const scoreVal = parseFloat(document.getElementById("inputReviewScore").value);
        const titleVal = document.getElementById("inputReviewTitle").value.trim();
        const msgVal = document.getElementById("inputReviewMessage").value.trim();

        if (!titleVal || !msgVal) {
          alert("Vui lòng nhập đầy đủ tiêu đề và nội dung đánh giá!");
          return;
        }

        const newReview = EcomStore.addReview(productId, {
          review_score: scoreVal,
          review_title: titleVal,
          review_comment_message: msgVal
        });

        showToast(`Cảm ơn bạn! Đánh giá đã được ghi nhận với sắc thái: ${newReview.review_sentiment}`, "success");
        reviewForm.reset();
        renderReviews();
      });
    }
  }

  // ==========================================================================
  // TRANG GIỎ HÀNG: CART.HTML
  // ==========================================================================
  function initCartPage() {
    renderCartPageContent();
  }

  function renderCartPageContent() {
    const container = document.getElementById("cartContentWrapper");
    const titleCount = document.getElementById("cartCountTitle");
    if (!container) return;

    const cart = EcomStore.getCart();
    if (titleCount) titleCount.textContent = `(${cart.total_items} sản phẩm)`;
    updateHeaderCartBadge();

    if (cart.items.length === 0) {
      container.innerHTML = `
        <div class="cart-card text-center p-5">
          <i class="bi bi-cart-x text-muted" style="font-size: 4.5rem"></i>
          <h4 class="fw-bold text-dark mt-3">Giỏ hàng của bạn đang trống</h4>
          <p class="text-muted" style="font-size: 0.95rem">
            Không có sản phẩm nào trong giỏ hàng. Hãy khám phá hàng ngàn ưu đãi công nghệ tại EcomFlow Store ngay hôm nay!
          </p>
          <a href="index.html" class="btn btn-danger btn-lg fw-bold px-4 mt-2">
            <i class="bi bi-bag-check"></i> Khám phá sản phẩm ngay
          </a>
        </div>
      `;
      return;
    }

    const subTotal = cart.total_amount;
    const discountVoucher = cart.voucher_discount || 0;
    const discountSmember = Math.round(subTotal * 0.015); // Diamond 1.5%
    const grandTotal = Math.max(0, subTotal - discountVoucher - discountSmember);

    container.innerHTML = `
      <div class="row g-4">
        <!-- Col Left: Items Table -->
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
                          <img src="${item.product_photo}" alt="${item.product_name}" class="rounded border p-1" style="width:64px; height:64px; object-fit:contain">
                          <div>
                            <strong class="d-block text-dark" style="font-size:0.9rem">${item.product_name}</strong>
                            <span class="text-muted" style="font-size:0.8rem">Phiên bản: <strong>${item.product_version}</strong></span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="fw-bold text-dark">${formatVND(item.unit_price)}</span>
                      </td>
                      <td>
                        <div class="input-group input-group-sm" style="width:110px">
                          <button class="btn btn-outline-secondary cart-qty-btn btn-qty-dec" data-id="${item.product_id}" data-ver="${item.product_version}">-</button>
                          <input type="text" class="form-control text-center fw-bold bg-white" value="${item.quantity}" readonly>
                          <button class="btn btn-outline-secondary cart-qty-btn btn-qty-inc" data-id="${item.product_id}" data-ver="${item.product_version}">+</button>
                        </div>
                      </td>
                      <td>
                        <strong class="text-danger">${formatVND(item.item_total)}</strong>
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
              <a href="index.html#catalogSection" class="btn btn-outline-secondary btn-sm">
                <i class="bi bi-arrow-left"></i> Tiếp tục chọn sản phẩm khác
              </a>
              <button class="btn btn-outline-danger btn-sm" id="btnClearCart">
                <i class="bi bi-trash"></i> Xóa toàn bộ giỏ hàng
              </button>
            </div>
          </div>
        </div>

        <!-- Col Right: Voucher & Order Calculation -->
        <div class="col-lg-4">
          <div class="cart-card">
            <h5 class="fw-bold text-dark mb-3 border-bottom pb-2">
              <i class="bi bi-tag-fill text-danger"></i> Mã Giảm Giá / Voucher
            </h5>

            <!-- Voucher Input Box -->
            <div class="mb-3">
              <div class="input-group">
                <input type="text" class="form-control" id="cartPageVoucherInput" placeholder="Nhập mã voucher" value="${cart.applied_voucher ? cart.applied_voucher.code : ""}">
                <button class="btn btn-danger fw-bold" id="btnApplyCartVoucher">Áp dụng</button>
              </div>

              <!-- Quick Voucher Chips -->
              <div class="d-flex gap-1 flex-wrap mt-2">
                <span class="badge bg-light text-danger border voucher-chip py-1 px-2" data-code="WEEKEND10">WEEKEND10 (-10%)</span>
                <span class="badge bg-light text-danger border voucher-chip py-1 px-2" data-code="SMEMBER5">SMEMBER5 (-5%)</span>
                <span class="badge bg-light text-danger border voucher-chip py-1 px-2" data-code="TECHPRO15">TECHPRO15 (-15%)</span>
                <span class="badge bg-light text-danger border voucher-chip py-1 px-2" data-code="FREESHIP">FREESHIP</span>
              </div>
            </div>

            <!-- Price Breakdown -->
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

              <a href="checkout.html" class="btn btn-danger btn-lg w-100 fw-bold py-3 mt-4 shadow-sm">
                TIẾN HÀNH ĐẶT HÀNG <i class="bi bi-arrow-right"></i>
              </a>

              <div class="text-center text-muted mt-2" style="font-size:0.78rem">
                Hỗ trợ trả góp 0% lãi suất • Đổi trả miễn phí 30 ngày
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event handlers for cart items
    container.querySelectorAll(".btn-qty-inc").forEach(btn => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        const ver = this.getAttribute("data-ver");
        const item = cart.items.find(i => i.product_id === id && i.product_version === ver);
        if (item) {
          EcomStore.updateCartItemQuantity(id, ver, item.quantity + 1);
          renderCartPageContent();
        }
      });
    });

    container.querySelectorAll(".btn-qty-dec").forEach(btn => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        const ver = this.getAttribute("data-ver");
        const item = cart.items.find(i => i.product_id === id && i.product_version === ver);
        if (item) {
          EcomStore.updateCartItemQuantity(id, ver, item.quantity - 1);
          renderCartPageContent();
        }
      });
    });

    container.querySelectorAll(".btn-remove-item").forEach(btn => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        const ver = this.getAttribute("data-ver");
        EcomStore.removeFromCart(id, ver);
        showToast("Đã xóa sản phẩm khỏi giỏ hàng", "info");
        renderCartPageContent();
      });
    });

    const clearBtn = document.getElementById("btnClearCart");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        if (confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?")) {
          EcomStore.clearCart();
          showToast("Đã làm trống giỏ hàng", "info");
          renderCartPageContent();
        }
      });
    }

    // Voucher handling
    const voucherInput = document.getElementById("cartPageVoucherInput");
    const applyVoucherBtn = document.getElementById("btnApplyCartVoucher");
    if (applyVoucherBtn && voucherInput) {
      applyVoucherBtn.addEventListener("click", function () {
        const code = voucherInput.value.trim().toUpperCase();
        if (!code) return;
        const res = EcomStore.applyVoucher(code);
        if (res.success) {
          showToast(res.message, "success");
          renderCartPageContent();
        } else {
          showToast(res.message, "danger");
        }
      });
    }

    container.querySelectorAll(".voucher-chip").forEach(chip => {
      chip.addEventListener("click", function () {
        const code = this.getAttribute("data-code");
        if (voucherInput) voucherInput.value = code;
        const res = EcomStore.applyVoucher(code);
        if (res.success) {
          showToast(res.message, "success");
          renderCartPageContent();
        } else {
          showToast(res.message, "danger");
        }
      });
    });
  }

  // ==========================================================================
  // TRANG THANH TOÁN: CHECKOUT.HTML
  // ==========================================================================
  function initCheckoutPage() {
    const cart = EcomStore.getCart();
    if (cart.items.length === 0) {
      alert("Giỏ hàng của bạn đang trống! Hãy chọn sản phẩm trước khi thanh toán.");
      window.location.href = "index.html";
      return;
    }

    renderCheckoutSummary();

    const citySelect = document.getElementById("checkoutCity");
    if (citySelect) {
      citySelect.addEventListener("change", function () {
        updateAssignedShowroom(this.value);
      });
      updateAssignedShowroom(citySelect.value);
    }

    function updateAssignedShowroom(city) {
      const showrooms = EcomStore.getSubsidiariesByCity(city);
      const nameEl = document.getElementById("assignedShowroomName");
      const addrEl = document.getElementById("assignedShowroomAddress");
      if (showrooms.length > 0 && nameEl && addrEl) {
        nameEl.textContent = showrooms[0].sub_name;
        addrEl.textContent = `${showrooms[0].sub_address}, ${showrooms[0].sub_district}, ${showrooms[0].sub_city}`;
      }
    }

    const checkoutForm = document.getElementById("pageCheckoutForm");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const fullName = document.getElementById("checkoutFullName").value.trim();
        const phone = document.getElementById("checkoutPhone").value.trim();
        const city = document.getElementById("checkoutCity").value;
        const district = document.getElementById("checkoutDistrict").value.trim();
        const street = document.getElementById("checkoutStreet").value.trim();
        const pmEl = document.querySelector('input[name="pagePaymentMethod"]:checked');
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

        // Xóa giỏ hàng sau khi đặt thành công
        EcomStore.clearCart();
        updateHeaderCartBadge();

        // Hiển thị màn hình thành công
        const mainRow = document.getElementById("checkoutMainRow");
        const successView = document.getElementById("checkoutSuccessView");
        if (mainRow) mainRow.classList.add("d-none");
        if (successView) {
          successView.classList.remove("d-none");
          document.getElementById("placedOrderId").textContent = newOrder.order_id;
          document.getElementById("placedTotal").textContent = formatVND(newOrder.grand_total);
          document.getElementById("placedPayment").textContent = `${paymentMethod} (${paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : "Đã thanh toán điện tử"})`;
          document.getElementById("placedCustomer").textContent = `${fullName} - ${phone}`;
          document.getElementById("placedAddress").textContent = address;

          const linkTrack = document.getElementById("linkToOrderTracking");
          if (linkTrack) {
            linkTrack.href = `order-tracking.html?orderId=${encodeURIComponent(newOrder.order_id)}`;
          }
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
      });
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
            <img src="${item.product_photo}" alt="${item.product_name}" class="rounded border p-1" style="width:50px; height:50px; object-fit:contain">
            <div>
              <strong class="d-block" style="font-size:0.85rem">${item.product_name}</strong>
              <span class="text-muted" style="font-size:0.75rem">${item.product_version} x ${item.quantity}</span>
            </div>
          </div>
          <strong class="text-danger" style="font-size:0.88rem">${formatVND(item.item_total)}</strong>
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
  // TRANG TRA CỨU ĐƠN HÀNG: ORDER-TRACKING.HTML
  // ==========================================================================
  function initOrderTrackingPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const queryOrderId = urlParams.get("orderId");

    let currentStatusFilter = "ALL";
    let searchKeyword = queryOrderId || "";

    const searchInput = document.getElementById("orderSearchKeyword");
    if (searchInput && searchKeyword) {
      searchInput.value = searchKeyword;
    }

    renderOrders();

    // Tab filtering
    document.querySelectorAll("#orderStatusTabs .city-tab-btn").forEach(tab => {
      tab.addEventListener("click", function () {
        document.querySelectorAll("#orderStatusTabs .city-tab-btn").forEach(t => t.classList.remove("active"));
        this.classList.add("active");
        currentStatusFilter = this.getAttribute("data-status");
        renderOrders();
      });
    });

    // Search form submit
    const searchForm = document.getElementById("orderSearchForm");
    if (searchForm) {
      searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        searchKeyword = (searchInput ? searchInput.value.trim() : "");
        renderOrders();
      });
    }

    function renderOrders() {
      const container = document.getElementById("ordersListContainer");
      if (!container) return;

      const allOrders = EcomStore.getOrders();

      // Cập nhật số lượng trên các tab
      updateTabCounts(allOrders);

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
            <a href="index.html" class="btn btn-outline-danger fw-bold">Khám phá sản phẩm ngay</a>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(order => renderOrderCard(order)).join("");

      // Gắn sự kiện cho các nút hành động trong đơn
      bindOrderActions(container);
    }

    function updateTabCounts(orders) {
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
          <!-- Order Card Header -->
          <div class="order-tracking-header">
            <div>
              <span class="text-muted" style="font-size:0.8rem">MÃ ĐƠN HÀNG:</span>
              <strong class="text-danger fs-5 ms-1">${order.order_id}</strong>
              <span class="text-muted ms-3" style="font-size:0.82rem"><i class="bi bi-calendar"></i> ${order.order_date}</span>
            </div>
            <div>
              ${statusBadge}
            </div>
          </div>

          <!-- Stepper 5-Stage (nếu chưa bị hủy) -->
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
              <i class="bi bi-info-circle"></i> Đơn hàng này đã bị hủy theo yêu cầu.
            </div>
          `}

          <!-- Order Info & Items -->
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

          <!-- Products in Order -->
          <div class="d-flex flex-column gap-2 my-3">
            ${(order.items || []).map(item => `
              <div class="d-flex align-items-center justify-content-between gap-3">
                <div class="d-flex align-items-center gap-2">
                  <img src="${item.product_photo || "images/products/" + item.product_id + ".jpg"}" alt="${item.product_name}" class="rounded border p-1" style="width:48px; height:48px; object-fit:contain">
                  <div>
                    <strong class="d-block" style="font-size:0.86rem">${item.product_name}</strong>
                    <span class="text-muted" style="font-size:0.75rem">${item.product_version} • Số lượng: ${item.quantity}</span>
                  </div>
                </div>
                <div class="text-end">
                  <strong class="text-dark" style="font-size:0.88rem">${formatVND(item.item_total)}</strong>
                </div>
              </div>
            `).join("")}
          </div>

          <!-- Total Calculation -->
          <div class="d-flex justify-content-between align-items-baseline border-top pt-2">
            <span class="text-muted" style="font-size:0.85rem">Tổng tiền đã thanh toán:</span>
            <strong class="text-danger fs-5">${formatVND(order.grand_total)}</strong>
          </div>

          <!-- Action Controls & Demo Advance Status -->
          <div class="demo-control-bar mt-3 flex-wrap gap-2">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-lightning-charge-fill text-warning fs-5"></i>
              <span><strong>Công cụ Demo Giảng viên:</strong> Mô phỏng quy trình xử lý đơn hàng</span>
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
                <a href="product-detail.html?id=${(order.items && order.items[0]) ? order.items[0].product_id : "PR001"}#reviewsSection" class="btn btn-outline-danger btn-sm fw-bold">
                  <i class="bi bi-star"></i> Đánh giá sản phẩm
                </a>
              ` : ""}
            </div>
          </div>
        </div>
      `;
    }

    function bindOrderActions(parent) {
      parent.querySelectorAll(".btn-advance-order").forEach(btn => {
        btn.addEventListener("click", function () {
          const id = this.getAttribute("data-id");
          const next = EcomStore.advanceOrderStatus(id);
          showToast(`Đơn hàng ${id} đã chuyển sang trạng thái: ${next}`, "success");
          renderOrders();
        });
      });

      parent.querySelectorAll(".btn-cancel-order").forEach(btn => {
        btn.addEventListener("click", function () {
          const id = this.getAttribute("data-id");
          if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${id}?`)) {
            EcomStore.cancelOrder(id);
            showToast(`Đã hủy đơn hàng ${id}`, "info");
            renderOrders();
          }
        });
      });
    }
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
    showToast,
    formatVND
  };
});
