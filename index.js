const express = require('express')
const app = express()
const port = 3010
const bodyParser = require('body-parser')
const moment = require('moment')
app.use(bodyParser.json())

app.post('/', (request, response) => {
    // request passes in the last billing event based on the user logged in. On the frontend (ie Vuejs) this would GET on the created hook
    let lastBilling = moment(request.body.last_billing_event).format("YYYY-MM-DD")
    // console.log(lastBilling)
    // initialise an array
    let data = []
    // could be retrieved dynamically
    const billingFrequencies = [7, 14, 28, 42]
    //iterate through the billing breaks
    billingFrequencies.forEach((billingFrequency) => {
        let dataObject = {}
        dataObject.break = billingFrequency/7
        dataObject.billingdate = moment(lastBilling).add(billingFrequency, 'days').format("YYYY-MM-DD")
        // delivery add 2 days on from the billing date
        dataObject.deliverydate = moment(lastBilling).add(billingFrequency + 2, 'days').format("YYYY-MM-DD")
        //if delivery date is a Sunday defer to the Monday
        if (moment(lastBilling).add(billingFrequency + 2, 'days').day() === 0) {
            console.log('is Sunday')
            dataObject.deliverydate = moment(lastBilling).add(billingFrequency + 3, 'days').format("YYYY-MM-DD")
        } else {
            console.log('is not Sunday')
        }
        //append the array
        data.push(dataObject)
    });

    if (moment().format('HH:mm:ss') > (moment().hour(14).format('HH:mm:ss'))) {
        // In the response the frontend is informed to dipatch tomorrow if they order after 2pm, 
        // Guessing this feature is if they order for immediate fulfillment rather than using a payment break point.
        data.push({ deferDelivery: true })
    } else {    
        data.push({ deferDelivery: false })
    }
    response.send(data)
})

app.listen(port, () => {
    console.log(`Breaks app listening on port ${port}`)
})