package com.webank.wedatasphpere.dss.user.service.impl;


import com.webank.wedatasphpere.dss.user.dto.request.AuthorizationBody;
import org.junit.jupiter.api.Test;

class MetastoreCommandTest {

    @Test
//    @MethodSource("body")
    void authorization() {
        AuthorizationBody body = new AuthorizationBody();
        body.setUsername("anlexander");
        body.setPassword("123321");
        MetastoreCommand test = new MetastoreCommand();

        try {
            test.authorization(body);
        } catch (Exception e) {
            e.printStackTrace();
        }

        System.out.println("当前测试方法结束");
    }
}