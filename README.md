# GCP-API-Police-CF
Example Cloud Function to prevent unauthorized APIs from being enabled

## Usage
To run this Cloud Function in blockedMode, deploy the `apiPolice` function in `index.js`. To customize for your organizations usage, update `const blockedList` to match the list of your organizations blocked APIs.

To run this Cloud Function in allowMode, deploy the `apiPoliceAllowedList` function in `index.js`. To customize for your organizations usage, update `const allowedList`.

[Documentation on deploying Google Cloud Function](https://cloud.google.com/functions/docs/deploying/)
