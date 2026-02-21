package com.mauna.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private Long id;
    private String name;
    private String code;
    private String address;
    private String phone;
    private String email;
    private String contactPerson;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CustomerResponse fromDomain(com.mauna.domain.Customer customer) {
        return new CustomerResponse(
            customer.getId(),
            customer.getName(),
            customer.getCode(),
            customer.getAddress(),
            customer.getPhone(),
            customer.getEmail(),
            customer.getContactPerson(),
            customer.getNotes(),
            customer.getCreatedAt(),
            customer.getUpdatedAt()
        );
    }
}
