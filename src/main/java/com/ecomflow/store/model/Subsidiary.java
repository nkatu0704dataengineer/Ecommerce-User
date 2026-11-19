package com.ecomflow.store.model;

import com.ecomflow.store.common.BaseAuditEntity;
import java.util.Objects;

/**
 * POJO Entity ánh xạ bảng dbo.subsidiaries (Mạng lưới Showroom bán lẻ).
 */
public class Subsidiary extends BaseAuditEntity {

    private static final long serialVersionUID = 1L;

    private String subId;
    private String subName;
    private String phoneNumber;
    private String establishmentDate;
    private String subStreet;
    private String subDistrict;
    private String subCity;

    public Subsidiary() {
        super();
    }

    public Subsidiary(String subId, String subName, String phoneNumber, String establishmentDate,
                      String subStreet, String subDistrict, String subCity) {
        super();
        this.subId = subId;
        this.subName = subName;
        this.phoneNumber = phoneNumber;
        this.establishmentDate = establishmentDate;
        this.subStreet = subStreet;
        this.subDistrict = subDistrict;
        this.subCity = subCity;
    }

    public Subsidiary(String subId, String subName, String phoneNumber, String establishmentDate,
                      String subStreet, String subDistrict, String subCity,
                      String createdAt, String updatedAt, String ingestionTime) {
        super(createdAt, updatedAt, ingestionTime);
        this.subId = subId;
        this.subName = subName;
        this.phoneNumber = phoneNumber;
        this.establishmentDate = establishmentDate;
        this.subStreet = subStreet;
        this.subDistrict = subDistrict;
        this.subCity = subCity;
    }

    public String getSubId() {
        return subId;
    }

    public void setSubId(String subId) {
        this.subId = subId;
    }

    public String getSubName() {
        return subName;
    }

    public void setSubName(String subName) {
        this.subName = subName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEstablishmentDate() {
        return establishmentDate;
    }

    public void setEstablishmentDate(String establishmentDate) {
        this.establishmentDate = establishmentDate;
    }

    public String getSubStreet() {
        return subStreet;
    }

    public void setSubStreet(String subStreet) {
        this.subStreet = subStreet;
    }

    public String getSubDistrict() {
        return subDistrict;
    }

    public void setSubDistrict(String subDistrict) {
        this.subDistrict = subDistrict;
    }

    public String getSubCity() {
        return subCity;
    }

    public void setSubCity(String subCity) {
        this.subCity = subCity;
    }

    public String getFullAddress() {
        StringBuilder sb = new StringBuilder();
        if (subStreet != null && !subStreet.isBlank()) sb.append(subStreet);
        if (subDistrict != null && !subDistrict.isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(subDistrict);
        }
        if (subCity != null && !subCity.isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(subCity);
        }
        return sb.toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Subsidiary that = (Subsidiary) o;
        return Objects.equals(subId, that.subId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(subId);
    }

    @Override
    public String toString() {
        return "Subsidiary{" +
                "subId='" + subId + '\'' +
                ", subName='" + subName + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", subCity='" + subCity + '\'' +
                ", fullAddress='" + getFullAddress() + '\'' +
                ", " + super.toString() +
                '}';
    }
}
