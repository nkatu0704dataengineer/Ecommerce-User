package com.ecomflow.store.model;

import com.ecomflow.store.common.BaseAuditEntity;
import java.util.Objects;

/**
 * POJO Entity ánh xạ bảng dbo.categories.
 */
public class Category extends BaseAuditEntity {

    private static final long serialVersionUID = 1L;

    private String cateId;
    private String cateName;

    public Category() {
        super();
    }

    public Category(String cateId, String cateName) {
        super();
        this.cateId = cateId;
        this.cateName = cateName;
    }

    public Category(String cateId, String cateName, String createdAt, String updatedAt, String ingestionTime) {
        super(createdAt, updatedAt, ingestionTime);
        this.cateId = cateId;
        this.cateName = cateName;
    }

    public String getCateId() {
        return cateId;
    }

    public void setCateId(String cateId) {
        this.cateId = cateId;
    }

    public String getCateName() {
        return cateName;
    }

    public void setCateName(String cateName) {
        this.cateName = cateName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Category category = (Category) o;
        return Objects.equals(cateId, category.cateId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(cateId);
    }

    @Override
    public String toString() {
        return "Category{" +
                "cateId='" + cateId + '\'' +
                ", cateName='" + cateName + '\'' +
                ", " + super.toString() +
                '}';
    }
}
