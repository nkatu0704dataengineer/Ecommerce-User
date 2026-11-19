package com.ecomflow.store.model;

import java.io.Serializable;
import java.util.Objects;

/**
 * POJO Entity ánh xạ bảng dbo.product_sales (Quan hệ N-M giữa Sản phẩm và Chiến dịch).
 */
public class ProductSale implements Serializable {

    private static final long serialVersionUID = 1L;

    private ProductSaleId id;
    private Product product;
    private ProgramSale programSale;
    private String createdAt;
    private String updatedAt;

    public ProductSale() {}

    public ProductSale(ProductSaleId id, Product product, ProgramSale programSale, String createdAt, String updatedAt) {
        this.id = id;
        this.product = product;
        this.programSale = programSale;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public ProductSale(Product product, ProgramSale programSale, String createdAt, String updatedAt) {
        String pId = product != null ? product.getProductId() : null;
        String sId = programSale != null ? programSale.getSaleId() : null;
        this.id = new ProductSaleId(pId, sId);
        this.product = product;
        this.programSale = programSale;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public ProductSaleId getId() {
        return id;
    }

    public void setId(ProductSaleId id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
        if (product != null && this.id != null) {
            this.id.setProductId(product.getProductId());
        }
    }

    public ProgramSale getProgramSale() {
        return programSale;
    }

    public void setProgramSale(ProgramSale programSale) {
        this.programSale = programSale;
        if (programSale != null && this.id != null) {
            this.id.setSaleId(programSale.getSaleId());
        }
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProductSale that = (ProductSale) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "ProductSale{" +
                "id=" + id +
                ", createdAt='" + createdAt + '\'' +
                '}';
    }
}
