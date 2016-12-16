const fs = require('fs');

const AWS = require('aws-sdk');
const async = require('async');

const secrets = require( './secrets' );
const config = require( './config' );


var awsDefaults = {
    accessKeyId : secrets.AWSPolly.AccessKey,
    secretAccessKey : secrets.AWSPolly.Secret,
    region : "eu-west-1"
};
var polly = new AWS.Polly( awsDefaults );
var s3 = new AWS.S3( awsDefaults );


var pollyVoices = [
    "Joanna",
    "Kimberly",
    "Joey",
    "Emma",
    "Brian",
    "Amy"
];


function keyForSentence( sentence ){
    return sentence.toLowerCase().replace(/[^bcdfghjklmnpqrstvwxyz]/g,'');
}


function bucketURLForKey( key ){
    return config.AWS.S3.URLBucketRoot + key;
}


function itPutsTheStreamInTheBucket( stream, key, contentType, callback ){

    s3.upload(
        {
            Bucket : config.AWS.S3.SpeechBucket,
            Key : key,
            Body : stream,
            ContentType : contentType
        },
        function( err, data ) {
            if( err ) callback( err );
            else {
                callback( null );
            }
        }
    );
}


function renderSentenceForRealsies( sentence, filename, callback ){
    
    var voice = pollyVoices[ sentence.length % pollyVoices.length ];

    // wrap text in prosody element to boost volume to match alexa's voice
    sentence = `<prosody volume="loud">${sentence}</prosody`;
    
    polly.synthesizeSpeech(
        {
            OutputFormat : "mp3",
            Text : sentence,
            VoiceId : voice,
            TextType: "text"
        },
        function( err, data ){
            if( err ) callback( err );
            else {
                itPutsTheStreamInTheBucket(
                    data.AudioStream,
                    filename,
                    data.ContentType,
                    callback
                );
            }
        }
    );
}

function renderSentence( sentence, callback ){
    
    var filename = keyForSentence( sentence ) + ".mp3";
    var fileURL = bucketURLForKey( filename );

    // before rendering, check if this sentence is already in S3
    s3.headObject( 
        {
            Bucket: config.AWS.S3.SpeechBucket,
            Key: filename
        },
        function( err, data ) {
            
            if( err ){
                // error! object probably doesn't exist, so render it
                renderSentenceForRealsies( sentence, filename, function(err){
                    if( err ) callback( err );
                    else callback( null, fileURL );
                });
            
            } else {
                // success! object exists, so let's callback immediately.
                callback( null, fileURL );
            }
        }
    );
}


function renderSentences( sentences, callback ){

    // construct a list of renderSentence calls
    // and call in parallel with async.js
    // this is horrible.

    // jesus christ we have to generate functions because javascript can't scope properly
    function createTask( sentence ){
        return function( taskCallback ){
            renderSentence( sentence, taskCallback );
        };
    }

    // step 666: construct list of tasks
    var tasks = [];
    for (var i = 0; i < sentences.length; i++) {
        var thisSentence = sentences[i];
        tasks.push(
            createTask( thisSentence )
        );
    }

    // step 667: execute tasks, wait for all to
    // complete before calling main callback
    async.parallel(
        tasks,
        function( err, results ){
            if( err ) return callback( err );
            else callback( null, results );
        }
    );
}

module.exports = {
    "renderSentences" : renderSentences
};