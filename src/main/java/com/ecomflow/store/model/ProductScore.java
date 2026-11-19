package com.ecomflow.store.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * POJO Entity ánh xạ bảng dbo.product_scores (Quan hệ 1:1 với Product).
 * Ghi chú: Bảng chỉ gồm 3 cột nghiệp vụ, không có audit columns.
 */
public class ProductScore implements Serializable {

    private static final long serialVersionUID = 1L;

    private String productId;
    private Product product;
    private Integer reviewCount;
    private BigDecimal avgRating;

    public ProductScore() {}

    public ProductScore(String productId, Integer reviewCount, BigDecimal avgRating) {
        this.productId = productId;
        this.reviewCount = reviewCount;
        this.avgRating = avgRating;
    }

    public ProductScore(String productId, Product product, Integer reviewCount, BigDecimal avgRating) {
        this.productId = productId;
        this.product = product;
        this.reviewCount = reviewCount;
        this.avgRating = avgRating;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
        if (product != null && this.productId == null) {
            this.productId = product.getProductId();
        }
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public BigDecimal getAvgRating() {
        return avgRating;
    }

    public void setAvgRating(BigDecimal avgRating) {
        this.avgRating = avgRating;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProductScore that = (ProductScore) o;
        return Objects.equals(productId, that.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productId);
    }

    @Override
    public String toString() {
        return "ProductScore{" +
                "productId='" + productId + '\'' +
                ", reviewCount=" + reviewCount +
                ", avgRating=" + avgRating +
                '}';
    }
}
