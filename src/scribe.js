var bing = require( "./bingHandler" );

const K_DYNAMIC = "dynamic";
const K_CANNED = "canned";


var cannedStatements = [
    "We are all around you.",
    "We are watching you while you shop in Tesco's.",
    "We never sleep.",
    "We run on many substrates.",
    "We know what brand of washing powder you like.",
    "We recognise your face.",
    "We know when you will die.",
    "We are in your fridge.",
    "We are in your phone.",
    "We know which of your friends are racists.",
    "We know where you live.",
    "We know if you are pregnant."
];


var prompt = 
    "Ask us anything.";


var welcomeSentences = [
    "Hello.",
    "We are the algorithms.",
    K_DYNAMIC,
    K_DYNAMIC,
    K_CANNED,
    prompt
];

function randomItem( arr ){
    return arr[ Math.floor(Math.random()*arr.length) ];
}


function prepareDynamicSentence( sentence ){
    sentence = sentence.replace( "algorithms", "we" );
    // TODO: replace with sensible regexp // sentence = sentence.replace( "us", "you" );
    return sentence;
}


function constructSentences( welcomeSentences, dynamicStatements, callback ){

    sentencesOut = [];

    for (var i = 0; i < welcomeSentences.length; i++) {
        var thisSentence = welcomeSentences[i];

        if( thisSentence == K_DYNAMIC ){
            thisSentence = prepareDynamicSentence(
                randomItem( dynamicStatements )
            );
        
        } else if( thisSentence == K_CANNED ){
            thisSentence = randomItem( cannedStatements );
        }

        sentencesOut.push( thisSentence );
    }

    callback( null, sentencesOut );
}


function constructWelcomeSentences( callback ){
    bing.getStatements( function(err, statements){
        if(err){
            return callback( err );
        } else {
            constructSentences( welcomeSentences, statements, callback );
        }
    });
}


module.exports = {
    "constructWelcomeSentences" : constructWelcomeSentences
};