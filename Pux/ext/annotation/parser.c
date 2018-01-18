/* Driver template for the LEMON parser generator.
** The author disclaims copyright to this source code.
*/
/* First off, code is include which follows the "include" declaration
** in the input file. */
#include <stdio.h>
#line 27 "parser.lemon"


#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include "php.h"
#include "ext/standard/php_smart_str.h"
#include "Zend/zend_exceptions.h"

#include "parser.h"
#include "scanner.h"
#include "annot.h"

static zval *phannot_ret_literal_zval(int type, phannot_parser_token *T)
{
	zval *ret;

	MAKE_STD_ZVAL(ret);
	array_init(ret);
	add_assoc_long(ret, "type", type);
	if (T) {
		add_assoc_stringl(ret, "value", T->token, T->token_len, 0);
		efree(T);
	}

	return ret;
}

static zval *phannot_ret_array(zval *items)
{
	zval *ret;

	MAKE_STD_ZVAL(ret);
	array_init(ret);
	add_assoc_long(ret, "type", PHANNOT_T_ARRAY);

	if (items) {
		add_assoc_zval(ret, "items", items);
	}

	return ret;
}

static zval *phannot_ret_zval_list(zval *list_left, zval *right_list)
{

	zval *ret;
	HashPosition pos;
	HashTable *list;

	MAKE_STD_ZVAL(ret);
	array_init(ret);

	if (list_left) {

		list = Z_ARRVAL_P(list_left);
		if (zend_hash_index_exists(list, 0)) {
			zend_hash_internal_pointer_reset_ex(list, &pos);
			for (;; zend_hash_move_forward_ex(list, &pos)) {

				zval ** item;

				if (zend_hash_get_current_data_ex(list, (void**) &item, &pos) == FAILURE) {
					break;
				}

				Z_ADDREF_PP(item);
				add_next_index_zval(ret, *item);

			}
			zval_ptr_dtor(&list_left);
		} else {
			add_next_index_zval(ret, list_left);
		}
	}

	add_next_index_zval(ret, right_list);

	return ret;
}

static zval *phannot_ret_named_item(phannot_parser_token *name, zval *expr)
{
	zval *ret;

	MAKE_STD_ZVAL(ret);
	array_init(ret);
	add_assoc_zval(ret, "expr", expr);
	if (name != NULL) {
		add_assoc_stringl(ret, "name", name->token, name->token_len, 0);
		efree(name);
	}

	return ret;
}

static zval *phannot_ret_annotation(phannot_parser_token *name, zval *arguments, phannot_scanner_state *state)
{

	zval *ret;

	MAKE_STD_ZVAL(ret);
	array_init(ret);

	add_assoc_long(ret, "type", PHANNOT_T_ANNOTATION);

	if (name) {
		add_assoc_stringl(ret, "name", name->token, name->token_len, 0);
		efree(name);
	}

	if (arguments) {
		add_assoc_zval(ret, "arguments", arguments);
	}

	Z_ADDREF_P(state->active_file);
	add_assoc_zval(ret, "file", state->active_file);
	add_assoc_long(ret, "line", state->active_line);

	return ret;
}


#line 132 "parser.c"
/* Next is all token values, in a form suitable for use by makeheaders.
** This section will be null unless lemon is run with the -m switch.
*/
/* 
** These constants (all generated automatically by the parser generator)
** specify the various kinds of tokens (terminals) that the parser
** understands. 
**
** Each symbol here is a terminal symbol in the grammar.
*/
/* Make sure the INTERFACE macro is defined.
*/
#ifndef INTERFACE
# define INTERFACE 1
#endif
/* The next thing included is series of defines which control
** various aspects of the generated parser.
**    YYCODETYPE         is the data type used for storing terminal
**                       and nonterminal numbers.  "unsigned char" is
**                       used if there are fewer than 250 terminals
**                       and nonterminals.  "int" is used otherwise.
**    YYNOCODE           is a number of type YYCODETYPE which corresponds
**                       to no legal terminal or nonterminal number.  This
**                       number is used to fill in empty slots of the hash 
**                       table.
**    YYFALLBACK         If defined, this indicates that one or more tokens
**                       have fall-back values which should be used if the
**                       original value of the token will not parse.
**    YYACTIONTYPE       is the data type used for storing terminal
**                       and nonterminal numbers.  "unsigned char" is
**                       used if there are fewer than 250 rules and
**                       states combined.  "int" is used otherwise.
**    phannot_TOKENTYPE     is the data type used for minor tokens given 
**                       directly to the parser from the tokenizer.
**    YYMINORTYPE        is the data type used for all minor tokens.
**                       This is typically a union of many types, one of
**                       which is phannot_TOKENTYPE.  The entry in the union
**                       for base tokens is called "yy0".
**    YYSTACKDEPTH       is the maximum depth of the parser's stack.
**    phannot_ARG_SDECL     A static variable declaration for the %extra_argument
**    phannot_ARG_PDECL     A parameter declaration for the %extra_argument
**    phannot_ARG_STORE     Code to store %extra_argument into yypParser
**    phannot_ARG_FETCH     Code to extract %extra_argument from yypParser
**    YYNSTATE           the combined number of states.
**    YYNRULE            the number of rules in the grammar
**    YYERRORSYMBOL      is the code number of the error symbol.  If not
**                       defined, then do no error processing.
*/
#define YYCODETYPE unsigned char
#define YYNOCODE 28
#define YYACTIONTYPE unsigned char
#define phannot_TOKENTYPE phannot_parser_token*
typedef union {
  phannot_TOKENTYPE yy0;
  zval* yy36;
  int yy55;
} YYMINORTYPE;
#define YYSTACKDEPTH 100
#define phannot_ARG_SDECL phannot_parser_status *status;
#define phannot_ARG_PDECL ,phannot_parser_status *status
#define phannot_ARG_FETCH phannot_parser_status *status = yypParser->status
#define phannot_ARG_STORE yypParser->status = status
#define YYNSTATE 40
#define YYNRULE 25
#define YYERRORSYMBOL 18
#define YYERRSYMDT yy55
#define YY_NO_ACTION      (YYNSTATE+YYNRULE+2)
#define YY_ACCEPT_ACTION  (YYNSTATE+YYNRULE+1)
#define YY_ERROR_ACTION   (YYNSTATE+YYNRULE)

