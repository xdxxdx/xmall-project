package com.xdx.xmall.lesson.orm;

import java.util.List;

public interface CustmerService {
    /**
     * 新增
     *
     * @param id
     * @param firstName
     * @param lastName
     * @return
     */
    int create(long id, String firstName, String lastName);

    /**
     * 根据firstname查询
     *
     * @param firstName
     * @return
     */
    List<Customer> getByFirstName(String firstName);

    /**
     * 删除
     *
     * @param firstName
     * @return
     */
    int deleteByfirtName(String firstName);

    /**
     * 获取所有
     * @return
     */
    List<Customer>getAll();


}
