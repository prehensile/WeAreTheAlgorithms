var crypto = require('crypto');
var fs = require('fs');

var AWS = require('aws-sdk');

var secrets = require( './secrets' );

var polly = new AWS.Polly({
    accessKeyId : secrets.aws_polly.access_key,
    secretAccessKey : secrets.aws_polly.secret,
    region : "eu-west-1"
});


var voices = [
    "Joanna",
    "Kimberly",
    "Joey",
    "Emma",
    "Brian",
    "Amy"
];


function renderSentence( sentence ){
    
    var voice = voices[ sentence.length % voices.length ];
    var filename = crypto.createHash('md5').update( sentence ).digest( 'hex' ) + ".mp3";

    polly.synthesizeSpeech(
        {
            OutputFormat : "mp3",
            Text : sentence,
            VoiceId : voice,
            TextType: "text"
        },
        function( err, data ){
            if( err ) throw err;
            
            fs.writeFile(
                filename,
                data.AudioStream,
                function( err ){
                    if( err ) throw err;
                }
            );
        }
    );

    return filename;
}


function renderSentences( sentences, callback ){

    var filenames = [];

    for (var i = 0; i < sentences.length; i++) {
        var thisSentence = sentences[i];
        filenames.push(
            renderSentence( thisSentence )
        );
    }

    callback( null, filenames );

}

module.exports = {
    "renderSentences" : renderSentences
};