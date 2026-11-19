package com.ecomflow.store.model;

import com.ecomflow.store.common.BaseAuditEntity;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/**
 * POJO Entity ánh xạ bảng dbo.order_items (Chi tiết mặt hàng xuất kho trong đơn hàng).
 */
public class OrderItem extends BaseAuditEntity {

    private static final long serialVersionUID = 1L;

    private OrderItemId id;
    private Order order;
    private Product product;
    private Subsidiary subsidiary;
    private ProgramSale programSale;
    private Integer quantity;
    private BigDecimal listPrice;
    private BigDecimal discountRate;
    private BigDecimal salePrice;
    private BigDecimal totalPrice;
    private Double itemTotalWeightG;
    private Double shippingDistanceKm;
    private BigDecimal shippingFee;

    public OrderItem() {
        super();
        this.quantity = 1;
        this.discountRate = BigDecimal.ZERO;
        this.shippingFee = BigDecimal.ZERO;
    }

    public OrderItem(OrderItemId id, Order order, Product product, Subsidiary subsidiary,
                     ProgramSale programSale, Integer quantity, BigDecimal listPrice,
                     BigDecimal discountRate, Double shippingDistanceKm) {
        super();
        this.id = id;
        this.order = order;
        this.product = product;
        this.subsidiary = subsidiary;
        this.programSale = programSale;
        this.quantity = quantity != null ? quantity : 1;
        this.listPrice = listPrice != null ? listPrice : (product != null ? product.getProductListprice() : BigDecimal.ZERO);
        this.discountRate = discountRate != null ? discountRate : BigDecimal.ZERO;
        this.shippingDistanceKm = shippingDistanceKm != null ? shippingDistanceKm : 5.0;
        recalculate();
    }

    public OrderItemId getId() {
        return id;
    }

    public void setId(OrderItemId id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
        if (order != null && this.id != null) {
            this.id.setOrderId(order.getOrderId());
        }
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
        recalculate();
    }

    public Subsidiary getSubsidiary() {
        return subsidiary;
    }

    public void setSubsidiary(Subsidiary subsidiary) {
        this.subsidiary = subsidiary;
    }

    public ProgramSale getProgramSale() {
        return programSale;
    }

    public void setProgramSale(ProgramSale programSale) {
        this.programSale = programSale;
        if (programSale != null && programSale.getDiscountValue() != null) {
            this.discountRate = programSale.getDiscountValue();
        }
        recalculate();
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        recalculate();
    }

    public BigDecimal getListPrice() {
        return listPrice;
    }

    public void setListPrice(BigDecimal listPrice) {
        this.listPrice = listPrice;
        recalculate();
    }

    public BigDecimal getDiscountRate() {
        return discountRate;
    }

    public void setDiscountRate(BigDecimal discountRate) {
        this.discountRate = discountRate;
        recalculate();
    }

    public BigDecimal getSalePrice() {
        return salePrice;
    }

    public void setSalePrice(BigDecimal salePrice) {
        this.salePrice = salePrice;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public Double getItemTotalWeightG() {
        return itemTotalWeightG;
    }

    public void setItemTotalWeightG(Double itemTotalWeightG) {
        this.itemTotalWeightG = itemTotalWeightG;
    }

    public Double getShippingDistanceKm() {
        return shippingDistanceKm;
    }

    public void setShippingDistanceKm(Double shippingDistanceKm) {
        this.shippingDistanceKm = shippingDistanceKm;
    }

    public BigDecimal getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(BigDecimal shippingFee) {
        this.shippingFee = shippingFee;
    }

    public void recalculate() {
        if (listPrice != null) {
            BigDecimal rate = discountRate != null ? discountRate : BigDecimal.ZERO;
            this.salePrice = listPrice.multiply(BigDecimal.ONE.subtract(rate)).setScale(0, RoundingMode.HALF_UP);
            int qty = quantity != null ? quantity : 1;
            this.totalPrice = this.salePrice.multiply(BigDecimal.valueOf(qty));
        }
        if (product != null && product.getProductWeightG() != null && quantity != null) {
            this.itemTotalWeightG = product.getProductWeightG() * quantity;
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrderItem orderItem = (OrderItem) o;
        return Objects.equals(id, orderItem.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "OrderItem{" +
                "id=" + id +
                ", product=" + (product != null ? product.getProductName() : null) +
                ", qty=" + quantity +
                ", salePrice=" + salePrice +
                ", total=" + totalPrice +
                '}';
    }
}
