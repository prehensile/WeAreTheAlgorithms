/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, tell Hello World to say hello"
 *  Alexa: "Hello World!"
 */

/**
 * App ID for the skill
 */
var APP_ID = undefined; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

var dramaturge = require('./dramaturge');
var stringTable = require('./stringTable');
const alexaHelpers = require('./alexaHelpers');


var __ts = new Date().getTime();

/**
 * HelloAlgos is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var HelloAlgos = function () {
    AlexaSkill.call( this, APP_ID );
};

// Extend AlexaSkill
HelloAlgos.prototype = Object.create(AlexaSkill.prototype);
HelloAlgos.prototype.constructor = HelloAlgos;

HelloAlgos.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("HelloAlgos onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};


function handleError( err, response ){
    console.error( err );
    response.tell( stringTable.GenericError );
}

function onDramaturgeCallback( err, speechElements, response ){
    
    if( err ){
        // TODO: more graceful handling of errors
        return handleError( err, response );
    } 

    var ssml = alexaHelpers.SSMLForSpeechElements( speechElements );

    __ts = new Date().getTime() - __ts;
    console.log( `request completed in ${__ts}ms` );

    response.tell({
        type : "SSML",
        speech : ssml
    });
}

function generateWelcome( response ){

    __ts = new Date().getTime();

    dramaturge.getWelcome( function( err, speechElements ){
        onDramaturgeCallback(
            err,
            speechElements,
            response
        );
    }); 
}

HelloAlgos.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("HelloAlgos onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    
    // dramaturge.getWelcome( function(err,sentenceURLs){
    //     handleSentenceURLCallback( err, sentenceURLs, response );
    // });

    generateWelcome( response );

    // response.ask(
    //     speechOutput,
    //     repromptText
    // );
};

HelloAlgos.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("HelloAlgos onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

HelloAlgos.prototype.intentHandlers = {
    // register custom intent handlers
    
    "HelloIntent": function (intent, session, response) {
        //response.tellWithCard("Hello World!", "Hello World", "Hello World!");
        console.log( "intentHandler: HelloIntent" );
        generateWelcome( response );
    },
    
    "AMAZON.HelpIntent": function ( intent, session, response ) {
        response.ask("You can say hello to me!", "You can say hello to me!");
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HelloAlgos skill.
    var helloAlgos = new HelloAlgos();
    helloAlgos.execute( event, context );
};

