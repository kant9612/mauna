package com.mauna.service;

import com.mauna.domain.Customer;
import com.mauna.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerService {

    private static final String CODE_PREFIX = "CUS";
    private static final int MAX_RETRY = 3;

    @Autowired
    private CustomerRepository customerRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));
    }

    @Transactional(noRollbackFor = DuplicateKeyException.class)
    public Customer createCustomer(Customer customer) {
        for (int retry = 0; retry < MAX_RETRY; retry++) {
            String nextCode = generateNextCode();
            customer.setCode(nextCode);
            try {
                customerRepository.insert(customer);
                return customer;
            } catch (DuplicateKeyException e) {
                if (retry == MAX_RETRY - 1) {
                    throw new RuntimeException("Failed to generate unique customer code", e);
                }
            }
        }
        return customer;
    }

    private String generateNextCode() {
        String maxCode = customerRepository.findMaxCode();
        int nextNumber = 1;
        if (maxCode != null && maxCode.startsWith(CODE_PREFIX)) {
            try {
                nextNumber = Integer.parseInt(maxCode.substring(CODE_PREFIX.length())) + 1;
            } catch (NumberFormatException e) {
                // ignore
            }
        }
        return String.format("%s%03d", CODE_PREFIX, nextNumber);
    }

    @Transactional
    public Customer updateCustomer(Long id, Customer customer) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));
        customer.setId(id);
        customer.setCode(existing.getCode());
        customerRepository.update(customer);
        return customer;
    }

    @Transactional
    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }
}
