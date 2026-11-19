package com.ecomflow.store.model;

import java.io.Serializable;
import java.util.Objects;

/**
 * POJO Entity ánh xạ bảng dbo.employees.
 */
public class Employee implements Serializable {

    private static final long serialVersionUID = 1L;

    private String employeeId;
    private String lastName;
    private String firstName;
    private String gender;
    private String phone;
    private String email;
    private String born;
    private String address;
    private String recruitedAt;
    private String username;
    private String password;
    private String role;
    private Subsidiary subsidiary;
    private String ingestionTime;

    public Employee() {}

    public Employee(String employeeId, String lastName, String firstName, String gender,
                    String phone, String email, String born, String address,
                    String recruitedAt, String username, String password,
                    String role, Subsidiary subsidiary, String ingestionTime) {
        this.employeeId = employeeId;
        this.lastName = lastName;
        this.firstName = firstName;
        this.gender = gender;
        this.phone = phone;
        this.email = email;
        this.born = born;
        this.address = address;
        this.recruitedAt = recruitedAt;
        this.username = username;
        this.password = password;
        this.role = role;
        this.subsidiary = subsidiary;
        this.ingestionTime = ingestionTime;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
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

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBorn() {
        return born;
    }

    public void setBorn(String born) {
        this.born = born;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getRecruitedAt() {
        return recruitedAt;
    }

    public void setRecruitedAt(String recruitedAt) {
        this.recruitedAt = recruitedAt;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Subsidiary getSubsidiary() {
        return subsidiary;
    }

    public void setSubsidiary(Subsidiary subsidiary) {
        this.subsidiary = subsidiary;
    }

    public String getIngestionTime() {
        return ingestionTime;
    }

    public void setIngestionTime(String ingestionTime) {
        this.ingestionTime = ingestionTime;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Employee employee = (Employee) o;
        return Objects.equals(employeeId, employee.employeeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(employeeId);
    }

    @Override
    public String toString() {
        return "Employee{" +
                "employeeId='" + employeeId + '\'' +
                ", fullName='" + getFullName() + '\'' +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                '}';
    }
}
