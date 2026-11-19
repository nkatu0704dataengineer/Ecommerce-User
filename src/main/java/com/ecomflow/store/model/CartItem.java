package com.ecomflow.store.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Objects;

/**
 * POJO Entity ánh xạ bảng dbo.cart_items (Chi tiết mặt hàng trong giỏ).
 */
public class CartItem implements Serializable {

    private static final long serialVersionUID = 1L;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private CartItemId id;
    private Cart cart;
    private Product product;
    private Integer quantity;
    private BigDecimal listPrice;
    private BigDecimal itemTotalAmount;
    private String addedAt;
    private String updatedAt;
    private String ingestionTime;

    public CartItem() {
        String now = LocalDateTime.now().format(FORMATTER);
        this.addedAt = now;
        this.updatedAt = now;
        this.ingestionTime = now;
    }

    public CartItem(CartItemId id, Cart cart, Product product, Integer quantity,
                    BigDecimal listPrice, BigDecimal itemTotalAmount) {
        this();
        this.id = id;
        this.cart = cart;
        this.product = product;
        this.quantity = quantity;
        this.listPrice = listPrice;
        this.itemTotalAmount = itemTotalAmount;
    }

    public CartItem(String cartId, Integer itemSequence, Product product, Integer quantity, BigDecimal listPrice) {
        this();
        this.id = new CartItemId(cartId, itemSequence);
        this.product = product;
        this.quantity = quantity != null ? quantity : 1;
        this.listPrice = listPrice != null ? listPrice : (product != null ? product.getProductListprice() : BigDecimal.ZERO);
        recalculateTotal();
    }

    public CartItemId getId() {
        return id;
    }

    public void setId(CartItemId id) {
        this.id = id;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
        if (cart != null && this.id != null) {
            this.id.setCartId(cart.getCartId());
        }
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        recalculateTotal();
    }

    public BigDecimal getListPrice() {
        return listPrice;
    }

    public void setListPrice(BigDecimal listPrice) {
        this.listPrice = listPrice;
        recalculateTotal();
    }

    public BigDecimal getItemTotalAmount() {
        return itemTotalAmount;
    }

    public void setItemTotalAmount(BigDecimal itemTotalAmount) {
        this.itemTotalAmount = itemTotalAmount;
    }

    public String getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(String addedAt) {
        this.addedAt = addedAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getIngestionTime() {
        return ingestionTime;
    }

    public void setIngestionTime(String ingestionTime) {
        this.ingestionTime = ingestionTime;
    }

    public void recalculateTotal() {
        if (listPrice != null && quantity != null) {
            this.itemTotalAmount = listPrice.multiply(BigDecimal.valueOf(quantity));
        } else {
            this.itemTotalAmount = BigDecimal.ZERO;
        }
        this.updatedAt = LocalDateTime.now().format(FORMATTER);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CartItem cartItem = (CartItem) o;
        return Objects.equals(id, cartItem.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "CartItem{" +
                "id=" + id +
                ", product=" + (product != null ? product.getProductName() : null) +
                ", quantity=" + quantity +
                ", itemTotal=" + itemTotalAmount +
                '}';
    }
}
