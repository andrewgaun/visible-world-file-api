# Visible World File Delivery

### Getting started
Download project and run the following scripts

`npm run build`

`npm run server`

Review the `scripts` section in `package.json` for the full list of commands.


### Endpoints
**Add Host**
----
  Create a new host. Hosts need a `name`.

* **URL**

  /host

* **Method:**

  `POST`

* **Data Params**

  **Required:**
 
  `{"name"=[string]}`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{"status": "200"}`
 
* **Error Response:**

  * **Code:** 400 Bad Request <br />
    **Content:** `{
      "status": 400,
      "title": "ValidationError",
      "detail": [{...}]}`

  OR

  * **Code:** 409 Conflict <br />
    **Content:** `{
  "status": 409,
  "title": "AlreadyInUseError",
  "detail": "The specified 'host' value is already in use for: name"
}`

* **Sample Call:**

  ```
    curl -H "Content-Type: application/json" -X POST -d '{"name":"test"}' http://localhost:3000/host
  ```



**Show Hosts**
----
  Returns json data about all hosts.

* **URL**

  /hosts

* **Method:**

  `GET`
  
*  **URL Params**

  None

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `['host1', 'host2', ...]`
 
* **Error Response:**

  None

* **Sample Call:**

  ```
    curl http://localhost:3000/hosts
  ```



**Add Link**
----
  Creates a link between two hosts. Links need the names of the two hosts being
connected and a description of the link.

* **URL**

  /link

* **Method:**

  `POST`

* **Data Params**

  **Required:**
  `{
    "from": [string],
    "to": [string],
    "description": [string]
  }`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{"status": "200"}`
 
* **Error Response:**

  * **Code:** 400 Bad Request <br />
    **Content:** `{
      "status": 400,
      "title": "ValidationError",
      "detail": [{...}]}`

  OR

  * **Code:** 404 Not Found <br />
    **Content:** `{
  "status": 404,
  "title": "NotFoundError",
  "detail": "Not Found: \"host1\""
}`

* **Sample Call:**

  ```
  curl -H "Content-Type: application/json" -X POST -d '{"to":"host1", "from":"host2", "description":"ftp"}' http://localhost:3000/link
  ```


**Show Links**
----
  Returns a listing of all links.

* **URL**

  /links

* **Method:**

  `GET`
  
*  **URL Params**

  None

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `[
  {
    "from": "host1",
    "to": "host2",
    "description": "ftp"
  },
  ...
]`
 
* **Error Response:**

  None

* **Sample Call:**

  ```
    curl http://localhost:3000/links
  ```



**Get Path**
----
  Get the easiest way to transfer a file between host A and host B. If there is no path between the hosts, return an empty array.

* **URL**

  /path/:A/to/:B

* **Method:**

  `GET`
  
*  **URL Params**

  **Required:**
 
   `A=[string]`
   `B=[string]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `[
  {
    "from": "host1",
    "to": "host2",
    "description": "ftp"
  },
  ...
]`
 
* **Error Response:**

  * **Code:** 404 Not Found <br />
    **Content:** `{
  "status": 404,
  "title": "NotFoundError",
  "detail": "Not Found: \"host1\""
}`

* **Sample Call:**

  ```
    curl http://localhost:3000/path/host1/to/host2
  ```


