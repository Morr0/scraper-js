# Scraper for my own use

Feel free to use it. Duplicate sample.json to your liking. Include the link to your file in .env.

sample.json attributes: 
1. selector = HTML selector query
2. every = every x seconds (Defaults to 1 hour)
3. links = an array of links to scrape sequentially. A name/url pair.

## Writing the results: 
Values can be either written to a file and REST api. 

- To write to a file, just include the name of the file in your .env as the attribute `FILE_DEST`.
- To write in a POST API request:
    - Include the rest endpoint (must be the same for HEAD and POST methods) in .env as `API_POST_CALL`.
    - Implement a HEAD method that gets called only once at the start of the application for initialization purposes. **If it does not return a status of 200 will not proceed the POST API calls**.
    - Implement a POST method that recieves the body as `{name, value}` json formatted. Where `name` is the name of the link and the `value` is the value extracted out of the website.
    - Check `test/server/` for an example of the REST server.