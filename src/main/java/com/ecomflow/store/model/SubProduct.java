package com.ecomflow.store.model;

import com.ecomflow.store.common.BaseAuditEntity;
import java.util.Objects;

/**
 * POJO Entity ánh xạ bảng dbo.sub_products (Ma trận Tồn kho Đa Chi nhánh).
 */
public class SubProduct extends BaseAuditEntity {

    private static final long serialVersionUID = 1L;

    private SubProductId id;
    private Subsidiary subsidiary;
    private Product product;
    private Integer quantity;

    public SubProduct() {
        super();
    }

    public SubProduct(SubProductId id, Subsidiary subsidiary, Product product, Integer quantity) {
        super();
        this.id = id;
        this.subsidiary = subsidiary;
        this.product = product;
        this.quantity = quantity;
    }

    public SubProduct(Subsidiary subsidiary, Product product, Integer quantity) {
        super();
        String subId = subsidiary != null ? subsidiary.getSubId() : null;
        String prodId = product != null ? product.getProductId() : null;
        this.id = new SubProductId(subId, prodId);
        this.subsidiary = subsidiary;
        this.product = product;
        this.quantity = quantity;
    }

    public SubProductId getId() {
        return id;
    }

    public void setId(SubProductId id) {
        this.id = id;
    }

    public Subsidiary getSubsidiary() {
        return subsidiary;
    }

    public void setSubsidiary(Subsidiary subsidiary) {
        this.subsidiary = subsidiary;
        if (subsidiary != null && this.id != null) {
            this.id.setSubsidiaryId(subsidiary.getSubId());
        }
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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    /**
     * Trạng thái tồn kho hiển thị cho người mua hàng
     * >= 5: Còn hàng
     * 1 .. 4: Sắp hết hàng
     * 0: Tạm hết hàng
     */
    public String getStockStatusText() {
        if (quantity == null || quantity <= 0) return "Tạm hết hàng";
        if (quantity < 5) return "Sắp hết hàng (còn " + quantity + " máy)";
        return "Còn hàng (" + quantity + " máy)";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SubProduct that = (SubProduct) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "SubProduct{" +
                "id=" + id +
                ", quantity=" + quantity +
                ", status=" + getStockStatusText() +
                '}';
    }
}
