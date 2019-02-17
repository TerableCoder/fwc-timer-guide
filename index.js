module.exports = function FwcTimerGuide(dispatch) {	
	const command = mod.command || mod.require.command;
    /*
        TODO: Watch when mobs despawn to get next proper spawn time
    */
    const warningTime = 60000;

    const messages = [
        { time: 180000,    msg: '3:00 Mobs' },
        { time: 240000,    msg: '3:40 Teralith @ South' },
        { time: 340000,    msg: '5:40 Naga @ North' },
        { time: 370000,    msg: '6:10 Mobs' },
        { time: 510000,    msg: '8:30 Teralith @ South' },
        //{ time: 540000,    msg: '9:00 Mobs' },
        { time: 690000,    msg: '11:30 Naga @ North' },
        //{ time: 720000,    msg: '12:00 Mobs' },
        { time: 800000,    msg: '13:20 Teralith @ South' },
        //{ time: 0,    msg: '16:30? Naga @ North' }, ????????
    ];
    
    let timers = [],
    inBg = false;
	let enabled = true;
	let streamMode = false;

	command.add('fwc', (arg) => {
        if (arg === undefined){
            enabled = !enabled;
            command.message('Fwc Guide ' + (enabled ? 'Enabled' : 'Disabled') + '.');
        } else if(arg.toLowerCase() === "off"){
            enabled = false;
            command.message('Fwc Guide ' + (enabled ? 'Enabled' : 'Disabled') + '.');
        } else if(arg.toLowerCase() === "on"){
            enabled = true;
            command.message('Fwc Guide ' + (enabled ? 'Enabled' : 'Disabled') + '.');
        } else if(arg.toLowerCase() === "stream"){
            streamMode = !streamMode;
            command.message('Fwc Guide - Stream Mode: ' + (streamMode ? 'Enabled.' : 'Disabled.'));
        }
    });
	
    mod.hook('S_LOAD_TOPO', 3, (event) => {
        inBg = event.zone === 112 ? true : false;
        if (!inBg && timers.length > 0) {
            for (let i = 0; i < timers.length; i++) {
                clearTimeout(timers[i]);
            }
            timers = [];
        }
    });
    
//    mod.hook('S_BATTLE_FIELD_STATE', 1, (event) => {   
//        if (event.state === 1) startTimers();
//    });
    
    // workaround for missing S_BATTLE_FIELD_STATE def
    mod.hook('S_SYSTEM_MESSAGE', 1, (event) => {
        if (inBg && event.message.startsWith("@153") && event.message[9] === '2' && timers.length == 0) {
            startTimers();
        }
    });
    
    function startTimers() {
        for (let i = 0; i < messages.length; i++) {
            timers.push(setTimeout(()=>{displayMessage(messages[i].msg);}, messages[i].time - warningTime));
        }
    }
    
    function displayMessage(msg) {
		if(!enabled) return;
		
		if(streamMode){
			command.message(msg); // send to proxy chat
        } else{
			mod.toClient('S_CHAT', 1, {    
				channel: 7,  // send to /w chat
				//channel: 21,  // send to p-notice
				authorName: 'fwc-guide',
				message: msg
			});
			mod.toClient('S_DUNGEON_EVENT_MESSAGE', 2, {
				message: msg,
				type: 2,
				chat: false,
				channel: 0
			});
		}
    }
    
}
