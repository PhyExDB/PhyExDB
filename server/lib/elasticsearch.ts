import { Client } from "@elastic/elasticsearch"

/** Create elasticsearch client */
export const elasticsearch = new Client({
  node: "http://localhost:9200", // Replace with your Elasticsearch server URL
})
