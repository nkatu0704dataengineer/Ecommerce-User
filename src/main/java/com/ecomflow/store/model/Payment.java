package com.ecomflow.store.model;

import com.ecomflow.store.common.BaseAuditEntity;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * POJO Entity ánh xạ bảng dbo.payments (Đối soát tài chính 1:1 với orders).
 */
public class Payment extends BaseAuditEntity {

    private static final long serialVersionUID = 1L;

    private String paymentId;
    private Order order;
    private String paymentMethod; // VNPAY, MOMO, ZALOPAY, BANKING, COD
    private String paymentStatus; // SUCCESS, PENDING, FAILED, REFUNDED
    private BigDecimal paymentAmount;
    private String paidAt;
    private String refundAt;

    public Payment() {
        super();
        this.paymentMethod = "COD";
        this.paymentStatus = "PENDING";
        this.paymentAmount = BigDecimal.ZERO;
    }

    public Payment(String paymentId, Order order, String paymentMethod, String paymentStatus, BigDecimal paymentAmount) {
        super();
        this.paymentId = paymentId;
        this.order = order;
        this.paymentMethod = paymentMethod != null ? paymentMethod : "COD";
        this.paymentStatus = paymentStatus != null ? paymentStatus : "PENDING";
        this.paymentAmount = paymentAmount != null ? paymentAmount : BigDecimal.ZERO;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public BigDecimal getPaymentAmount() {
        return paymentAmount;
    }

    public void setPaymentAmount(BigDecimal paymentAmount) {
        this.paymentAmount = paymentAmount;
    }

    public String getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(String paidAt) {
        this.paidAt = paidAt;
    }

    public String getRefundAt() {
        return refundAt;
    }

    public void setRefundAt(String refundAt) {
        this.refundAt = refundAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Payment payment = (Payment) o;
        return Objects.equals(paymentId, payment.paymentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(paymentId);
    }

    @Override
    public String toString() {
        return "Payment{" +
                "paymentId='" + paymentId + '\'' +
                ", method='" + paymentMethod + '\'' +
                ", status='" + paymentStatus + '\'' +
                ", amount=" + paymentAmount +
                '}';
    }
}
