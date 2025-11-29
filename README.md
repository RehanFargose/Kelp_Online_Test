# Kelp_Online_Test
Custom CSV to JSON parser in JS, to also store &amp; retrieve Age distribution from PG15 DB.
Assumptions:
  - The CSV file has 1st 4 columns as prescribed by the PDF(fullname, age, address, gender)
  - All other columns after the main 4 are random and during CSV to JSON parsing are added in the main object together as a sub-object
  - Type checking kept mainly for age, all other are strings
  - Duplicate check based on fullname+Additonal_info matching
  - fs.readfile was replaced by stream since pdf mentioned possibility of 50,000+ records(Scalability)
  - PG15 db is used.
  - fullname in csv is 1 column having "fname lname" in each cell, which is to be separated based on spaces during parsing
  - Address is also 1 cell/column in csv, divided strictly into 4 parts as prescribed by pdf
  - A folder containing Output SS is also attached
