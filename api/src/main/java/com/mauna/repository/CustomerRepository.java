package com.mauna.repository;

import com.mauna.domain.Customer;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface CustomerRepository {
    List<Customer> findAll();
    Optional<Customer> findById(@Param("id") Long id);
    void insert(Customer customer);
    void update(Customer customer);
    void deleteById(@Param("id") Long id);
    String findMaxCode();
}
