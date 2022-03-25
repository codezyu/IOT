package com.example.server;

import com.example.server.service.ServerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ServerApplication {

    @Autowired
    ServerService service;
    public static void main(String[] args) {
        SpringApplication.run(ServerApplication.class, args);
    }

}
