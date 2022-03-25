package com.example.server.bo;

import lombok.Data;

import java.io.Serializable;

@Data
public class Position implements Serializable {
    //经度
    Double Longitude;
    //纬度
    Double Latitude;
}
