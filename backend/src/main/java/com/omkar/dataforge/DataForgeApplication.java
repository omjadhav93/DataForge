package com.omkar.dataforge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DataForgeApplication {

	public static void main(String[] args) {
		SpringApplication.run(DataForgeApplication.class, args);
	}


}
