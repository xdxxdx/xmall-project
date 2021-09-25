package com.xdx.xmall.lesson.orm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
@Component
public class CustmerServiceImpl implements CustmerService {
    @Autowired
    JdbcTemplate jdbcTemplate;
    @Override
    public int create(long id, String firstName, String lastName) {
        return jdbcTemplate.update("insert into customers(id, first_name,last_name) values(?, ?,?)", id, firstName,lastName);
    }

    @Override
    public List<Customer> getByFirstName(String firstName) {
        List<Customer> custmerList= jdbcTemplate.query("select * from customers where first_name = ?",(resultSet, i) -> {
            Customer customer = new Customer(resultSet.getLong("id"),resultSet.getString("first_name"),resultSet.getString("last_name"));
            return customer;

        },firstName);
        return custmerList;
    }

    @Override
    public int deleteByfirtName(String firstName) {
        return jdbcTemplate.update("delete from customers where first_name=?", firstName);
    }

    @Override
    public List<Customer> getAll() {
        return jdbcTemplate.queryForList("select * from customers",Customer.class);
    }
}
