package com.xdx.xmall.lesson.orm;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.annotation.security.RunAs;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Slf4j
class CustmerServiceImplTest {
    @Autowired
    private CustmerService custmerService;

    @Test
    void create() {
        custmerService.create(7,"jr","smith");
        int a=custmerService.create(8,"jr2","smith2");
        assertEquals(1,1);


    }

    @Test
    void getByFirstName() {
        List<Customer> customerList=custmerService.getByFirstName("Josh");
        customerList.forEach(customer -> {
            log.info(customer.toString());
        });
    }

    @Test
    void deleteByfirtName() {
    }

    @Test
    void getAll() {
    }
}