/* Next are that tables used to determine what action to take based on the
** current state and lookahead token.  These tables are used to implement
** functions that take a state number and lookahead value and return an
** action integer.  
**
** Suppose the action integer is N.  Then the action is determined as
** follows
**
**   0 <= N < YYNSTATE                  Shift N.  That is, push the lookahead
**                                      token onto the stack and goto state N.
**
**   YYNSTATE <= N < YYNSTATE+YYNRULE   Reduce by rule N-YYNSTATE.
**
**   N == YYNSTATE+YYNRULE              A syntax error has occurred.
**
**   N == YYNSTATE+YYNRULE+1            The parser accepts its input.
**
**   N == YYNSTATE+YYNRULE+2            No such action.  Denotes unused
**                                      slots in the yy_action[] table.
**
** The action table is constructed as a single large table named yy_action[].
** Given state S and lookahead X, the action is computed as
**
**      yy_action[ yy_shift_ofst[S] + X ]
**
** If the index value yy_shift_ofst[S]+X is out of range or if the value
** yy_lookahead[yy_shift_ofst[S]+X] is not equal to X or if yy_shift_ofst[S]
** is equal to YY_SHIFT_USE_DFLT, it means that the action is not in the table
** and that yy_default[S] should be used instead.  
**
** The formula above is for computing the action when the lookahead is
** a terminal symbol.  If the lookahead is a non-terminal (as occurs after
** a reduce action) then the yy_reduce_ofst[] array is used in place of
** the yy_shift_ofst[] array and YY_REDUCE_USE_DFLT is used in place of
** YY_SHIFT_USE_DFLT.
**
** The following are the tables generated in this section:
**
**  yy_action[]        A single table containing all actions.
**  yy_lookahead[]     A table containing the lookahead for each entry in
**                     yy_action.  Used to detect hash collisions.
**  yy_shift_ofst[]    For each state, the offset into yy_action for
**                     shifting terminals.
**  yy_reduce_ofst[]   For each state, the offset into yy_action for
**                     shifting non-terminals after a reduce.
**  yy_default[]       Default action for each state.
*/
static YYACTIONTYPE yy_action[] = {
 /*     0 */     4,   28,   15,   38,   12,   37,   16,   18,   20,   21,
 /*    10 */    22,   23,   24,    4,   31,    4,   17,   15,   40,   19,
 /*    20 */    35,   16,   18,   20,   21,   22,   23,   24,    3,   31,
 /*    30 */     4,   28,   15,    6,   12,   30,   16,   18,   20,   21,
 /*    40 */    22,   23,   24,   54,   31,   15,   25,   27,   11,   16,
 /*    50 */    13,   36,   15,    7,   27,   11,   16,   15,   32,   27,
 /*    60 */    11,   16,   15,    9,   10,   11,   16,   66,    1,    2,
 /*    70 */    39,   15,    9,    5,   14,   16,   41,   26,    4,    9,
 /*    80 */    29,   34,   54,    8,   54,   54,   54,   54,   33,
};
static YYCODETYPE yy_lookahead[] = {
 /*     0 */     2,    3,   22,    5,    6,   25,   26,    9,   10,   11,
 /*    10 */    12,   13,   14,    2,   16,    2,    3,   22,    0,    6,
 /*    20 */    25,   26,    9,   10,   11,   12,   13,   14,   22,   16,
 /*    30 */     2,    3,   22,    4,    6,   25,   26,    9,   10,   11,
 /*    40 */    12,   13,   14,   27,   16,   22,   23,   24,   25,   26,
 /*    50 */     7,    8,   22,   23,   24,   25,   26,   22,   23,   24,
 /*    60 */    25,   26,   22,    1,   24,   25,   26,   19,   20,   21,
 /*    70 */    22,   22,    1,    3,   25,   26,    0,   15,    2,    1,
 /*    80 */     7,    8,   27,    5,   27,   27,   27,   27,   17,
};
#define YY_SHIFT_USE_DFLT (-3)
static signed char yy_shift_ofst[] = {
 /*     0 */    11,   18,   76,   -3,   70,   29,   -2,   78,   -3,   28,
 /*    10 */    -3,   -3,   43,   13,   -3,   -3,   -3,   -3,   -3,   -3,
 /*    20 */    -3,   -3,   -3,   -3,   28,   62,   -3,   -3,   73,   13,
 /*    30 */    -3,   28,   71,   -3,   13,   -3,   13,   -3,   -3,   -3,
};
#define YY_REDUCE_USE_DFLT (-21)
static signed char yy_reduce_ofst[] = {
 /*     0 */    48,  -21,    6,  -21,  -21,  -21,   30,  -21,  -21,   40,
 /*    10 */   -21,  -21,  -21,   49,  -21,  -21,  -21,  -21,  -21,  -21,
 /*    20 */   -21,  -21,  -21,  -21,   23,  -21,  -21,  -21,  -21,   10,
 /*    30 */   -21,   35,  -21,  -21,   -5,  -21,  -20,  -21,  -21,  -21,
};
static YYACTIONTYPE yy_default[] = {
 /*     0 */    65,   65,   65,   42,   65,   46,   65,   65,   44,   65,
 /*    10 */    47,   49,   58,   65,   50,   54,   55,   56,   57,   58,
 /*    20 */    59,   60,   61,   62,   65,   65,   63,   48,   56,   65,
 /*    30 */    52,   65,   65,   64,   65,   53,   65,   51,   45,   43,
};
#define YY_SZ_ACTTAB (sizeof(yy_action)/sizeof(yy_action[0]))

/* The next table maps tokens into fallback tokens.  If a construct
** like the following:
** 
**      %fallback ID X Y Z.
**
** appears in the grammer, then ID becomes a fallback token for X, Y,
** and Z.  Whenever one of the tokens X, Y, or Z is input to the parser
** but it does not parse, the type of the token is changed to ID and
** the parse is retried before an error is thrown.
*/
#ifdef YYFALLBACK
static const YYCODETYPE yyFallback[] = {
};
#endif /* YYFALLBACK */

/* The following structure represents a single element of the
** parser's stack.  Information stored includes:
**
**   +  The state number for the parser at this level of the stack.
**
**   +  The value of the token stored at this level of the stack.
**      (In other words, the "major" token.)
**
**   +  The semantic value stored at this level of the stack.  This is
**      the information used by the action routines in the grammar.
**      It is sometimes called the "minor" token.
*/
struct yyStackEntry {
  int stateno;       /* The state-number */
  int major;         /* The major token value.  This is the code
                     ** number for the token at this stack level */
  YYMINORTYPE minor; /* The user-supplied minor token value.  This
                     ** is the value of the token  */
};
typedef struct yyStackEntry yyStackEntry;

/* The state of the parser is completely contained in an instance of
** the following structure */
struct yyParser {
  int yyidx;                    /* Index of top element in stack */
  int yyerrcnt;                 /* Shifts left before out of the error */
  phannot_ARG_SDECL                /* A place to hold %extra_argument */
  yyStackEntry yystack[YYSTACKDEPTH];  /* The parser's stack */
};
typedef struct yyParser yyParser;

#ifndef NDEBUG
#include <stdio.h>
static FILE *yyTraceFILE = 0;
static char *yyTracePrompt = 0;
#endif /* NDEBUG */

#ifndef NDEBUG
/* 
** Turn parser tracing on by giving a stream to which to write the trace
** and a prompt to preface each trace message.  Tracing is turned off
** by making either argument NULL 
**
** Inputs:
** <ul>
** <li> A FILE* to which trace output should be written.
**      If NULL, then tracing is turned off.
** <li> A prefix string written at the beginning of every
**      line of trace output.  If NULL, then tracing is
**      turned off.
** </ul>
**
** Outputs:
** None.
*/
void phannot_Trace(FILE *TraceFILE, char *zTracePrompt){
  yyTraceFILE = TraceFILE;
  yyTracePrompt = zTracePrompt;
  if( yyTraceFILE==0 ) yyTracePrompt = 0;
  else if( yyTracePrompt==0 ) yyTraceFILE = 0;
}
#endif /* NDEBUG */

