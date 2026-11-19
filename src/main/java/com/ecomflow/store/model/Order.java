package com.ecomflow.store.model;

import com.ecomflow.store.common.BaseAuditEntity;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * POJO Entity ánh xạ bảng dbo.orders (Đơn đặt hàng Storefront).
 */
public class Order extends BaseAuditEntity {

    private static final long serialVersionUID = 1L;

    private String orderId;
    private Customer customer;
    private Employee employee;
    private String orderStatus; // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
    private BigDecimal totalAmount;
    private BigDecimal totalShipFee;
    private String targetStreet;
    private String targetDistrict;
    private String targetCity;
    private String confirmedAt;
    private String shippedAt;
    private String estimatedDeliveryDate;
    private String deliveredAt;
    private String cancelDate;
    private List<OrderItem> items = new ArrayList<>();
    private Payment payment;

    public Order() {
        super();
        this.orderStatus = "PENDING";
        this.totalAmount = BigDecimal.ZERO;
        this.totalShipFee = BigDecimal.ZERO;
    }

    public Order(String orderId, Customer customer, Employee employee, String orderStatus,
                 BigDecimal totalAmount, BigDecimal totalShipFee, String targetStreet,
                 String targetDistrict, String targetCity) {
        super();
        this.orderId = orderId;
        this.customer = customer;
        this.employee = employee;
        this.orderStatus = orderStatus != null ? orderStatus : "PENDING";
        this.totalAmount = totalAmount != null ? totalAmount : BigDecimal.ZERO;
        this.totalShipFee = totalShipFee != null ? totalShipFee : BigDecimal.ZERO;
        this.targetStreet = targetStreet;
        this.targetDistrict = targetDistrict;
        this.targetCity = targetCity;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getTotalShipFee() {
        return totalShipFee;
    }

    public void setTotalShipFee(BigDecimal totalShipFee) {
        this.totalShipFee = totalShipFee;
    }

    public BigDecimal getGrandTotal() {
        BigDecimal amt = totalAmount != null ? totalAmount : BigDecimal.ZERO;
        BigDecimal fee = totalShipFee != null ? totalShipFee : BigDecimal.ZERO;
        return amt.add(fee);
    }

    public String getTargetStreet() {
        return targetStreet;
    }

    public void setTargetStreet(String targetStreet) {
        this.targetStreet = targetStreet;
    }

    public String getTargetDistrict() {
        return targetDistrict;
    }

    public void setTargetDistrict(String targetDistrict) {
        this.targetDistrict = targetDistrict;
    }

    public String getTargetCity() {
        return targetCity;
    }

    public void setTargetCity(String targetCity) {
        this.targetCity = targetCity;
    }

    public String getConfirmedAt() {
        return confirmedAt;
    }

    public void setConfirmedAt(String confirmedAt) {
        this.confirmedAt = confirmedAt;
    }

    public String getShippedAt() {
        return shippedAt;
    }

    public void setShippedAt(String shippedAt) {
        this.shippedAt = shippedAt;
    }

    public String getEstimatedDeliveryDate() {
        return estimatedDeliveryDate;
    }

    public void setEstimatedDeliveryDate(String estimatedDeliveryDate) {
        this.estimatedDeliveryDate = estimatedDeliveryDate;
    }

    public String getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(String deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public String getCancelDate() {
        return cancelDate;
    }

    public void setCancelDate(String cancelDate) {
        this.cancelDate = cancelDate;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items != null ? items : new ArrayList<>();
    }

    public void addItem(OrderItem item) {
        if (item != null) {
            this.items.add(item);
            item.setOrder(this);
        }
    }

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
        if (payment != null) {
            payment.setOrder(this);
        }
    }

    public String getFullTargetAddress() {
        StringBuilder sb = new StringBuilder();
        if (targetStreet != null && !targetStreet.isBlank()) sb.append(targetStreet);
        if (targetDistrict != null && !targetDistrict.isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(targetDistrict);
        }
        if (targetCity != null && !targetCity.isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(targetCity);
        }
        return sb.toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Order order = (Order) o;
        return Objects.equals(orderId, order.orderId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderId);
    }

    @Override
    public String toString() {
        return "Order{" +
                "orderId='" + orderId + '\'' +
                ", status='" + orderStatus + '\'' +
                ", totalAmount=" + totalAmount +
                ", shipFee=" + totalShipFee +
                ", grandTotal=" + getGrandTotal() +
                ", address='" + getFullTargetAddress() + '\'' +
                '}';
    }
}
