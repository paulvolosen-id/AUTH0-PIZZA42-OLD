const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/contacts.readonly'];
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Tasks API.
//  authorize(JSON.parse(content), listConnectionNames);
    authorize(JSON.parse(content), getConnectionCount);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Get the numbe of total connections for individual user
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

function getConnectionCount(auth) {

    const service = google.people({version: 'v1', auth});

  service.people.connections.list({
    resourceName: 'people/me',
    pageSize: 10,
    personFields: 'names',
  }, (err, res) => {
    if (err) return console.error('The API returned an error: ' + err);
    console.log("totalItems: " + res.data.totalItems);
  
    });
}

/* Leaving code incase customer asks to see more detailed functionality 

  function listConnectionNames(auth) {
  const service = google.people({version: 'v1', auth});
  //totalCount = service.people.connections.list.totalItems;
  //console.log('Connections Count: '+ totalCount);

  service.people.connections.list({
    resourceName: 'people/me',
    pageSize: 10,
    personFields: 'names,emailAddresses',
  }, (err, res) => {
    if (err) return console.error('The API returned an error: ' + err);
    console.log("totalItems: " + res.data.totalItems);

    const connections = res.data.connections;
    if (connections) {

      
      connections.forEach((person) => {
        //console.log("connections.totalItems: " + connections.totalItems);

        if (person.names && person.names.length > 0) {
          console.log(person.names[0].displayName);
    //      totalCount++;
         // console.log('In for each person ... connections Count: '+ totalCount);

        } else {
          console.log('No display name found for connection.');
        }
      });
    } else {
      console.log('No connections found.');
    }
  });

  //console.log('Connections Count: '+ totalCount);
}
*/