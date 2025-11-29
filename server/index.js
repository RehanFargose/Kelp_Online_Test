import express from "express";
import "dotenv/config";
import fs from 'fs';
import readline from 'readline'; 
import MyKelp from "./customClass.js";
import pool from "./db.js";


const app = express()
const PORT = process.env.PORT || 8080;



// This function takes the csv file as input and creates a list of dictionary/js objects
async function csvToObject(fileLocation){
    // It returns a list of objects
    // So all rows must be parsed, except for 1st row
    if (!fileLocation) {
        console.log("No Location passed for file through .env!");
        return;
    }

    // For scalability
    const stream = fs.createReadStream(fileLocation);

    // To store the data
    const allObjects = [];    

    // Read each line
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity }); 
    let isFirstRow = true; 
    console.log("CSV Data is:"); 
    
    // Take each line as it is processed
    for await (const line of rl) { 
        // Skip headers
        if (isFirstRow) 
        { 
            isFirstRow = false; 
            continue; 
        } 

        // print out the line/row and turn it into an object
        console.log(line);
        const newRecord = new MyKelp(line);

        allObjects.push(newRecord);
    }
    

    // Test whether the object actually holds the values
    console.log("Object correction test");
    console.log(allObjects[0].gender);
    console.log(allObjects[0].address.state);
    console.log(allObjects[1].address.city);   
    console.log(allObjects[1].name.lastName);
    console.log(allObjects[1].age);
    console.log(allObjects[0]);
    console.log(allObjects[1].additional_info);
    
    
    return allObjects;
}


// To check if a record already exists in the db, so as to skip it
async function duplicateCheck(fullName, extra_info) {
    try {
        const response = await pool.query("SELECT name FROM users WHERE name=$1 AND additional_info=$2", 
            [fullName, extra_info]);

        if (response.rowCount > 0) {
            return true;
        }
        else{
            return false;
        }
    } catch (error) {
        console.log(error);
    }
}


// Take the list of objects and store in PG15 database
async function storeInDB(peopleArr) {
    try {
        for (const elem of peopleArr) {
            const fullName = elem.name.firstName+" "+elem.name.lastName;

            // Duplicate check to prevent re-adding old rows from csv
            const duplicate = await duplicateCheck(fullName, JSON.stringify(elem.additional_info));

            if (duplicate) {
                console.log(fullName, "-->Already exists in DB: Skipped");
                continue;
            }

            var personAge = parseInt(elem.age, 10);
            // Check if value is null or negative
            if (isNaN(personAge) || personAge <0) {
                console.log("Age value is not integer or outright wrong for: ", fullName);
                continue;
            }

            const response = await pool.query("INSERT INTO public.users(name, age, address, additional_info) VALUES($1, $2, $3, $4) RETURNING *",
            [fullName, personAge, JSON.stringify(elem.address), JSON.stringify(elem.additional_info)]);
            
            console.log("Newly added record:",fullName);
            console.log(response.rows);
               
        }

    } catch (error) {
        console.log(error)
    }
 
    console.log("All records inserted succesfully in kelpdb");
    
}



// Get the ages and calculate the distribution
async function getAgeDist() {
    let ageList = [];
    try {
        const response = await pool.query("SELECT age FROM users");
        // List/array of just ages
        ageList = response.rows.map(elem => elem.age);
        
        const ageGroup = {
            "<20": 0,
            "20-40":0,
            "40-60":0,
            "60+":0,
        }

        // Create a hashmap for the age group
        ageList.forEach(num => {
            if (num<20) {
                ageGroup["<20"]++;
            }
            else if( num < 40){
                ageGroup["20-40"]++;
            }
            else if (num < 60) {
                ageGroup["40-60"]++;
            }
            else {
               ageGroup["60+"]++; 
            }
        })

        // Calculate Distribution
        console.log("Age Distribution is:");
        
        const totalLength = ageList.length;
        console.log("<20:", (ageGroup["<20"]/totalLength)*100, "%");
        console.log("20-40:", (ageGroup["20-40"]/totalLength)*100, "%");
        console.log("40-60:", (ageGroup["40-60"]/totalLength)*100, "%");
        console.log("60+:", (ageGroup["60+"]/totalLength)*100, "%");

    } catch (error) {
        console.log(error);
    }

}




// Home route
app.get('/', async (req, res) => {
    console.log("Route for CSV Extraction");
    try {
        const csvPath = process.env.CSV_LOCATION;
        console.log("csv path is: ", csvPath);

        const formattedObj = await csvToObject(csvPath);
        console.log("Total number of objects: ", formattedObj.length);
        
       // Function to insert all the elems in object to the DB
        await storeInDB(formattedObj);

        // Get distribution of ages
        getAgeDist();

        res.send('Kelp CSV to JSON parser');

    } catch (error) {
        console.error(error);
        res.json(error);
    }


})



// Start the app
const app_url = `http://localhost:${PORT}`
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`)
    console.log("URL is:", app_url);
    
})