package com.ecomflow.store.model;

import com.ecomflow.store.common.BaseAuditEntity;
import java.util.Objects;

/**
 * POJO Entity ánh xạ bảng dbo.customers (Khách hàng Storefront & Smember).
 */
public class Customer extends BaseAuditEntity {

    private static final long serialVersionUID = 1L;

    private String accId;
    private String cusId;
    private String lastName;
    private String firstName;
    private String email;
    private String phoneNumber;
    private String gender;
    private String birthDate;
    private Integer age;
    private String district;
    private String city;
    private String accountName;
    private String customerRank; // DIAMOND, VIP, COPPER, STANDARD
    private Boolean isActive;
    private Integer accountAgeDays;

    public Customer() {
        super();
    }

    public Customer(String accId, String cusId, String lastName, String firstName, String email,
                    String phoneNumber, String gender, String birthDate, Integer age,
                    String district, String city, String accountName, String customerRank,
                    Boolean isActive, Integer accountAgeDays) {
        super();
        this.accId = accId;
        this.cusId = cusId;
        this.lastName = lastName;
        this.firstName = firstName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.gender = gender;
        this.birthDate = birthDate;
        this.age = age;
        this.district = district;
        this.city = city;
        this.accountName = accountName;
        this.customerRank = customerRank;
        this.isActive = isActive;
        this.accountAgeDays = accountAgeDays;
    }

    public String getAccId() {
        return accId;
    }

    public void setAccId(String accId) {
        this.accId = accId;
    }

    public String getCusId() {
        return cusId;
    }

    public void setCusId(String cusId) {
        this.cusId = cusId;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getFullName() {
        return (lastName != null ? lastName + " " : "") + (firstName != null ? firstName : "");
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(String birthDate) {
        this.birthDate = birthDate;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public String getCustomerRank() {
        return customerRank;
    }

    public void setCustomerRank(String customerRank) {
        this.customerRank = customerRank;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public Integer getAccountAgeDays() {
        return accountAgeDays;
    }

    public void setAccountAgeDays(Integer accountAgeDays) {
        this.accountAgeDays = accountAgeDays;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Customer customer = (Customer) o;
        return Objects.equals(accId, customer.accId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(accId);
    }

    @Override
    public String toString() {
        return "Customer{" +
                "accId='" + accId + '\'' +
                ", fullName='" + getFullName() + '\'' +
                ", email='" + email + '\'' +
                ", rank='" + customerRank + '\'' +
                ", city='" + city + '\'' +
                ", " + super.toString() +
                '}';
    }
}
