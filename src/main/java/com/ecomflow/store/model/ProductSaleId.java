package com.ecomflow.store.model;

import java.io.Serializable;
import java.util.Objects;

/**
 * Khóa phức hợp Composite PK cho bảng product_sales (product_id + sale_id).
 */
public class ProductSaleId implements Serializable {

    private static final long serialVersionUID = 1L;

    private String productId;
    private String saleId;

    public ProductSaleId() {}

    public ProductSaleId(String productId, String saleId) {
        this.productId = productId;
        this.saleId = saleId;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getSaleId() {
        return saleId;
    }

    public void setSaleId(String saleId) {
        this.saleId = saleId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProductSaleId that = (ProductSaleId) o;
        return Objects.equals(productId, that.productId) && Objects.equals(saleId, that.saleId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productId, saleId);
    }

    @Override
    public String toString() {
        return "ProductSaleId{" +
                "productId='" + productId + '\'' +
                ", saleId='" + saleId + '\'' +
                '}';
    }
}
