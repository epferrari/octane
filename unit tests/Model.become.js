function assert(a,b,message){
    message = message || '';
    console.log(a == b,message);
}

function unit(message){
	console.log('TESTING: '+message);
}

/*************************************/
/*************************************/

assert(octane.model('App'),octane.App,'octane.App is octane.model("App")');
assert(octane.get('App'),octane.App.state,'App state is octane.get("App)');
assert(octane.get('App.name'),'WDPSA Conference App','App is named WDPSA Conference App');

/*************************************/
/*************************************/

unit('App detached');
octane.App.detach();

assert(octane.App,octane.model('App'),'App is still attached');
assert(octane.App.get(),octane.get('App'),'App state is still accessible thru octane.get()');

/*************************************/
/*************************************/

unit('reattach App');
octane.App.become('App');

assert(octane.App,octane.model('App'),'App is reattached');

/*************************************/
/*************************************/

unit('creating model me, unattached');

var me = octane.model();
me.set({name:'Ethan'});
assert(octane.get('Ethan'),undefined,'Ethan is undefined');

/*************************************/
/*************************************/

unit('me becoming "Ethan"');
me.become('Ethan');

assert(me.isRegistered(),true,'Ethan is registered');
assert(me.registeredTo(),'Ethan','Ethan is registered to "Ethan"');
assert(me,octane.model('Ethan'));
assert(me.get(),octane.model('Ethan').get(),'states match with octane.model().get');
assert(me.get(),octane.get('Ethan'),'states match with octane.get()');

/*************************************/
/*************************************/

unit('detaching me');
me.detach();

assert(octane.get('Ethan'),undefined,'Ethan is detached');
assert(me.state.name,'Ethan','me.state.name is "Ethan"');
assert(octane.model('Ethan').get('name'),undefined,'octane.model(Ethan).get(name) is undefined');

/*************************************/
/*************************************/

unit('me becoming Patrick');
me.become('Patrick');

assert(me,octane.model('Patrick'),'me is now "Patrick" in octane');
assert(me.registeredTo(),'Patrick','me is registered to "Patrick"');
assert(me,octane.model('Ethan'),'me is still "Ethan" in octane');
assert(me.get(),octane.get('Patrick'),'me.state matched octane.get(Patrick)');

/*************************************/
/*************************************/

unit('me become App');
me.become('App');

assert(me,octane.model('App'),'me is now attached to "App"');
assert(me,octane.model('Patrick'),'me is still attached to "Patrick"');
assert(octane.App,octane.model('App'),'octane.App is still attached to "App"');

/*************************************/
/*************************************/

