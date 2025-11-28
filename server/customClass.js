// To safely split the full row based on commas when address also has commas inside
function safeSplitter(row) {
    // array/list to hold final result
    const result = [];
    // Hold the entire rebuilt address temporarily
    let current = '';
    let insideQuotes = false;

    for (let char of row) {

        if (char === '"') {
            insideQuotes = !insideQuotes;  
            continue;
        }

        if (char === ',' && !insideQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());

    return result;
}


// Customn class just for name & to split it
class Name{
    constructor(fullName){
        var dataArray = fullName.split(" ");
        this.firstName = dataArray[0] || "NA";
        this.lastName = dataArray[1] || "NA";
    }
}


// Customn class just for address & to split it
class Address{
    constructor(fullAddress){
        var dataArray = fullAddress.split(",").map(elem => elem.trim());
        this.line1 = dataArray[0] || "NA";
        this.line2 = dataArray[1] || "NA";
        this.city = dataArray[2] || "NA";
        this.state = dataArray[3] || "NA";
    }
}


// Final main class to represent full 1 row
class MyKelp{
    constructor(fullRow) {
        // The row elems are separate by ","
        var dataArray = safeSplitter(fullRow);

        // Set all the inner objects
        this.name = new Name(dataArray[0]);
        this.age = dataArray[1];
        this.address = new Address(dataArray[2]);
        this.gender = dataArray[3];

        // For remaining data columns
        if (dataArray.length > 4) {
            this.additional_info = {};
            for (let index = 4; index < dataArray.length; index++){ 
                this.additional_info[`extra_${index}`] = dataArray[index] || "NA";
            }
        }
 
  }

}



export default MyKelp;