#ifndef NDEBUG
/* For tracing shifts, the names of all terminals and nonterminals
** are required.  The following table supplies these names */
static const char *yyTokenName[] = { 
  "$",             "COMMA",         "AT",            "IDENTIFIER",  
  "PARENTHESES_OPEN",  "PARENTHESES_CLOSE",  "STRING",        "EQUALS",      
  "COLON",         "INTEGER",       "DOUBLE",        "NULL",        
  "FALSE",         "TRUE",          "BRACKET_OPEN",  "BRACKET_CLOSE",
  "SBRACKET_OPEN",  "SBRACKET_CLOSE",  "error",         "program",     
  "annotation_language",  "annotation_list",  "annotation",    "argument_list",
  "argument_item",  "expr",          "array",       
};
#endif /* NDEBUG */

#ifndef NDEBUG
/* For tracing reduce actions, the names of all rules are required.
*/
static const char *yyRuleName[] = {
 /*   0 */ "program ::= annotation_language",
 /*   1 */ "annotation_language ::= annotation_list",
 /*   2 */ "annotation_list ::= annotation_list annotation",
 /*   3 */ "annotation_list ::= annotation",
 /*   4 */ "annotation ::= AT IDENTIFIER PARENTHESES_OPEN argument_list PARENTHESES_CLOSE",
 /*   5 */ "annotation ::= AT IDENTIFIER PARENTHESES_OPEN PARENTHESES_CLOSE",
 /*   6 */ "annotation ::= AT IDENTIFIER",
 /*   7 */ "argument_list ::= argument_list COMMA argument_item",
 /*   8 */ "argument_list ::= argument_item",
 /*   9 */ "argument_item ::= expr",
 /*  10 */ "argument_item ::= STRING EQUALS expr",
 /*  11 */ "argument_item ::= STRING COLON expr",
 /*  12 */ "argument_item ::= IDENTIFIER EQUALS expr",
 /*  13 */ "argument_item ::= IDENTIFIER COLON expr",
 /*  14 */ "expr ::= annotation",
 /*  15 */ "expr ::= array",
 /*  16 */ "expr ::= IDENTIFIER",
 /*  17 */ "expr ::= INTEGER",
 /*  18 */ "expr ::= STRING",
 /*  19 */ "expr ::= DOUBLE",
 /*  20 */ "expr ::= NULL",
 /*  21 */ "expr ::= FALSE",
 /*  22 */ "expr ::= TRUE",
 /*  23 */ "array ::= BRACKET_OPEN argument_list BRACKET_CLOSE",
 /*  24 */ "array ::= SBRACKET_OPEN argument_list SBRACKET_CLOSE",
};
#endif /* NDEBUG */

/*
** This function returns the symbolic name associated with a token
** value.
*/
const char *phannot_TokenName(int tokenType){
#ifndef NDEBUG
  if( tokenType>0 && tokenType<(sizeof(yyTokenName)/sizeof(yyTokenName[0])) ){
    return yyTokenName[tokenType];
  }else{
    return "Unknown";
  }
#else
  return "";
#endif
}

/* 
** This function allocates a new parser.
** The only argument is a pointer to a function which works like
** malloc.
**
** Inputs:
** A pointer to the function used to allocate memory.
**
** Outputs:
** A pointer to a parser.  This pointer is used in subsequent calls
** to phannot_ and phannot_Free.
*/
void *phannot_Alloc(void *(*mallocProc)(size_t)){
  yyParser *pParser;
  pParser = (yyParser*)(*mallocProc)( (size_t)sizeof(yyParser) );
  if( pParser ){
    pParser->yyidx = -1;
  }
  return pParser;
}

/* The following function deletes the value associated with a
** symbol.  The symbol can be either a terminal or nonterminal.
** "yymajor" is the symbol code, and "yypminor" is a pointer to
** the value.
*/
static void yy_destructor(YYCODETYPE yymajor, YYMINORTYPE *yypminor){
  switch( yymajor ){
    /* Here is inserted the actions which take place when a
    ** terminal or non-terminal is destroyed.  This can happen
    ** when the symbol is popped from the stack during a
    ** reduce or during error processing or when a parser is 
    ** being destroyed before it is finished parsing.
    **
    ** Note: during a reduce, the only symbols destroyed are those
    ** which appear on the RHS of the rule, but which are not used
    ** inside the C code.
    */
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
    case 15:
    case 16:
    case 17:
#line 214 "parser.lemon"
{
	if ((yypminor->yy0)) {
		if ((yypminor->yy0)->free_flag) {
			efree((yypminor->yy0)->token);
		}
		efree((yypminor->yy0));
	}
}
#line 498 "parser.c"
      break;
    case 20:
    case 21:
    case 22:
    case 23:
    case 24:
    case 25:
#line 227 "parser.lemon"
{ zval_ptr_dtor(&(yypminor->yy36)); }
#line 508 "parser.c"
      break;
    default:  break;   /* If no destructor action specified: do nothing */
  }
}

/*
** Pop the parser's stack once.
**
** If there is a destructor routine associated with the token which
** is popped from the stack, then call it.
**
** Return the major token number for the symbol popped.
*/
static int yy_pop_parser_stack(yyParser *pParser){
  YYCODETYPE yymajor;
  yyStackEntry *yytos = &pParser->yystack[pParser->yyidx];

  if( pParser->yyidx<0 ) return 0;
#ifndef NDEBUG
  if( yyTraceFILE && pParser->yyidx>=0 ){
    fprintf(yyTraceFILE,"%sPopping %s\n",
      yyTracePrompt,
      yyTokenName[yytos->major]);
  }
#endif
  yymajor = yytos->major;
  yy_destructor( yymajor, &yytos->minor);
  pParser->yyidx--;
  return yymajor;
}

/* 
** Deallocate and destroy a parser.  Destructors are all called for
** all stack elements before shutting the parser down.
**
** Inputs:
** <ul>
** <li>  A pointer to the parser.  This should be a pointer
**       obtained from phannot_Alloc.
** <li>  A pointer to a function used to reclaim memory obtained
**       from malloc.
** </ul>
*/
void phannot_Free(
  void *p,                    /* The parser to be deleted */
  void (*freeProc)(void*)     /* Function used to reclaim memory */
){
  yyParser *pParser = (yyParser*)p;
  if( pParser==0 ) return;
  while( pParser->yyidx>=0 ) yy_pop_parser_stack(pParser);
  (*freeProc)((void*)pParser);
}

/*
** Find the appropriate action for a parser given the terminal
** look-ahead token iLookAhead.
**
** If the look-ahead token is YYNOCODE, then check to see if the action is
** independent of the look-ahead.  If it is, return the action, otherwise
** return YY_NO_ACTION.
*/
static int yy_find_shift_action(
  yyParser *pParser,        /* The parser */
  int iLookAhead            /* The look-ahead token */
){
  int i;
  int stateno = pParser->yystack[pParser->yyidx].stateno;
 
  /* if( pParser->yyidx<0 ) return YY_NO_ACTION;  */
  i = yy_shift_ofst[stateno];
  if( i==YY_SHIFT_USE_DFLT ){
    return yy_default[stateno];
  }
  if( iLookAhead==YYNOCODE ){
    return YY_NO_ACTION;
  }
  i += iLookAhead;
  if( i<0 || i>=YY_SZ_ACTTAB || yy_lookahead[i]!=iLookAhead ){
#ifdef YYFALLBACK
    int iFallback;            /* Fallback token */
    if( iLookAhead<sizeof(yyFallback)/sizeof(yyFallback[0])
           && (iFallback = yyFallback[iLookAhead])!=0 ){
#ifndef NDEBUG
      if( yyTraceFILE ){
        fprintf(yyTraceFILE, "%sFALLBACK %s => %s\n",
           yyTracePrompt, yyTokenName[iLookAhead], yyTokenName[iFallback]);
      }
#endif
      return yy_find_shift_action(pParser, iFallback);
    }
#endif
    return yy_default[stateno];
  }else{
    return yy_action[i];
  }
}

