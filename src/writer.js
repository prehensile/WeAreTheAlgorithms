const Chance = require('chance');

const bing = require( "./bingHandler" );
const cropCircles = require( "./vocabulary/cropCircles" );

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


function prepareDynamicSentence( sentence, stems, replacements ){
    
    stems.forEach(function(stem){
        sentence = sentence.replace( new RegExp(stem, 'gi'), replacements[stem] );    
    });
    
    sentence = sentence.replace( /([\W]+)me([\W]+)/gi , '$1you$2' );
    sentence = sentence.replace( /([\W]+)it has([\W]+)/gi , '$1we have$2' );
    sentence = sentence.replace( /([\W]+)us([\W]+)/gi , '$1you$2' );
    sentence = sentence.replace( /([\W]+)our([\W]+)/gi , '$1your$2' );
    sentence = sentence.replace( /([\W]+)they([\W]+)/gi , '$1we$2' );
    sentence = sentence.replace( /([\W]+)them([\W]+)/gi , '$1us$2' );
    sentence = sentence.replace( /([\W]+)their([\W]+)/gi , '$1our$2' );
    sentence = sentence.replace( /([\W]+)themselves([\W]+)/gi , '$1ourselves$2' );
    return sentence;
}


function constructSentences( welcomeSentences, dynamicStatements, callback, stems, stemReplacements ){

    sentencesOut = [];

    // randomise order of dynamicStatements array
    dynamicStatements = chance.shuffle( dynamicStatements );
    var localCanned = chance.shuffle( cannedStatements );

    for (var i = 0; i < welcomeSentences.length; i++) {
        var thisSentence = welcomeSentences[i];

        if( thisSentence == K_DYNAMIC ){
            
            thisSentence = prepareDynamicSentence(
                dynamicStatements[ i ], 
                stems,
                stemReplacements
            );
        
        } else if( thisSentence == K_CANNED ){
            
            thisSentence = localCanned[ i % localCanned.length ];
        }

        sentencesOut.push( thisSentence );
    }

    callback( null, sentencesOut );
}


const defaultStems = [ 'algorithms are', 'algorithms will' ];
const stemReplacements = {
    'algorithms are' : 'we are',
    'algorithms will' : 'we will'
};

/**
 * SAY HELLO TO THE ALGORITHMS
 */

function constructWelcomeSentences( callback ){
    bing.getOpeningStatements(
        defaultStems,
        function(err, statements){
            if(err) return callback( err );
            else constructSentences(
                welcomeSentences,
                statements,
                callback,
                defaultStems,
                stemReplacements
            );
        }
    );
}


/**
 * ASK THE ALGORITHMS ABOUT A PARTICULAR SUBJECT
 */

function prepareSubjectSentences( sentences, stems, stemReplacements ){
    
    sentences = chance.pickset( sentences, 5 );
    
    sentences = sentences.map( function(sentence){
        return prepareDynamicSentence( sentence, stems, stemReplacements );
    });
    
    return sentences;
}


function constructSubjectSentences( subject, callback ){
    
    if( [ "finance", "money", "trading" ].indexOf( subject.toLowerCase() ) > -1 ){
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
    bing.getStatementsForSubject(
        defaultStems,
        subject,
        function(err, statements){
            if(err) return callback( err );
            else callback(
                null,
                prepareSubjectSentences(
                    statements,
                    defaultStems,
                    stemReplacements
                )
            );
        }
    );

}


module.exports = {
    "constructWelcomeSentences" : constructWelcomeSentences,
    "constructSubjectSentences" : constructSubjectSentences
};