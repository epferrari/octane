

        //  Octane Translator Module
        /* ------------------------------- */
        /*          PUBLIC API             */
        /* ------------------------------- */

        //  .renderControls(langs[,container])
        //  .translate([,data])
        //  .getLang()
        //  .setLang(lang)
        //  .getLangContent(contentID)
        //  .setLangData(data)

        /* ------------------------------- */
        /*              CONFIG             */
        /* ------------------------------- */

        
        //  @config langData [obj]: language data in JSON format
        //  @config paginated [bool]: 
       	//      true:	the translation table is split into [page][contentID]
        //      false:	the translation table is a dictionary of only [contentID]s (default)
        //  @config defaultLang [string]: a default language or (default:English)
        //  @config langSupport [array]: supported languages for the translator (default:['English'])

    octane.module('translator', function (config){

            // dummy
            var $M = {};

            config = config || {};

        /* ------------------------------- */
        // private protected properties
        /* ------------------------------- */

                // set by param
                $M.rosettaStone = ( _.isObject(config.langData) ) 	? config.langData 	  : {};
                // set by config
                $M.isPaginated	= ( _.isBoolean(config.paginated) ) ? config.paginated 	  : false;
                $M.langSupport  = ( _.isArray(config.langSupport) ) ? config.langSupport  : ['English'];
                // immutable
                $M.dropdown		= 	{
                                        wrapper 	: $('o-control#translator'),
                                        outerUL 	: $('<ul class="nav nav-pills"></ul>'),
                                        outerLI 	: $('<li class="dropdown"></li>'),
                                        pill 		: $('<a id="selected-language" class="dropdown-toggle closed" data-toggle="dropdown"></a>'),
                                        caret 		: $('<span class="caret"></span>'),
                                        innerUL 	: $('<ul class="dropdown-menu" role="menu"></ul>'),
                                        classKey 	: 'language-selector',
                                        dataKey 	: 'language-selected'
                                    };
                $M.languages 	= [
                                    {
                                        key:'English',
                                        display:'English',
                                        abbr:'en',
                                        regexp:/^_?(english|eng|en)$/i
                                    },{
                                        key:'Russian',
                                        display:'Русский',
                                        abbr:'ru',
                                        regexp:/^_?(russian|rus|ru|Русский)$/i
                                    },{
                                        key:'Spanish',
                                        display:'Español',
                                        abbr:'es',
                                        regexp:/^_?(spanish|espanol|esp|es|español)$/i
                                    },{
                                        key:'French',
                                        display:'Françias',
                                        abbr:'fr',
                                        regexp:/^_?(french|francias|françias|fra|fr)$/i
                                    },{
                                        key:'German',
                                        display:'Deutsch',
                                        abbr:'de',
                                        regexp:/^_?(german|deutsch|ger|de)$/i
                                    },{
                                        key:'Chinese',
                                        display:'简体中文',
                                        abbr:'zh',
                                        regexp:/^_?(chinese|zh|简体中文)$/i
                                    },{
                                        key:'Portugese',
                                        display:'Portugese',
                                        abbr:'pt',
                                        regexp:/^_?(portugese|port|pt)$/i
                                    },{
                                        key:'Japanese',
                                        display:'日本語',
                                        abbr:'ja',
                                        regexp:/^_?(japanese|jap|ja|日本語|nihongo)$/i
                                    }
                                ];
                // also set by config   
                $M.defaultLang	= supportsLang(config.defaultLang) || $M.languages[0];

        /* ------------------------------- */
        // private protected methods
        /* ------------------------------- */


            // set elements with o-lang attribute with language text
            /* --------------------------------------------------------------------- */

                function translate (data){

                    if( _.isObject(data) ) $M.rosettaStone = data;

                    var elems = document.querySelectorAll('[o-lang]');

                    for(var i=0, n = elems.length; i<n; i++){
                        translateElement(elems[i]);
                    }

                    $M.dropdown.pill.html($M.lang.display+' ');//.append($M.dropdown.caret);
                    octane.fire('translated');
                }

                function translateElement(el){

                    var contentID = el.getAttribute('o-lang'),
                        content = fetch(contentID);
                    // create or replace text node
                    if(el.firstChild && el.firstChild.nodeType == 3){
                        el.firstChild.data = content;
                    }else{
                        el.insertBefore(document.createTextNode(content),el.firstChild);
                    }
                }

            // @param langs [array] array of languages for the dropdown
            // @param container [string || $ object] containing elem for the dropdown
            /* --------------------------------------------------------------------- */

                function renderControls(langs,container){

                    var	$d 	= $M.dropdown;

                    // set the wrapper to a diffrent elem if passed
                    switch (true){
                        case ( _.isString(container) ):
                            $d.wrapper = $(container);
                            break;
                        case ( __.is$(container) ):
                            $d.wrapper = container;
                            break;
                    }

                    $d.outerUL.appendTo($d.wrapper);
                    $d.outerLI
                        .append($d.pill)
                        .append($d.innerUL)
                        .appendTo($d.outerUL);
                    //$d.caret.appendTo($d.pill);

                    langs	= _.isArray(langs) ? langs : [];

                    var	n = langs.length,
                        i, supported,innerLI;

                    for(i=0; i < n; i++){
                        supported = supportsLang(langs[i]);
                        if(supported){
                            innerLI = $('<li></li>');
                            innerLI
                                .addClass($d.classKey)
                                .attr('data-'+$d.dataKey,supported.key)
                                .html(supported.display)
                                .appendTo($d.innerUL);
                        }
                    }

                    // apply handlers to new DOM elems
                    applyClickHandlers();
                }


            // find the language from the url and set $M.lang
            /* --------------------------------------------------------------------- */

                function findLang (){

                    var parsed = __.location().searchObject;

                    $M.lang = supportsLang(parsed.lang) || $M.defaultLang;
                }



            // return the module's language
            /* --------------------------------------------------------------------- */

                function getLang(){
                    return $M.lang.key;
                }



            // define a language and re-translate
            // @param lang [string]: a language
            /* --------------------------------------------------------------------- */

                function setLang (lang){

                    if( supportsLang(lang) ){
                        $M.lang = supportsLang(lang);
                        // update the language in the url
                        //octane.pushState( {lang:$M.getLang()} );

                        // TODO: replace URL with new language	with history API
                        //window.location.search = '?lang='+$M.lang.key;

                        return getLang();
                    }
                }



            // return a specific content bit by its id
            // @param contentID [string]: content-id
            /* --------------------------------------------------------------------- */

                function fetch(contentID){

                    var id,page,section,content;

                    if($M.isPaginated){
                            id = ( _.isString(contentID) ) ? contentID.split('-') : [];
                            page = id[0];
                            section = id[1];
                            content = ($M.rosettaStone[page] && $M.rosettaStone[page][section]) ? $M.rosettaStone[page][section] : null;
                    }else{
                            content = $M.rosettaStone[contentID] ? $M.rosettaStone[contentID] : null;
                    }

                    if(content){
                        return content[$M.lang.abbr] ? content[$M.lang.abbr] : content[$M.defaultLang.abbr];
                    }else{
                        return '';
                    }
                }


        /* ------------------------------- */
        // private helpers
        /* ------------------------------- */


            // helper
            /* --------------------------------------------------------------------- */

                function applyClickHandlers(){
                    var $this, lang;

                    $('li.'+$M.dropdown.classKey).on('click',function (){
                        $this = $(this);
                        lang = $this.data($M.dropdown.dataKey);
                        setLang(lang);
                        translate();
                        $M.dropdown.pill.trigger('click');

                    });

                    $M.dropdown.pill.on('click',function (){
                        var pill = $(this);
                        if(pill.hasClass('closed')){
                            pill.removeClass('closed').addClass('open');
                            $M.dropdown.innerUL.show();
                        }
                        else if (pill.hasClass('open')){
                            pill.removeClass('open').addClass('closed');
                            $M.dropdown.innerUL.hide();
                        }
                    });			
                }


            // helper
            // determines if a language is supported
            // returns language object from $M.languages or false
            // @param lang [string]
            /* --------------------------------------------------------------------- */

                function supportsLang (lang){

                    var 	n = $M.languages.length,
                            i,$this;

                    for(i = 0; i < n; i++){
                        $this = $M.languages[i];
                        if($this.regexp && $this.regexp.test && $this.regexp.test(lang)) return $this;
                    }
                    return false;
                }


        /* ------------------------------- */
        // create public methods
        /* ------------------------------- */

                this.define({

                    renderTranslator		: 	function(langs,container){
                                                    return renderControls(langs,container);
                                                },
                    translate 				: 	function(data){
                                                    return translate(data);
                                                },
                    translateElement        :   function(el){
                                                    translateElement(el);
                                                },
                    getLang 				: 	function(){
                                                    return getLang();
                                                },
                    setLang 				: 	function(lang){
                                                    return setLang(lang);
                                                }
                });



        /* ------------------------------- */
        // init
        /* ------------------------------- */
                octane.handle('view:routed',translate);
                findLang();
                renderControls($M.langSupport);
                translate();
    });

	