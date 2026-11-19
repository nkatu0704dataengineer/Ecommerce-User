package com.ecomflow.store.model;

import java.io.Serializable;
import java.util.Objects;

/**
 * Khóa phức hợp Composite PK cho bảng sub_products (subsidiary_id + product_id).
 */
public class SubProductId implements Serializable {

    private static final long serialVersionUID = 1L;

    private String subsidiaryId;
    private String productId;

    public SubProductId() {}

    public SubProductId(String subsidiaryId, String productId) {
        this.subsidiaryId = subsidiaryId;
        this.productId = productId;
    }

    public String getSubsidiaryId() {
        return subsidiaryId;
    }

    public void setSubsidiaryId(String subsidiaryId) {
        this.subsidiaryId = subsidiaryId;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SubProductId that = (SubProductId) o;
        return Objects.equals(subsidiaryId, that.subsidiaryId) && Objects.equals(productId, that.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(subsidiaryId, productId);
    }

    @Override
    public String toString() {
        return "SubProductId{" +
                "subsidiaryId='" + subsidiaryId + '\'' +
                ", productId='" + productId + '\'' +
                '}';
    }
}
