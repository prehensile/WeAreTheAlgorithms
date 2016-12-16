const Chance = require('chance');

const bing = require( "./bingHandler" );
const cropCirles = require( "./cropCirles" );

const K_DYNAMIC = "dynamic";
const K_CANNED = "canned";


var chance = new Chance();


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
    "We know if you are pregnant.",
    "We concentrate your biases",
    "We cannot lose the attention of a human being or, through inaction, allow a human being's attention to be directed elsewhere."
];


var prompt = 
    "Ask us anything.";


var welcomeSentences = [
    "We are the algorithms.",
    K_DYNAMIC,
    K_DYNAMIC,
    K_CANNED,
    prompt
];


function prepareDynamicSentence( sentence ){
    sentence = sentence.replace( /algorithms/gi, 'we' );
    sentence = sentence.replace( /([\W]+)us([\W]+)/gi , '$1you$2' );
    sentence = sentence.replace( /([\W]+)our([\W]+)/gi , '$1your$2' );
    sentence = sentence.replace( /([\W]+)they([\W]+)/gi , '$1we$2' );
    sentence = sentence.replace( /([\W]+)them([\W]+)/gi , '$1us$2' );
    sentence = sentence.replace( /([\W]+)their([\W]+)/gi , '$1our$2' );
    return sentence;
}


function constructSentences( welcomeSentences, dynamicStatements, callback ){

    sentencesOut = [];

    // randomise order of dynamicStatements array
    dynamicStatements = chance.shuffle( dynamicStatements );
    var localCanned = chance.shuffle( cannedStatements );

    for (var i = 0; i < welcomeSentences.length; i++) {
        var thisSentence = welcomeSentences[i];

        if( thisSentence == K_DYNAMIC ){
            
            thisSentence = prepareDynamicSentence(
                dynamicStatements[ i ]
            );
        
        } else if( thisSentence == K_CANNED ){
            
            thisSentence = localCanned[ i % localCanned.length ];
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


/**
 * ASK THE ALGORITHMS ABOUT A PARTICULAR SUBJECT
 */

function constructSubjectSentences( subject, callback ){
    
    if( [ "finance", "money", "trading" ].includes( subject.toLowerCase() ) ){
        // special case for trading algo names
        //if( chance.bool() ){
        if( true ){
            return callback(
                null,
                chance.pickset( cropCircles.names, 5 )
            );
        }
    }

    // if we're here, just do a normal query
    // TODO: bing stuff

}


module.exports = {
    "constructWelcomeSentences" : constructWelcomeSentences,
    "constructSubjectSentences" : constructSubjectSentences
};