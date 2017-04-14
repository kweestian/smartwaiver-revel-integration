### Smartwaiver + RevelPOS integration

1. Webhook fires from smartaiver everytime a user signs up, POSTs a unique_id to our heroku endpoint.  
2. we then query smartwaiver back with this unique_id to get the user's data
3. We get gorgeous XML data which we convert to JSON 
4. send JSON data to revel endpoint
5. now for a little dirty hack, if they opted out of email marketting, we use Mandrill to send an Are You Sure? click here to subscribe
6. Using mailchimp api, hard code the list-id so we can just add users to list without double opt-in