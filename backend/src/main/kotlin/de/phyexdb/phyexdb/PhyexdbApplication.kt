package de.phyexdb.phyexdb

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.ComponentScan
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@SpringBootApplication
class PhyexdbApplication

fun main(args: Array<String>) {
	runApplication<PhyexdbApplication>(*args)
}

@RestController
class HelloWorldController {
	@GetMapping("/hello")
	fun index(@RequestParam("name") name: String) = "Hello, $name!"
}