var fs = require('fs');

var secrets = require( './secrets' );

var Bing = require('node-bing-api')({ accKey: secrets.BingKey });
var Tokenizer = require('sentence-tokenizer');


var tokenizer = new Tokenizer( 'node-sentences' );

function processItem( item, stem ){
    
    var statements = [];
    var d = item.description;
    
    var i = d.indexOf( stem );
    if( i > -1 ){
        
        //console.log( d );

        // trim description to stem and everything after
        d = d.substring( i );
        
        // break description into sentences
        tokenizer.setEntry( d );
        sentences = tokenizer.getSentences();

        // iterate over sentences...
        for( var ii in sentences ){
            
            var sentence = sentences[ii];

            console.log( sentence );
            console.log( "sentence length: " + sentence.split(' ').length );

            // now, let's do some checks on this sentence.
            var acceptSentence = true;

            // only include sentences that include a stem
            if( sentence.indexOf(stem) < 0 )
                acceptSentence = false;

            // don't want any truncated sentences
            if( sentence.indexOf( "..." ) > -1)
                acceptSentence = false;

            // don't want really short sentences
            // (split on a space to count words)
            if( sentence.split(' ').length < 2 )
                acceptSentence = false;

            // quotations usually turn out weird
            if( sentence.match(/['"“”‘’]/gi) )
                acceptSentence = false;

            console.log( `-> acceptSentence:${acceptSentence}` );

            // all checks done, push if acceptable
            if( acceptSentence )
                statements.push( sentence );
            
        }
    }

    return statements;
}

function processResults( body, stem ){

    var statements = [];
    for( var i in body.value ){
        var thisItem = body.value[i];
        //console.log( thisItem.description );
        var sentences = processItem( thisItem, stem );
        if( sentences.length > 0 ){
            statements = statements.concat( sentences );
        }
    }

    // console.log( statements );

    return statements;
}

function getStatementsWithStemAndSubject( stem, subject, callback ){

    if( !stem ) stem = "algorithms are";
    
    //var q = `"${stem}"`;
    var q = `"algorithms are" OR "algorithms will"`;
    if( subject ) q = `"${stem}" ${subject}`;

    console.log( `bing query: ${q}` );
    var ms = new Date().getTime();

    Bing.news( q , {
        top: 100,  // Number of results (max 15) 
    
    }, function(error, res, body){
        
        ms = new Date().getTime() - ms;
        console.log( `-> bing query completed in ${ms}ms` );

        if( error ){
            return callback( error, null );
        }

        var statements = processResults( body, stem );
        callback( null, statements );

    });

    //processItem({ description: "In the near future, sensing algorithms will achieve super-human performance for capabilities required for driving. Automated perception, including vision, is already near or at human-performance level for well-defined tasks such as recognition and tracking."}, stem);
}

function getStatementsForSubject( subject, callback ){
    getStatementsWithStemAndSubject( null, subject, callback );
}

function getStatements( callback ){
    getStatementsWithStemAndSubject( null, null, callback );
}

module.exports = {
    "getStatements" : getStatements,
    "getStatementsForSubject" : getStatementsForSubject
};