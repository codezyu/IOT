package com.example.server.vo;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;

import java.util.Date;

@Data
public class TemperatureVo {
    String name;
    Double temp;
    Date time;
}
