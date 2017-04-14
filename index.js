var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var rp = require('request-promise');
var parseString = require('xml2js').parseString;
var curl = require('curlrequest');
var mandrill = require('mandrill-api/mandrill');
var utils = require('./utils/post-revel');
var moment = require('moment');
var Mailchimp = require('mailchimp-api-v3');


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // su

var API_KEY = process.env.SMARTWAIVER_API_KEY;
var API_VERSION = process.env.SMARTWAIVER_API_VERSION;

var mailchimp = new Mailchimp(process.env.MAILCHIMP_API_KEY_MC);
var mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_API_WEALTH);


// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.send(req.body);
});

app.get('/subscribeToMailChimp', function(req, res) {
  var email = decodeURIComponent(req.query.email);
  var firstname = decodeURIComponent(req.query.firstname);
  var lastname = decodeURIComponent(req.query.lastname);
  var dob = req.query.dob;

  mailchimp.post('lists/c1248e56b2/members', {
    email_address: email,
    status: 'subscribed',
    merge_fields: {
      FNAME: firstname,
      LNAME: lastname,
      MMERGE6: dob
    }
  })
  .then(function(response) {
    if (response.statusCode === 200) {
      res.redirect('https://wealthshop.us11.list-manage.com/subscribe/confirm?u=bac2b553f93cc20899dedd7df&id=c1248e56b2&e=19ef776399');
    }
  })
  .catch(function(err) {
    console.log(err);
    res.status(404).end();
  })
})

app.post('/', function(req, res) {

  var credential = req.body.credential;
  var unique_id = req.body.unique_id;
  var event = req.body.event;

  if (!credential || !unique_id || !event) {
	  return false;
  }

  var apiUrl = "http://www.smartwaiver.com/api/" + API_VERSION + "/?rest_request=" + API_KEY + "&rest_waiverid=" + unique_id;

  var postData = {};

  // initiate promise chain with get on Smartwaiver

  rp(apiUrl)
    .then(function(xml) {
      // Parse XML to JSON
      var result;
      parseString(xml, function(err, json) {
        result = json;
      });
      return result;
    })
    .then(function(val) {
      var user, testStr, regExp;

      
      user = val.xml.participants.toString() ? val.xml.participants[0].participant[0] : undefined;

      // if ID is a miss
      if (user === undefined) {
        throw new Error("user not found")
      }

      // if Test1, dont send to revel
      testStr = user.lastname + user.firstname + user.primary_email;
      regExp = /test1/i;

      if (testStr.match(regExp) === null) {
        function callback(err, res) {
          if (err) {
            console.log(err, 'from in curl to revel');
          } else {
            console.log(res);
          }
        }
        curl.request(utils.getRevelPost(user), callback);
      }

      return user;
    })
    .then(function(user) {

      // if they opted out of marketting, they get an Are you Sure ? email
      var sendOptOut = !JSON.parse(user.marketingallowed);

      var fullUrl = req.get('host') + '/subscribeToMailChimp?email=' + encodeURIComponent(user.primary_email) + '&firstname=' + encodeURIComponent(user.firstname) + '&lastname=' + encodeURIComponent(user.lastname) + '&dob=' + user.dob;

      if (sendOptOut) {

        var template_name = "opt-out-capture";
        var template_content = [{
          "name": "subscribe",
          "content": "You have chosen not to subscribe to our beautiful email list, If this is a mistake, you can <a href=" + fullUrl + ">subscribe here</a>"
        }];
        var message = {
          "to": [{
            "email": user.primary_email.toString(),
            "name": user.firstname,
            "type": "to"
          }],
          "headers": {
            "Reply-To": "admin@wealthshop.ca"
          },
          "track_clicks": true,
          "inline_css": true,
          "bcc_address": "signups@wealthshop.ca",
          "tags": [
              "opt-out-capture"
          ]
        };

        mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content, "message": message}, function(result) {
          console.log(result);
        }, function(e) {
          // Mandrill returns the error as an object with name and message keys
          console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
          // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
        });
      }
    })
    .catch(function(err) {
      console.log('error catch in promise chain: %s', err)
    })

  res.status(200).send('OK')
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
