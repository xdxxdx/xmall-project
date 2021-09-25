package com.xdx.xmall;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.sql.DataSource;

@SpringBootApplication
@Slf4j
public class XmallServerApplication implements CommandLineRunner
{
    @Autowired
    private DataSource dataSource;
    public static void main(String[] args) {
        SpringApplication.run(XmallServerApplication.class, args);
    }


    @Override
    public void run(String... args) throws Exception {
        log.info("数据源："+dataSource.toString());
    }
}
