/**
 * Asynchronously fetches dragon data from the API and prints it to the console.
 */
async function fetchDragonData() {
    const url = "https://dragon.best/api/dragons.json";

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse the response body as a JavaScript object (which will be your array)
        const dataArray = await response.json();
        
        // THIS LINE PRINTS THE ENTIRE ARRAY TO YOUR BROWSER'S CONSOLE:
        console.log("Here is the full data array from the API:", dataArray);
        
        // Example of accessing the first item in the array:
        // console.log("First dragon's name:", dataArray[0].name); 

    } catch (error) {
        console.error("Could not fetch dragon data:", error);
    }
}

// Execute the function
fetchDragonData();
