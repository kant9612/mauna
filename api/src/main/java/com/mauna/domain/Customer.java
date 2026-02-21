package com.mauna.domain;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Customer {
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
}
