package de.phyexdb.phyexdb

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class PhyexdbApplication

fun main(args: Array<String>) {
	runApplication<PhyexdbApplication>(*args)
}