package com.ecomflow.store.model;

import java.io.Serializable;
import java.util.Objects;

/**
 * Khóa phức hợp Composite PK cho bảng cart_items (cart_id + item_sequence).
 */
public class CartItemId implements Serializable {

    private static final long serialVersionUID = 1L;

    private String cartId;
    private Integer itemSequence;

    public CartItemId() {}

    public CartItemId(String cartId, Integer itemSequence) {
        this.cartId = cartId;
        this.itemSequence = itemSequence;
    }

    public String getCartId() {
        return cartId;
    }

    public void setCartId(String cartId) {
        this.cartId = cartId;
    }

    public Integer getItemSequence() {
        return itemSequence;
    }

    public void setItemSequence(Integer itemSequence) {
        this.itemSequence = itemSequence;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CartItemId that = (CartItemId) o;
        return Objects.equals(cartId, that.cartId) && Objects.equals(itemSequence, that.itemSequence);
    }

    @Override
    public int hashCode() {
        return Objects.hash(cartId, itemSequence);
    }

    @Override
    public String toString() {
        return "CartItemId{" +
                "cartId='" + cartId + '\'' +
                ", itemSequence=" + itemSequence +
                '}';
    }
}
