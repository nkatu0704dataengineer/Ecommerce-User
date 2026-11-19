/**
 * EcomFlow Store - Customer Storefront Application (CellPhoneS Interactive Engine)
 * Xử lý toàn bộ tương tác người dùng, hiển thị danh mục, bộ lọc, giỏ hàng,
 * thanh toán, tra cứu đơn hàng và đánh giá sản phẩm.
 */

document.addEventListener("DOMContentLoaded", function () {
  // Trạng thái cục bộ của giao diện
  const UIState = {
    selectedCity: "ALL", // "ALL", "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng"
    selectedCategory: "ALL",
    selectedBrand: "ALL",
    selectedPriceRange: "ALL",
    sortBy: "FEATURED",
    compareList: [], // Danh sách product_id đang chọn để so sánh (tối đa 3)
    currentPdpProduct: null,
    currentPdpVersion: null,
    reviewFilterSentiment: "ALL"
  };

  // Khởi tạo các thành phần giao diện
  initHeader();
  initCountdownTimer();
  renderHeroCategoryMenu();
  renderHotSaleSection();
  renderCatalogProducts();
  initSearchAutocomplete();
  updateCartBadge();
  setupEventListeners();

  // ==========================================================================
  // 1. HEADER & KHU VỰC ĐỊA CHỈ
  // ==========================================================================
  function initHeader() {
    const customer = EcomStore.getCurrentCustomer();
    const customerRankEl = document.getElementById("headerCustomerRank");
    if (customerRankEl && customer) {
      customerRankEl.innerHTML = `<i class="bi bi-gem"></i> Smember <span class="rank-tag">${customer.customer_rank}</span>`;
    }

    const cityLabel = document.getElementById("selectedCityLabel");
    if (cityLabel) {
      cityLabel.textContent = UIState.selectedCity === "ALL" ? "Toàn quốc" : UIState.selectedCity;
    }
  }

  function updateCartBadge() {
    const cart = EcomStore.getCart();
    const badges = document.querySelectorAll(".cart-badge-count");
    badges.forEach(b => {
      b.textContent = cart.total_items || 0;
    });
  }

  // ==========================================================================
  // 2. TÌM KIẾM AUTOCOMPLETE
  // ==========================================================================
  function initSearchAutocomplete() {
    const input = document.getElementById("searchInput");
    const dropdown = document.getElementById("searchDropdown");
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

      // Bắt sự kiện click vào kết quả gợi ý
      dropdown.querySelectorAll(".search-item").forEach(item => {
        item.addEventListener("click", function () {
          const id = this.getAttribute("data-id");
          dropdown.classList.remove("active");
          input.value = "";
          openProductDetailModal(id);
        });
      });
    });

    // Đóng dropdown khi click ra ngoài
    document.addEventListener("click", function (e) {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove("active");
      }
    });
  }

  // ==========================================================================
  // 3. ĐỒNG HỒ ĐẾM NGƯỢC HOT SALE CUỐI TUẦN
  // ==========================================================================
  function initCountdownTimer() {
    function updateTimer() {
      const now = new Date();
      // Đếm ngược tới 23:59:59 của ngày Chủ Nhật cuối tuần
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

  // ==========================================================================
  // 4. MENU DANH MỤC TRÁI (HERO SIDEBAR)
  // ==========================================================================
  function renderHeroCategoryMenu() {
    const container = document.getElementById("heroCategorySidebar");
    if (!container) return;

    const categories = EcomStore.getCategories();
    container.innerHTML = categories.map(cat => `
      <a class="cat-menu-item" data-cat-id="${cat.cate_id}">
        <span><i class="bi ${cat.icon}"></i> ${cat.cate_name}</span>
        ${cat.tag ? `<span class="cat-tag">${cat.tag}</span>` : `<i class="bi bi-chevron-right" style="font-size:0.75rem"></i>`}
      </a>
    `).join("");

    container.querySelectorAll(".cat-menu-item").forEach(item => {
      item.addEventListener("click", function () {
        const catId = this.getAttribute("data-cat-id");
        UIState.selectedCategory = catId;
        renderCatalogProducts();
        scrollToCatalog();
      });
    });
  }

  // ==========================================================================
  // 5. KHỐI HOT SALE CUỐI TUẦN
  // ==========================================================================
  function renderHotSaleSection() {
    const container = document.getElementById("hotsaleProductGrid");
    if (!container) return;

    const hotProducts = EcomStore.getProducts().filter(p => p.is_hot_deal).slice(0, 4);

    container.innerHTML = hotProducts.map(p => {
      const discountPct = p.sale_price ? Math.round((1 - p.sale_price / p.product_listprice) * 100) : 0;
      return `
        <div class="product-card" data-id="${p.product_id}">
          <span class="product-discount-tag"><i class="bi bi-fire"></i> Giảm ${discountPct}%</span>
          <div class="product-thumb-wrapper">
            <img class="product-thumb" src="${p.product_photos_link}" alt="${p.product_name}">
          </div>
          <div class="product-info">
            <h3 class="product-title">${p.product_name}</h3>
            <span class="product-version-pill">${p.product_version || "Bản tiêu chuẩn"}</span>
            <div class="product-price-row">
              <span class="product-sale-price">${formatVND(p.sale_price || p.product_listprice)}</span>
              <span class="product-list-price">${formatVND(p.product_listprice)}</span>
            </div>
            <div class="smember-card-perk">
              <i class="bi bi-gem"></i> Smember giảm thêm đến ${p.smember_discount_pct || 1}%
            </div>
            <div class="product-rating-row">
              <span class="product-stars"><i class="bi bi-star-fill"></i> ${p.product_rating}</span>
              <span><i class="bi bi-geo-alt"></i> ${getStockStatusBrief(p.product_id)}</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    bindProductCardClicks(container);
  }

  // ==========================================================================
  // 6. DANH MỤC & LỌC SẢN PHẨM NÂNG CAO (CATALOG & FILTER)
  // ==========================================================================
  function renderCatalogProducts() {
    const container = document.getElementById("catalogProductGrid");
    const countEl = document.getElementById("catalogProductCount");
    if (!container) return;

    let list = [...EcomStore.getProducts()];

    // 1. Lọc theo Ngành hàng
    if (UIState.selectedCategory !== "ALL") {
      list = list.filter(p => p.category_id === UIState.selectedCategory);
    }

    // 2. Lọc theo Hãng
    if (UIState.selectedBrand !== "ALL") {
      list = list.filter(p => p.brand_id === UIState.selectedBrand);
    }

    // 3. Lọc theo Khoảng giá
    if (UIState.selectedPriceRange === "UNDER_5M") {
      list = list.filter(p => (p.sale_price || p.product_listprice) < 5000000);
    } else if (UIState.selectedPriceRange === "5M_10M") {
      list = list.filter(p => {
        const price = p.sale_price || p.product_listprice;
        return price >= 5000000 && price <= 10000000;
      });
    } else if (UIState.selectedPriceRange === "10M_20M") {
      list = list.filter(p => {
        const price = p.sale_price || p.product_listprice;
        return price >= 10000000 && price <= 20000000;
      });
    } else if (UIState.selectedPriceRange === "OVER_20M") {
      list = list.filter(p => (p.sale_price || p.product_listprice) > 20000000);
    }

    // 4. Lọc theo Tồn kho chi nhánh thành phố
    if (UIState.selectedCity !== "ALL") {
      list = list.filter(p => {
        const inv = EcomStore.getProductInventory(p.product_id, UIState.selectedCity);
        return inv.some(i => i.quantity > 0);
      });
    }

    // 5. Sắp xếp
    if (UIState.sortBy === "PRICE_ASC") {
      list.sort((a, b) => (a.sale_price || a.product_listprice) - (b.sale_price || b.product_listprice));
    } else if (UIState.sortBy === "PRICE_DESC") {
      list.sort((a, b) => (b.sale_price || b.product_listprice) - (a.sale_price || a.product_listprice));
    } else if (UIState.sortBy === "RATING_DESC") {
      list.sort((a, b) => b.product_rating - a.product_rating);
    }

    if (countEl) countEl.textContent = `(${list.length} sản phẩm)`;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="col-12 py-5 text-center">
          <i class="bi bi-inbox" style="font-size:3rem; color:var(--text-muted)"></i>
          <p class="mt-3 text-muted fw-bold">Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.</p>
          <button class="btn btn-outline-danger btn-sm" id="resetFiltersBtn">Xóa toàn bộ bộ lọc</button>
        </div>
      `;
      const resetBtn = document.getElementById("resetFiltersBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          UIState.selectedCategory = "ALL";
          UIState.selectedBrand = "ALL";
          UIState.selectedPriceRange = "ALL";
          UIState.selectedCity = "ALL";
          renderFilterBar();
          renderCatalogProducts();
        });
      }
      return;
    }

    container.innerHTML = list.map(p => {
      const discountPct = p.sale_price ? Math.round((1 - p.sale_price / p.product_listprice) * 100) : 0;
      const isComparing = UIState.compareList.includes(p.product_id);

      return `
        <div class="product-card" data-id="${p.product_id}">
          ${discountPct > 0 ? `<span class="product-discount-tag">-${discountPct}%</span>` : ""}
          <div class="product-compare-checkbox" onclick="event.stopPropagation()">
            <input type="checkbox" id="cmp_${p.product_id}" data-id="${p.product_id}" ${isComparing ? "checked" : ""}>
            <label for="cmp_${p.product_id}" style="cursor:pointer;font-size:0.75rem">So sánh</label>
          </div>
          <div class="product-thumb-wrapper">
            <img class="product-thumb" src="${p.product_photos_link}" alt="${p.product_name}">
          </div>
          <div class="product-info">
            <h3 class="product-title">${p.product_name}</h3>
            <span class="product-version-pill">${p.product_version || "Bản tiêu chuẩn"}</span>
            <div class="product-price-row">
              <span class="product-sale-price">${formatVND(p.sale_price || p.product_listprice)}</span>
              ${p.sale_price ? `<span class="product-list-price">${formatVND(p.product_listprice)}</span>` : ""}
            </div>
            <div class="smember-card-perk">
              <i class="bi bi-gem"></i> Smember giảm thêm đến ${p.smember_discount_pct || 1}%
            </div>
            <div class="product-rating-row">
              <span class="product-stars"><i class="bi bi-star-fill"></i> ${p.product_rating}</span>
              <span><i class="bi bi-geo-alt"></i> ${getStockStatusBrief(p.product_id)}</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    bindProductCardClicks(container);
    bindCompareCheckboxes(container);
  }

  function getStockStatusBrief(productId) {
    const inv = EcomStore.getProductInventory(productId, UIState.selectedCity);
    const hasStock = inv.some(i => i.quantity > 0);
    return hasStock ? "Còn hàng" : "Hết hàng";
  }

  function bindProductCardClicks(parent) {
    parent.querySelectorAll(".product-card").forEach(card => {
      card.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        openProductDetailModal(id);
      });
    });
  }

  function bindCompareCheckboxes(parent) {
    parent.querySelectorAll(".product-compare-checkbox input").forEach(chk => {
      chk.addEventListener("change", function () {
        const id = this.getAttribute("data-id");
        if (this.checked) {
          if (UIState.compareList.length >= 3) {
            this.checked = false;
            showToast("warning", "Chỉ có thể so sánh tối đa 3 sản phẩm cùng lúc!");
            return;
          }
          if (!UIState.compareList.includes(id)) {
            UIState.compareList.push(id);
          }
        } else {
          UIState.compareList = UIState.compareList.filter(item => item !== id);
        }
        updateCompareFloatingBar();
      });
    });
  }

  function updateCompareFloatingBar() {
    const bar = document.getElementById("compareFloatingBar");
    const countEl = document.getElementById("compareCount");
    if (!bar || !countEl) return;

    if (UIState.compareList.length > 0) {
      countEl.textContent = UIState.compareList.length;
      bar.classList.add("active");
    } else {
      bar.classList.remove("active");
    }
  }

  // ==========================================================================
  // 7. PRODUCT DETAIL MODAL (PDP) & TRA CỨU TỒN KHO 51 SHOWROOM
  // ==========================================================================
  function openProductDetailModal(productId) {
    const product = EcomStore.getProductById(productId);
    if (!product) return;

    UIState.currentPdpProduct = product;
    UIState.currentPdpVersion = product.product_version || (product.versions ? product.versions[0] : "Tiêu chuẩn");

    const modalEl = document.getElementById("productDetailModal");
    if (!modalEl) return;

    // Cập nhật thông tin tiêu đề, ảnh, giá
    document.getElementById("pdpTitle").textContent = product.product_name;
    document.getElementById("pdpImage").src = product.product_photos_link;
    document.getElementById("pdpDescription").textContent = product.product_description;
    document.getElementById("pdpSalePrice").textContent = formatVND(product.sale_price || product.product_listprice);
    document.getElementById("pdpListPrice").textContent = formatVND(product.product_listprice);
    document.getElementById("pdpRating").textContent = product.product_rating;
    document.getElementById("pdpReviewCount").textContent = product.review_count;

    // Render Version Pills
    const versionContainer = document.getElementById("pdpVersions");
    if (versionContainer) {
      const versions = product.versions || [product.product_version || "Tiêu chuẩn"];
      versionContainer.innerHTML = versions.map((v, i) => `
        <div class="version-pill ${v === UIState.currentPdpVersion ? "active" : ""}" data-version="${v}">
          ${v}
        </div>
      `).join("");

      versionContainer.querySelectorAll(".version-pill").forEach(pill => {
        pill.addEventListener("click", function () {
          versionContainer.querySelectorAll(".version-pill").forEach(p => p.classList.remove("active"));
          this.classList.add("active");
          UIState.currentPdpVersion = this.getAttribute("data-version");
        });
      });
    }

    // Render Logistics Specs Table
    const specsContainer = document.getElementById("pdpLogisticsSpecs");
    if (specsContainer) {
      specsContainer.innerHTML = `
        <tr><td><strong>Khối lượng</strong></td><td>${product.product_weight_g ? product.product_weight_g + " gram" : "227 gram"}</td></tr>
        <tr><td><strong>Kích thước</strong></td><td>${product.product_length_cm} x ${product.product_width_cm} x ${product.product_height_cm} cm</td></tr>
        <tr><td><strong>Trạng thái</strong></td><td><span class="badge bg-success">Hàng chính hãng New 100%</span></td></tr>
      `;
    }

    // Render Stock Checker (Mặc định lọc theo city hiện tại)
    renderPdpStockChecker(productId, UIState.selectedCity);

    // Render Reviews
    renderPdpReviews(productId);

    // Mở Bootstrap Modal
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }

  function renderPdpStockChecker(productId, city) {
    const listEl = document.getElementById("pdpStockList");
    if (!listEl) return;

    const inventory = EcomStore.getProductInventory(productId, city);
    if (inventory.length === 0) {
      listEl.innerHTML = `<div class="p-3 text-muted text-center" style="font-size:0.82rem">Không có showroom nào tại khu vực đã chọn</div>`;
      return;
    }

    listEl.innerHTML = inventory.map(item => `
      <div class="stock-item">
        <div>
          <div class="fw-bold">${item.sub_name}</div>
          <div class="text-muted" style="font-size:0.75rem">${item.sub_street}, ${item.sub_district}, ${item.sub_city} - Hotline: ${item.phone_number}</div>
        </div>
        <span class="${item.badgeClass}">${item.statusText}</span>
      </div>
    `).join("");
  }

  function renderPdpReviews(productId) {
    const listEl = document.getElementById("pdpReviewsList");
    if (!listEl) return;

    let reviews = EcomStore.getProductReviews(productId);

    // Lọc theo sắc thái cảm xúc nếu có
    if (UIState.reviewFilterSentiment !== "ALL") {
      reviews = reviews.filter(r => r.review_sentiment === UIState.reviewFilterSentiment);
    }

    if (reviews.length === 0) {
      listEl.innerHTML = `<div class="p-3 text-muted text-center" style="font-size:0.85rem">Chưa có đánh giá nào thuộc danh mục này. Hãy là người đầu tiên chia sẻ cảm nhận!</div>`;
      return;
    }

    listEl.innerHTML = reviews.map(r => {
      let sentimentBadge = "";
      if (r.review_sentiment === "Positive") {
        sentimentBadge = `<span class="sentiment-badge-pos"><i class="bi bi-emoji-smile"></i> Hài lòng</span>`;
      } else if (r.review_sentiment === "Neutral") {
        sentimentBadge = `<span class="sentiment-badge-neu"><i class="bi bi-emoji-neutral"></i> Trung tính</span>`;
      } else {
        sentimentBadge = `<span class="sentiment-badge-neg"><i class="bi bi-emoji-frown"></i> Cần cải thiện</span>`;
      }

      return `
        <div class="border-bottom py-3">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <div>
              <strong>${r.customer_name}</strong>
              <span class="badge bg-danger ms-2" style="font-size:0.65rem">${r.customer_rank || "Smember"}</span>
              ${sentimentBadge}
            </div>
            <div class="text-warning" style="font-size:0.8rem">
              ${Array(Math.floor(r.review_score)).fill('<i class="bi bi-star-fill"></i>').join("")}
              <span class="text-muted ms-1" style="font-size:0.75rem">(${r.review_score})</span>
            </div>
          </div>
          <div class="fw-bold mb-1" style="font-size:0.86rem">${r.review_title || ""}</div>
          <div class="text-muted" style="font-size:0.84rem; line-height:1.4">${r.review_message}</div>
          <div class="text-muted mt-1" style="font-size:0.72rem">${r.created_at}</div>

          ${r.has_reply && r.reply_content ? `
            <div class="cskh-reply-box">
              <strong><i class="bi bi-headset"></i> Phản hồi từ CSKH EcomFlow Store:</strong>
              <div>${r.reply_content}</div>
            </div>
          ` : ""}
        </div>
      `;
    }).join("");
  }

  // ==========================================================================
  // 8. SO SÁNH SẢN PHẨM (COMPARE MODAL)
  // ==========================================================================
  function openCompareModal() {
    if (UIState.compareList.length < 2) {
      showToast("warning", "Vui lòng chọn ít nhất 2 sản phẩm để so sánh!");
      return;
    }

    const modalEl = document.getElementById("compareModal");
    const tableBody = document.getElementById("compareTableBody");
    if (!modalEl || !tableBody) return;

    const products = UIState.compareList.map(id => EcomStore.getProductById(id)).filter(Boolean);

    tableBody.innerHTML = `
      <tr>
        <th style="width:160px">Hình ảnh & Tên</th>
        ${products.map(p => `
          <td class="text-center">
            <img src="${p.product_photos_link}" alt="${p.product_name}" style="height:120px; object-fit:contain" class="mb-2">
            <div class="fw-bold">${p.product_name}</div>
            <div class="text-muted" style="font-size:0.8rem">${p.product_version || ""}</div>
          </td>
        `).join("")}
      </tr>
      <tr>
        <th>Giá khuyến mãi</th>
        ${products.map(p => `<td class="text-danger fw-bold fs-5 text-center">${formatVND(p.sale_price || p.product_listprice)}</td>`).join("")}
      </tr>
      <tr>
        <th>Giá niêm yết</th>
        ${products.map(p => `<td class="text-muted text-decoration-line-through text-center">${formatVND(p.product_listprice)}</td>`).join("")}
      </tr>
      <tr>
        <th>Đánh giá sao</th>
        ${products.map(p => `<td class="text-center text-warning fw-bold"><i class="bi bi-star-fill"></i> ${p.product_rating} / 5.0 (${p.review_count} lượt)</td>`).join("")}
      </tr>
      <tr>
        <th>Khối lượng</th>
        ${products.map(p => `<td class="text-center">${p.product_weight_g || 220} gram</td>`).join("")}
      </tr>
      <tr>
        <th>Kích thước</th>
        ${products.map(p => `<td class="text-center">${p.product_length_cm} x ${p.product_width_cm} x ${p.product_height_cm} cm</td>`).join("")}
      </tr>
      <tr>
        <th>Hành động</th>
        ${products.map(p => `
          <td class="text-center">
            <button class="btn btn-danger btn-sm w-100" onclick="window.EcomApp.quickAddToCart('${p.product_id}')">
              <i class="bi bi-cart-plus"></i> Thêm vào giỏ
            </button>
          </td>
        `).join("")}
      </tr>
    `;

    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }

  // ==========================================================================
  // 9. QUẢN LÝ GIỎ HÀNG (CART OFFCANVAS)
  // ==========================================================================
  function openCartOffcanvas() {
    const offcanvasEl = document.getElementById("cartOffcanvas");
    if (!offcanvasEl) return;

    renderCartItems();

    const bsOffcanvas = new bootstrap.Offcanvas(offcanvasEl);
    bsOffcanvas.show();
  }

  function renderCartItems() {
    const cart = EcomStore.getCart();
    const container = document.getElementById("cartItemsList");
    const totalEl = document.getElementById("cartTotalAmount");
    const discountEl = document.getElementById("cartDiscountRow");
    const discountValEl = document.getElementById("cartDiscountValue");
    const grandTotalEl = document.getElementById("cartGrandTotal");
    const checkoutBtn = document.getElementById("cartCheckoutBtn");

    if (!container) return;

    if (!cart.items || cart.items.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-cart-x text-muted" style="font-size:3rem"></i>
          <p class="mt-3 text-muted fw-bold">Giỏ hàng của bạn đang trống</p>
          <button class="btn btn-danger btn-sm" data-bs-dismiss="offcanvas">Tiếp tục mua sắm</button>
        </div>
      `;
      if (totalEl) totalEl.textContent = "0 VND";
      if (grandTotalEl) grandTotalEl.textContent = "0 VND";
      if (discountEl) discountEl.style.display = "none";
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;

    container.innerHTML = cart.items.map(item => `
      <div class="d-flex align-items-center gap-3 py-3 border-bottom">
        <img src="${item.product_photos_link}" alt="${item.product_name}" style="width:60px; height:60px; object-fit:cover; border-radius:8px">
        <div class="flex-grow-1">
          <div class="fw-bold text-dark" style="font-size:0.88rem; line-height:1.2">${item.product_name}</div>
          <div class="text-muted" style="font-size:0.75rem">${item.product_version}</div>
          <div class="text-danger fw-bold mt-1" style="font-size:0.86rem">${formatVND(item.sale_price)}</div>
          
          <div class="d-flex align-items-center gap-2 mt-2">
            <div class="btn-group btn-group-sm" role="group">
              <button class="btn btn-outline-secondary" onclick="window.EcomApp.updateQty('${item.product_id}', '${item.product_version}', ${item.quantity - 1})">-</button>
              <button class="btn btn-outline-secondary" disabled style="color:#000; font-weight:700">${item.quantity}</button>
              <button class="btn btn-outline-secondary" onclick="window.EcomApp.updateQty('${item.product_id}', '${item.product_version}', ${item.quantity + 1})">+</button>
            </div>
            <button class="btn btn-link text-muted p-0 ms-auto" style="font-size:0.8rem" onclick="window.EcomApp.removeItem('${item.product_id}', '${item.product_version}')">
              <i class="bi bi-trash"></i> Xóa
            </button>
          </div>
        </div>
      </div>
    `).join("");

    if (totalEl) totalEl.textContent = formatVND(cart.total_amount);

    // Tính toán voucher
    let discount = 0;
    if (cart.applied_voucher) {
      discount = Math.round(cart.total_amount * (cart.applied_voucher.discount_value || 0));
      if (discountEl) discountEl.style.display = "flex";
      if (discountValEl) discountValEl.textContent = `-${formatVND(discount)}`;
      
      const badgeVoucher = document.getElementById("appliedVoucherBadge");
      if (badgeVoucher) {
        badgeVoucher.innerHTML = `Mã: <strong>${cart.applied_voucher.code}</strong> <i class="bi bi-x-circle ms-1 cursor-pointer" onclick="window.EcomApp.removeVoucher()"></i>`;
      }
    } else {
      if (discountEl) discountEl.style.display = "none";
    }

    const grand = Math.max(0, cart.total_amount - discount);
    if (grandTotalEl) grandTotalEl.textContent = formatVND(grand);
  }

  // ==========================================================================
  // 10. THANH TOÁN (CHECKOUT MODAL)
  // ==========================================================================
  function openCheckoutModal() {
    const cart = EcomStore.getCart();
    if (!cart.items || cart.items.length === 0) {
      showToast("warning", "Giỏ hàng đang trống!");
      return;
    }

    // Đóng offcanvas giỏ hàng nếu đang mở
    const offcanvasEl = document.getElementById("cartOffcanvas");
    if (offcanvasEl) {
      const bsOff = bootstrap.Offcanvas.getInstance(offcanvasEl);
      if (bsOff) bsOff.hide();
    }

    const modalEl = document.getElementById("checkoutModal");
    if (!modalEl) return;

    const customer = EcomStore.getCurrentCustomer();
    if (customer) {
      document.getElementById("checkoutFullName").value = customer.first_name + " " + customer.last_name;
      document.getElementById("checkoutPhone").value = customer.phone_number;
      document.getElementById("checkoutCity").value = customer.city || "TP. Hồ Chí Minh";
      document.getElementById("checkoutDistrict").value = customer.district || "Quận 1";
      document.getElementById("checkoutStreet").value = "Số 15 Lê Duẩn";
    }

    // Tính tổng tiền checkout
    const voucher = cart.applied_voucher;
    const discount = voucher ? Math.round(cart.total_amount * (voucher.discount_value || 0)) : 0;
    const isFreeShip = (cart.total_amount >= 5000000) || (voucher && voucher.free_shipping) || (customer && customer.customer_rank === "DIAMOND");
    const shipFee = isFreeShip ? 0 : 35000;
    const grand = Math.max(0, cart.total_amount - discount) + shipFee;

    document.getElementById("checkoutSummaryTotal").textContent = formatVND(cart.total_amount);
    document.getElementById("checkoutSummaryDiscount").textContent = `-${formatVND(discount)}`;
    document.getElementById("checkoutSummaryShip").textContent = shipFee === 0 ? "Miễn phí" : formatVND(shipFee);
    document.getElementById("checkoutSummaryGrand").textContent = formatVND(grand);

    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }

  // ==========================================================================
  // 11. TRA CỨU & THEO DÕI ĐƠN HÀNG (ORDER TRACKING MODAL)
  // ==========================================================================
  function openOrderTrackingModal() {
    const modalEl = document.getElementById("orderTrackingModal");
    if (!modalEl) return;

    renderOrderList();

    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }

  function renderOrderList() {
    const container = document.getElementById("orderTrackingList");
    if (!container) return;

    const orders = EcomStore.getOrders();
    if (orders.length === 0) {
      container.innerHTML = `<div class="p-5 text-center text-muted fw-bold">Bạn chưa có đơn hàng nào tại EcomFlow Store.</div>`;
      return;
    }

    container.innerHTML = orders.map(o => {
      // Xác định bước tiến trình (0: PENDING, 1: CONFIRMED, 2: SHIPPED, 3: DELIVERED, -1: CANCELLED)
      let stepIndex = 0;
      let statusColor = "warning";
      let statusText = "Chờ xác nhận";

      if (o.order_status === "CONFIRMED") {
        stepIndex = 1;
        statusColor = "info";
        statusText = "Đã xác nhận";
      } else if (o.order_status === "SHIPPED") {
        stepIndex = 2;
        statusColor = "primary";
        statusText = "Đang vận chuyển";
      } else if (o.order_status === "DELIVERED") {
        stepIndex = 3;
        statusColor = "success";
        statusText = "Giao hàng thành công";
      } else if (o.order_status === "CANCELLED") {
        stepIndex = -1;
        statusColor = "danger";
        statusText = "Đã hủy đơn";
      }

      return `
        <div class="order-tracking-card mb-4">
          <div class="order-tracking-header">
            <div>
              <span class="fw-bold fs-6">Mã đơn: <span class="text-danger">${o.order_id}</span></span>
              <span class="badge bg-${statusColor} ms-2">${statusText}</span>
              <span class="text-muted ms-3" style="font-size:0.8rem"><i class="bi bi-clock"></i> ${o.created_at}</span>
            </div>
            <div>
              <span class="text-muted" style="font-size:0.82rem">Tổng thanh toán: </span>
              <span class="fw-bold text-danger fs-6">${formatVND(o.grand_total || (o.total_amount + o.total_shipfee))}</span>
            </div>
          </div>

          <!-- 5-Stage Stepper -->
          ${o.order_status !== "CANCELLED" ? `
            <div class="timeline-stepper">
              <div class="timeline-step ${stepIndex >= 0 ? "active" : ""} ${stepIndex > 0 ? "completed" : ""}">
                <div class="timeline-icon"><i class="bi bi-receipt"></i></div>
                <div class="timeline-label">Chờ duyệt</div>
              </div>
              <div class="timeline-step ${stepIndex >= 1 ? "active" : ""} ${stepIndex > 1 ? "completed" : ""}">
                <div class="timeline-icon"><i class="bi bi-check-circle"></i></div>
                <div class="timeline-label">Đã xác nhận</div>
              </div>
              <div class="timeline-step ${stepIndex >= 2 ? "active" : ""} ${stepIndex > 2 ? "completed" : ""}">
                <div class="timeline-icon"><i class="bi bi-truck"></i></div>
                <div class="timeline-label">Đang giao</div>
              </div>
              <div class="timeline-step ${stepIndex >= 3 ? "active" : ""} ${stepIndex >= 3 ? "completed" : ""}">
                <div class="timeline-icon"><i class="bi bi-box2-heart"></i></div>
                <div class="timeline-label">Đã nhận hàng</div>
              </div>
            </div>
          ` : `
            <div class="alert alert-danger py-2" style="font-size:0.85rem">
              <i class="bi bi-x-circle-fill"></i> Đơn hàng đã bị hủy vào ngày ${o.cancel_date || "N/A"}.
            </div>
          `}

          <!-- Danh sách sản phẩm trong đơn -->
          <div class="bg-light p-3 rounded-3 mb-3">
            ${o.items.map(it => `
              <div class="d-flex align-items-center gap-3 py-2 border-bottom">
                <img src="${it.product_photos_link || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100'}" alt="${it.product_name}" style="width:48px;height:48px;object-fit:cover;border-radius:6px">
                <div class="flex-grow-1">
                  <div class="fw-bold" style="font-size:0.85rem">${it.product_name}</div>
                  <div class="text-muted" style="font-size:0.75rem">Phiên bản: ${it.product_version || "Tiêu chuẩn"} | Xuất kho: ${it.subsidiary_name || "Kho trung tâm"}</div>
                </div>
                <div class="text-end">
                  <div class="fw-bold text-danger" style="font-size:0.85rem">${formatVND(it.sale_price)} x ${it.quantity}</div>
                </div>
              </div>
            `).join("")}
            <div class="d-flex justify-content-between align-items-center pt-2" style="font-size:0.82rem">
              <div><i class="bi bi-credit-card"></i> PT Thanh toán: <strong>${o.payment ? o.payment.payment_method : "COD"}</strong> (${o.payment ? o.payment.payment_status : "PENDING"})</div>
              <div><i class="bi bi-geo-alt"></i> Nơi nhận: <strong>${o.target_street}, ${o.target_district}, ${o.target_city}</strong></div>
            </div>
          </div>

          <!-- Demo Controller Bar -->
          <div class="demo-control-bar">
            <div>
              <strong><i class="bi bi-lightning-charge-fill text-warning"></i> Chế độ thuyết trình:</strong>
              ${o.order_status !== "DELIVERED" && o.order_status !== "CANCELLED" 
                ? `Nhấn nút bên phải để mô phỏng chuyển trạng thái đơn hàng thời gian thực.` 
                : `Đơn đã giao hoàn tất, bạn có thể gửi đánh giá cho sản phẩm.`}
            </div>
            <div class="d-flex gap-2">
              ${o.order_status !== "DELIVERED" && o.order_status !== "CANCELLED" ? `
                <button class="btn btn-warning btn-sm fw-bold" onclick="window.EcomApp.advanceOrder('${o.order_id}')">
                  ⚡ Chuyển trạng thái tiếp theo
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="window.EcomApp.cancelOrder('${o.order_id}')">
                  Hủy đơn
                </button>
              ` : ""}
              ${o.order_status === "DELIVERED" ? `
                <button class="btn btn-danger btn-sm fw-bold" onclick="window.EcomApp.reviewDeliveredOrder('${o.items[0].product_id}', '${o.order_id}')">
                  <i class="bi bi-star"></i> Viết đánh giá ngay
                </button>
              ` : ""}
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // ==========================================================================
  // 12. CÁC TIỆN ÍCH EVENT LISTENER & BỘ LỌC
  // ==========================================================================
  function setupEventListeners() {
    // 1. Nút mở giỏ hàng
    const cartBtn = document.getElementById("headerCartBtn");
    if (cartBtn) cartBtn.addEventListener("click", openCartOffcanvas);

    // 2. Nút mở tra cứu đơn hàng
    const trackingBtn = document.getElementById("headerTrackingBtn");
    if (trackingBtn) trackingBtn.addEventListener("click", openOrderTrackingModal);

    // 3. Nút mở modal vị trí thành phố
    const locationBtn = document.getElementById("headerLocationBtn");
    if (locationBtn) {
      locationBtn.addEventListener("click", () => {
        const modalEl = document.getElementById("locationModal");
        if (modalEl) new bootstrap.Modal(modalEl).show();
      });
    }

    // Chọn thành phố trong Location Modal
    document.querySelectorAll(".city-choice-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const city = this.getAttribute("data-city");
        UIState.selectedCity = city;
        initHeader();
        renderCatalogProducts();
        const modalEl = document.getElementById("locationModal");
        if (modalEl) {
          const bsM = bootstrap.Modal.getInstance(modalEl);
          if (bsM) bsM.hide();
        }
        showToast("info", `Đã chuyển khu vực xem giá & tồn kho sang: ${city === "ALL" ? "Toàn quốc" : city}`);
      });
    });

    // 4. Lọc theo hãng (Brand filter pills)
    document.querySelectorAll(".brand-pill").forEach(pill => {
      pill.addEventListener("click", function () {
        document.querySelectorAll(".brand-pill").forEach(p => p.classList.remove("active"));
        this.classList.add("active");
        UIState.selectedBrand = this.getAttribute("data-brand");
        renderCatalogProducts();
      });
    });

    // 5. Lọc theo khoảng giá
    document.querySelectorAll(".filter-price-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".filter-price-btn").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        UIState.selectedPriceRange = this.getAttribute("data-price");
        renderCatalogProducts();
      });
    });

    // 6. Sắp xếp sản phẩm
    const sortSelect = document.getElementById("catalogSortSelect");
    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        UIState.sortBy = this.value;
        renderCatalogProducts();
      });
    }

    // 7. Thêm vào giỏ từ PDP Modal
    const pdpAddCartBtn = document.getElementById("pdpAddToCartBtn");
    if (pdpAddCartBtn) {
      pdpAddCartBtn.addEventListener("click", function () {
        if (!UIState.currentPdpProduct) return;
        EcomStore.addToCart(UIState.currentPdpProduct.product_id, UIState.currentPdpVersion, 1);
        updateCartBadge();
        showToast("success", `Đã thêm "${UIState.currentPdpProduct.product_name}" vào giỏ hàng!`);
      });
    }

    // 8. Mua ngay từ PDP Modal
    const pdpBuyNowBtn = document.getElementById("pdpBuyNowBtn");
    if (pdpBuyNowBtn) {
      pdpBuyNowBtn.addEventListener("click", function () {
        if (!UIState.currentPdpProduct) return;
        EcomStore.addToCart(UIState.currentPdpProduct.product_id, UIState.currentPdpVersion, 1);
        updateCartBadge();
        const modalEl = document.getElementById("productDetailModal");
        if (modalEl) {
          const bsM = bootstrap.Modal.getInstance(modalEl);
          if (bsM) bsM.hide();
        }
        openCheckoutModal();
      });
    }

    // 9. Lọc thành phố tồn kho trong PDP Modal
    const pdpCitySelect = document.getElementById("pdpStockCitySelect");
    if (pdpCitySelect) {
      pdpCitySelect.addEventListener("change", function () {
        if (UIState.currentPdpProduct) {
          renderPdpStockChecker(UIState.currentPdpProduct.product_id, this.value);
        }
      });
    }

    // 10. Gửi đánh giá mới từ PDP Modal
    const reviewForm = document.getElementById("pdpReviewForm");
    if (reviewForm) {
      reviewForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!UIState.currentPdpProduct) return;

        const score = document.getElementById("reviewScoreSelect").value;
        const title = document.getElementById("reviewTitleInput").value.trim();
        const message = document.getElementById("reviewMessageInput").value.trim();

        if (!message) {
          showToast("warning", "Vui lòng nhập nội dung đánh giá!");
          return;
        }

        const res = EcomStore.addReview({
          productId: UIState.currentPdpProduct.product_id,
          score: score,
          title: title,
          message: message
        });

        if (res.success) {
          showToast("success", "Cảm ơn bạn! Đánh giá đã được ghi nhận và phân tích sắc thái thành công.");
          reviewForm.reset();
          renderPdpReviews(UIState.currentPdpProduct.product_id);
          document.getElementById("pdpRating").textContent = res.newRating;
          renderCatalogProducts();
          renderHotSaleSection();
        }
      });
    }

    // 11. Áp dụng mã giảm giá trong giỏ hàng
    const applyVoucherBtn = document.getElementById("applyVoucherBtn");
    if (applyVoucherBtn) {
      applyVoucherBtn.addEventListener("click", function () {
        const input = document.getElementById("voucherInput");
        if (!input) return;
        const res = EcomStore.applyVoucher(input.value);
        if (res.success) {
          showToast("success", res.message);
          renderCartItems();
        } else {
          showToast("warning", res.message);
        }
      });
    }

    // Quick Voucher Chips click
    document.querySelectorAll(".voucher-chip").forEach(chip => {
      chip.addEventListener("click", function () {
        const code = this.getAttribute("data-code");
        const res = EcomStore.applyVoucher(code);
        if (res.success) {
          showToast("success", res.message);
          renderCartItems();
        } else {
          showToast("warning", res.message);
        }
      });
    });

    // 12. Xác nhận đặt hàng
    const checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const payload = {
          fullName: document.getElementById("checkoutFullName").value.trim(),
          phone: document.getElementById("checkoutPhone").value.trim(),
          targetCity: document.getElementById("checkoutCity").value,
          targetDistrict: document.getElementById("checkoutDistrict").value.trim(),
          targetStreet: document.getElementById("checkoutStreet").value.trim(),
          paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
        };

        const res = EcomStore.createOrder(payload);
        if (res.success) {
          const checkoutModalEl = document.getElementById("checkoutModal");
          if (checkoutModalEl) {
            const bsM = bootstrap.Modal.getInstance(checkoutModalEl);
            if (bsM) bsM.hide();
          }

          updateCartBadge();

          // Mở modal hóa đơn xác nhận đặt hàng thành công
          showOrderSuccessModal(res.order);
        } else {
          showToast("danger", res.message);
        }
      });
    }

    // 13. Nút so sánh floating bar
    const openCompareBtn = document.getElementById("openCompareBtn");
    if (openCompareBtn) openCompareBtn.addEventListener("click", openCompareModal);

    const clearCompareBtn = document.getElementById("clearCompareBtn");
    if (clearCompareBtn) {
      clearCompareBtn.addEventListener("click", () => {
        UIState.compareList = [];
        updateCompareFloatingBar();
        renderCatalogProducts();
      });
    }

    // 14. Nút Khôi phục dữ liệu gốc
    const resetStoreBtn = document.getElementById("resetStoreBtn");
    if (resetStoreBtn) {
      resetStoreBtn.addEventListener("click", function () {
        if (confirm("Bạn có chắc chắn muốn khôi phục toàn bộ dữ liệu mẫu ban đầu? Mọi đơn hàng mới và giỏ hàng sẽ được đặt lại.")) {
          EcomStore.resetToDefault();
          updateCartBadge();
          renderHotSaleSection();
          renderCatalogProducts();
          showToast("info", "Đã khôi phục dữ liệu gốc EcomFlow thành công!");
        }
      });
    }
  }

  function showOrderSuccessModal(order) {
    const modalEl = document.getElementById("orderSuccessModal");
    if (!modalEl) return;

    document.getElementById("successOrderId").textContent = order.order_id;
    document.getElementById("successGrandTotal").textContent = formatVND(order.grand_total);
    document.getElementById("successPaymentMethod").textContent = order.payment.payment_method;
    document.getElementById("successAddress").textContent = `${order.target_street}, ${order.target_district}, ${order.target_city}`;

    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }

  function scrollToCatalog() {
    const el = document.getElementById("catalogSection");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  // ==========================================================================
  // 13. EXPORT RA WINDOW ĐỂ GỌI TỪ INLINE ONCLICK HANDLERS
  // ==========================================================================
  window.EcomApp = {
    updateQty: function (productId, version, newQty) {
      EcomStore.updateCartItemQty(productId, version, newQty);
      updateCartBadge();
      renderCartItems();
    },

    removeItem: function (productId, version) {
      EcomStore.removeFromCart(productId, version);
      updateCartBadge();
      renderCartItems();
      showToast("info", "Đã xóa sản phẩm khỏi giỏ hàng.");
    },

    removeVoucher: function () {
      EcomStore.removeVoucher();
      renderCartItems();
      showToast("info", "Đã gỡ bỏ mã giảm giá.");
    },

    quickAddToCart: function (productId) {
      const p = EcomStore.getProductById(productId);
      if (p) {
        EcomStore.addToCart(productId, p.product_version, 1);
        updateCartBadge();
        showToast("success", `Đã thêm "${p.product_name}" vào giỏ hàng!`);
      }
    },

    advanceOrder: function (orderId) {
      const res = EcomStore.advanceOrderStatus(orderId);
      if (res.success) {
        showToast("success", `Đơn hàng ${orderId} đã chuyển sang trạng thái: ${res.order.order_status}`);
        renderOrderList();
      } else {
        showToast("warning", res.message);
      }
    },

    cancelOrder: function (orderId) {
      if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${orderId}?`)) {
        const res = EcomStore.cancelOrder(orderId);
        if (res.success) {
          showToast("info", `Đơn hàng ${orderId} đã được hủy.`);
          renderOrderList();
        } else {
          showToast("warning", res.message);
        }
      }
    },

    reviewDeliveredOrder: function (productId, orderId) {
      const trackingModalEl = document.getElementById("orderTrackingModal");
      if (trackingModalEl) {
        const bsM = bootstrap.Modal.getInstance(trackingModalEl);
        if (bsM) bsM.hide();
      }
      openProductDetailModal(productId);
      setTimeout(() => {
        const reviewForm = document.getElementById("pdpReviewForm");
        if (reviewForm) reviewForm.scrollIntoView({ behavior: "smooth" });
      }, 500);
    },

    openCheckout: openCheckoutModal
  };

  // Helper định dạng tiền tệ VND
  function formatVND(num) {
    if (num == null) return "0 VND";
    return num.toLocaleString("vi-VN") + " VND";
  }

  // Toast Notification System
  function showToast(type, message) {
    const toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) return;

    const toastId = "toast_" + Date.now();
    let bgClass = "bg-primary";
    let icon = "bi-info-circle";

    if (type === "success") {
      bgClass = "bg-success";
      icon = "bi-check-circle";
    } else if (type === "warning") {
      bgClass = "bg-warning text-dark";
      icon = "bi-exclamation-triangle";
    } else if (type === "danger") {
      bgClass = "bg-danger";
      icon = "bi-x-circle";
    }

    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi ${icon} fs-5"></i>
            <span>${message}</span>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;

    toastContainer.insertAdjacentHTML("beforeend", toastHtml);
    const toastEl = document.getElementById(toastId);
    if (toastEl) {
      const bsToast = new bootstrap.Toast(toastEl, { delay: 3500 });
      bsToast.show();
      toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
    }
  }
});
