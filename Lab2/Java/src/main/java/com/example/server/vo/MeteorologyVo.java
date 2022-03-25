package com.example.server.vo;

import com.example.server.bo.Position;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

@Data
public class MeteorologyVo {
    Double Temperature;
    Double Humidity;
    Double WindSpeed;
    Double RainFall;
    Double Altitude;
    Position Position;
    @JsonFormat(pattern="yyyy/MM/dd")
    Date Date;
    String name;
}