/*
** Find the appropriate action for a parser given the non-terminal
** look-ahead token iLookAhead.
**
** If the look-ahead token is YYNOCODE, then check to see if the action is
** independent of the look-ahead.  If it is, return the action, otherwise
** return YY_NO_ACTION.
*/
static int yy_find_reduce_action(
  yyParser *pParser,        /* The parser */
  int iLookAhead            /* The look-ahead token */
){
  int i;
  int stateno = pParser->yystack[pParser->yyidx].stateno;
 
  i = yy_reduce_ofst[stateno];
  if( i==YY_REDUCE_USE_DFLT ){
    return yy_default[stateno];
  }
  if( iLookAhead==YYNOCODE ){
    return YY_NO_ACTION;
  }
  i += iLookAhead;
  if( i<0 || i>=YY_SZ_ACTTAB || yy_lookahead[i]!=iLookAhead ){
    return yy_default[stateno];
  }else{
    return yy_action[i];
  }
}

/*
** Perform a shift action.
*/
static void yy_shift(
  yyParser *yypParser,          /* The parser to be shifted */
  int yyNewState,               /* The new state to shift in */
  int yyMajor,                  /* The major token to shift in */
  YYMINORTYPE *yypMinor         /* Pointer ot the minor token to shift in */
){
  yyStackEntry *yytos;
  yypParser->yyidx++;
  if( yypParser->yyidx>=YYSTACKDEPTH ){
     phannot_ARG_FETCH;
     yypParser->yyidx--;
#ifndef NDEBUG
     if( yyTraceFILE ){
       fprintf(yyTraceFILE,"%sStack Overflow!\n",yyTracePrompt);
     }
#endif
     while( yypParser->yyidx>=0 ) yy_pop_parser_stack(yypParser);
     /* Here code is inserted which will execute if the parser
     ** stack every overflows */
     phannot_ARG_STORE; /* Suppress warning about unused %extra_argument var */
     return;
  }
  yytos = &yypParser->yystack[yypParser->yyidx];
  yytos->stateno = yyNewState;
  yytos->major = yyMajor;
  yytos->minor = *yypMinor;
#ifndef NDEBUG
  if( yyTraceFILE && yypParser->yyidx>0 ){
    int i;
    fprintf(yyTraceFILE,"%sShift %d\n",yyTracePrompt,yyNewState);
    fprintf(yyTraceFILE,"%sStack:",yyTracePrompt);
    for(i=1; i<=yypParser->yyidx; i++)
      fprintf(yyTraceFILE," %s",yyTokenName[yypParser->yystack[i].major]);
    fprintf(yyTraceFILE,"\n");
  }
#endif
}

/* The following table contains information about every rule that
** is used during the reduce.
*/
static struct {
  YYCODETYPE lhs;         /* Symbol on the left-hand side of the rule */
  unsigned char nrhs;     /* Number of right-hand side symbols in the rule */
} yyRuleInfo[] = {
  { 19, 1 },
  { 20, 1 },
  { 21, 2 },
  { 21, 1 },
  { 22, 5 },
  { 22, 4 },
  { 22, 2 },
  { 23, 3 },
  { 23, 1 },
  { 24, 1 },
  { 24, 3 },
  { 24, 3 },
  { 24, 3 },
  { 24, 3 },
  { 25, 1 },
  { 25, 1 },
  { 25, 1 },
  { 25, 1 },
  { 25, 1 },
  { 25, 1 },
  { 25, 1 },
  { 25, 1 },
  { 25, 1 },
  { 26, 3 },
  { 26, 3 },
};

static void yy_accept(yyParser*);  /* Forward Declaration */

