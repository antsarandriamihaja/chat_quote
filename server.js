const restify = require('restify');
const builder = require('botbuilder');
const MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID;
const config = require('./config');

var port = process.env.PORT || 3978;

var server = restify.createServer();

const connector = new builder.ChatConnector({
    appId: config.appId,
    appPassword: config.appPassword
});

var bot = new builder.UniversalBot(connector);

bot.dialog('/', [
    function(session){
        builder.Prompts.text(session, 'Welcome to the South Park Quote Machine!')
    },
    function(session){
        session.beginDialog('/ensureProfile')
    },
    function (session, results, next){
        session.userData.profile = results.response
        if (session.userData.profile.fan === 'Yes'){
            session.send('Hello %s, we are glad you are a fan of South Park', session.userData.profile.name)
        }
        else{
            session.send('Hi there %s, we hope you have fun with this app anyway!', session.userData.profile.name)
        }
        next();
    },
    
])

bot.dialog('/ensureProfile', [
    function (session, args, next){
        session.userData.profile = args || {}
        if (!session.userData.profile.name){
            builder.Prompts.text(session, 'What is your name?')
        }
        else{
            next();
        }
    },
    function (session, results, next){
        if (results.response){
             session.userData.profile.name = results.response
        }
        if (!session.userData.profile.fan){
            builder.Prompts.choice(session, 'Are you a South Park fan?', ['Yes', 'Nope'])
        }
        else{
            next();
        } 
    },
    function (session, results){
        if (results.response){
            session.userData.profile.fan = results.response.entity
        }
        session.endDialogWithResult({response: session.userData.profile})
    }
])

server.post('/api/messages', connector.listen());
server.listen(port, () => {
    console.log('%s listening to %s', server.name, server.url)
})