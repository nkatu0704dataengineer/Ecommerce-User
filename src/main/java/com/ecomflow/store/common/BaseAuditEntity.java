package com.ecomflow.store.common;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Objects;

/**
 * Lớp cơ sở chứa các thuộc tính theo vết thời gian kế thừa cho các POJO Entity.
 * Hoàn toàn thuần Java (Không phụ thuộc JPA/Hibernate/Spring/Lombok).
 */
public abstract class BaseAuditEntity implements Serializable {

    private static final long serialVersionUID = 1L;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private String createdAt;
    private String updatedAt;
    private String ingestionTime;

    public BaseAuditEntity() {
        String nowStr = LocalDateTime.now().format(FORMATTER);
        this.createdAt = nowStr;
        this.updatedAt = nowStr;
        this.ingestionTime = nowStr;
    }

    public BaseAuditEntity(String createdAt, String updatedAt, String ingestionTime) {
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.ingestionTime = ingestionTime;
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

    public String getIngestionTime() {
        return ingestionTime;
    }

    public void setIngestionTime(String ingestionTime) {
        this.ingestionTime = ingestionTime;
    }

    public void touch() {
        this.updatedAt = LocalDateTime.now().format(FORMATTER);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BaseAuditEntity)) return false;
        BaseAuditEntity that = (BaseAuditEntity) o;
        return Objects.equals(createdAt, that.createdAt) &&
               Objects.equals(updatedAt, that.updatedAt) &&
               Objects.equals(ingestionTime, that.ingestionTime);
    }

    @Override
    public int hashCode() {
        return Objects.hash(createdAt, updatedAt, ingestionTime);
    }

    @Override
    public String toString() {
        return "createdAt='" + createdAt + '\'' +
                ", updatedAt='" + updatedAt + '\'' +
                ", ingestionTime='" + ingestionTime + '\'';
    }
}
