package com.example.server.controller;

import com.example.server.bo.Meteorology;
import com.example.server.service.ServerService;
import com.example.server.vo.MeteorologyVo;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

@CrossOrigin
@RestController
@RequestMapping(value = "",produces = "application/json;charset=UTF-8")
public class controller {
    @Autowired
    ServerService myservice;
    @GetMapping(value = "/data")
    public Object GetData(@RequestParam(value = "name") String name,
                                 @RequestParam(value = "begin",required = false)@JsonFormat(pattern="yyyy/MM/dd") Date begin,
                                 @RequestParam(value = "end",required = false)@JsonFormat(pattern="yyyy/MM/dd") Date end)
    {
        return myservice.GetData(name,begin,end);
    }
    //测试联通代码
    @GetMapping(path = "")
    public Object Get()
    {
        return "zy";
    }
    @PostMapping(value = "/data")
    public Object StoreData(@RequestBody MeteorologyVo value)
    {
        return myservice.StoreMeteorology(new Meteorology(value),value.getDate());
    }
}
