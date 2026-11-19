/**
 * EcomFlow Store - State & LocalStorage Engine
 * Đóng vai trò là Tầng Quản lý Dữ liệu Phía Client (Client-side Virtual Database)
 * Đảm bảo dữ liệu giỏ hàng, đặt hàng, cập nhật trạng thái đơn, và đánh giá NLP
 * được duy trì liên tục xuyên suốt phiên làm việc.
 */

const EcomStore = (function () {
  const STORAGE_KEY = "ECOMFLOW_STOREFRONT_STATE_V2";

  // Khởi tạo trạng thái ban đầu từ Mock Data
  function getInitialState() {
    const rawMock = (typeof window !== "undefined" && window.EcomStoreMockData) 
      ? window.EcomStoreMockData 
      : (typeof EcomStoreMockData !== "undefined" ? EcomStoreMockData : {});
    
    // Deep clone để không làm biến dạng dữ liệu gốc
    const cloned = JSON.parse(JSON.stringify(rawMock));

    // Khởi tạo giỏ hàng trống nếu chưa có
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

    return cloned;
  }

  // Tải trạng thái từ localStorage
  function loadState() {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        return JSON.parse(serialized);
      }
    } catch (e) {
      console.warn("Không thể đọc localStorage, dùng dữ liệu khởi tạo ban đầu:", e);
    }
    const freshState = getInitialState();
    saveState(freshState);
    return freshState;
  }

  // Lưu trạng thái vào localStorage
  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Lỗi khi ghi vào localStorage:", e);
    }
  }

  // Biến state runtime
  let appState = loadState();

  // Đảm bảo giỏ hàng luôn được tính toán đúng
  function recalculateCart() {
    let count = 0;
    let sum = 0;
    appState.cart.items.forEach(item => {
      item.item_total_amount = item.sale_price * item.quantity;
      count += item.quantity;
      sum += item.item_total_amount;
    });
    appState.cart.total_items = count;
    appState.cart.total_amount = sum;

    // Kiểm tra lại voucher nếu tổng tiền bị giảm dưới ngưỡng tối thiểu
    if (appState.cart.applied_voucher) {
      if (sum < appState.cart.applied_voucher.min_ordervalue) {
        appState.cart.applied_voucher = null;
      }
    }
    saveState(appState);
  }

  return {
    // 1. Quản trị hệ thống & Khôi phục dữ liệu
    getState: function () {
      return appState;
    },

    resetToDefault: function () {
      localStorage.removeItem(STORAGE_KEY);
      appState = getInitialState();
      saveState(appState);
      return appState;
    },

    // 2. Thông tin khách hàng đang đăng nhập (Smember)
    getCurrentCustomer: function () {
      return appState.customers && appState.customers.length > 0 ? appState.customers[0] : null;
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

    getSubsidiaries: function () {
      return appState.subsidiaries || [];
    },

    // 4. Tra cứu Tồn kho đa chi nhánh (Sub_Products)
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

      if (filterCity && filterCity !== "ALL") {
        return result.filter(item => item.sub_city === filterCity);
      }
      return result;
    },

    // 5. Quản lý Giỏ hàng (Cart & Cart Items)
    getCart: function () {
      return appState.cart;
    },

    addToCart: function (productId, selectedVersion, quantity = 1) {
      const product = this.getProductById(productId);
      if (!product) return { success: false, message: "Sản phẩm không tồn tại" };

      const version = selectedVersion || product.product_version || "Tiêu chuẩn";
      const existingItem = appState.cart.items.find(
        item => item.product_id === productId && item.product_version === version
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        const nextSeq = appState.cart.items.length + 1;
        appState.cart.items.push({
          item_sequence: nextSeq,
          product_id: product.product_id,
          product_name: product.product_name,
          product_version: version,
          product_photos_link: product.product_photos_link,
          list_price: product.product_listprice,
          sale_price: product.sale_price || product.product_listprice,
          quantity: quantity,
          item_total_amount: (product.sale_price || product.product_listprice) * quantity,
          product_weight_g: product.product_weight_g || 200
        });
      }

      recalculateCart();
      return { success: true, cart: appState.cart };
    },

    updateCartItemQty: function (productId, version, newQty) {
      const idx = appState.cart.items.findIndex(
        item => item.product_id === productId && item.product_version === version
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

    removeFromCart: function (productId, version) {
      appState.cart.items = appState.cart.items.filter(
        item => !(item.product_id === productId && item.product_version === version)
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

    // 6. Quản lý Khuyến mãi & Áp mã giảm giá
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

    // 7. Quy trình Đặt hàng (Checkout & Create Order)
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

      // Tính phí vận chuyển theo khối lượng và khoảng cách
      let totalWeightG = 0;
      appState.cart.items.forEach(it => {
        totalWeightG += (it.product_weight_g || 250) * it.quantity;
      });

      // Miễn phí vận chuyển nếu đơn > 5 triệu hoặc voucher FREESHIP hoặc thành viên DIAMOND
      let shipFee = 35000;
      if (rawTotal >= 5000000 || (voucher && voucher.free_shipping) || (customer && customer.customer_rank === "DIAMOND")) {
        shipFee = 0;
      }

      const grandTotal = discountedAmount + shipFee;

      // Phân bổ chi nhánh xuất kho tự động và trừ tồn kho ảo
      const orderItems = appState.cart.items.map((it, idx) => {
        // Tìm chi nhánh gần nhất thuộc thành phố khách chọn có tồn kho
        const invList = this.getProductInventory(it.product_id, orderPayload.targetCity);
        const availableSub = invList.find(s => s.quantity >= it.quantity) || invList[0];
        const assignedSubId = availableSub ? availableSub.subsidiary_id : "SB001";
        const assignedSubName = availableSub ? availableSub.sub_name : "EcomFlow Flagship Nguyễn Huệ";

        // Trừ tồn kho ảo trong sub_products
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
        order_status: "PENDING", // Trạng thái ban đầu: PENDING
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

      // Đưa đơn hàng mới lên đầu danh sách
      appState.orders.unshift(newOrder);

      // Làm rỗng giỏ hàng
      this.clearCart();

      saveState(appState);
      return { success: true, order: newOrder };
    },

    // 8. Tra cứu & Điều khiển trạng thái Đơn hàng (Demo Trình diễn)
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
        return { success: false, message: "Đơn hàng đã ở trạng thái cuối cùng" };
      }

      saveState(appState);
      return { success: true, order: order };
    },

    cancelOrder: function (orderId) {
      const order = this.getOrderById(orderId);
      if (!order) return { success: false, message: "Không tìm thấy đơn hàng" };

      if (order.order_status === "DELIVERED") {
        return { success: false, message: "Đơn hàng đã giao thành công, không thể hủy" };
      }

      order.order_status = "CANCELLED";
      order.cancel_date = new Date().toISOString().replace("T", " ").substring(0, 19);

      // Hoàn trả lại số lượng tồn kho ảo
      order.items.forEach(it => {
        const spIdx = (appState.sub_products || []).findIndex(
          sp => sp.subsidiary_id === it.subsidiary_id && sp.product_id === it.product_id
        );
        if (spIdx !== -1) {
          appState.sub_products[spIdx].quantity += it.quantity;
        }
      });

      saveState(appState);
      return { success: true, order: order };
    },

    // 9. Quản lý Đánh giá & Phân tích Sắc thái NLP (Reviews)
    getProductReviews: function (productId) {
      return (appState.reviews || []).filter(r => r.product_id === productId);
    },

    addReview: function ({ productId, orderId, score, title, message }) {
      const product = this.getProductById(productId);
      if (!product) return { success: false, message: "Sản phẩm không hợp lệ" };

      const customer = this.getCurrentCustomer();
      const numScore = parseFloat(score) || 5.0;

      // Phân tích sắc thái tự động
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
        review_message: message || "Sản phẩm tốt, đóng gói cẩn thận.",
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

      // Cập nhật điểm trung bình trong product_scores và product
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
    }
  };
})();

// Export cho môi trường Browser và Node.js
if (typeof window !== "undefined") {
  window.EcomStore = EcomStore;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = EcomStore;
}
