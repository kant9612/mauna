package com.mauna.controller;

import com.mauna.domain.Customer;
import com.mauna.dto.CustomerRequest;
import com.mauna.dto.CustomerResponse;
import com.mauna.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/customers")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"}, allowCredentials = "true")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {
        List<Customer> customers = customerService.getAllCustomers();
        List<CustomerResponse> response = customers.stream()
                .map(CustomerResponse::fromDomain)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Long id) {
        Customer customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(CustomerResponse.fromDomain(customer));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomerResponse> createCustomer(@RequestBody CustomerRequest request) {
        Customer customer = new Customer();
        customer.setName(request.getName());
        // codeは自動採番されるため、リクエストから設定しない
        customer.setAddress(request.getAddress());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setContactPerson(request.getContactPerson());
        customer.setNotes(request.getNotes());

        Customer created = customerService.createCustomer(customer);
        return ResponseEntity.ok(CustomerResponse.fromDomain(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomerResponse> updateCustomer(@PathVariable Long id, @RequestBody CustomerRequest request) {
        Customer customer = new Customer();
        customer.setName(request.getName());
        // codeは既存値を維持するため、リクエストから設定しない（Serviceで処理）
        customer.setAddress(request.getAddress());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setContactPerson(request.getContactPerson());
        customer.setNotes(request.getNotes());

        Customer updated = customerService.updateCustomer(id, customer);
        return ResponseEntity.ok(CustomerResponse.fromDomain(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
}
