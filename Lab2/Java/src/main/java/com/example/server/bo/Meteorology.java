package com.example.server.bo;

import com.example.server.vo.MeteorologyVo;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

@Data
public class Meteorology implements Serializable {
    Double Temperature;
    Double Humidity;
    Double WindSpeed;
    Double RainFall;
    Double Altitude;
    Position Position;
    Date Date;

    public Meteorology(MeteorologyVo vo){
        Temperature=vo.getTemperature();
        Humidity=vo.getHumidity();
        WindSpeed=vo.getWindSpeed();
        RainFall=vo.getRainFall();
        Altitude=vo.getAltitude();
        Date=vo.getDate();
        Position=vo.getPosition();
    }
}
