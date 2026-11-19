package com.ecomflow.store.model;

import com.ecomflow.store.common.BaseAuditEntity;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * POJO Entity ánh xạ bảng dbo.carts (Giỏ hàng của khách hàng).
 */
public class Cart extends BaseAuditEntity {

    private static final long serialVersionUID = 1L;

    private String cartId;
    private Customer customer;
    private String cartStatus; // ACTIVE, ABANDONED, CHECKED_OUT
    private Integer totalItems;
    private BigDecimal totalAmount;
    private List<CartItem> items = new ArrayList<>();

    public Cart() {
        super();
        this.cartStatus = "ACTIVE";
        this.totalItems = 0;
        this.totalAmount = BigDecimal.ZERO;
    }

    public Cart(String cartId, Customer customer, String cartStatus, Integer totalItems, BigDecimal totalAmount) {
        super();
        this.cartId = cartId;
        this.customer = customer;
        this.cartStatus = cartStatus != null ? cartStatus : "ACTIVE";
        this.totalItems = totalItems != null ? totalItems : 0;
        this.totalAmount = totalAmount != null ? totalAmount : BigDecimal.ZERO;
    }

    public String getCartId() {
        return cartId;
    }

    public void setCartId(String cartId) {
        this.cartId = cartId;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public String getCartStatus() {
        return cartStatus;
    }

    public void setCartStatus(String cartStatus) {
        this.cartStatus = cartStatus;
    }

    public Integer getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items != null ? items : new ArrayList<>();
        recalculate();
    }

    public void addItem(CartItem item) {
        if (item != null) {
            this.items.add(item);
            item.setCart(this);
            recalculate();
        }
    }

    public void removeItem(int itemSequence) {
        this.items.removeIf(i -> i.getId() != null && Objects.equals(i.getId().getItemSequence(), itemSequence));
        recalculate();
    }

    public void recalculate() {
        int count = 0;
        BigDecimal sum = BigDecimal.ZERO;
        for (CartItem item : items) {
            if (item.getQuantity() != null) {
                count += item.getQuantity();
            }
            if (item.getItemTotalAmount() != null) {
                sum = sum.add(item.getItemTotalAmount());
            }
        }
        this.totalItems = count;
        this.totalAmount = sum;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Cart cart = (Cart) o;
        return Objects.equals(cartId, cart.cartId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(cartId);
    }

    @Override
    public String toString() {
        return "Cart{" +
                "cartId='" + cartId + '\'' +
                ", status='" + cartStatus + '\'' +
                ", totalItems=" + totalItems +
                ", totalAmount=" + totalAmount +
                '}';
    }
}
