package com.ecomflow.store.model;

import com.ecomflow.store.common.BaseAuditEntity;
import java.util.Objects;

/**
 * POJO Entity ánh xạ bảng dbo.brands.
 */
public class Brand extends BaseAuditEntity {

    private static final long serialVersionUID = 1L;

    private String brandId;
    private String brandName;
    private String brandCountry;

    public Brand() {
        super();
    }

    public Brand(String brandId, String brandName, String brandCountry) {
        super();
        this.brandId = brandId;
        this.brandName = brandName;
        this.brandCountry = brandCountry;
    }

    public Brand(String brandId, String brandName, String brandCountry, String createdAt, String updatedAt, String ingestionTime) {
        super(createdAt, updatedAt, ingestionTime);
        this.brandId = brandId;
        this.brandName = brandName;
        this.brandCountry = brandCountry;
    }

    public String getBrandId() {
        return brandId;
    }

    public void setBrandId(String brandId) {
        this.brandId = brandId;
    }

    public String getBrandName() {
        return brandName;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }

    public String getBrandCountry() {
        return brandCountry;
    }

    public void setBrandCountry(String brandCountry) {
        this.brandCountry = brandCountry;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Brand brand = (Brand) o;
        return Objects.equals(brandId, brand.brandId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(brandId);
    }

    @Override
    public String toString() {
        return "Brand{" +
                "brandId='" + brandId + '\'' +
                ", brandName='" + brandName + '\'' +
                ", brandCountry='" + brandCountry + '\'' +
                ", " + super.toString() +
                '}';
    }
}
