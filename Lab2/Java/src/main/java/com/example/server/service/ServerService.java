package com.example.server.service;

import com.example.server.bo.Meteorology;
import com.example.server.bo.Position;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.*;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
public class ServerService {
    static TreeMap<Date, Meteorology> meteorologyHashMap;
    static HashMap<Date, Position> positionHashMap;

    public Object GetData(String name,
                          Date begin,
                          Date end) {
        if(name.equals("meteorology")){
           return GetMeteorology(begin,end);
        }
        else {
            return null;
        }
    }

    public void StoreData(String name, Object Data, Date time) {
        if (name.equals("meteorology")) {
            StoreMeteorology((Meteorology) Data, time);
        }
    }
    public Object GetMeteorology(Date begin,Date end){
        if(meteorologyHashMap==null) {
            return null;
        }
        if (begin == null || end == null){
            return meteorologyHashMap.values().stream().collect(Collectors.toList());
        }
       return meteorologyHashMap.subMap(begin,true,end,true).values().stream().collect(Collectors.toList());
    }
    public Object StoreMeteorology(Meteorology meteorology, Date Time) {
        if(meteorologyHashMap==null)
            meteorologyHashMap=new TreeMap<>();
        meteorologyHashMap.put(Time, meteorology);
        return null;
    }

    @PostConstruct
    public void init() {
        try {
            //读取文件
            FileInputStream in = null;
            File file = new File("./meteorology.ser");
            if (!file.exists()) {
                file.createNewFile();
            }
            in = new FileInputStream(file);
            ObjectInputStream oi = new ObjectInputStream(in);
            meteorologyHashMap=(TreeMap<Date, Meteorology>) oi.readObject();
            in.close();
            oi.close();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (Exception e) {
            System.out.println(meteorologyHashMap==null);
            e.printStackTrace();
        }
    }
    @Scheduled(fixedRate = 10000)
    public void scheduledTask() {
        try {
            if(meteorologyHashMap==null)
                return;
            FileOutputStream out = null;
            File file = new File("./meteorology.ser");
            if (!file.exists()) {
                file.createNewFile();
            }
            out = new FileOutputStream(file);
            ObjectOutputStream os = new ObjectOutputStream(out);
            os.writeObject(meteorologyHashMap);
            os.close();
            out.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
