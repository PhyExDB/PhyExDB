package de.phyexdb.phyexdb

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class HelloWorldController {
	@GetMapping("/hello") //http://localhost:8080/hello?name=World
	fun index(@RequestParam("name") name: String) = "Hello, $name!"
}