/*
** Perform a reduce action and the shift that must immediately
** follow the reduce.
*/
static void yy_reduce(
  yyParser *yypParser,         /* The parser */
  int yyruleno                 /* Number of the rule by which to reduce */
){
  int yygoto;                     /* The next state */
  int yyact;                      /* The next action */
  YYMINORTYPE yygotominor;        /* The LHS of the rule reduced */
  yyStackEntry *yymsp;            /* The top of the parser's stack */
  int yysize;                     /* Amount to pop the stack */
  phannot_ARG_FETCH;
  yymsp = &yypParser->yystack[yypParser->yyidx];
#ifndef NDEBUG
  if( yyTraceFILE && yyruleno>=0 
        && yyruleno<sizeof(yyRuleName)/sizeof(yyRuleName[0]) ){
    fprintf(yyTraceFILE, "%sReduce [%s].\n", yyTracePrompt,
      yyRuleName[yyruleno]);
  }
#endif /* NDEBUG */

  switch( yyruleno ){
  /* Beginning here are the reduction cases.  A typical example
  ** follows:
  **   case 0:
  **  #line <lineno> <grammarfile>
  **     { ... }           // User supplied code
  **  #line <lineno> <thisfile>
  **     break;
  */
      case 0:
#line 223 "parser.lemon"
{
	status->ret = yymsp[0].minor.yy36;
}
#line 750 "parser.c"
        break;
      case 1:
      case 14:
      case 15:
#line 229 "parser.lemon"
{
	yygotominor.yy36 = yymsp[0].minor.yy36;
}
#line 759 "parser.c"
        break;
      case 2:
#line 235 "parser.lemon"
{
	yygotominor.yy36 = phannot_ret_zval_list(yymsp[-1].minor.yy36, yymsp[0].minor.yy36);
}
#line 766 "parser.c"
        break;
      case 3:
      case 8:
#line 239 "parser.lemon"
{
	yygotominor.yy36 = phannot_ret_zval_list(NULL, yymsp[0].minor.yy36);
}
#line 774 "parser.c"
        break;
      case 4:
#line 246 "parser.lemon"
{
	yygotominor.yy36 = phannot_ret_annotation(yymsp[-3].minor.yy0, yymsp[-1].minor.yy36, status->scanner_state);
  yy_destructor(2,&yymsp[-4].minor);
  yy_destructor(4,&yymsp[-2].minor);
  yy_destructor(5,&yymsp[0].minor);
}
#line 784 "parser.c"
        break;
      case 5:
#line 250 "parser.lemon"
{
	yygotominor.yy36 = phannot_ret_annotation(yymsp[-2].minor.yy0, NULL, status->scanner_state);
  yy_destructor(2,&yymsp[-3].minor);
  yy_destructor(4,&yymsp[-1].minor);
  yy_destructor(5,&yymsp[0].minor);
}
#line 794 "parser.c"
        break;
      case 6:
#line 254 "parser.lemon"
{
	yygotominor.yy36 = phannot_ret_annotation(yymsp[0].minor.yy0, NULL, status->scanner_state);
  yy_destructor(2,&yymsp[-1].minor);
}
#line 802 "parser.c"
        break;
      case 7:
#line 260 "parser.lemon"
{
	yygotominor.yy36 = phannot_ret_zval_list(yymsp[-2].minor.yy36, yymsp[0].minor.yy36);
  yy_destructor(1,&yymsp[-1].minor);
}
#line 810 "parser.c"
        break;
      case 9:
#line 270 "parser.lemon"
{
	yygotominor.yy36 = phannot_ret_named_item(NULL, yymsp[0].minor.yy36);
}
#line 817 "parser.c"
        break;
      case 10:
      case 12:
#line 274 "parser.lemon"
{
	yygotominor.yy36 = phannot_ret_named_item(yymsp[-2].minor.yy0, yymsp[0].minor.yy36);
  yy_destructor(7,&yymsp[-1].minor);
}
#line 826 "parser.c"
        break;
      case 11:
      case 13:
#line 278 "parser.lemon"
{
	yygotominor.yy36 = phannot_ret_named_item(yymsp[-2].minor.yy0, yymsp[0].minor.yy36);
  yy_destructor(8,&yymsp[-1].minor);
}
#line 835 "parser.c"
        break;
      case 16:
#line 300 "parser.lemon"
{
	yygotominor.yy36 = phannot_ret_literal_zval(PHANNOT_T_IDENTIFIER, yymsp[0].minor.yy0);
}
#line 842 "parser.c"
        break;
      case 17:
#line 304 "parser.lemon"
{
	yygotominor.yy36 = phannot_ret_literal_zval(PHANNOT_T_INTEGER, yymsp[0].minor.yy0);
}
#line 849 "parser.c"
        break;
      case 18:
#line 308 "parser.lemon"
{
	yygotominor.yy36 = phannot_ret_literal_zval(PHANNOT_T_STRING, yymsp[0].minor.yy0);
}
#line 856 "parser.c"
        break;
      case 19:
#line 312 "parser.lemon"
{
	yygotominor.yy36 = phannot_ret_literal_zval(PHANNOT_T_DOUBLE, yymsp[0].minor.yy0);
}
#line 863 "parser.c"
        break;
      case 20:
#line 316 "parser.lemon"
{
	yygotominor.yy36 = phannot_ret_literal_zval(PHANNOT_T_NULL, NULL);
  yy_destructor(11,&yymsp[0].minor);
}
#line 871 "parser.c"
        break;
      case 21:
#line 320 "parser.lemon"
{
	yygotominor.yy36 = phannot_ret_literal_zval(PHANNOT_T_FALSE, NULL);
  yy_destructor(12,&yymsp[0].minor);
}
#line 879 "parser.c"
        break;
      case 22:
#line 324 "parser.lemon"
{
	yygotominor.yy36 = phannot_ret_literal_zval(PHANNOT_T_TRUE, NULL);
  yy_destructor(13,&yymsp[0].minor);
}
#line 887 "parser.c"
        break;
      case 23:
#line 328 "parser.lemon"
{
	yygotominor.yy36 = phannot_ret_array(yymsp[-1].minor.yy36);
  yy_destructor(14,&yymsp[-2].minor);
  yy_destructor(15,&yymsp[0].minor);
}
#line 896 "parser.c"
        break;
      case 24:
#line 332 "parser.lemon"
{
	yygotominor.yy36 = phannot_ret_array(yymsp[-1].minor.yy36);
  yy_destructor(16,&yymsp[-2].minor);
  yy_destructor(17,&yymsp[0].minor);
}
#line 905 "parser.c"
        break;
  };
  yygoto = yyRuleInfo[yyruleno].lhs;
  yysize = yyRuleInfo[yyruleno].nrhs;
  yypParser->yyidx -= yysize;
  yyact = yy_find_reduce_action(yypParser,yygoto);
  if( yyact < YYNSTATE ){
    yy_shift(yypParser,yyact,yygoto,&yygotominor);
  }else if( yyact == YYNSTATE + YYNRULE + 1 ){
    yy_accept(yypParser);
  }
}

/*
** The following code executes when the parse fails
*/
static void yy_parse_failed(
  yyParser *yypParser           /* The parser */
){
  phannot_ARG_FETCH;
#ifndef NDEBUG
  if( yyTraceFILE ){
    fprintf(yyTraceFILE,"%sFail!\n",yyTracePrompt);
  }
#endif
  while( yypParser->yyidx>=0 ) yy_pop_parser_stack(yypParser);
  /* Here code is inserted which will be executed whenever the
  ** parser fails */
  phannot_ARG_STORE; /* Suppress warning about unused %extra_argument variable */
}

/*
** The following code executes when a syntax error first occurs.
*/
static void yy_syntax_error(
  yyParser *yypParser,           /* The parser */
  int yymajor,                   /* The major type of the error token */
  YYMINORTYPE yyminor            /* The minor type of the error token */
){
  phannot_ARG_FETCH;
#define TOKEN (yyminor.yy0)
#line 151 "parser.lemon"

	if (status->scanner_state->start_length) {
		{

			char *token_name = NULL;
			const phannot_token_names *tokens = phannot_tokens;
			int token_found = 0;
			int active_token = status->scanner_state->active_token;
			int near_length = status->scanner_state->start_length;

			if (active_token) {
				do {
					if (tokens->code == active_token) {
						token_found = 1;
						token_name = tokens->name;
						break;
					}
					++tokens;
				} while (tokens[0].code != 0);
			}

			if (!token_name) {
				token_found = 0;
				token_name = estrndup("UNKNOWN", strlen("UNKNOWN"));
			}

			status->syntax_error_len = 128 + strlen(token_name) + Z_STRLEN_P(status->scanner_state->active_file);
			status->syntax_error = emalloc(sizeof(char) * status->syntax_error_len);

			if (near_length > 0) {
				if (status->token->value) {
					snprintf(status->syntax_error, status->syntax_error_len, "Syntax error, unexpected token %s(%s), near to '%s' in %s on line %d", token_name, status->token->value, status->scanner_state->start, Z_STRVAL_P(status->scanner_state->active_file), status->scanner_state->active_line);
				} else {
					snprintf(status->syntax_error, status->syntax_error_len, "Syntax error, unexpected token %s, near to '%s' in %s on line %d", token_name, status->scanner_state->start, Z_STRVAL_P(status->scanner_state->active_file), status->scanner_state->active_line);
				}
			} else {
				if (active_token != PHANNOT_T_IGNORE) {
					if (status->token->value) {
						snprintf(status->syntax_error, status->syntax_error_len, "Syntax error, unexpected token %s(%s), at the end of docblock in %s on line %d", token_name, status->token->value, Z_STRVAL_P(status->scanner_state->active_file), status->scanner_state->active_line);
					} else {
						snprintf(status->syntax_error, status->syntax_error_len, "Syntax error, unexpected token %s, at the end of docblock in %s on line %d", token_name, Z_STRVAL_P(status->scanner_state->active_file), status->scanner_state->active_line);
					}
				} else {
					snprintf(status->syntax_error, status->syntax_error_len, "Syntax error, unexpected EOF, at the end of docblock in %s on line %d", Z_STRVAL_P(status->scanner_state->active_file), status->scanner_state->active_line);
				}
				status->syntax_error[status->syntax_error_len-1] = '\0';
			}

			if (!token_found) {
				if (token_name) {
					efree(token_name);
				}
			}
		}
	} else {
		status->syntax_error_len = 48 + Z_STRLEN_P(status->scanner_state->active_file);
		status->syntax_error = emalloc(sizeof(char) * status->syntax_error_len);
		sprintf(status->syntax_error, "Syntax error, unexpected EOF in %s", Z_STRVAL_P(status->scanner_state->active_file));
	}

	status->status = PHANNOT_PARSING_FAILED;

#line 1010 "parser.c"
  phannot_ARG_STORE; /* Suppress warning about unused %extra_argument variable */
}

