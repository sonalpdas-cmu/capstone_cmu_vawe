var express = require('express');
var router = express.Router();
var MicrosoftGraph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

router.post('/', async function (req, res, next) {
    let token;
    const tokenAvailable = req.headers.authorization ||
        req.headers['x-access-token'];

    if (req.headers.authorization) {
        [, token] = req.headers.authorization.split(' ');
    } else {
        token = tokenAvailable;
    }

    if (token) {
        // Create a Graph client
        var client = MicrosoftGraph.Client.init({
            authProvider: (done) => {
                // Just return the token
                done(null, token);
            }
        });

        const subject = req.body.subject;
        const messageBody = req.body.messageBody;
        const startTime = req.body.startTime;
        const endTime = req.body.endTime;
        const location = req.body.location;
        const emails = req.body.receiverEmails;
        const attendees = [];
        for (let key in emails) {
            const attendee = {emailAddress: {address: null}, type: "required"};
            attendee.emailAddress.address = emails[key];
            attendees.push(attendee);
        }

        const messageRequest = {
            subject,
            body: {
                contentType: "HTML",
                content: messageBody
            },
            start: {
                dateTime: startTime,
                timeZone: "Eastern Standard Time"
            },
            end: {
                dateTime: endTime,
                timeZone: "Eastern Standard Time"
            },
            location: {
                displayName: location
            },
            attendees
        };

        // console.log(messageRequest, '====>')
        try {
            // Send Event Invite
            let response = await client
                .api('/me/calendar/events')
                .post(messageRequest)
            res.send({
                message: 'Event created successfully!',
                response
            })
        } catch (error) {
            console.log(error, '----->')
        }

    } else {
        res.send({
            error: "No access token"
        })
    }
});

module.exports = router;