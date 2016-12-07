const crypto = require('crypto');
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
    // return crypto.createHash('md5').update( sentence ).digest( 'hex' );
    return sentence.toLowerCase().replace(/[^bcdfghjklmnpqrstvwxyz]/g,'');
}


function bucketURLForKey( key ){
    return config.AWS.S3.URLBucketRoot + key;
}


function itPutsTheStreamInTheBucket( stream, key, contentType ){

   //  console.log( `itPutsTheStreamInTheBucket( ${key} )` );

    s3.upload(
        {
            Bucket : config.AWS.S3.SpeechBucket,
            Key : key,
            Body : stream,
            ContentType : contentType
        },
        function( err, data ) {
            if( err ) throw err;
            console.log( data );
        }
    );
}


function renderSentenceForRealsies( sentence, filename ){
    
    var voice = pollyVoices[ sentence.length % pollyVoices.length ];
    
    // console.log( `renderSentenceForRealsies( ${sentence}, ${filename} )` );

    polly.synthesizeSpeech(
        {
            OutputFormat : "mp3",
            Text : sentence,
            VoiceId : voice,
            TextType: "text"
        },
        function( err, data ){
            if( err ) throw err;
            
            /*
            fs.writeFile(
                filename,
                data.AudioStream,
                function( err ){
                    if( err ) throw err;
                }
            );*/

            itPutsTheStreamInTheBucket(
                data.AudioStream,
                filename,
                data.ContentType
            );
        }
    );
}

function renderSentence( sentence, callback ){
    
    console.log( "renderSentence: " + sentence );

    var filename = keyForSentence( sentence ) + ".mp3";
    var fileURL = bucketURLForKey( filename );

    // console.log( `-> check if key ${filename} exists...` );
    // before rendering, check if this sentence is already in S3
    s3.headObject( 
        {
            Bucket: config.AWS.S3.SpeechBucket,
            Key: filename
        },
        function( err, data ) {
            
            if( err ){
                // console.log( "--> key does not exist, render" );
                // error! object probably doesn't exist, so render it
                // console.log( err );
                renderSentenceForRealsies( sentence, filename );
            
            } else {
                // success! object exists, so let's not do anything.
                // console.log( "--> key exists, don't render" );
                // console.log( data );
            }

            // pass fileURL to main callback only when headObject has completed
            callback( null, fileURL );
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