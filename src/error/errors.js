// Lists all the error codes
module.exports = {
    // Initialization errors, where was supposed to initialize but could not
    SERVICE_NO_INIT_API: 0, // couldn't hook up with API
    SERVICE_NO_INIT_FILE: 1, // couldn't find the file destination to be valid
    SERVICE_NO_INIT_MONGO: 2, // couldn't connect to MongoDB

    SCRAPE_TIMEOUT: 3, // Couldn't scrape the content in time
    SCRAPE_EMPTY_RESULTS: 33, // When the result is empty, indicates bad scrape (maybe the selector has changed)

    // Error with sending scraped data to destination
    SERVICE_FAILURE_API: 4, // error sending POST request to destination
    SERVICE_FAILURE_FILE: 5, // error writing to a file
    SERVICE_FAILURE_MONGO: 6, // error writing to MongoDB

}