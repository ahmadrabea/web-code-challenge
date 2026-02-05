# Web Code Challenge
## Scenario

We have a page in our system called *'Flight Inspirations'* where user can see suggestion for his upcoming travel.
You need to ceate an admin dashboard to view and edit the 'Flight Inspirations'.

## What is already in the codebase:
You have Tanstack table. Each table cell is editable and after updating any cell (or multiple cells) you will see the editted cells in highlighted color. 
You are able to save the cells and the data in the table is persisted. This functionality should remain working.
<img width="1576" alt="Screenshot 2025-02-13 at 2 57 33 PM" src="https://github.com/user-attachments/assets/e83cf53d-65e2-443b-a8af-1102c82bc720" />

## Assignment:
I. Register on Amadeus Developer and get access to their free open-source APIs we will use in this challenge:
Step-by-step guide to get the keys https://developers.amadeus.com/register

II. Create a form with inputs for: origin city code, destination city code, departure date, and departure time. Add a submit button or icon. The form should collect the necessary data to construct the API payload (originDestinations with originLocationCode, destinationLocationCode, and departureDateTime with date and time; travelers and sources can be set to default values).

III. Using the values from the form do the API call to fetch Flight Availability 
https://developers.amadeus.com/self-service/category/flights/api-doc/flight-availabilities-search/api-reference

**Note:** Mock data is available in `src/mocks/flightAvailabilityMock.json` as a fallback if the API is unavailable.


IV. Display the results of the call in the table you have in this codebase. Feel free to edit any code necessary, its just a blueprint. The only thing that you should pay attention is that cell edit/hightlight/save functionality is working.

V. After data is displayed make sure its styled nicely. 

VI. Add drag and drop functionality to the columns of the table. (You should be able to switch position of the columns: eg. 5 -> 1, 1 -> 2, etc).

VII. Add client side pagination.

VII. Optimize the state management of the app.


## Conditions
- You should think about the UI and UX of your app.
- You should think about the state management of your app.
- You should consume the api endpoint mentioned and not use it as internal json file.
- You should build this application using Reactjs and Typescript.

## What we are looking for

- **Simple, clear, readable code** How well structured it is? Clear separation of concerns? Can anyone just look at it and get the idea to
what is being done? Does it follow any standards?
- **Correctness** Does the application do what it promises? Can we find bugs or trivial flaws?
- **Memory efficiency** How will it behave in case of large datasets? Are results cached? Do you have debounce on your search?
- **Testing** How well tested your application is? Can you give some metrics?


## Questions & Delivery

If you have any questions to this challenge, please do reach out to us.

The challenge should be delivered as a link to a public git repository (github.com or bitbucket.com are preferred).