/*
** The following is executed when the parser accepts
*/
static void yy_accept(
  yyParser *yypParser           /* The parser */
){
  phannot_ARG_FETCH;
#ifndef NDEBUG
  if( yyTraceFILE ){
    fprintf(yyTraceFILE,"%sAccept!\n",yyTracePrompt);
  }
#endif
  while( yypParser->yyidx>=0 ) yy_pop_parser_stack(yypParser);
  /* Here code is inserted which will be executed whenever the
  ** parser accepts */
  phannot_ARG_STORE; /* Suppress warning about unused %extra_argument variable */
}

/* The main parser program.
** The first argument is a pointer to a structure obtained from
** "phannot_Alloc" which describes the current state of the parser.
** The second argument is the major token number.  The third is
** the minor token.  The fourth optional argument is whatever the
** user wants (and specified in the grammar) and is available for
** use by the action routines.
**
** Inputs:
** <ul>
** <li> A pointer to the parser (an opaque structure.)
** <li> The major token number.
** <li> The minor token number.
** <li> An option argument of a grammar-specified type.
** </ul>
**
** Outputs:
** None.
*/
void phannot_(
  void *yyp,                   /* The parser */
  int yymajor,                 /* The major token code number */
  phannot_TOKENTYPE yyminor       /* The value for the token */
  phannot_ARG_PDECL               /* Optional %extra_argument parameter */
){
  YYMINORTYPE yyminorunion;
  int yyact;            /* The parser action. */
  int yyendofinput;     /* True if we are at the end of input */
  int yyerrorhit = 0;   /* True if yymajor has invoked an error */
  yyParser *yypParser;  /* The parser */

  /* (re)initialize the parser, if necessary */
  yypParser = (yyParser*)yyp;
  if( yypParser->yyidx<0 ){
    if( yymajor==0 ) return;
    yypParser->yyidx = 0;
    yypParser->yyerrcnt = -1;
    yypParser->yystack[0].stateno = 0;
    yypParser->yystack[0].major = 0;
  }
  yyminorunion.yy0 = yyminor;
  yyendofinput = (yymajor==0);
  phannot_ARG_STORE;

#ifndef NDEBUG
  if( yyTraceFILE ){
    fprintf(yyTraceFILE,"%sInput %s\n",yyTracePrompt,yyTokenName[yymajor]);
  }
#endif

  do{
    yyact = yy_find_shift_action(yypParser,yymajor);
    if( yyact<YYNSTATE ){
      yy_shift(yypParser,yyact,yymajor,&yyminorunion);
      yypParser->yyerrcnt--;
      if( yyendofinput && yypParser->yyidx>=0 ){
        yymajor = 0;
      }else{
        yymajor = YYNOCODE;
      }
    }else if( yyact < YYNSTATE + YYNRULE ){
      yy_reduce(yypParser,yyact-YYNSTATE);
    }else if( yyact == YY_ERROR_ACTION ){
      int yymx;
#ifndef NDEBUG
      if( yyTraceFILE ){
        fprintf(yyTraceFILE,"%sSyntax Error!\n",yyTracePrompt);
      }
#endif
#ifdef YYERRORSYMBOL
      /* A syntax error has occurred.
      ** The response to an error depends upon whether or not the
      ** grammar defines an error token "ERROR".  
      **
      ** This is what we do if the grammar does define ERROR:
      **
      **  * Call the %syntax_error function.
      **
      **  * Begin popping the stack until we enter a state where
      **    it is legal to shift the error symbol, then shift
      **    the error symbol.
      **
      **  * Set the error count to three.
      **
      **  * Begin accepting and shifting new tokens.  No new error
      **    processing will occur until three tokens have been
      **    shifted successfully.
      **
      */
      if( yypParser->yyerrcnt<0 ){
        yy_syntax_error(yypParser,yymajor,yyminorunion);
      }
      yymx = yypParser->yystack[yypParser->yyidx].major;
      if( yymx==YYERRORSYMBOL || yyerrorhit ){
#ifndef NDEBUG
        if( yyTraceFILE ){
          fprintf(yyTraceFILE,"%sDiscard input token %s\n",
             yyTracePrompt,yyTokenName[yymajor]);
        }
#endif
        yy_destructor(yymajor,&yyminorunion);
        yymajor = YYNOCODE;
      }else{
         while(
          yypParser->yyidx >= 0 &&
          yymx != YYERRORSYMBOL &&
          (yyact = yy_find_shift_action(yypParser,YYERRORSYMBOL)) >= YYNSTATE
        ){
          yy_pop_parser_stack(yypParser);
        }
        if( yypParser->yyidx < 0 || yymajor==0 ){
          yy_destructor(yymajor,&yyminorunion);
          yy_parse_failed(yypParser);
          yymajor = YYNOCODE;
        }else if( yymx!=YYERRORSYMBOL ){
          YYMINORTYPE u2;
          u2.YYERRSYMDT = 0;
          yy_shift(yypParser,yyact,YYERRORSYMBOL,&u2);
        }
      }
      yypParser->yyerrcnt = 3;
      yyerrorhit = 1;
#else  /* YYERRORSYMBOL is not defined */
      /* This is what we do if the grammar does not define ERROR:
      **
      **  * Report an error message, and throw away the input token.
      **
      **  * If the input token is $, then fail the parse.
      **
      ** As before, subsequent error messages are suppressed until
      ** three input tokens have been successfully shifted.
      */
      if( yypParser->yyerrcnt<=0 ){
        yy_syntax_error(yypParser,yymajor,yyminorunion);
      }
      yypParser->yyerrcnt = 3;
      yy_destructor(yymajor,&yyminorunion);
      if( yyendofinput ){
        yy_parse_failed(yypParser);
      }
      yymajor = YYNOCODE;
#endif
    }else{
      yy_accept(yypParser);
      yymajor = YYNOCODE;
    }
  }while( yymajor!=YYNOCODE && yypParser->yyidx>=0 );
  return;
}

/*
  +------------------------------------------------------------------------+
  | Phalcon Framework                                                      |
  +------------------------------------------------------------------------+
  | Copyright (c) 2011-2014 Phalcon Team (http://www.phalconphp.com)       |
  +------------------------------------------------------------------------+
  | This source file is subject to the New BSD License that is bundled     |
  | with this package in the file docs/LICENSE.txt.                        |
  |                                                                        |
  | If you did not receive a copy of the license and are unable to         |
  | obtain it through the world-wide-web, please send an email             |
  | to license@phalconphp.com so we can send you a copy immediately.       |
  +------------------------------------------------------------------------+
  | Authors: Andres Gutierrez <andres@phalconphp.com>                      |
  |          Eduar Carvajal <eduar@phalconphp.com>                         |
  +------------------------------------------------------------------------+
*/

