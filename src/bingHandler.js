var fs = require('fs');

var secrets = require( './config/secrets' );

var Bing = require('node-bing-api')({ accKey: secrets.BingKey });
var Tokenizer = require('sentence-tokenizer');


var tokenizer = new Tokenizer( 'node-sentences' );

var reClauses = new RegExp( /[,\;:\-\–\—\−]/gi );
var reConjunctions = new RegExp( /(\band\b)|(\bor\b)/gi );


function processItem( item, stem ){
    
    var statements = [];
    var d = item.description;
    
    var reStem = new RegExp( stem, 'i' );
    var i = d.search( reStem );
    if( i > -1 ){
        
        // trim description to stem and everything after
        d = d.substring( i );
        
        // break description into sentences
        tokenizer.setEntry( d );
        sentences = tokenizer.getSentences();

        // iterate over sentences...
        for( var ii in sentences ){
            
            var sentence = sentences[ii];
            console.log( sentence );

            // now, let's do some checks on the sentence.
            // if any fail, continue to the next sentence
            // without adding to the statements array

            // only include sentences that include a stem
            if( sentence.search( reStem ) < 0 )
                continue;

            // if we've found a truncated sentence...
            if( sentence.indexOf( "..." ) > -1 ){
                var firstClause = reClauses.exec( sentence ) || [];
                var firstConjoiner = reConjunctions.exec( sentence ) || [];
                
                // if we haven't matched any conjoiners or clauses in the sentence, bail
                if( firstClause.length + firstConjoiner.length < 1 )
                    continue;

                // if we haven't bailed, use the first conjoiner or clause marker as a break point
                var breakIndex = sentence.length;
                if(firstClause.length > 0) breakIndex = Math.min( breakIndex, firstClause.index );
                if(firstConjoiner.length > 0) breakIndex = Math.min( breakIndex, firstConjoiner.index );

                // chop truncated sentence down to first clause
                sentence = sentence.substring( 0, breakIndex );
            }

            // don't want really short sentences
            // (split on a space to count words)
            if( sentence.split(' ').length < 3 )
                continue;

            // quotations usually turn out weird
            if( sentence.match(/["“”]/gi) )
                continue;

            // as do things with a lot of clauses
            var m = sentence.match( reClauses );
            if( m && m.length > 3 )
                continue;

            // if we're here, the sentence has passed all checks
            // ( no continues have been hit)
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
        console.log( res );

        if( error ){
            return callback( error, null );
        }

        var statements = processResults( body, stem );
        callback( null, statements );

    });
}

function getStatementsForSubject( subject, callback ){
    getStatementsWithStemAndSubject( null, subject, callback );
}

function getStatements( callback ){
    getStatementsWithStemAndSubject( null, null, callback );
}

module.exports = {
    "getStatements" : getStatements,
    "getStatementsForSubject" : getStatementsForSubject,
    "processItem" : processItem
};