# Organization's Relations Service
A RESTful service that enables users to create and retrieve the relations of an organization.  
The possible relations an organization can have are `PARENT`, `DAUGHTER`, `SISTER`.  

## Table of Contents
[Getting Started](./README.md#getting-started)
  * [Requirements](./README.md#requirements)
  * [Installing](./README.md#installing)
  * [Running](./README.md#running)
  * [Testing](./README.md#testing)  

[Endpoints](./README.md#endpoints)
  * [`/organization/relations`](./README.md#post-organizationrelations)
  * [`/organization/:name/relations`](./README.md#get-organizationnamerelations)

[DB Schema](./README.md#db-schema)
  * [The Index](./README.md#the-index)

[Architecture](./README.md#architecture)
  * [Handlers](./README.md#handlers)
  * [Repository](./README.md#repository)
  * [Adapters](./README.md#adapters)

## Getting Started
### Requirements
  * NodeJS version 14 or higher  
### Installing
```npm install```
### Running
```
npm start
```
### Testing
```
npm test
```
Alternatively, you can run the tests in watch mode with:
```
npm run test:watch
```

## Endpoints
### POST `/organization/relations`
Creates the relations of an organization.  
It expects a body in JSON format with the schema
```json
{
  "org_name": "<parent>",
  "daughters": [
    {
      "org_name": "<child 1>",
      "daughters": [
        {
          "org_name": "<child 1.1>",
          "daughters": [...]
        }
      ]
    },
    {
      "org_name": "<child 2>",
      "daughters": [...]
    },
    ...
  ]
}
```
A succesful response
```json
{
  "success": true
}
```
More information [LINK](LINK)

### GET `organization/:name/relations`
Retrieves the relations of the organization `:name`.  
The relations are sorted alphabetically and paginated with a maximum of 100 relations by page.  
An example of a succesful response.
```json
{
  "relations": [
    {
      "org_name": "Child 1",
      "relationshio_type": "daughter"
    },
    {
      "org_name": "Child 2",
      "relationshio_type": "sister"
    },
    {
      "org_name": "Parent",
      "relationshio_type": "parent"
    }
  ],
  "pagination": {
    "prev_cursor": "Child 1",
    "next_cursor": "Parent"
  }
}
```
#### Pagination
This endpoint supports pagination through cursors, meaning clients can only request the *previous* and *next* page and not a specific page.  
The server responds with a `pagination` property that contains the name of the first relation, in `prev_cursor`, and the name of the last relation, in `next_cursor`. The value of `next_cursor` will be `null` when there are no more pages.    
Clients move between pages by sending two query parameters: `before` and `after`.  
The clients must use `after` for fetching the next page and **both** `before` and `after` to fetch the previous page.  
##### Example
###### Next Page
Fetching the next page is straightfoward, the client sends the `next_cursor` value in the `after` query parameter.  
`GET /organization/:name/relations?after=<next_cursor>`.  
###### Previous Page
Fetching the previous page is more trickier, the client would need to save the previous page `prev_cursor` value, send it in the `after` parameter while also sending the current page `prev_cursor` value in the `before` parameter.   
`GET /organization/:name/relations?before=<current_page:prev_cursor>&after=<last_page:prev_cursor>`.

## DB Schema
![schema](./docs/db_schema.png)  

The service is supported by a `relations` table and an associated index.  
Each row of `relations` can be seen as an edge of a graph where the column `head` represents the start vertice, the column `tail` represents the end vertice, and the column `type` representing the type of relationship.  

### The index
Since retrieving relations by alphabetical order needs to be supported, an index was created on the `relations` table where the `head` column acts as the "primary key" and the `tail` column acts as the "sort key".  This can be seen as an `ORDER BY` done at insertion time instead of query time.  

**Example**  
The relations table could be in this state and no order would be guaranteed.  

![table](./docs/db_schema_table.png)  

However, the index would be like this, guaranteeing the alphabetical order.  

![index](./docs/db_schema_index.png)

## Architecture
This project follows the current code architecure:  

![architecture](./docs/code_design.png)

### Handlers
Handlers are the first and last point of contact with the client, they are responsible for validating the client's request and responding adequately.  
Handlers only interact with the repository.

### Repository
Repository provide the access paterns for our usecases.  
It uses an *adapter* to interact with the storage layer.

### Adapters
An adapter is an abstraction layer over the actual storage used be it SQL, NoSQL or even in-memory.
