const polly = require( "./pollyHandler" );
const writer = require( "./writer" );


function onSentencesRendered( sentenceURLs, speechElements, callback ){

    if( !speechElements ) speechElements = [];
    for (var i = 0; i < sentenceURLs.length; i++) {
        var sentenceURL = sentenceURLs[i];
        speechElements.push({
            "type" : "audio",
            "content" : sentenceURL
        });
    }

    callback( null, speechElements );
}


function onSentencesWritten( sentences, speechElements, callback ){

    // console.log( "onSentencesWritten" );

    polly.renderSentences( sentences , function( err, urls ){
        if (err) return callback( err );
        else onSentencesRendered(
            urls, 
            speechElements,
            callback
        );
    });
}


function getWelcome( callback ){

    var speechElements = [{
        type: "text",
        content: "Hello!"
    }];

    writer.constructWelcomeSentences(
        function( err,sentences ){
            if (err) return callback( err );
            else onSentencesWritten(
                sentences,
                speechElements,
                callback
            );
        }
    );
}


function interrogateSubject( subject, callback ){

    writer.constructSubjectSentences(
        function( err,sentences ){
            if (err) return callback( err );
            else onSentencesWritten(
                sentences,
                speechElements,
                callback
            );
        }
    );
}


module.exports = {
    "getWelcome" : getWelcome,
    "interrogateSubject" : interrogateSubject
};