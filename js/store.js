/**
 * EcomFlow Store - State & Storage Engine
 * Quản lý trạng thái phiên làm việc (Session & Local Storage)
 * Đảm bảo dữ liệu giỏ hàng, đặt hàng, cập nhật trạng thái đơn, và đánh giá
 * hoạt động mượt mà giữa các trang HTML mà không cần backend hay database.
 */

const EcomStore = (function () {
  const SESSION_KEY = "ECOMFLOW_STORE_SESSION_V3";

  // Khởi tạo trạng thái ban đầu từ Mock Data
  function getInitialState() {
    const rawMock = (typeof window !== "undefined" && window.EcomStoreMockData) 
      ? window.EcomStoreMockData 
      : (typeof EcomStoreMockData !== "undefined" ? EcomStoreMockData : {});
    
    // Deep clone để không làm biến dạng dữ liệu gốc
    const cloned = JSON.parse(JSON.stringify(rawMock));

    if (!cloned.cart) {
      cloned.cart = {
        cart_id: "CART_USER_01",
        acc_id: "ACC00001001",
        cart_status: "ACTIVE",
        total_items: 0,
        total_amount: 0,
        applied_voucher: null,
        items: []
      };
    }

    if (!cloned.selectedCity) cloned.selectedCity = "ALL";
    if (!cloned.selectedBranchId) cloned.selectedBranchId = "SB001"; // Flagship Nguyễn Huệ

    return cloned;
  }

  // Tải trạng thái từ sessionStorage (hoặc fallback localStorage)
  function loadState() {
    try {
      if (typeof window !== "undefined") {
        let serialized = sessionStorage.getItem(SESSION_KEY);
        if (!serialized) {
          serialized = localStorage.getItem(SESSION_KEY);
        }
        if (serialized) {
          const parsed = JSON.parse(serialized);
          // Đảm bảo có danh sách orders và cart
          if (parsed && parsed.products && parsed.products.length > 0) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn("Lỗi khi đọc storage, dùng dữ liệu khởi tạo ban đầu:", e);
    }
    const freshState = getInitialState();
    saveState(freshState);
    return freshState;
  }

  // Lưu trạng thái
  function saveState(state) {
    try {
      if (typeof window !== "undefined") {
        const serialized = JSON.stringify(state);
        sessionStorage.setItem(SESSION_KEY, serialized);
        localStorage.setItem(SESSION_KEY, serialized);
      }
    } catch (e) {
      console.error("Lỗi khi ghi storage:", e);
    }
  }

  let appState = loadState();

  function recalculateCart() {
    let count = 0;
    let sum = 0;
    appState.cart.items.forEach(item => {
      const sPrice = item.sale_price || item.unit_price || 0;
      item.sale_price = sPrice;
      item.unit_price = sPrice;
      item.item_total_amount = sPrice * item.quantity;
      item.item_total = item.item_total_amount;
      item.product_photo = item.product_photo || item.product_photos_link;
      item.product_photos_link = item.product_photo;
      count += item.quantity;
      sum += item.item_total_amount;
    });
    appState.cart.total_items = count;
    appState.cart.total_amount = sum;

    if (appState.cart.applied_voucher) {
      if (sum < appState.cart.applied_voucher.min_ordervalue) {
        appState.cart.applied_voucher = null;
        appState.cart.voucher_discount = 0;
      } else {
        const v = appState.cart.applied_voucher;
        const discountRate = v.discount_value <= 1 ? v.discount_value : (v.discount_value / 100);
        appState.cart.voucher_discount = Math.round(sum * discountRate);
      }
    } else {
      appState.cart.voucher_discount = 0;
    }
    saveState(appState);
  }

  return {
    getState: function () {
      return appState;
    },

    resetToDefault: function () {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_KEY);
      }
      appState = getInitialState();
      saveState(appState);
      return appState;
    },

    // 1. Khách hàng
    getCurrentCustomer: function () {
      return appState.customers && appState.customers.length > 0 ? appState.customers[0] : null;
    },

    // 2. Chi nhánh & Khu vực
    getCities: function () {
      return ["Toàn quốc", "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hải Phòng"];
    },

    getSelectedCity: function () {
      return appState.selectedCity || "ALL";
    },

    setSelectedCity: function (city) {
      appState.selectedCity = city;
      saveState(appState);
      return city;
    },

    getSubsidiaries: function () {
      return appState.subsidiaries || [];
    },

    getSubsidiariesByCity: function (city) {
      const all = appState.subsidiaries || [];
      if (!city || city === "ALL" || city === "Toàn quốc") return all;
      return all.filter(s => s.sub_city === city);
    },

    getSelectedBranch: function () {
      const subId = appState.selectedBranchId || "SB001";
      return (appState.subsidiaries || []).find(s => s.sub_id === subId) || appState.subsidiaries[0];
    },

    setSelectedBranch: function (branchId) {
      appState.selectedBranchId = branchId;
      const b = (appState.subsidiaries || []).find(s => s.sub_id === branchId);
      if (b) appState.selectedCity = b.sub_city;
      saveState(appState);
      return b;
    },

    // 3. Danh mục, Thương hiệu & Sản phẩm
    getCategories: function () {
      return appState.categories || [];
    },

    getBrands: function () {
      return appState.brands || [];
    },

    getProducts: function () {
      return appState.products || [];
    },

    getProductById: function (productId) {
      return (appState.products || []).find(p => p.product_id === productId) || null;
    },

    // 4. Tra cứu Tồn kho
    getProductInventory: function (productId, filterCity) {
      const stockRecords = (appState.sub_products || []).filter(sp => sp.product_id === productId);
      const subsidiaries = appState.subsidiaries || [];

      const result = subsidiaries.map(sub => {
        const found = stockRecords.find(sp => sp.subsidiary_id === sub.sub_id);
        const qty = found ? found.quantity : 0;
        let status = "OUT_OF_STOCK";
        let statusText = "Tạm hết hàng";
        let badgeClass = "badge-out-of-stock";

        if (qty >= 5) {
          status = "IN_STOCK";
          statusText = `Còn hàng (${qty} máy)`;
          badgeClass = "badge-in-stock";
        } else if (qty > 0) {
          status = "LOW_STOCK";
          statusText = `Sắp hết (${qty} máy)`;
          badgeClass = "badge-low-stock";
        }

        return {
          subsidiary_id: sub.sub_id,
          sub_name: sub.sub_name,
          sub_city: sub.sub_city,
          sub_district: sub.sub_district,
          sub_street: sub.sub_street,
          phone_number: sub.phone_number,
          quantity: qty,
          status: status,
          statusText: statusText,
          badgeClass: badgeClass
        };
      });

      if (filterCity && filterCity !== "ALL" && filterCity !== "Toàn quốc") {
        return result.filter(item => item.sub_city === filterCity);
      }
      return result;
    },

    // 5. Giỏ hàng
    getCart: function () {
      return appState.cart;
    },

    addToCart: function (productOrId, selectedVersion, quantity = 1, selectedColor = null) {
      const productId = (typeof productOrId === "object" && productOrId) ? productOrId.product_id : productOrId;
      const product = this.getProductById(productId);
      if (!product) return { success: false, message: "Sản phẩm không tồn tại" };

      const version = selectedVersion || product.product_version || "Tiêu chuẩn";
      const color = selectedColor || (product.colors ? product.colors[0] : "");
      
      const existingItem = appState.cart.items.find(
        item => item.product_id === productId && item.product_version === version && (color ? item.color === color : true)
      );

      const sPrice = product.sale_price || product.product_listprice;

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        const nextSeq = appState.cart.items.length + 1;
        appState.cart.items.push({
          item_sequence: nextSeq,
          product_id: product.product_id,
          product_name: product.product_name,
          product_version: version,
          color: color,
          product_photo: product.product_photos_link,
          product_photos_link: product.product_photos_link,
          list_price: product.product_listprice,
          unit_price: sPrice,
          sale_price: sPrice,
          quantity: quantity,
          item_total: sPrice * quantity,
          item_total_amount: sPrice * quantity,
          product_weight_g: product.product_weight_g || 200
        });
      }

      recalculateCart();
      return { success: true, cart: appState.cart };
    },

    updateCartItemQty: function (productId, version, colorOrQty, maybeQty) {
      let color = null;
      let newQty = colorOrQty;
      if (typeof maybeQty === "number") {
        color = colorOrQty;
        newQty = maybeQty;
      }

      const idx = appState.cart.items.findIndex(
        item => item.product_id === productId && item.product_version === version && (color ? item.color === color : true)
      );
      if (idx !== -1) {
        if (newQty <= 0) {
          appState.cart.items.splice(idx, 1);
        } else {
          appState.cart.items[idx].quantity = newQty;
        }
        recalculateCart();
      }
      return appState.cart;
    },

    removeFromCart: function (productId, version, color) {
      appState.cart.items = appState.cart.items.filter(
        item => !(item.product_id === productId && (!version || item.product_version === version) && (color ? item.color === color : true))
      );
      recalculateCart();
      return appState.cart;
    },

    clearCart: function () {
      appState.cart.items = [];
      appState.cart.applied_voucher = null;
      recalculateCart();
      return appState.cart;
    },

    // 6. Voucher
    getVouchers: function () {
      return appState.program_sales || [];
    },

    applyVoucher: function (voucherCode) {
      if (!voucherCode) {
        appState.cart.applied_voucher = null;
        recalculateCart();
        return { success: false, message: "Vui lòng nhập mã giảm giá" };
      }

      const codeUpper = voucherCode.trim().toUpperCase();
      const voucher = (appState.program_sales || []).find(v => v.code === codeUpper);

      if (!voucher) {
        return { success: false, message: "Mã giảm giá không tồn tại hoặc đã hết hạn" };
      }

      const total = appState.cart.total_amount;
      if (total < voucher.min_ordervalue) {
        const diff = voucher.min_ordervalue - total;
        return {
          success: false,
          message: `Mã ${voucher.code} yêu cầu đơn tối thiểu ${voucher.min_ordervalue.toLocaleString("vi-VN")}đ (Cần mua thêm ${diff.toLocaleString("vi-VN")}đ)`
        };
      }

      appState.cart.applied_voucher = voucher;
      recalculateCart();
      saveState(appState);

      const discountAmount = Math.round(total * (voucher.discount_value || 0));
      return {
        success: true,
        message: `Áp dụng thành công mã ${voucher.code}: Giảm ${discountAmount.toLocaleString("vi-VN")}đ!`,
        voucher: voucher,
        discountAmount: discountAmount
      };
    },

    removeVoucher: function () {
      appState.cart.applied_voucher = null;
      saveState(appState);
      return { success: true };
    },

    // 7. Tạo Đơn hàng
    createOrder: function (orderPayload) {
      if (!appState.cart.items || appState.cart.items.length === 0) {
        return { success: false, message: "Giỏ hàng của bạn đang trống" };
      }

      const customer = this.getCurrentCustomer();
      const orderNum = (appState.orders.length + 1).toString().padStart(6, "0");
      const orderId = "OD" + orderNum;
      const paymentId = "PAY" + orderNum;

      const rawTotal = appState.cart.total_amount;
      const voucher = appState.cart.applied_voucher;
      const discount = voucher ? Math.round(rawTotal * (voucher.discount_value || 0)) : 0;
      const discountedAmount = Math.max(0, rawTotal - discount);

      let isFreeShip = (rawTotal >= 5000000) || (voucher && voucher.free_shipping) || (customer && customer.customer_rank === "DIAMOND");
      let shipFee = isFreeShip ? 0 : 35000;
      const grandTotal = discountedAmount + shipFee;

      const orderItems = appState.cart.items.map((it, idx) => {
        const invList = this.getProductInventory(it.product_id, orderPayload.targetCity);
        const availableSub = invList.find(s => s.quantity >= it.quantity) || invList[0];
        const assignedSubId = availableSub ? availableSub.subsidiary_id : "SB001";
        const assignedSubName = availableSub ? availableSub.sub_name : "EcomFlow Flagship Nguyễn Huệ";

        // Trừ kho ảo
        const spIdx = (appState.sub_products || []).findIndex(
          sp => sp.subsidiary_id === assignedSubId && sp.product_id === it.product_id
        );
        if (spIdx !== -1) {
          appState.sub_products[spIdx].quantity = Math.max(0, appState.sub_products[spIdx].quantity - it.quantity);
        }

        return {
          order_item_id: idx + 1,
          product_id: it.product_id,
          product_name: it.product_name,
          product_version: it.product_version,
          color: it.color || "",
          product_photos_link: it.product_photos_link,
          subsidiary_id: assignedSubId,
          subsidiary_name: assignedSubName,
          quantity: it.quantity,
          list_price: it.list_price,
          discount_rate: voucher ? voucher.discount_value : 0,
          sale_price: it.sale_price,
          total_price: it.item_total_amount,
          shipping_fee: shipFee
        };
      });

      const now = new Date();
      const nowStr = now.toISOString().replace("T", " ").substring(0, 19);

      const newOrder = {
        order_id: orderId,
        acc_id: customer ? customer.acc_id : "ACC00001001",
        customer_name: orderPayload.fullName || (customer ? customer.first_name + " " + customer.last_name : "Khách hàng"),
        phone_number: orderPayload.phone || (customer ? customer.phone_number : "0908123456"),
        employee_id: "EP141",
        order_status: "PENDING",
        total_amount: discountedAmount,
        total_shipfee: shipFee,
        grand_total: grandTotal,
        target_street: orderPayload.targetStreet || "Số 15 Lê Duẩn",
        target_district: orderPayload.targetDistrict || "Quận 1",
        target_city: orderPayload.targetCity || "TP. Hồ Chí Minh",
        created_at: nowStr,
        confirmed_at: null,
        shipped_at: null,
        delivered_at: null,
        cancel_date: null,
        items: orderItems,
        payment: {
          payment_id: paymentId,
          order_id: orderId,
          payment_method: orderPayload.paymentMethod || "COD",
          payment_status: (orderPayload.paymentMethod === "COD" || orderPayload.paymentMethod === "BANKING") ? "PENDING" : "SUCCESS",
          payment_amount: grandTotal,
          paid_at: (orderPayload.paymentMethod !== "COD" && orderPayload.paymentMethod !== "BANKING") ? nowStr : null
        }
      };

      appState.orders.unshift(newOrder);
      this.clearCart();
      saveState(appState);
      return { ...newOrder, success: true, order: newOrder };
    },

    // 8. Quản lý Đơn hàng
    getOrders: function () {
      return appState.orders || [];
    },

    getOrderById: function (orderId) {
      return (appState.orders || []).find(o => o.order_id === orderId) || null;
    },

    advanceOrderStatus: function (orderId) {
      const order = this.getOrderById(orderId);
      if (!order) return { success: false, message: "Không tìm thấy đơn hàng" };

      const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);

      if (order.order_status === "PENDING") {
        order.order_status = "CONFIRMED";
        order.confirmed_at = nowStr;
      } else if (order.order_status === "CONFIRMED") {
        order.order_status = "SHIPPED";
        order.shipped_at = nowStr;
      } else if (order.order_status === "SHIPPED") {
        order.order_status = "DELIVERED";
        order.delivered_at = nowStr;
        if (order.payment) {
          order.payment.payment_status = "SUCCESS";
          order.payment.paid_at = nowStr;
        }
      } else {
        return { success: false, message: "Đơn hàng đã ở trạng thái hoàn tất" };
      }

      saveState(appState);
      return { success: true, order: order, status: order.order_status, toString() { return order.order_status; } };
    },

    cancelOrder: function (orderId) {
      const order = this.getOrderById(orderId);
      if (!order) return { success: false, message: "Không tìm thấy đơn hàng" };

      if (order.order_status === "DELIVERED") {
        return { success: false, message: "Đơn hàng đã giao thành công, không thể hủy" };
      }

      order.order_status = "CANCELLED";
      order.cancel_date = new Date().toISOString().replace("T", " ").substring(0, 19);

      // Hoàn trả tồn kho ảo
      order.items.forEach(it => {
        const spIdx = (appState.sub_products || []).findIndex(
          sp => sp.subsidiary_id === it.subsidiary_id && sp.product_id === it.product_id
        );
        if (spIdx !== -1) {
          appState.sub_products[spIdx].quantity += it.quantity;
        }
      });

      saveState(appState);
      return { success: true, order: order, status: order.order_status, toString() { return order.order_status; } };
    },

    // 9. Đánh giá & Sắc thái NLP
    getProductReviews: function (productId) {
      return (appState.reviews || []).filter(r => r.product_id === productId);
    },

    addReview: function ({ productId, orderId, score, title, message }) {
      const product = this.getProductById(productId);
      if (!product) return { success: false, message: "Sản phẩm không hợp lệ" };

      const customer = this.getCurrentCustomer();
      const numScore = parseFloat(score) || 5.0;

      let sentiment = "Neutral";
      let isPos = false;
      let isNeu = false;
      let isNeg = false;

      if (numScore >= 4.0) {
        sentiment = "Positive";
        isPos = true;
      } else if (numScore >= 3.0) {
        sentiment = "Neutral";
        isNeu = true;
      } else {
        sentiment = "Negative";
        isNeg = true;
      }

      const hasTitle = Boolean(title && title.trim());
      const hasMsg = Boolean(message && message.trim());
      const isComplete = hasTitle && hasMsg;

      const reviewId = "RV" + (appState.reviews.length + 1).toString().padStart(6, "0");
      const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);

      const newReview = {
        review_id: reviewId,
        product_id: productId,
        order_id: orderId || "OD000001",
        customer_name: customer ? customer.first_name + " " + customer.last_name : "Khách hàng thân thiết",
        customer_rank: customer ? customer.customer_rank : "VIP",
        review_score: numScore,
        review_sentiment: sentiment,
        review_title: title || "Đánh giá sản phẩm",
        review_message: message || "Sản phẩm dùng rất tốt, đóng gói cẩn thận.",
        created_at: nowStr,
        replied_at: null,
        reply_content: null,
        has_reply: false,
        is_positive_review: isPos,
        is_neutral_review: isNeu,
        is_negative_review: isNeg,
        is_complete_review: isComplete
      };

      appState.reviews.unshift(newReview);

      const allProductReviews = appState.reviews.filter(r => r.product_id === productId);
      const totalScore = allProductReviews.reduce((acc, r) => acc + r.review_score, 0);
      const newAvg = parseFloat((totalScore / allProductReviews.length).toFixed(1));

      product.product_rating = newAvg;
      product.review_count = allProductReviews.length;

      const ps = (appState.product_scores || []).find(s => s.product_id === productId);
      if (ps) {
        ps.avg_rating = newAvg;
        ps.review_count = allProductReviews.length;
      }

      saveState(appState);
      return { success: true, review: newReview, newRating: newAvg };
    },

    // Helper & Alias Methods
    getProductScore: function (productId) {
      const ps = (appState.product_scores || []).find(s => s.product_id === productId);
      if (ps) {
        return {
          rating_average: ps.avg_rating || ps.rating_average || 4.9,
          review_count: ps.review_count || 120
        };
      }
      const p = this.getProductById(productId);
      return {
        rating_average: p ? (p.product_rating || 4.9) : 4.9,
        review_count: p ? (p.review_count || 120) : 120
      };
    },

    resetStore: function () {
      return this.resetToDefault();
    },

    getSubProductsByProductId: function (productId) {
      return this.getProductInventory(productId);
    },

    updateCartItemQuantity: function (productId, version, quantity) {
      return this.updateCartItemQty(productId, version, quantity);
    },

    getReviewsByProductId: function (productId, sentimentFilter) {
      return this.getProductReviews(productId, sentimentFilter);
    }
  };
})();

// Export
if (typeof window !== "undefined") {
  window.EcomStore = EcomStore;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = EcomStore;
}