const phannot_token_names phannot_tokens[] =
{
	{ "INTEGER",        PHANNOT_T_INTEGER },
	{ "DOUBLE",         PHANNOT_T_DOUBLE },
	{ "STRING",         PHANNOT_T_STRING },
	{ "IDENTIFIER",     PHANNOT_T_IDENTIFIER },
	{ "@",              PHANNOT_T_AT },
	{ ",",              PHANNOT_T_COMMA },
	{ "=",              PHANNOT_T_EQUALS },
	{ ":",              PHANNOT_T_COLON },
	{ "(",              PHANNOT_T_PARENTHESES_OPEN },
	{ ")",              PHANNOT_T_PARENTHESES_CLOSE },
	{ "{",              PHANNOT_T_BRACKET_OPEN },
	{ "}",              PHANNOT_T_BRACKET_CLOSE },
 	{ "[",              PHANNOT_T_SBRACKET_OPEN },
	{ "]",              PHANNOT_T_SBRACKET_CLOSE },
	{ "ARBITRARY TEXT", PHANNOT_T_ARBITRARY_TEXT },
	{ NULL, 0 }
};

/**
 * Wrapper to alloc memory within the parser
 */
static void *phannot_wrapper_alloc(size_t bytes){
	return emalloc(bytes);
}

/**
 * Wrapper to free memory within the parser
 */
static void phannot_wrapper_free(void *pointer){
	efree(pointer);
}

/**
 * Creates a parser_token to be passed to the parser
 */
static void phannot_parse_with_token(void* phannot_parser, int opcode, int parsercode, phannot_scanner_token *token, phannot_parser_status *parser_status){

	phannot_parser_token *pToken;

	pToken = emalloc(sizeof(phannot_parser_token));
	pToken->opcode = opcode;
	pToken->token = token->value;
	pToken->token_len = token->len;
	pToken->free_flag = 1;

	phannot_(phannot_parser, parsercode, pToken, parser_status);

	token->value = NULL;
	token->len = 0;
}

/**
 * Creates an error message when it's triggered by the scanner
 */
static void phannot_scanner_error_msg(phannot_parser_status *parser_status, zval **error_msg TSRMLS_DC){

	int error_length;
	char *error, *error_part;
	phannot_scanner_state *state = parser_status->scanner_state;

	ALLOC_INIT_ZVAL(*error_msg);
	if (state->start) {
		error_length = 128 + state->start_length +  Z_STRLEN_P(state->active_file);
		error = emalloc(sizeof(char) * error_length);
		if (state->start_length > 16) {
			error_part = estrndup(state->start, 16);
			snprintf(error, 64 + state->start_length, "Scanning error before '%s...' in %s on line %d", error_part, Z_STRVAL_P(state->active_file), state->active_line);
			efree(error_part);
		} else {
			snprintf(error, error_length - 1, "Scanning error before '%s' in %s on line %d", state->start, Z_STRVAL_P(state->active_file), state->active_line);
		}
		error[error_length - 1] = '\0';
		ZVAL_STRING(*error_msg, error, 1);
	} else {
		error_length = sizeof(char) * (64 + Z_STRLEN_P(state->active_file));
		error = emalloc(error_length);
		snprintf(error, error_length - 1, "Scanning error near to EOF in %s", Z_STRVAL_P(state->active_file));
		ZVAL_STRING(*error_msg, error, 1);
		error[error_length - 1] = '\0';
	}
	efree(error);
}

/**
 * Receives the comment tokenizes and parses it
 */
int phannot_parse_annotations(zval *result, zval *comment, zval *file_path, zval *line TSRMLS_DC){

	zval *error_msg = NULL;

	ZVAL_NULL(result);

	if (Z_TYPE_P(comment) != IS_STRING) {
        zend_throw_exception(zend_exception_get_default(TSRMLS_C), "Comment must be a string", 0 TSRMLS_CC);
		return FAILURE;
	}

	if(phannot_internal_parse_annotations(&result, comment, file_path, line, &error_msg TSRMLS_CC) == FAILURE){
		if (error_msg != NULL) {
			// phalcon_throw_exception_string(phalcon_annotations_exception_ce, Z_STRVAL_P(error_msg), Z_STRLEN_P(error_msg), 1 TSRMLS_CC);
            zend_throw_exception(zend_exception_get_default(TSRMLS_C), Z_STRVAL_P(error_msg) , 0 TSRMLS_CC);
		}
		else {
			// phalcon_throw_exception_string(phalcon_annotations_exception_ce, ZEND_STRL("There was an error parsing annotation"), 1 TSRMLS_CC);
            zend_throw_exception(zend_exception_get_default(TSRMLS_C), "There was an error parsing annotation" , 0 TSRMLS_CC);
		}

		return FAILURE;
	}

	return SUCCESS;
}

/**
 * Remove comment separators from a docblock
 */
void phannot_remove_comment_separators(zval *return_value, char *comment, int length, int *start_lines) {

	int start_mode = 1, j, i, open_parentheses;
	smart_str processed_str = {0};
	char ch;

	(*start_lines) = 0;

	for (i = 0; i < length; i++) {

		ch = comment[i];

		if (start_mode) {
			if (ch == ' ' || ch == '*' || ch == '/' || ch == '\t' || ch == 11) {
				continue;
			}
			start_mode = 0;
		}

		if (ch == '@') {

			smart_str_appendc(&processed_str, ch);
			i++;

			open_parentheses = 0;
			for (j = i; j < length; j++) {

				ch = comment[j];

				if (start_mode) {
					if (ch == ' ' || ch == '*' || ch == '/' || ch == '\t' || ch == 11) {
						continue;
					}
					start_mode = 0;
				}

				if (open_parentheses == 0) {

					if (isalnum(ch) || '_' == ch || '\\' == ch) {
						smart_str_appendc(&processed_str, ch);
						continue;
					}

					if (ch == '(') {
						smart_str_appendc(&processed_str, ch);
						open_parentheses++;
						continue;
					}

				} else {

					smart_str_appendc(&processed_str, ch);

					if (ch == '(') {
						open_parentheses++;
					} else if (ch == ')') {
						open_parentheses--;
					} else if (ch == '\n') {
						(*start_lines)++;
						start_mode = 1;
					}

					if (open_parentheses > 0) {
						continue;
					}
				}

				i = j;
				smart_str_appendc(&processed_str, ' ');
				break;
			}
		}

		if (ch == '\n') {
			(*start_lines)++;
			start_mode = 1;
		}
	}

	smart_str_0(&processed_str);

	if (processed_str.len) {
		RETURN_STRINGL(processed_str.c, processed_str.len, 0);
	} else {
		RETURN_EMPTY_STRING();
	}
}

/**
 * Parses a comment returning an intermediate array representation
 */
