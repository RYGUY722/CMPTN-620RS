/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
			// Do a fancy animation, because we're cool...
			document.body.style.background = "#000011 url(distrib/images/core_background.png) no-repeat fixed center";
			document.getElementById("display").style.backgroundColor = "rgba(202,232,117,.5)";
			document.getElementById("display").style.border = "2px solid red";
			
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnModeChange")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnProcessView")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       // There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
			_Memory = new Memory();
			_Memory.init();
			_MemoryAccessor = new MemoryAccessor();
			_MemoryAccessor.init();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
		
        public static hostBtnModeChange_click(btn): void {
			if(_hardwareClockID !==-1){ //If there is currently a clock pulse, then we're in normal mode.
				Control.hostLog("Switching to Single-Step Mode", "host");
				// Stop the interval that's simulating our clock pulse.
				clearInterval(_hardwareClockID);
				_hardwareClockID = -1; //To keep track that there is no longer a clock pulse, I set this to -1.
				// Allow the user to click the step button
				(<HTMLButtonElement>document.getElementById("btnStep")).disabled = false;
				// And display that we are now in Single-Step Mode.
				(<HTMLButtonElement>document.getElementById("btnModeChange")).value = "Mode: Single-Step";
				(<HTMLInputElement> document.getElementById("btnStep")).focus();
			}
			else{ //Otherwise, we need to switch back to normal mode.
				Control.hostLog("Switching to Normal Mode", "host");
				// Reset our clock pulse.
				_hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
				// Disable the step button again
				(<HTMLButtonElement>document.getElementById("btnStep")).disabled = true;
				// And display that we are now back in Normal Mode.
				(<HTMLButtonElement>document.getElementById("btnModeChange")).value = "Mode: Normal";
				
			}
        }
		
        public static hostBtnStep_click(btn): void { // Pushes the clock forward one cycle manually.
            Control.hostLog("Manually pulsing clock", "host");
            Devices.hostClockPulse();
        }
		
		public static hostBtnProcessView_click(btn): void { // Switches the view between the ready queue and all PCBs.
            if(document.getElementById("divPCBInfo").style.display == "none") {
				document.getElementById("divPCBInfo").style.display = "block";
				document.getElementById("divReadyInfo").style.display = "none";
				(<HTMLButtonElement>document.getElementById("btnProcessView")).value = "Showing: All";
			}
			else {
				document.getElementById("divPCBInfo").style.display = "none";
				document.getElementById("divReadyInfo").style.display = "block";
				(<HTMLButtonElement>document.getElementById("btnProcessView")).value = "Showing: Ready";
			}
        }
		
		public static updateDisplays(): void { // A compilation method of most of the methods that update displays on the OS page, to make it simpler and quicker to call.
			Control.updateDate();
			Control.updateMemory();
			Control.updateCPUStatus();
			Control.updatePCBStatus();
			Control.updateReadyDisplay();
		}
		
		public static updateDate(): void { // Updates the taskbar date display
			var d = new Date();
            document.getElementById("dateIn").innerHTML = d.toLocaleString();
		}
		
		public static updateMemory(): void { // Updates the memory display table
			var table = (<HTMLTableElement>document.getElementById("tbMemory"));
            var newtab = document.createElement('tbody');
			for(var i = 0; i < MEM_MAXIMUM_SIZE; i+=8) {
				var row = newtab.insertRow(-1);
				var addrstr = (i % MEM_SEGMENT_SIZE).toString(16).toUpperCase(); // To display the memory address, I turn i into a hexadecimal string. For clarity, I broke it up into a new variable.
				while(addrstr.length<3){ // To make it look good, I want all addresses to be the same size. I didn't want to do all that in a single line, this is clearer.
					addrstr = "0" + addrstr;
				}
				
				var th = document.createElement('th'); // I switched this to a th to bold the address.
				th.innerHTML = (Math.floor(i/MEM_SEGMENT_SIZE) + "x" + addrstr);
				row.appendChild(th);
				for(var c = 0; c < 8; c++) {
					var memval = _MemoryAccessor.readDirect(i+c);
					memval = memval.toString();
					row.insertCell(-1).innerHTML = memval.toUpperCase();
				}
			}
			table.replaceChild(newtab, table.tBodies[0]);
		}
		
		public static updateCPUStatus(): void { // Updates the CPU Status display table
			var table = (<HTMLTableElement>document.getElementById("tbCPU"));
			var row = table.rows[1]; // The CPU Status table only has a header row and an info row.
			
			row.cells[0].innerHTML = _CPU.isExecuting.toString();
			row.cells[1].innerHTML = _CPU.PC.toString(16).toUpperCase();
			row.cells[2].innerHTML = _MemoryAccessor.readDirect(_CPU.PC);
            row.cells[3].innerHTML = _CPU.Acc.toString(16).toUpperCase();
            row.cells[4].innerHTML = _CPU.Xreg.toString(16).toUpperCase();
            row.cells[5].innerHTML = _CPU.Yreg.toString(16).toUpperCase();
            row.cells[6].innerHTML = _CPU.Zflag.toString();
		}
		
		public static updatePCBStatus(): void { // Updates the PCB Status display table
			var table = (<HTMLTableElement>document.getElementById("tbPCB"));
			while(_ProcessCounter>=table.rows.length){
				var newrow = table.insertRow(-1);
				for(var i = 0; i < 9; i++) {
					newrow.insertCell(-1);
				}
			}
			
			for(var i = 0; i < _ProcessCounter; i++){ // For every item in the Process List, print a row of the table.
				var row = table.rows[(i+1)];
				row.cells[0].innerHTML = _ProcessList[i].PID.toString();
				row.cells[1].innerHTML = _ProcessList[i].PC.toString(16).toUpperCase();
				row.cells[2].innerHTML = _ProcessList[i].Acc.toString(16).toUpperCase();
				row.cells[3].innerHTML = _ProcessList[i].Xreg.toString(16).toUpperCase();
				row.cells[4].innerHTML = _ProcessList[i].Yreg.toString(16).toUpperCase();
				row.cells[5].innerHTML = _ProcessList[i].Zflag.toString();
				row.cells[6].innerHTML = _ProcessList[i].State.toString();
				row.cells[7].innerHTML = _ProcessList[i].Location.toString();
				row.cells[8].innerHTML = _ProcessList[i].completed.toString();
				if(i == _CurrentProcess) {
					row.style.backgroundColor = "yellow";
				}
				else {
					row.style.backgroundColor = "transparent";
				}
			}
		}
		
		public static updateReadyDisplay(): void { // Updates the Ready Queue display table
			var table = (<HTMLTableElement>document.getElementById("tbReady"));
			var new_tbody = document.createElement('tbody');
			var qString = _ReadyList.toString();
			qString = qString.substring(1, qString.length-2);
			var qArr = qString.split("] [");
			if(qArr[0] == "") {qArr = new Array();} // There was an error where qArr was getting 1 index set to just "" which caused the lower for loop to blow up.
			while(qArr.length-1>=new_tbody.rows.length){
				var newrow = new_tbody.insertRow(-1);
				for(var i = 0; i < 9; i++) {
					newrow.insertCell(-1);
				}
			}
			
			for(var i = 0; i < qArr.length; i++){ // For everything in the Ready Display, place a row into the table
				var row = new_tbody.rows[i];
				row.cells[0].innerHTML = _ProcessList[parseInt(qArr[i],10)].PID.toString();
				row.cells[1].innerHTML = _ProcessList[parseInt(qArr[i],10)].PC.toString(16).toUpperCase();
				row.cells[2].innerHTML = _ProcessList[parseInt(qArr[i],10)].Acc.toString(16).toUpperCase();
				row.cells[3].innerHTML = _ProcessList[parseInt(qArr[i],10)].Xreg.toString(16).toUpperCase();
				row.cells[4].innerHTML = _ProcessList[parseInt(qArr[i],10)].Yreg.toString(16).toUpperCase();
				row.cells[5].innerHTML = _ProcessList[parseInt(qArr[i],10)].Zflag.toString();
				row.cells[6].innerHTML = _ProcessList[parseInt(qArr[i],10)].State.toString();
				row.cells[7].innerHTML = _ProcessList[parseInt(qArr[i],10)].Location.toString();
				row.cells[8].innerHTML = _ProcessList[parseInt(qArr[i],10)].completed.toString();
			}
			
			if(_CurrentProcess>=0) { // If there's a currently running process, put that in too.
				var row = new_tbody.insertRow(0);
				for(var i = 0; i < 9; i++) {
					row.insertCell(-1);
				}
				row.cells[0].innerHTML = _ProcessList[_CurrentProcess].PID.toString();
				row.cells[1].innerHTML = _ProcessList[_CurrentProcess].PC.toString(16).toUpperCase();
				row.cells[2].innerHTML = _ProcessList[_CurrentProcess].Acc.toString(16).toUpperCase();
				row.cells[3].innerHTML = _ProcessList[_CurrentProcess].Xreg.toString(16).toUpperCase();
				row.cells[4].innerHTML = _ProcessList[_CurrentProcess].Yreg.toString(16).toUpperCase();
				row.cells[5].innerHTML = _ProcessList[_CurrentProcess].Zflag.toString();
				row.cells[6].innerHTML = _ProcessList[_CurrentProcess].State.toString();
				row.cells[7].innerHTML = _ProcessList[_CurrentProcess].Location.toString();
				row.cells[8].innerHTML = _ProcessList[_CurrentProcess].completed.toString();
				row.style.backgroundColor = "yellow";
			}
			table.replaceChild(new_tbody, table.tBodies[0]);
		}
		
		public static updateDiskDisplay(): void { // Updates the Hard Disk display table
			var table = (<HTMLTableElement>document.getElementById("tbStorage"));
            var newtab = document.createElement('tbody');
			for(let x = 0; x < HDD_TRACKS; x++){
				for(let y = 0; y < HDD_SECTORS; y++){
					for(let z = 0; z < HDD_BLOCKS; z++){ // For each block,
						var row = newtab.insertRow(-1); // Create a cell for the location
						var th = document.createElement('th');
						th.innerHTML = x + "," + y + "," + z;
						row.appendChild(th);
						
						var data = sessionStorage.getItem(x+""+y+""+z); // Create and format a cell for the "In Use" byte
						var cell = row.insertCell(-1);
						if(data.substr(0,1).toUpperCase() == "0") {
							cell.innerHTML = "Not In Use";
							cell.style.color = "red";
						}
						else {
							cell.innerHTML = "In Use";
							cell.style.color = "green";
						}
						row.appendChild(cell);
						
						cell = row.insertCell(-1); // Create and format a cell for the link location
						var datalink = data.substr(1,3).toUpperCase();
						if(datalink == "000") {
							cell.innerHTML = "No Link";
							cell.style.color = "red";
						}
						else {
							datalink = datalink.charAt(0) + "," + datalink.charAt(1) + "," + datalink.charAt(2);
							cell.innerHTML = datalink;
						}
						row.appendChild(cell);
						
						var scrolldiv = document.createElement('div'); // Format the data in a scrollable div
						scrolldiv.className = "scrollable";
						scrolldiv.innerHTML = data.substring(4).toUpperCase();
						row.insertCell(-1).appendChild(scrolldiv);
					}
				}
			}
			table.replaceChild(newtab, table.tBodies[0]);
		}
    }
}
