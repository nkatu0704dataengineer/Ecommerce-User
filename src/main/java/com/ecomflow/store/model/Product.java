package com.ecomflow.store.model;

import com.ecomflow.store.common.BaseAuditEntity;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/**
 * POJO Entity ánh xạ bảng dbo.products (Sản phẩm gốc & Thông số Logistics).
 */
public class Product extends BaseAuditEntity {

    private static final long serialVersionUID = 1L;

    private String productId;
    private String productVersion;
    private Brand brand;
    private Category category;
    private String productName;
    private String productDescription;
    private String productStatus;
    private BigDecimal productRating;
    private Integer reviewCount;
    private BigDecimal productListprice;
    private Double productWeightG;
    private Double productLengthCm;
    private Double productHeightCm;
    private Double productWidthCm;
    private Double productVolumeCm3;
    private Double productDensityGCm3;
    private String productPhotosLink;
    private Integer productPhotosQty;

    public Product() {
        super();
    }

    public Product(String productId, String productVersion, Brand brand, Category category,
                   String productName, String productDescription, String productStatus,
                   BigDecimal productRating, Integer reviewCount, BigDecimal productListprice,
                   Double productWeightG, Double productLengthCm, Double productHeightCm,
                   Double productWidthCm, Double productVolumeCm3, Double productDensityGCm3,
                   String productPhotosLink, Integer productPhotosQty) {
        super();
        this.productId = productId;
        this.productVersion = productVersion;
        this.brand = brand;
        this.category = category;
        this.productName = productName;
        this.productDescription = productDescription;
        this.productStatus = productStatus;
        this.productRating = productRating;
        this.reviewCount = reviewCount;
        this.productListprice = productListprice;
        this.productWeightG = productWeightG;
        this.productLengthCm = productLengthCm;
        this.productHeightCm = productHeightCm;
        this.productWidthCm = productWidthCm;
        this.productVolumeCm3 = productVolumeCm3;
        this.productDensityGCm3 = productDensityGCm3;
        this.productPhotosLink = productPhotosLink;
        this.productPhotosQty = productPhotosQty;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getProductVersion() {
        return productVersion;
    }

    public void setProductVersion(String productVersion) {
        this.productVersion = productVersion;
    }

    public Brand getBrand() {
        return brand;
    }

    public void setBrand(Brand brand) {
        this.brand = brand;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductDescription() {
        return productDescription;
    }

    public void setProductDescription(String productDescription) {
        this.productDescription = productDescription;
    }

    public String getProductStatus() {
        return productStatus;
    }

    public void setProductStatus(String productStatus) {
        this.productStatus = productStatus;
    }

    public BigDecimal getProductRating() {
        return productRating;
    }

    public void setProductRating(BigDecimal productRating) {
        this.productRating = productRating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public BigDecimal getProductListprice() {
        return productListprice;
    }

    public void setProductListprice(BigDecimal productListprice) {
        this.productListprice = productListprice;
    }

    public Double getProductWeightG() {
        return productWeightG;
    }

    public void setProductWeightG(Double productWeightG) {
        this.productWeightG = productWeightG;
    }

    public Double getProductLengthCm() {
        return productLengthCm;
    }

    public void setProductLengthCm(Double productLengthCm) {
        this.productLengthCm = productLengthCm;
    }

    public Double getProductHeightCm() {
        return productHeightCm;
    }

    public void setProductHeightCm(Double productHeightCm) {
        this.productHeightCm = productHeightCm;
    }

    public Double getProductWidthCm() {
        return productWidthCm;
    }

    public void setProductWidthCm(Double productWidthCm) {
        this.productWidthCm = productWidthCm;
    }

    public Double getProductVolumeCm3() {
        return productVolumeCm3;
    }

    public void setProductVolumeCm3(Double productVolumeCm3) {
        this.productVolumeCm3 = productVolumeCm3;
    }

    public Double getProductDensityGCm3() {
        return productDensityGCm3;
    }

    public void setProductDensityGCm3(Double productDensityGCm3) {
        this.productDensityGCm3 = productDensityGCm3;
    }

    public String getProductPhotosLink() {
        return productPhotosLink;
    }

    public void setProductPhotosLink(String productPhotosLink) {
        this.productPhotosLink = productPhotosLink;
    }

    public Integer getProductPhotosQty() {
        return productPhotosQty;
    }

    public void setProductPhotosQty(Integer productPhotosQty) {
        this.productPhotosQty = productPhotosQty;
    }

    /**
     * Tính giá bán sau khi áp dụng chiết khấu khuyến mãi (VND).
     */
    public BigDecimal calculateDiscountedPrice(BigDecimal discountRate) {
        if (productListprice == null) return BigDecimal.ZERO;
        if (discountRate == null || discountRate.compareTo(BigDecimal.ZERO) <= 0) {
            return productListprice;
        }
        BigDecimal multiplier = BigDecimal.ONE.subtract(discountRate);
        return productListprice.multiply(multiplier).setScale(0, RoundingMode.HALF_UP);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Product product = (Product) o;
        return Objects.equals(productId, product.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productId);
    }

    @Override
    public String toString() {
        return "Product{" +
                "productId='" + productId + '\'' +
                ", productName='" + productName + '\'' +
                ", version='" + productVersion + '\'' +
                ", listPrice=" + productListprice +
                ", rating=" + productRating +
                ", status='" + productStatus + '\'' +
                '}';
    }
}
