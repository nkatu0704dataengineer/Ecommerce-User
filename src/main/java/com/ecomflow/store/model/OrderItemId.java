package com.ecomflow.store.model;

import java.io.Serializable;
import java.util.Objects;

/**
 * Khóa phức hợp Composite PK cho bảng order_items (order_id + order_item_id).
 */
public class OrderItemId implements Serializable {

    private static final long serialVersionUID = 1L;

    private String orderId;
    private Integer orderItemId;

    public OrderItemId() {}

    public OrderItemId(String orderId, Integer orderItemId) {
        this.orderId = orderId;
        this.orderItemId = orderItemId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public Integer getOrderItemId() {
        return orderItemId;
    }

    public void setOrderItemId(Integer orderItemId) {
        this.orderItemId = orderItemId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrderItemId that = (OrderItemId) o;
        return Objects.equals(orderId, that.orderId) && Objects.equals(orderItemId, that.orderItemId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderId, orderItemId);
    }

    @Override
    public String toString() {
        return "OrderItemId{" +
                "orderId='" + orderId + '\'' +
                ", orderItemId=" + orderItemId +
                '}';
    }
}
