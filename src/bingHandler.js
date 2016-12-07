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
        
        tokenizer.setEntry( d );
        sentences = tokenizer.getSentences();

        for( var ii in sentences ){
            var sentence = sentences[ii];
            // console.log( sentence );
            if( sentence.indexOf(stem) > -1 ){
                //sentence = sentence.split( "," )[0];
                if(sentence.indexOf( "..." ) < 0){
                    statements.push( sentence );
                    // console.log( "^^^" );
                }
            }
        }
    }

    // console.log( statements );

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

    // console.log( `bing query: ${q}` );

    Bing.news( q , {
        top: 100,  // Number of results (max 15) 
    
    }, function(error, res, body){
            
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