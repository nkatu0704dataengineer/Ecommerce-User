package com.ecomflow.store.model;

import com.ecomflow.store.common.BaseAuditEntity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

/**
 * POJO Entity ánh xạ bảng dbo.program_sales (Chiến dịch khuyến mãi & Voucher).
 */
public class ProgramSale extends BaseAuditEntity {

    private static final long serialVersionUID = 1L;

    private String saleId;
    private String saleName;
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private LocalDate startDate;
    private LocalDate endDate;

    public ProgramSale() {
        super();
    }

    public ProgramSale(String saleId, String saleName, BigDecimal discountValue,
                       BigDecimal minOrderValue, LocalDate startDate, LocalDate endDate) {
        super();
        this.saleId = saleId;
        this.saleName = saleName;
        this.discountValue = discountValue;
        this.minOrderValue = minOrderValue;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public String getSaleId() {
        return saleId;
    }

    public void setSaleId(String saleId) {
        this.saleId = saleId;
    }

    public String getSaleName() {
        return saleName;
    }

    public void setSaleName(String saleName) {
        this.saleName = saleName;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public BigDecimal getMinOrderValue() {
        return minOrderValue;
    }

    public void setMinOrderValue(BigDecimal minOrderValue) {
        this.minOrderValue = minOrderValue;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    /**
     * Kiểm tra điều kiện áp dụng voucher theo ngày và giá trị đơn hàng tối thiểu.
     */
    public boolean isValidFor(BigDecimal orderAmount, LocalDate currentDate) {
        if (currentDate != null) {
            if (startDate != null && currentDate.isBefore(startDate)) return false;
            if (endDate != null && currentDate.isAfter(endDate)) return false;
        }
        if (minOrderValue != null && orderAmount != null) {
            return orderAmount.compareTo(minOrderValue) >= 0;
        }
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProgramSale that = (ProgramSale) o;
        return Objects.equals(saleId, that.saleId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(saleId);
    }

    @Override
    public String toString() {
        return "ProgramSale{" +
                "saleId='" + saleId + '\'' +
                ", saleName='" + saleName + '\'' +
                ", discountValue=" + discountValue +
                ", minOrderValue=" + minOrderValue +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", " + super.toString() +
                '}';
    }
}
