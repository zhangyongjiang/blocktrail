/**
 * Adapter for Felixge's "mysql" API.
 * @see https://github.com/felixge
 * @see https://github.com/felixge/node-mysql
 * 
 * @author Dr. Benton - github.com/DrBenton
 * @see https://github.com/DrBenton/Node-DBI
 */

// ------------------------------------- modules

var async = require('async')
  , util = require('util')
  , _ = require('lodash')
  , DBAdapterAbstract = require('../dbAdapterAbstract').DBAdapterAbstract
  , DBExpr = require('../dbExpr').DBExpr
  , mysql = require('mysql');

//------------------------------------- constructor

/**
 * @param {DBWrapper} dbWrapper
 * @param {Object} connectionParams
 */
function Adapter( dbWrapper, connectionParams )
{
  
  this._dbClient = null;
  /**
   * @type boolean
   */
  this._debug = false; 
  /**
   * @type Integer
   */
  this._lastInsertId = null;
  
  // "Super" constructor is called
  DBAdapterAbstract.call( this, dbWrapper, connectionParams );
  
}

util.inherits(Adapter, DBAdapterAbstract);


//------------------------------------- static stuff

/**
 * @param {DBWrapper} dbWrapper
 * @param {Object} connectionParams
 * @api public
 * @static
 */
Adapter.createInstance = function( dbWrapper, connectionParams )
{
  return new Adapter( dbWrapper, connectionParams );
};

module.exports.createInstance = Adapter.createInstance;


//------------------------------------- public methods

/**
* @api public
*/
Adapter.prototype.connect = function()
{
  var self = this;
  
  if( this._debug )
    console.log('Adapter.prototype.connect('+JSON.stringify(this._connectionParams)+')');
  
  _.defaults( this._connectionParams, {
    host:     'localhost',
    port:     3306,
    user:     null,
    password: null,
    database: null,
    pooling: false
  } );
  
  // Is it the V2.0+ API ?
  var pooling = ( this._connectionParams.pooling && mysql.createPool && (mysql.createPool instanceof Function) ) ? true : false ;
  var v200 = ( mysql.createConnection && (mysql.createConnection instanceof Function) ) ? true : false ;
  // We have to handle the API incompatibility of V0.9.2+
  // @see https://github.com/felixge/node-mysql/wiki/Upgrading-to-0.9.2+
  var v092 = ( mysql.createClient && (mysql.createClient instanceof Function) ) ? true : false ;
  if (pooling) {
    // V2.0+ pooling API
    this._dbClient = mysql.createPool({
      host     : this._connectionParams.host,
      user     : this._connectionParams.user,
      password : this._connectionParams.password,
      port     : this._connectionParams.port,
      database : this._connectionParams.database,
      connectionLimit : this._connectionParams.poolConnectionLimit || 10
    });
    // setup connection event
    this._dbClient.on('connection', function(err, connection) {
      self.emit( 'connection', err );
    });
    // trigger initialization because the pooling won't make a connection until neccesary
    this._onConnectionInitialization();
  } else if (v200) {
    // V2.0+ API
    this._dbClient = mysql.createConnection({
      host     : this._connectionParams.host,
      user     : this._connectionParams.user,
      password : this._connectionParams.password,
      port     : this._connectionParams.port,
      database : this._connectionParams.database
    });
    this._dbClient.connect( _.bind( this._onConnectionInitialization, this ) );
  } else {
      // Old APIs
      if( v092 ) {
          this._dbClient = mysql.createClient();//V0.9.2+ API
      } else {
          this._dbClient = new mysql.Client();//old API
      }  
      
      this._dbClient.host = this._connectionParams.host;
      this._dbClient.port = this._connectionParams.port;
      this._dbClient.user = this._connectionParams.user;
      this._dbClient.password = this._connectionParams.password;
      this._dbClient.database = this._connectionParams.database;
      
      if( v092 ) {
        this._onConnectionInitialization( null );//V0.9.2+ API : no explicit "connect()"
      } else {
        this._dbClient.connect( _.bind( this._onConnectionInitialization, this ) );//old API
      }
  } 
  
};


/**
 * @api public
 */
Adapter.prototype.close = function( callback )
{
  
  if( this._debug )
    console.log('Adapter.prototype.close('+JSON.stringify(this._connectionParams)+')');
  
  if(this._dbClient)
    this._dbClient.end( callback );
  else
    callback( new Error('Cannot close connection, since it is not connected') );
  
};


/**
 * @param {String}  sql
 * @param {Array|null}  bind
 * @param {Function|null}  callback
 * @api public
 */
Adapter.prototype.query = function( sql, bind, callback )
{
  
  // SQL values are safely escaped ; since this client API doesn't handle it, we do it manually 
  sql = this._format(sql, bind);
  
  if( this._debug )
    console.log('sql='+sql);
  
  // Some aliases for the async scope...
  var me = this;
  var _dbClient = this._dbClient;
  
  // Go! Go! Go!
  async.waterfall(
      
    [
      function( callback )
      {
        _dbClient.query( sql, callback );
      }
    ],
    
    function( err, res )
    {
      
      if( ! callback )
        return;

      if( err )
        callback( err );
      else
      {
        
        if( res.insertId && ! isNaN(res.insertId) && res.insertId>0 )
          me._lastInsertId = res.insertId;
        
        callback( null, res.affectedRows, res.changedRows );
        
      }
    }
  );
  
};


/**
 * @param {String}  sql
 * @param {Array|null}  bind
 * @param {Function|null}  callback
 * @api public
 */
Adapter.prototype.fetchAll = function( sql, bind, callback )
{
  
  // SQL values are safely escaped ; since this client API doesn't handle it, we do it manually
  sql = this._format(sql, bind);
  
  // Some aliases for the async scope...
  var query = _.bind( this.query, this );
  var _dbClient = this._dbClient;
  var _debug = this._debug;
  
  
  if( _debug )
    console.log('sql='+sql);
  
  // Go! Go! Go!  
  async.waterfall(
      
    [
     function( callback )
     {
       _dbClient.query( sql, callback );
     },
    
    ],
    
    function( err, rows, fields )
    {
      
      if( _debug )
      {
        console.log('rows='+JSON.stringify(rows));
        console.log('fields='+JSON.stringify(fields));
      }
      
      callback && callback( err, rows );
      
    }
    
  );
  
};

/**
 * @rturn {Integer|null}  the last inserted Id
 * @api public
 */
Adapter.prototype.getLastInsertId = function()
{
  return this._lastInsertId; 
};


/**
 * @param {String}  value
 * @rturn {String}  the escaped value
 * @api public
 */
Adapter.prototype.escape = function( value )
{
  if( typeof(value)=='object' && (value instanceof Date) )
    return "'" + this._stringifyDate(value) + "'";
  else if( typeof(value)=='object' && (value instanceof DBExpr) )
    return value.getStr();
  else if( typeof(value)=='string' )
    return this._dbClient.escape( value );
  else if( value===null )
    return 'NULL';
  else if( isNaN(value) && ! value )
    return "''";//falsy-but-not-null-and-not-Numbers values are converted to empty Strings
  else
    return value;
};