int phannot_internal_parse_annotations(zval **result, zval *comment, zval *file_path, zval *line, zval **error_msg TSRMLS_DC) {

	char *error;
	phannot_scanner_state *state;
	phannot_scanner_token token;
	int scanner_status, status = SUCCESS, start_lines, error_length;
	phannot_parser_status *parser_status = NULL;
	void* phannot_parser;
	zval processed_comment;

	/**
	 * Check if the comment has content
	 */
	if (!Z_STRVAL_P(comment)) {
		ZVAL_BOOL(*result, 0);
		return FAILURE;
	}

	if (Z_STRLEN_P(comment) < 2) {
		ZVAL_BOOL(*result, 0);
		return SUCCESS;
	}

	/**
	 * Remove comment separators
	 */
	phannot_remove_comment_separators(&processed_comment, Z_STRVAL_P(comment), Z_STRLEN_P(comment), &start_lines);

	if (Z_STRLEN(processed_comment) < 2) {
		ZVAL_BOOL(*result, 0);
		efree(Z_STRVAL(processed_comment));
		return SUCCESS;
	}

	/**
	 * Start the reentrant parser
	 */
	phannot_parser = phannot_Alloc(phannot_wrapper_alloc);

	parser_status = emalloc(sizeof(phannot_parser_status));
	state = emalloc(sizeof(phannot_scanner_state));

	parser_status->status = PHANNOT_PARSING_OK;
	parser_status->scanner_state = state;
	parser_status->ret = NULL;
	parser_status->token = &token;
	parser_status->syntax_error = NULL;

	/**
	 * Initialize the scanner state
	 */
	state->active_token = 0;
	state->start = Z_STRVAL(processed_comment);
	state->start_length = 0;
	state->mode = PHANNOT_MODE_RAW;
	state->active_file = file_path;

	token.value = NULL;
	token.len = 0;

	/**
	 * Possible start line
	 */
	if (Z_TYPE_P(line) == IS_LONG) {
		state->active_line = Z_LVAL_P(line) - start_lines;
	} else {
		state->active_line = 1;
	}

	state->end = state->start;

	while(0 <= (scanner_status = phannot_get_token(state, &token))) {

		state->active_token = token.opcode;

		state->start_length = (Z_STRVAL(processed_comment) + Z_STRLEN(processed_comment) - state->start);

		switch (token.opcode) {

			case PHANNOT_T_IGNORE:
				break;

			case PHANNOT_T_AT:
				phannot_(phannot_parser, PHANNOT_AT, NULL, parser_status);
				break;
			case PHANNOT_T_COMMA:
				phannot_(phannot_parser, PHANNOT_COMMA, NULL, parser_status);
				break;
			case PHANNOT_T_EQUALS:
				phannot_(phannot_parser, PHANNOT_EQUALS, NULL, parser_status);
				break;
			case PHANNOT_T_COLON:
				phannot_(phannot_parser, PHANNOT_COLON, NULL, parser_status);
				break;

			case PHANNOT_T_PARENTHESES_OPEN:
				phannot_(phannot_parser, PHANNOT_PARENTHESES_OPEN, NULL, parser_status);
				break;
			case PHANNOT_T_PARENTHESES_CLOSE:
				phannot_(phannot_parser, PHANNOT_PARENTHESES_CLOSE, NULL, parser_status);
				break;

			case PHANNOT_T_BRACKET_OPEN:
				phannot_(phannot_parser, PHANNOT_BRACKET_OPEN, NULL, parser_status);
				break;
			case PHANNOT_T_BRACKET_CLOSE:
				phannot_(phannot_parser, PHANNOT_BRACKET_CLOSE, NULL, parser_status);
				break;

			case PHANNOT_T_SBRACKET_OPEN:
				phannot_(phannot_parser, PHANNOT_SBRACKET_OPEN, NULL, parser_status);
				break;
			case PHANNOT_T_SBRACKET_CLOSE:
				phannot_(phannot_parser, PHANNOT_SBRACKET_CLOSE, NULL, parser_status);
				break;

			case PHANNOT_T_NULL:
				phannot_(phannot_parser, PHANNOT_NULL, NULL, parser_status);
				break;
			case PHANNOT_T_TRUE:
				phannot_(phannot_parser, PHANNOT_TRUE, NULL, parser_status);
				break;
			case PHANNOT_T_FALSE:
				phannot_(phannot_parser, PHANNOT_FALSE, NULL, parser_status);
				break;

			case PHANNOT_T_INTEGER:
				phannot_parse_with_token(phannot_parser, PHANNOT_T_INTEGER, PHANNOT_INTEGER, &token, parser_status);
				break;
			case PHANNOT_T_DOUBLE:
				phannot_parse_with_token(phannot_parser, PHANNOT_T_DOUBLE, PHANNOT_DOUBLE, &token, parser_status);
				break;
			case PHANNOT_T_STRING:
				phannot_parse_with_token(phannot_parser, PHANNOT_T_STRING, PHANNOT_STRING, &token, parser_status);
				break;
			case PHANNOT_T_IDENTIFIER:
				phannot_parse_with_token(phannot_parser, PHANNOT_T_IDENTIFIER, PHANNOT_IDENTIFIER, &token, parser_status);
				break;
			/*case PHANNOT_T_ARBITRARY_TEXT:
				phannot_parse_with_token(phannot_parser, PHANNOT_T_ARBITRARY_TEXT, PHANNOT_ARBITRARY_TEXT, &token, parser_status);
				break;*/

			default:
				parser_status->status = PHANNOT_PARSING_FAILED;
				if (!*error_msg) {
					error_length = sizeof(char) * (48 + Z_STRLEN_P(state->active_file));
					error = emalloc(error_length);
					snprintf(error, error_length - 1, "Scanner: unknown opcode %d on in %s line %d", token.opcode, Z_STRVAL_P(state->active_file), state->active_line);
					error[error_length - 1] = '\0';
					ALLOC_INIT_ZVAL(*error_msg);
					ZVAL_STRING(*error_msg, error, 1);
					efree(error);
				}
				break;
		}

		if (parser_status->status != PHANNOT_PARSING_OK) {
			status = FAILURE;
			break;
		}

		state->end = state->start;
	}

	if (status != FAILURE) {
		switch (scanner_status) {
			case PHANNOT_SCANNER_RETCODE_ERR:
			case PHANNOT_SCANNER_RETCODE_IMPOSSIBLE:
				if (!*error_msg) {
					phannot_scanner_error_msg(parser_status, error_msg TSRMLS_CC);
				}
				status = FAILURE;
				break;
			default:
				phannot_(phannot_parser, 0, NULL, parser_status);
		}
	}

	state->active_token = 0;
	state->start = NULL;

	if (parser_status->status != PHANNOT_PARSING_OK) {
		status = FAILURE;
		if (parser_status->syntax_error) {
			if (!*error_msg) {
				ALLOC_INIT_ZVAL(*error_msg);
				ZVAL_STRING(*error_msg, parser_status->syntax_error, 1);
			}
			efree(parser_status->syntax_error);
		}
	}

	phannot_Free(phannot_parser, phannot_wrapper_free);

	if (status != FAILURE) {
		if (parser_status->status == PHANNOT_PARSING_OK) {
			if (parser_status->ret) {
				ZVAL_ZVAL(*result, parser_status->ret, 0, 0);
				ZVAL_NULL(parser_status->ret);
				zval_ptr_dtor(&parser_status->ret);
			} else {
				array_init(*result);
			}
		}
	}

	efree(Z_STRVAL(processed_comment));

	efree(parser_status);
	efree(state);

	return status;
}
